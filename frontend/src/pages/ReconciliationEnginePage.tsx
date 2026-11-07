import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Info
} from 'lucide-react';
import { ReconciliationSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface ReconciliationEnginePageProps {
  summary: ReconciliationSummary | null;
  onRunReconciliation: () => void;
  isLoading?: boolean;
}

export const ReconciliationEnginePage: React.FC<ReconciliationEnginePageProps> = ({
  summary,
  onRunReconciliation,
  isLoading
}) => {
  const [selectedRuleTab, setSelectedRuleTab] = useState<'rules' | 'audit' | 'matrix'>('rules');

  const ruleSteps = [
    {
      step: 1,
      name: "Invoice & Payment Verification",
      target: "1_invoices.csv",
      description: "Verifies gateway payment_status == 'Paid', checks settled net_amount against course fee, isolates installment/partial payments and gateway failures.",
      failureCode: "PAYMENT_NOT_COMPLETED / PARTIAL_PAYMENT",
      actionOnFail: "Immediate halt of automated workflow. Dispatches payment retry or milestone notice to parent."
    },
    {
      step: 2,
      name: "Faculty Form Submission Cross-Match",
      target: "2_faculty_form_unapproved.csv",
      description: "Outer-joins invoice_id to faculty submission. Validates educator identity, session count, amount reported vs gateway receipt, and flags orphaned payments.",
      failureCode: "MISSING_TEACHER_FORM / INVOICE_AMOUNT_MISMATCH / DUPLICATE_FACULTY_FORM",
      actionOnFail: "Routes to Teacher Operations queue and generates automated educator reminder."
    },
    {
      step: 3,
      name: "Master Student & Contact Integrity Check",
      target: "reference_active_batches_and_students.csv",
      description: "Matches student_id to master student profile. Compares payer mobile against registered parent number to safeguard against unauthorized account manipulation.",
      failureCode: "PARENT_CONTACT_MISMATCH / MISSING_STUDENT_REFERENCE",
      actionOnFail: "Requires Ops desk secondary guardian verification before updating student contact."
    },
    {
      step: 4,
      name: "Batch Capacity & Scheduling Availability",
      target: "reference_active_batches_and_students.csv (active_students vs max_batch_size)",
      description: "Verifies whether target batch has vacant seats (active < 6). Checks whether parent requested same-batch continuation or batch timing change.",
      failureCode: "BATCH_UNAVAILABLE (Capacity 6/6 Full) / BATCH_CHANGE_PENDING",
      actionOnFail: "Blocks auto-approval. Prompts Academic Coordinator to create overflow batch or offer parallel slots."
    },
    {
      step: 5,
      name: "Existing Booking De-Duplication",
      target: "4_class_schedule_bookings.csv",
      description: "Scans active class schedule bookings. If student already has active scheduled sessions for this renewal, marks status as ALREADY_SCHEDULED.",
      failureCode: "ALREADY_SCHEDULED (Duplicate Booking Prevention)",
      actionOnFail: "Preserves existing booking without duplicate slot consumption."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 flex-shrink-0">
            <Cpu size={26} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#111827]">Deterministic Reconciliation Engine v1.0</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Active & Verified
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Multi-table rule validator evaluating Invoices → Teacher Forms → Booking Requests → Schedules → Reference Roster.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onRunReconciliation}
            disabled={isLoading}
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Play size={14} className="mr-1.5 fill-white" />
            {isLoading ? 'Reconciling Datasets...' : 'Re-Run All Rules'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E5EAF2] pb-2 text-xs font-medium">
        <button
          onClick={() => setSelectedRuleTab('rules')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedRuleTab === 'rules' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          Validation Rules Sequence (5 Layers)
        </button>
        <button
          onClick={() => setSelectedRuleTab('matrix')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedRuleTab === 'matrix' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          Decision Matrix & Reason Taxonomy
        </button>
      </div>

      {/* Tab 1: Rules Sequence */}
      {selectedRuleTab === 'rules' && (
        <div className="space-y-4">
          {ruleSteps.map(st => (
            <div key={st.step} className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {st.step}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111827]">{st.name}</h3>
                  <span className="font-mono text-[11px] text-[#64748B] bg-[#F7F9FC] px-2 py-0.5 rounded border border-[#E5EAF2]">
                    {st.target}
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">{st.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="bg-red-50/70 border border-red-100 rounded-lg p-2 text-red-900">
                    <span className="font-semibold block text-[11px]">Exception Triggers:</span>
                    <span className="font-mono text-[11px]">{st.failureCode}</span>
                  </div>
                  <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2 text-blue-900">
                    <span className="font-semibold block text-[11px]">Deterministic Action:</span>
                    <span>{st.actionOnFail}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Decision Matrix */}
      {selectedRuleTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FC] text-[#64748B] font-semibold uppercase tracking-wider border-b border-[#E5EAF2]">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Condition Required</th>
                <th className="py-3 px-4">Auto-Approval Allowed?</th>
                <th className="py-3 px-4">Responsible Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF2]">
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4"><StatusBadge status="AUTO_APPROVED" /></td>
                <td className="py-3 px-4">Paid in full + Single matching teacher form + Net amount matches + Batch capacity &lt; 6 + Same batch continuation</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">YES (Zero-Touch)</td>
                <td className="py-3 px-4 font-medium text-[#111827]">Automation Engine</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4"><StatusBadge status="ALREADY_SCHEDULED" /></td>
                <td className="py-3 px-4">Active booking records already found in 4_class_schedule_bookings.csv</td>
                <td className="py-3 px-4 text-gray-500 font-medium">N/A (Complete)</td>
                <td className="py-3 px-4 font-medium text-[#111827]">Operations Audit</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4"><StatusBadge status="MISSING_TEACHER_FORM" /></td>
                <td className="py-3 px-4">Payment confirmed, but no matching faculty form exists after 4 hours</td>
                <td className="py-3 px-4 text-red-600 font-bold">NO (Blocked)</td>
                <td className="py-3 px-4 font-medium text-[#111827]">Teacher Operations</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4"><StatusBadge status="BATCH_UNAVAILABLE" /></td>
                <td className="py-3 px-4">Target batch active_students_count &gt;= max_batch_size (e.g. 6/6 full)</td>
                <td className="py-3 px-4 text-red-600 font-bold">NO (Blocked)</td>
                <td className="py-3 px-4 font-medium text-[#111827]">Academic Scheduling</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4"><StatusBadge status="PARTIAL_PAYMENT" /></td>
                <td className="py-3 px-4">Invoice payment_type contains installment or net_amount &lt; standard course fee</td>
                <td className="py-3 px-4 text-red-600 font-bold">NO (Blocked)</td>
                <td className="py-3 px-4 font-medium text-[#111827]">Finance Desk</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4"><StatusBadge status="PARENT_CONTACT_MISMATCH" /></td>
                <td className="py-3 px-4">Invoice mobile differs from master registered mobile in reference roster</td>
                <td className="py-3 px-4 text-amber-600 font-bold">NO (Ops Review)</td>
                <td className="py-3 px-4 font-medium text-[#111827]">Ops Desk</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4"><StatusBadge status="REJECTED" /></td>
                <td className="py-3 px-4">Payment gateway marked payment_status as 'Failed' or no paid_at timestamp</td>
                <td className="py-3 px-4 text-red-600 font-bold">NO (Halted)</td>
                <td className="py-3 px-4 font-medium text-[#111827]">Finance Desk</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

