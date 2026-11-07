import os
import unittest
from backend.app.reconciliation import ReconciliationEngine
from backend.app.models import ReconciliationStatus, ExceptionCode, ExceptionSeverity

class TestReconciliationEngine(unittest.TestCase):
    def setUp(self):
        data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data")
        self.engine = ReconciliationEngine(data_dir=data_path)
        self.summary = self.engine.run_reconciliation()

    def test_load_all_five_csvs(self):
        info = self.engine.load_data()
        self.assertEqual(len(info), 5)
        self.assertIn("invoices", info)
        self.assertIn("faculty_forms", info)
        self.assertIn("booking_requests", info)
        self.assertIn("class_schedules", info)
        self.assertIn("reference", info)
        self.assertEqual(info["invoices"]["total_rows"], 13)

    def test_already_scheduled_detection(self):
        """Rule: Do not flag already scheduled students as failure; preserve clean active state."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84901"), None)
        self.assertIsNotNone(rec)
        self.assertEqual(rec.reconciliation_status, ReconciliationStatus.ALREADY_SCHEDULED)
        self.assertGreater(len(rec.class_schedule_ids), 0)

    def test_clean_auto_approval(self):
        """Rule: Eligible renewal with verified payment, single matching teacher form, open capacity is auto-approved."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84903"), None)
        self.assertIsNotNone(rec)
        self.assertEqual(rec.reconciliation_status, ReconciliationStatus.AUTO_APPROVED)
        self.assertTrue(rec.is_auto_approvable)

    def test_failed_payment_rejection(self):
        """Rule: Never approve when payment gateway failed or funds not settled."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84911"), None)
        self.assertIsNotNone(rec)
        self.assertEqual(rec.reconciliation_status, ReconciliationStatus.REJECTED)
        self.assertEqual(rec.reason_code, ExceptionCode.PAYMENT_NOT_COMPLETED.value)
        has_crit = any(e.severity == ExceptionSeverity.CRITICAL for e in rec.exceptions)
        self.assertTrue(has_crit)

    def test_partial_payment_detection(self):
        """Rule: Flag installment payment with high severity to prevent premature 24-session release."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84909"), None)
        self.assertIsNotNone(rec)
        self.assertEqual(rec.reconciliation_status, ReconciliationStatus.PAYMENT_PENDING)
        has_partial = any(e.exception_type == ExceptionCode.PARTIAL_PAYMENT for e in rec.exceptions)
        self.assertTrue(has_partial)

    def test_missing_teacher_form_orphaned_invoice(self):
        """Rule: Flag paid invoices with no faculty submission within SLA window."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84906"), None)
        self.assertIsNotNone(rec)
        self.assertEqual(rec.reconciliation_status, ReconciliationStatus.MISSING_TEACHER_FORM)
        has_missing = any(e.exception_type == ExceptionCode.MISSING_TEACHER_FORM for e in rec.exceptions)
        self.assertTrue(has_missing)

    def test_batch_unavailable_capacity_full(self):
        """Rule: When active_students >= max_batch_size, flag BATCH_UNAVAILABLE."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84905"), None)
        self.assertIsNotNone(rec)
        has_full = any(e.exception_type == ExceptionCode.BATCH_UNAVAILABLE for e in rec.exceptions)
        self.assertTrue(has_full)

    def test_duplicate_faculty_form_detection(self):
        """Rule: Detect duplicate faculty submissions and retain clean working state."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84908"), None)
        self.assertIsNotNone(rec)
        has_dup = any(e.exception_type == ExceptionCode.DUPLICATE_FACULTY_FORM for e in rec.exceptions)
        self.assertTrue(has_dup)

    def test_invoice_typo_fuzzy_cross_table_matching(self):
        """Rule: Reconcile educator typo (84931 vs 84913) via student ID and flag for correction."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84913"), None)
        self.assertIsNotNone(rec)
        has_typo = any(e.exception_type == ExceptionCode.INVOICE_NOT_FOUND for e in rec.exceptions)
        self.assertTrue(has_typo)

    def test_parent_contact_mismatch(self):
        """Rule: Flag when payment mobile differs from registered master student profile."""
        rec = next((r for r in self.summary.records if r.invoice_id == "84904"), None)
        self.assertIsNotNone(rec)
        has_mismatch = any(e.exception_type == ExceptionCode.PARENT_CONTACT_MISMATCH for e in rec.exceptions)
        self.assertTrue(has_mismatch)

    def test_simulation_workflow(self):
        sim = self.engine.run_simulation()
        self.assertEqual(sim.total_records_processed, 13)
        self.assertGreater(sim.successful_validations, 0)
        self.assertGreater(sim.auto_approved_count, 0)
        self.assertEqual(len(sim.step_logs), 5)

if __name__ == "__main__":
    unittest.main()
