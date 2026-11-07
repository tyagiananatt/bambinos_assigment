#!/usr/bin/env python3
"""
Bambinos.live Reconciliation Engine CLI.
Provides headless terminal execution for automated batch jobs and CI/CD pipelines.
"""
import sys
import os
import argparse
import json

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.reconciliation import ReconciliationEngine
from backend.app.reports import generate_pdf_case_report

def main():
    parser = argparse.ArgumentParser(description="Bambinos Operations Reconciliation Engine CLI")
    parser.add_argument("--data-dir", default="data", help="Directory containing the 5 CSV files")
    parser.add_argument("--output-dir", default="outputs", help="Directory to write export outputs")
    parser.add_argument("--generate-pdf", action="store_true", help="Generate the PDF Case Report")
    parser.add_argument("--simulate", action="store_true", help="Run pipeline simulation with latency benchmarks")
    args = parser.parse_args()

    print("=" * 70)
    print("  BAMBINOS.LIVE — RENEWAL OPERATIONS AUTOMATION PLATFORM")
    print("=" * 70)
    print(f"Loading datasets from: {os.path.abspath(args.data_dir)}")

    engine = ReconciliationEngine(data_dir=args.data_dir)
    engine.load_data()

    if args.simulate:
        print("\nRunning Zero-Touch Workflow Simulation...")
        sim = engine.run_simulation()
        print(f"Total Records Processed : {sim.total_records_processed}")
        print(f"Valid Payments Verified : {sim.successful_validations}")
        print(f"Auto-Approved Renewals  : {sim.auto_approved_count}")
        print(f"Exceptions Generated    : {sim.exceptions_generated}")
        print(f"Processing Latency      : {sim.processing_duration_ms} ms")
        print("\nStep Log:")
        for log in sim.step_logs:
            print(f"  [{log['step']}] {log['title']}: {log['detail']}")
        return

    summary = engine.run_reconciliation()
    print("\n--- RECONCILIATION SUMMARY ---")
    print(f"Total Invoices Ingested  : {summary.total_invoices}")
    print(f"Verified Payments        : {summary.verified_payments}")
    print(f"Auto-Approved Renewals   : {summary.auto_approved_renewals}")
    print(f"Pending Teacher Forms    : {summary.pending_teacher_forms}")
    print(f"Pending Booking Requests : {summary.pending_booking_requests}")
    print(f"Flagged Exceptions       : {summary.flagged_exceptions}")
    print(f"Automation Rate          : {summary.automation_rate_pct}%")
    print(f"Manual Effort Saved      : ~{summary.hours_saved_est} hours")

    os.makedirs(args.output_dir, exist_ok=True)
    out_json = os.path.join(args.output_dir, "bambinos_reconciliation_summary.json")
    with open(out_json, "w") as f:
        json.dump(summary.model_dump(), f, indent=2)
    print(f"\nReconciliation summary written to: {out_json}")

    if args.generate_pdf:
        pdf_path = os.path.join(args.output_dir, "Bambinos_Operations_TakeHome_Case_Report.pdf")
        generate_pdf_case_report({"kpis": summary.model_dump()}, pdf_path)
        print(f"Official PDF Case Report compiled to: {pdf_path}")

    print("\n[OK] Headless reconciliation run finished successfully.")

if __name__ == "__main__":
    main()

