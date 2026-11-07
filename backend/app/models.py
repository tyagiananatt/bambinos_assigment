from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class ReconciliationStatus(str, Enum):
    AUTO_APPROVED = "AUTO_APPROVED"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    MISSING_TEACHER_FORM = "MISSING_TEACHER_FORM"
    MISSING_BOOKING_REQUEST = "MISSING_BOOKING_REQUEST"
    ALREADY_SCHEDULED = "ALREADY_SCHEDULED"
    REJECTED = "REJECTED"
    DATA_MISMATCH = "DATA_MISMATCH"

class ExceptionCategory(str, Enum):
    PAYMENT_ISSUES = "Payment Issues"
    TEACHER_ISSUES = "Teacher Issues"
    SCHEDULING_ISSUES = "Scheduling Issues"
    DATA_MISMATCHES = "Data Mismatches"

class ExceptionSeverity(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class ExceptionCode(str, Enum):
    INVOICE_NOT_FOUND = "INVOICE_NOT_FOUND"
    MISSING_TEACHER_FORM = "MISSING_TEACHER_FORM"
    STUDENT_ID_MISMATCH = "STUDENT_ID_MISMATCH"
    INVOICE_AMOUNT_MISMATCH = "INVOICE_AMOUNT_MISMATCH"
    PAYMENT_NOT_COMPLETED = "PAYMENT_NOT_COMPLETED"
    PARTIAL_PAYMENT = "PARTIAL_PAYMENT"
    DUPLICATE_INVOICE = "DUPLICATE_INVOICE"
    DUPLICATE_FACULTY_FORM = "DUPLICATE_FACULTY_FORM"
    DUPLICATE_BOOKING_REQUEST = "DUPLICATE_BOOKING_REQUEST"
    BATCH_UNAVAILABLE = "BATCH_UNAVAILABLE"
    TEACHER_MISMATCH = "TEACHER_MISMATCH"
    MISSING_STUDENT_REFERENCE = "MISSING_STUDENT_REFERENCE"
    ALREADY_SCHEDULED = "ALREADY_SCHEDULED"
    PARENT_CONTACT_MISMATCH = "PARENT_CONTACT_MISMATCH"
    INCOMPLETE_DATA = "INCOMPLETE_DATA"
    AMBIGUOUS_STUDENT_MATCH = "AMBIGUOUS_STUDENT_MATCH"
    DATA_MISMATCH = "DATA_MISMATCH"
    BATCH_CHANGE_PENDING = "BATCH_CHANGE_PENDING"

class PipelineStage(str, Enum):
    PAYMENT_RECEIVED = "Payment Received"
    TEACHER_FORM_SUBMITTED = "Teacher Form Submitted"
    BOOKING_APPROVED = "Booking Request Approved"
    CLASS_SCHEDULED = "Class Scheduled"

class FollowUpMessage(BaseModel):
    recipient_type: str  # "Teacher" | "Parent" | "Operations"
    recipient_name: Optional[str] = None
    recipient_contact: Optional[str] = None
    subject: str
    message: str
    reason: str
    created_at: str

class ExceptionRecord(BaseModel):
    id: str
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    exception_type: ExceptionCode
    category: ExceptionCategory
    severity: ExceptionSeverity
    detected_at: str
    time_pending_hours: float
    responsible_team: str
    recommended_action: str
    status: str = "Open"  # Open | In Review | Resolved
    notes: List[str] = []
    assigned_to: Optional[str] = None
    explanation: str
    details: Dict[str, Any] = {}
    draft_messages: List[FollowUpMessage] = []

class ReconciledRenewal(BaseModel):
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    parent_email: Optional[str] = None
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    current_stage: PipelineStage
    reconciliation_status: ReconciliationStatus
    reason_code: Optional[str] = None
    explanation: str
    recommended_action: str
    responsible_team: str
    timestamp: str
    payment_status: str
    amount_paid: float
    net_amount: float
    currency: str = "INR"
    educator_id: Optional[str] = None
    educator_name: Optional[str] = None
    class_id: Optional[str] = None
    class_name: Optional[str] = None
    batch_id: Optional[str] = None
    batch_name: Optional[str] = None
    batch_days: Optional[str] = None
    batch_time: Optional[str] = None
    batch_capacity_info: Optional[str] = None
    continue_same_batch: Optional[str] = None
    teacher_form_id: Optional[str] = None
    booking_request_id: Optional[str] = None
    class_schedule_ids: List[str] = []
    is_auto_approvable: bool = False
    ready_for_scheduling: bool = False
    exceptions: List[ExceptionRecord] = []
    draft_messages: List[FollowUpMessage] = []

class ReconciliationSummary(BaseModel):
    total_invoices: int
    verified_payments: int
    auto_approved_renewals: int
    manual_review_needed: int
    pending_teacher_forms: int
    pending_booking_requests: int
    unscheduled_students: int
    flagged_exceptions: int
    automation_rate_pct: float
    hours_saved_est: float
    last_sync_timestamp: str
    records: List[ReconciledRenewal]
    exception_list: List[ExceptionRecord]

class SimulationResult(BaseModel):
    total_records_processed: int
    successful_validations: int
    auto_approved_count: int
    exceptions_generated: int
    duplicates_detected: int
    processing_duration_ms: float
    stages_breakdown: Dict[str, int]
    step_logs: List[Dict[str, Any]]
