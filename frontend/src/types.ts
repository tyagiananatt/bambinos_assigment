export interface FollowUpMessage {
  recipient_type: "Teacher" | "Parent" | "Operations";
  recipient_name?: string;
  recipient_contact?: string;
  subject: string;
  message: string;
  reason: string;
  created_at: string;
}

export interface ExceptionRecord {
  id: string;
  student_id?: string;
  student_name?: string;
  invoice_id?: string;
  invoice_number?: string;
  exception_type: string;
  category: "Payment Issues" | "Teacher Issues" | "Scheduling Issues" | "Data Mismatches";
  severity: "Critical" | "High" | "Medium" | "Low";
  detected_at: string;
  time_pending_hours: number;
  responsible_team: string;
  recommended_action: string;
  status: "Open" | "In Review" | "Resolved";
  notes: string[];
  assigned_to?: string;
  explanation: string;
  details?: Record<string, any>;
  draft_messages?: FollowUpMessage[];
}

export interface ReconciledRenewal {
  student_id?: string;
  student_name?: string;
  parent_name?: string;
  parent_mobile?: string;
  parent_email?: string;
  invoice_id?: string;
  invoice_number?: string;
  current_stage: "Payment Received" | "Teacher Form Submitted" | "Booking Request Approved" | "Class Scheduled";
  reconciliation_status: "AUTO_APPROVED" | "MANUAL_REVIEW" | "PAYMENT_PENDING" | "MISSING_TEACHER_FORM" | "MISSING_BOOKING_REQUEST" | "ALREADY_SCHEDULED" | "REJECTED" | "DATA_MISMATCH";
  reason_code?: string;
  explanation: string;
  recommended_action: string;
  responsible_team: string;
  timestamp: string;
  payment_status: string;
  amount_paid: number;
  net_amount: number;
  currency: string;
  educator_id?: string;
  educator_name?: string;
  class_id?: string;
  class_name?: string;
  batch_id?: string;
  batch_name?: string;
  batch_days?: string;
  batch_time?: string;
  batch_capacity_info?: string;
  continue_same_batch?: string;
  teacher_form_id?: string;
  booking_request_id?: string;
  class_schedule_ids: string[];
  is_auto_approvable: boolean;
  ready_for_scheduling: boolean;
  exceptions: ExceptionRecord[];
  draft_messages: FollowUpMessage[];
}

export interface ReconciliationSummary {
  total_invoices: number;
  verified_payments: number;
  auto_approved_renewals: number;
  manual_review_needed: number;
  pending_teacher_forms: number;
  pending_booking_requests: number;
  unscheduled_students: number;
  flagged_exceptions: number;
  automation_rate_pct: number;
  hours_saved_est: number;
  last_sync_timestamp: string;
  records: ReconciledRenewal[];
  exception_list: ExceptionRecord[];
}

export interface SimulationResult {
  total_records_processed: number;
  successful_validations: number;
  auto_approved_count: number;
  exceptions_generated: number;
  duplicates_detected: number;
  processing_duration_ms: number;
  stages_breakdown: Record<string, number>;
  step_logs: Array<{
    step: number;
    title: string;
    status: string;
    records: number;
    detail: string;
  }>;
}

export interface SlaMetrics {
  sla_targets: {
    payment_to_form: { target_hours: number; actual_avg_hours: number; compliance_pct: number; status: string };
    payment_to_approval: { target_hours: number; actual_avg_hours: number; compliance_pct: number; status: string };
    payment_to_scheduling: { target_hours: number; actual_avg_hours: number; compliance_pct: number; status: string };
    critical_exception_resolution: { target_hours: number; actual_avg_hours: number; compliance_pct: number; status: string };
  };
  orphaned_invoice_rate_pct: number;
  auto_approval_rate_pct: number;
  avg_processing_turnaround_hours: number;
  hours_saved_est: number;
  daily_trends: Array<{
    date: string;
    total: number;
    approved: number;
    exceptions: number;
    volume_inr: number;
  }>;
  teacher_pending_breakdown: Array<{
    educator_id: string;
    educator_name: string;
    pending_forms: number;
    total_students: number;
    exceptions: number;
  }>;
  category_distribution: Array<{ category: string; count: number }>;
  stuck_over_12h_count: number;
}

