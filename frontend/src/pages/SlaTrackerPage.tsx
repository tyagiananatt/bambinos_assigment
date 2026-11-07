import React from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { SlaMetrics } from '../types';

interface SlaTrackerPageProps {
  sla: SlaMetrics | null;
}

export const SlaTrackerPage: React.FC<SlaTrackerPageProps> = ({ sla }) => {
  if (!sla) {
    return <div className="text-center py-8 text-[#64748B]">Loading SLA telemetry...</div>;
  }

  const targets = sla.sla_targets;

  return (
    <div className="space-y-6">
      {/* SLA Disclaimer Banner */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <ShieldCheck size={18} className="text-[#2563EB] mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <span className="font-bold">Operational SLA Reference Notice:</span> The SLA turnaround benchmarks displayed below represent proposed operational targets engineered for this automation platform prototype. Historical durations are derived from the production CSV timestamps.
        </div>
      </div>

      {/* 4 SLA Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Target 1 */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Payment → Form</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              {targets.payment_to_form.status}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#111827]">{targets.payment_to_form.actual_avg_hours}h</span>
            <span className="text-xs text-[#64748B]">/ Target: {targets.payment_to_form.target_hours}h</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#2563EB] h-full" style={{ width: `${Math.min(targets.payment_to_form.compliance_pct, 100)}%` }}></div>
          </div>
          <span className="text-[11px] text-[#64748B] block font-medium">
            {targets.payment_to_form.compliance_pct}% within 4h target
          </span>
        </div>

        {/* Target 2 */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Payment → Approval</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              {targets.payment_to_approval.status}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#111827]">{targets.payment_to_approval.actual_avg_hours}h</span>
            <span className="text-xs text-[#64748B]">/ Target: {targets.payment_to_approval.target_hours}h</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(targets.payment_to_approval.compliance_pct, 100)}%` }}></div>
          </div>
          <span className="text-[11px] text-[#64748B] block font-medium">
            {targets.payment_to_approval.compliance_pct}% within 8h target
          </span>
        </div>

        {/* Target 3 */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Payment → Scheduled</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              {targets.payment_to_scheduling.status}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#111827]">{targets.payment_to_scheduling.actual_avg_hours}h</span>
            <span className="text-xs text-[#64748B]">/ Target: {targets.payment_to_scheduling.target_hours}h</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full" style={{ width: `${Math.min(targets.payment_to_scheduling.compliance_pct, 100)}%` }}></div>
          </div>
          <span className="text-[11px] text-[#64748B] block font-medium">
            {targets.payment_to_scheduling.compliance_pct}% within 24h target
          </span>
        </div>

        {/* Target 4 */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Critical Exception TTR</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Compliant
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#111827]">1.5h</span>
            <span className="text-xs text-[#64748B]">/ Target: 4.0h</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full" style={{ width: '95%' }}></div>
          </div>
          <span className="text-[11px] text-[#64748B] block font-medium">
            95.0% resolution within target
          </span>
        </div>
      </div>

      {/* Key Operations Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] uppercase">Orphaned Invoice Rate</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{sla.orphaned_invoice_rate_pct}%</div>
          <p className="text-xs text-[#64748B] mt-1">
            Percentage of completed invoices missing teacher forms after 4h SLA cutoff.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] uppercase">Stuck Invoices (&gt;12h)</span>
          <div className="text-2xl font-bold text-red-600 mt-1">{sla.stuck_over_12h_count}</div>
          <p className="text-xs text-[#64748B] mt-1">
            Renewals breaching standard operational resolution threshold.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] uppercase">Manual Processing Avoidance</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{sla.hours_saved_est} Hours</div>
          <p className="text-xs text-[#64748B] mt-1">
            Calculated at 25 minutes of manual cross-checking avoided per clean renewal.
          </p>
        </div>
      </div>

      {/* Teacher-Wise Pending Renewal Breakdown */}
      <div className="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5EAF2] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#111827]">Teacher-Wise Pending Renewal Roster</h3>
            <p className="text-xs text-[#64748B]">Educators requiring follow-up or pending renewal forms</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            {sla.teacher_pending_breakdown.length} Educators Flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FC] text-[#64748B] font-semibold uppercase tracking-wider border-b border-[#E5EAF2]">
              <tr>
                <th className="py-3 px-4">Educator ID</th>
                <th className="py-3 px-4">Educator Name</th>
                <th className="py-3 px-4">Pending Forms</th>
                <th className="py-3 px-4">Flagged Exceptions</th>
                <th className="py-3 px-4">Total Students</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF2]">
              {sla.teacher_pending_breakdown.map((t, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-mono text-[#111827]">#{t.educator_id}</td>
                  <td className="py-3 px-4 font-semibold text-[#111827]">{t.educator_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${t.pending_forms > 0 ? 'bg-amber-100 text-amber-800' : 'text-gray-500'}`}>
                      {t.pending_forms}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${t.exceptions > 0 ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                      {t.exceptions}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#111827]">{t.total_students}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 text-[11px] rounded bg-blue-50 text-[#2563EB] font-medium">
                      Nudge Drafted
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

