import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  Copy,
  Check,
  Send,
  Download,
  X,
  FileText,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ExceptionRecord, FollowUpMessage } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../api';

interface ExceptionCenterPageProps {
  exceptions: ExceptionRecord[];
  onUpdateException: (id: string, payload: { status?: string; assigned_to?: string; note?: string }) => void;
}

export const ExceptionCenterPage: React.FC<ExceptionCenterPageProps> = ({
  exceptions,
  onUpdateException
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeException, setActiveException] = useState<ExceptionRecord | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = ['All', 'Payment Issues', 'Teacher Issues', 'Scheduling Issues', 'Data Mismatches'];
  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Open', 'In Review', 'Resolved'];

  const filteredExceptions = exceptions.filter(e => {
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSev = selectedSeverity === 'All' || e.severity === selectedSeverity;
    const matchesStat = selectedStatus === 'All' || e.status.toLowerCase() === selectedStatus.toLowerCase();
    const s = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (e.student_name && e.student_name.toLowerCase().includes(s)) ||
      (e.student_id && e.student_id.toLowerCase().includes(s)) ||
      (e.invoice_id && e.invoice_id.toLowerCase().includes(s)) ||
      (e.explanation && e.explanation.toLowerCase().includes(s)) ||
      (e.exception_type.toLowerCase().includes(s));
    return matchesCat && matchesSev && matchesStat && matchesSearch;
  });

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddNote = () => {
    if (!activeException || !newNote.trim()) return;
    onUpdateException(activeException.id, { note: newNote.trim() });
    setNewNote('');
  };

  const handleStatusChange = (status: 'Open' | 'In Review' | 'Resolved') => {
    if (!activeException) return;
    onUpdateException(activeException.id, { status });
    setActiveException({ ...activeException, status });
  };

  const handleAssignChange = (assigned_to: string) => {
    if (!activeException) return;
    onUpdateException(activeException.id, { assigned_to });
    setActiveException({ ...activeException, assigned_to });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by student, invoice ID, error code, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <a
              href={api.getDownloadUrl('exceptions')}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-[#111827] bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download size={13} className="mr-1.5 text-red-500" />
              Export Exceptions CSV
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5EAF2] text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#64748B] font-semibold text-[11px] uppercase">Category:</span>
            <div className="flex space-x-1">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedCategory === c ? 'bg-[#2563EB] text-white font-medium' : 'bg-[#F7F9FC] text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 ml-auto">
            <span className="text-[#64748B] font-semibold text-[11px] uppercase">Severity:</span>
            <div className="flex space-x-1">
              {severities.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSeverity(s)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedSeverity === s ? 'bg-[#111827] text-white font-medium' : 'bg-[#F7F9FC] text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FC] text-[#64748B] font-semibold uppercase tracking-wider border-b border-[#E5EAF2]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Exception Reason</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Hours Pending</th>
                <th className="py-3 px-4">Responsible Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF2]">
              {filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#64748B]">
                    No exceptions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredExceptions.map(exc => (
                  <tr
                    key={exc.id}
                    onClick={() => setActiveException(exc)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#111827]">{exc.student_name || 'Unlinked'}</div>
                      <div className="text-[11px] text-[#64748B]">ID: {exc.student_id || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#111827]">
                      #{exc.invoice_id || 'N/A'}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-[#111827]">{exc.exception_type.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-[#64748B] truncate" title={exc.explanation}>
                        {exc.explanation}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#111827]">
                      {exc.category}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={exc.severity} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[#64748B]">
                      {exc.time_pending_hours > 0 ? `${exc.time_pending_hours}h` : '<1h'}
                    </td>
                    <td className="py-3 px-4 text-[#111827] font-medium">
                      {exc.responsible_team}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        exc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        exc.status === 'In Review' ? 'bg-blue-100 text-[#2563EB]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {exc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveException(exc);
                        }}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] rounded hover:bg-blue-100 transition-colors"
                      >
                        Triage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception Detail Side Drawer */}
      {activeException && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[#E5EAF2] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E5EAF2] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={activeException.severity} size="sm" />
                  <span className="text-xs text-[#64748B]">ID: {activeException.id}</span>
                </div>
                <h3 className="text-base font-bold text-[#111827] mt-1">
                  {activeException.exception_type.replace(/_/g, ' ')}
                </h3>
              </div>
              <button
                onClick={() => setActiveException(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-gray-100 hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Status & Assignment Bar */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F9FC] rounded-xl border border-[#E5EAF2]">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Workflow Status</label>
                  <select
                    value={activeException.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="w-full p-2 bg-white border border-[#E5EAF2] rounded-lg text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Assignee</label>
                  <select
                    value={activeException.assigned_to || activeException.responsible_team}
                    onChange={(e) => handleAssignChange(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E5EAF2] rounded-lg text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Teacher Operations">Teacher Operations</option>
                    <option value="Finance Desk">Finance Desk</option>
                    <option value="Scheduling Ops">Scheduling Ops</option>
                    <option value="Ops Lead">Ops Lead</option>
                  </select>
                </div>
              </div>

              {/* Diagnosis Callout */}
              <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-xl space-y-1">
                <span className="font-bold text-red-950 block">Root Cause Diagnosis:</span>
                <p className="text-red-900">{activeException.explanation}</p>
                <div className="pt-2 text-red-950 font-semibold">
                  Recommended Action: {activeException.recommended_action}
                </div>
              </div>

              {/* Entity Context */}
              <div className="border border-[#E5EAF2] rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-[#111827] uppercase text-[11px] tracking-wider">Entity Verification</h4>
                <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                  <div>Student: <span className="text-[#111827] font-semibold">{activeException.student_name} ({activeException.student_id})</span></div>
                  <div>Invoice: <span className="font-mono text-[#111827] font-semibold">#{activeException.invoice_id}</span></div>
                  <div>Detected At: <span className="text-[#111827]">{activeException.detected_at}</span></div>
                  <div>Time In Queue: <span className="text-[#111827] font-semibold">{activeException.time_pending_hours} hours</span></div>
                </div>

                {activeException.details && Object.keys(activeException.details).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E5EAF2]">
                    <span className="text-[11px] text-[#64748B] font-semibold">Diagnostic Attributes:</span>
                    <div className="mt-1 bg-[#F7F9FC] p-2 rounded-lg font-mono text-[11px] text-[#111827] space-y-0.5">
                      {Object.entries(activeException.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-[#64748B]">{k}:</span>
                          <span>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-Drafted AI Follow-Up Messages */}
              {activeException.draft_messages && activeException.draft_messages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#111827] uppercase text-[11px] tracking-wider">
                      Pre-Drafted Communications ({activeException.draft_messages.length})
                    </h4>
                    <span className="text-[10px] text-[#64748B] italic">Review before sending</span>
                  </div>

                  {activeException.draft_messages.map((msg, idx) => (
                    <div key={idx} className="bg-white border border-[#E5EAF2] rounded-xl p-3.5 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-[#2563EB]">
                          To: {msg.recipient_type} ({msg.recipient_name || 'Contact'})
                        </span>
                        <button
                          onClick={() => handleCopyMessage(msg.message, idx)}
                          className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-[#2563EB] bg-[#EFF6FF] rounded hover:bg-blue-100 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={12} className="mr-1 text-emerald-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} className="mr-1" />
                              Copy Draft
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] font-semibold text-[#111827]">{msg.subject}</div>
                      <p className="text-xs text-[#64748B] leading-relaxed bg-[#F7F9FC] p-2.5 rounded-lg border border-[#E5EAF2]">
                        {msg.message}
                      </p>
                      <div className="text-[10px] text-[#64748B]">Trigger Reason: {msg.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes & Activity Log */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#111827] uppercase text-[11px] tracking-wider">Internal Notes & Audit Log</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeException.notes.length === 0 ? (
                    <p className="text-[11px] text-[#64748B] italic">No notes added yet.</p>
                  ) : (
                    activeException.notes.map((n, i) => (
                      <div key={i} className="bg-[#F7F9FC] p-2 rounded-lg text-xs text-[#111827] border border-[#E5EAF2]">
                        {n}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add operational note or escalate to supervisor..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1E40AF] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E5EAF2] bg-[#F7F9FC] flex justify-between items-center">
              <span className="text-[11px] text-[#64748B]">
                Changes update local working prototype state.
              </span>
              <button
                onClick={() => setActiveException(null)}
                className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#111827] font-semibold rounded-lg hover:bg-gray-100 text-xs transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

