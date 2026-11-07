import React, { useState } from 'react';
import {
  CreditCard,
  UserCheck,
  CalendarCheck,
  CheckCircle,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ReconciledRenewal } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface PipelinePageProps {
  records: ReconciledRenewal[];
  onSelectStudentForException?: (invoiceId: string) => void;
}

export const PipelinePage: React.FC<PipelinePageProps> = ({ records }) => {
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStudent, setActiveStudent] = useState<ReconciledRenewal | null>(null);

  const stages = [
    { id: 'All', label: 'All Students', count: records.length, icon: Filter },
    { id: 'Payment Received', label: '1. Payment Received', count: records.filter(r => r.current_stage === 'Payment Received').length, icon: CreditCard, color: 'text-blue-600' },
    { id: 'Teacher Form Submitted', label: '2. Teacher Form Submitted', count: records.filter(r => r.current_stage === 'Teacher Form Submitted').length, icon: UserCheck, color: 'text-amber-600' },
    { id: 'Booking Request Approved', label: '3. Booking Approved', count: records.filter(r => r.current_stage === 'Booking Request Approved').length, icon: CalendarCheck, color: 'text-indigo-600' },
    { id: 'Class Scheduled', label: '4. Class Scheduled', count: records.filter(r => r.current_stage === 'Class Scheduled').length, icon: CheckCircle, color: 'text-emerald-600' },
  ];

  const filteredRecords = records.filter(r => {
    const matchesStage = selectedStage === 'All' || r.current_stage === selectedStage;
    const s = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (r.student_name && r.student_name.toLowerCase().includes(s)) ||
      (r.student_id && r.student_id.toLowerCase().includes(s)) ||
      (r.invoice_id && r.invoice_id.toLowerCase().includes(s)) ||
      (r.educator_name && r.educator_name.toLowerCase().includes(s)) ||
      (r.batch_name && r.batch_name.toLowerCase().includes(s));
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 4 Pipeline Stage Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stages.slice(1).map(stage => {
          const Icon = stage.icon;
          const isSelected = selectedStage === stage.id;
          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(isSelected ? 'All' : stage.id)}
              className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                isSelected ? 'border-[#2563EB] ring-2 ring-blue-100 shadow-md' : 'border-[#E5EAF2] hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#64748B]">{stage.label}</span>
                <Icon size={16} className={stage.color} />
              </div>
              <div className="text-2xl font-bold text-[#111827]">{stage.count}</div>
              <p className="text-[11px] text-[#64748B] mt-1">
                {stage.id === 'Payment Received' ? 'Awaiting teacher submission' :
                 stage.id === 'Teacher Form Submitted' ? 'Awaiting batch review' :
                 stage.id === 'Booking Request Approved' ? 'Ready for calendar dispatch' : 'Live classes confirmed'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search student, invoice, teacher, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {stages.map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedStage === st.id
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#F7F9FC] text-[#64748B] hover:bg-gray-100 hover:text-[#111827]'
              }`}
            >
              {st.label} ({st.count})
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FC] text-[#64748B] font-semibold uppercase tracking-wider border-b border-[#E5EAF2]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Status & Recommendation</th>
                <th className="py-3 px-4">Course & Batch</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Net Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF2]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748B]">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.invoice_id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#111827]">{r.student_name || 'Unlinked'}</div>
                      <div className="text-[11px] text-[#64748B]">ID: {r.student_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[#111827]">#{r.invoice_id}</div>
                      <div className="text-[11px] text-[#64748B]">{r.payment_status}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#111827]">{r.current_stage}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <StatusBadge status={r.reconciliation_status} />
                      <div className="text-[11px] text-[#64748B] mt-1 truncate" title={r.explanation}>
                        {r.explanation}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#111827] font-medium">{r.class_name || 'N/A'}</div>
                      <div className="text-[11px] text-[#64748B]">{r.batch_name || 'Unassigned'} ({r.batch_capacity_info || '-'})</div>
                    </td>
                    <td className="py-3 px-4 text-[#111827]">
                      {r.educator_name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#111827]">
                      ₹{r.net_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveStudent(r)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] rounded hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={12} className="mr-1" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {activeStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E5EAF2] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF2]">
              <div>
                <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">Renewal History</span>
                <h3 className="text-lg font-bold text-[#111827]">{activeStudent.student_name} (ID: {activeStudent.student_id})</h3>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-gray-100 hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Primary Status Banner */}
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] flex items-center justify-between">
                <div>
                  <span className="text-[#64748B] font-medium block">Current Reconciliation Decision</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <StatusBadge status={activeStudent.reconciliation_status} />
                    <span className="font-semibold text-[#111827]">{activeStudent.reason_code || 'Standard'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B]">Assigned Desk</span>
                  <div className="font-bold text-[#111827]">{activeStudent.responsible_team}</div>
                </div>
              </div>

              {/* Explanation & Action */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
                <span className="font-bold text-blue-900">Diagnosis & Next Steps:</span>
                <p className="text-blue-800">{activeStudent.explanation}</p>
                <p className="text-blue-950 font-semibold pt-1">Recommended Action: {activeStudent.recommended_action}</p>
              </div>

              {/* 4 Stage Verification Milestones */}
              <div className="border border-[#E5EAF2] rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-[#111827]">Milestone Cross-Table Audit</h4>
                
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-[10px]">1</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#111827]">Invoice & Payment Verification</div>
                    <div className="text-[#64748B]">Invoice #{activeStudent.invoice_id} • Amount: ₹{activeStudent.net_amount.toLocaleString()} • Status: {activeStudent.payment_status}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-[10px]">2</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#111827]">Faculty Renewal Submission</div>
                    <div className="text-[#64748B]">
                      {activeStudent.teacher_form_id ? `Form ID #${activeStudent.teacher_form_id} submitted by ${activeStudent.educator_name}` : 'Not submitted (Orphaned Payment)'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-[10px]">3</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#111827]">Booking Request Verification</div>
                    <div className="text-[#64748B]">
                      {activeStudent.booking_request_id ? `Booking Request #${activeStudent.booking_request_id} created` : 'Pending creation / Auto-eligible'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-[10px]">4</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#111827]">Class Schedule & Session Allocation</div>
                    <div className="text-[#64748B]">
                      {activeStudent.class_schedule_ids.length > 0 
                        ? `${activeStudent.class_schedule_ids.length} active sessions confirmed in batch ${activeStudent.batch_name}` 
                        : 'Unscheduled'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent & Contact Details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F9FC] rounded-xl border border-[#E5EAF2]">
                <div>
                  <span className="text-[#64748B]">Parent Guardian:</span>
                  <div className="font-semibold text-[#111827]">{activeStudent.parent_name || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Mobile Contact:</span>
                  <div className="font-semibold text-[#111827]">{activeStudent.parent_mobile || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Course & Level:</span>
                  <div className="font-semibold text-[#111827]">{activeStudent.class_name || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Batch Timing:</span>
                  <div className="font-semibold text-[#111827]">{activeStudent.batch_days} at {activeStudent.batch_time}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EAF2] flex justify-end">
              <button
                onClick={() => setActiveStudent(null)}
                className="px-4 py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1E40AF] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

