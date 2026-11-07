import os
import io
import csv
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from pydantic import BaseModel

from .models import (
    ReconciliationSummary,
    SimulationResult,
    ExceptionRecord,
    ReconciledRenewal,
    FollowUpMessage,
    ExceptionCategory,
    ExceptionSeverity,
    ExceptionCode,
    PipelineStage
)
from .reconciliation import ReconciliationEngine
from .metrics import calculate_sla_metrics
from .reports import generate_pdf_case_report
from .messaging import generate_messages_for_renewal

app = FastAPI(
    title="Bambinos Operations Automation Platform API",
    description="Production-quality Student Renewal Reconciliation and Class Scheduling Automation Engine",
    version="1.0.0"
)

# CORS setup for Vite frontend (typically localhost:5173 or localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine with standard data directory
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
OUTPUTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "outputs"))
os.makedirs(OUTPUTS_DIR, exist_ok=True)

engine = ReconciliationEngine(data_dir=DATA_DIR)
# Run initial reconciliation on startup
initial_summary = engine.run_reconciliation()

class ExceptionUpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    note: Optional[str] = None

class CustomMessageRequest(BaseModel):
    recipient_type: str
    recipient_name: Optional[str] = None
    recipient_contact: Optional[str] = None
    subject: str
    message: str
    reason: str

@app.get("/")
def root():
    return {
        "platform": "Bambinos Renewal Operations Automation Platform",
        "status": "Operational",
        "version": "1.0.0",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.get("/api/reconciliation", response_model=ReconciliationSummary)
def get_reconciliation():
    """Returns the latest reconciliation results across all 5 datasets."""
    if engine.last_reconciliation_result is None:
        return engine.run_reconciliation()
    return engine.last_reconciliation_result

@app.post("/api/reconciliation/run", response_model=ReconciliationSummary)
def run_fresh_reconciliation():
    """Forces a fresh re-scan of all 5 CSV files and re-runs the rule engine."""
    engine.load_data()
    summary = engine.run_reconciliation()
    return summary

@app.post("/api/reconciliation/simulate", response_model=SimulationResult)
def simulate_workflow():
    """Executes the automated workflow simulator showing timing and pipeline logs."""
    return engine.run_simulation()

@app.get("/api/exceptions", response_model=List[ExceptionRecord])
def list_exceptions(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """Lists all operational exceptions with multi-dimensional filtering."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()
    
    results = engine.last_reconciliation_result.exception_list

    if category and category != "All":
        results = [e for e in results if e.category.value == category or e.category == category]
    if severity and severity != "All":
        results = [e for e in results if e.severity.value == severity or e.severity == severity]
    if status and status != "All":
        results = [e for e in results if e.status.lower() == status.lower()]
    if search:
        s_lower = search.lower()
        results = [
            e for e in results 
            if (e.student_name and s_lower in e.student_name.lower())
            or (e.student_id and s_lower in e.student_id.lower())
            or (e.invoice_id and s_lower in e.invoice_id.lower())
            or (e.explanation and s_lower in e.explanation.lower())
        ]
    return results

@app.patch("/api/exceptions/{exception_id}")
def update_exception(exception_id: str, req: ExceptionUpdateRequest):
    """Updates the working status, notes, or assigned staff for an exception."""
    if engine.last_reconciliation_result is None:
        raise HTTPException(status_code=400, detail="Reconciliation not yet executed.")
    
    for exc in engine.last_reconciliation_result.exception_list:
        if exc.id == exception_id:
            if req.status:
                exc.status = req.status
            if req.assigned_to:
                exc.assigned_to = req.assigned_to
            if req.note:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
                exc.notes.append(f"[{timestamp}] {req.note}")
            return exc
    
    raise HTTPException(status_code=404, detail=f"Exception record {exception_id} not found.")

@app.get("/api/sla")
def get_sla():
    """Returns calculated SLA metrics and compliance analytics based on real data."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()
    return calculate_sla_metrics(engine, engine.last_reconciliation_result)

@app.get("/api/data")
def get_datasets_metadata():
    """Returns row counts, column counts, missing values, duplicates, and schema status for all 5 datasets."""
    return engine.load_data()

@app.get("/api/data/preview/{table_name}")
def preview_dataset(
    table_name: str,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None
):
    """Returns paginated preview rows for any of the 5 datasets."""
    df_map = {
        "invoices": engine.invoices_df,
        "faculty_forms": engine.faculty_forms_df,
        "booking_requests": engine.booking_requests_df,
        "class_schedules": engine.class_schedules_df,
        "reference": engine.reference_df
    }
    if table_name not in df_map or df_map[table_name] is None:
        engine.load_data()
        if table_name not in df_map or df_map[table_name] is None:
            raise HTTPException(status_code=404, detail=f"Table {table_name} not found.")

    df = df_map[table_name].fillna("")
    if search:
        s_lower = search.lower()
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(s_lower, regex=False).any(), axis=1)
        df = df[mask]

    total_records = len(df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    records = df.iloc[start_idx:end_idx].to_dict(orient="records")

    return {
        "table_name": table_name,
        "total_records": total_records,
        "page": page,
        "page_size": page_size,
        "columns": list(df.columns),
        "data": records
    }

@app.post("/api/data/upload/{table_name}")
async def upload_dataset(table_name: str, file: UploadFile = File(...)):
    """Uploads a replacement CSV file and validates required columns."""
    valid_tables = {
        "invoices": "1_invoices.csv",
        "faculty_forms": "2_faculty_form_unapproved.csv",
        "booking_requests": "3_booking_requests.csv",
        "class_schedules": "4_class_schedule_bookings.csv",
        "reference": "reference_active_batches_and_students.csv"
    }
    if table_name not in valid_tables:
        raise HTTPException(status_code=400, detail=f"Invalid table identifier '{table_name}'.")

    content = await file.read()
    dest_path = os.path.join(DATA_DIR, valid_tables[table_name])
    
    # Write to target path safely
    with open(dest_path, "wb") as f:
        f.write(content)

    # Reload data and re-run reconciliation
    engine.load_data()
    summary = engine.run_reconciliation()

    return {
        "message": f"Successfully updated {valid_tables[table_name]}.",
        "filename": file.filename,
        "total_invoices": summary.total_invoices,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.get("/api/messages")
def get_messages(recipient_type: Optional[str] = None):
    """Returns drafted follow-up communications generated for all renewals."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()
    
    all_msgs: List[FollowUpMessage] = []
    for r in engine.last_reconciliation_result.records:
        all_msgs.extend(r.draft_messages)

    if recipient_type and recipient_type != "All":
        all_msgs = [m for m in all_msgs if m.recipient_type.lower() == recipient_type.lower()]
    
    return all_msgs

# EXPORT ENDPOINTS
@app.get("/api/exports/auto-approved")
def export_auto_approved():
    """Generates and downloads CSV of auto-approved renewals ready for class scheduling."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()

    approved = [r for r in engine.last_reconciliation_result.records if r.reconciliation_status.value == "AUTO_APPROVED"]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Invoice ID", "Invoice Number", "Student ID", "Student Name", "Parent Name", 
        "Parent Mobile", "Class Name", "Batch ID", "Batch Name", "Schedule Days", 
        "Schedule Time", "Amount Paid", "Status", "Reason Code", "Timestamp"
    ])
    for r in approved:
        writer.writerow([
            r.invoice_id, r.invoice_number, r.student_id, r.student_name, r.parent_name,
            r.parent_mobile, r.class_name, r.batch_id, r.batch_name, r.batch_days,
            r.batch_time, r.net_amount, r.reconciliation_status.value, r.reason_code, r.timestamp
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bambinos_auto_approved_renewals.csv"}
    )

@app.get("/api/exports/exceptions")
def export_exceptions():
    """Generates and downloads CSV of all flagged operational exceptions."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Exception ID", "Student ID", "Student Name", "Invoice ID", "Exception Type",
        "Category", "Severity", "Detected At", "Hours Pending", "Responsible Team",
        "Recommended Action", "Status", "Explanation"
    ])
    for e in engine.last_reconciliation_result.exception_list:
        writer.writerow([
            e.id, e.student_id, e.student_name, e.invoice_id, e.exception_type.value,
            e.category.value, e.severity.value, e.detected_at, e.time_pending_hours,
            e.responsible_team, e.recommended_action, e.status, e.explanation
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bambinos_operational_exceptions.csv"}
    )

@app.get("/api/exports/messages")
def export_draft_messages():
    """Generates and downloads CSV of all drafted follow-up communications."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Recipient Type", "Recipient Name", "Recipient Contact", "Subject", "Message Draft", "Trigger Reason", "Created At"
    ])
    for r in engine.last_reconciliation_result.records:
        for m in r.draft_messages:
            writer.writerow([
                m.recipient_type, m.recipient_name, m.recipient_contact, m.subject, m.message, m.reason, m.created_at
            ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bambinos_draft_communications.csv"}
    )

@app.get("/api/exports/booking-ready")
def export_booking_ready():
    """Exports structured batch-allocation ready records for direct import into scheduling calendar."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()

    ready = [r for r in engine.last_reconciliation_result.records if r.is_auto_approvable or r.ready_for_scheduling]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "booking_request_id", "invoice_id", "student_id", "educator_id", "classbatch_id", 
        "sessions_count", "continue_same_batch", "preferred_days", "preferred_time", "status"
    ])
    for r in ready:
        writer.writerow([
            r.booking_request_id or f"BR-AUTO-{r.invoice_id}", r.invoice_id, r.student_id,
            r.educator_id, r.batch_id, 24, "Yes", r.batch_days, r.batch_time, "Ready_For_Allocation"
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bambinos_booking_ready_records.csv"}
    )

@app.get("/api/exports/summary-json")
def export_summary_json():
    """Downloads full reconciliation summary and audit structure as JSON."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()
    return engine.last_reconciliation_result.model_dump()

@app.get("/api/exports/case-report-pdf")
def download_case_report_pdf():
    """Generates and serves the official PDF Case Report deliverable."""
    if engine.last_reconciliation_result is None:
        engine.run_reconciliation()

    pdf_path = os.path.join(OUTPUTS_DIR, "Bambinos_Operations_TakeHome_Case_Report.pdf")
    generate_pdf_case_report({"kpis": engine.last_reconciliation_result.model_dump()}, pdf_path)
    
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="Bambinos_Operations_TakeHome_Case_Report.pdf"
    )

@app.get("/api/audit-logs")
def get_audit_logs():
    return engine.audit_log

