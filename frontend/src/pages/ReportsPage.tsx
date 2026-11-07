import React, { useState } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  BookOpen,
  Users,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../api';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rca' | 'architecture' | 'sop' | 'change' | 'roadmap'>('rca');

  return (
    <div className="space-y-6">
      {/* PDF Export Hero Card */}
      <div className="bg-gradient-to-r from-blue-900 to-[#1E40AF] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 uppercase tracking-wider">
            Compulsory Deliverable
          </span>
          <h2 className="text-xl font-bold mt-1">Official Case Report & Executive Deck</h2>
          <p className="text-xs text-blue-100 max-w-xl mt-1">
            Complete formal business documentation covering Root Cause Audit, Operational Leakage Matrix, Automated Architecture, SOPs, Change Management, and 30-60-90 Day Roadmap.
          </p>
        </div>

        <a
          href={api.getDownloadUrl('case-report-pdf')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2.5 bg-white text-[#1E40AF] font-bold text-xs rounded-xl shadow-lg hover:bg-blue-50 transition-all flex-shrink-0"
        >
          <Download size={15} className="mr-2 text-[#2563EB]" />
          Download PDF Case Report
        </a>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-[#E5EAF2] pb-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('rca')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'rca' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          Deliverable A: Root Cause & Leakage Audit
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'architecture' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          Deliverable B: Re-Engineered Architecture
        </button>
        <button
          onClick={() => setActiveTab('sop')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'sop' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          Deliverable D: Practical SOPs
        </button>
        <button
          onClick={() => setActiveTab('change')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'change' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          Change Management (200+ Teachers)
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'roadmap' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          30-60-90 Day Rollout Plan
        </button>
      </div>

      {/* Tab 1: Root Cause Analysis */}
      {activeTab === 'rca' && (
        <div className="space-y-5 text-xs">
          <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#111827]">Forensic Root Cause Analysis of Existing 4-Stage Pipeline</h3>
            <p className="text-[#64748B] leading-relaxed">
              Bambinos.live currently relies on an asynchronous 4-hop relay: Razorpay Payment → Educator Google Form → Ops Approval → Session Scheduling. This fragmented design creates multiple single points of human failure:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                <span className="font-bold text-[#111827] block mb-1">1. Orphaned Invoices (Missing Teacher Forms)</span>
                <p className="text-[#64748B]">
                  Observed in Invoices 84906 & 84910. When parents pay directly via payment link, teachers are notified asynchronously. If the teacher delays or forgets form submission, the payment remains completely invisible to the scheduling team.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                <span className="font-bold text-[#111827] block mb-1">2. Transposed Invoice Identifiers</span>
                <p className="text-[#64748B]">
                  Observed in Form 3313 (entered 84931 for Student 68113 instead of actual Invoice 84913). Manual data entry allows human transposition errors, disconnecting invoice records from student renewals and requiring 30+ minutes of manual ops investigation.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                <span className="font-bold text-[#111827] block mb-1">3. Capacity Blind Spots</span>
                <p className="text-[#64748B]">
                  Observed in Batch 9205 (Student 68105). Teachers confirm renewals without real-time visibility into batch caps (6/6 students). Booking requests fail at the final stage, forcing embarrassing parent escalations.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                <span className="font-bold text-[#111827] block mb-1">4. Phantom Payment Submissions</span>
                <p className="text-[#64748B]">
                  Observed in Form 3311 (Invoice 84911). Teachers accept unverified WhatsApp UPI transaction screenshots from parents and submit renewal forms despite gateway payment failure.
                </p>
              </div>
            </div>
          </div>

          {/* Operational Leakage Audit Table */}
          <div className="bg-white rounded-xl border border-[#E5EAF2] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E5EAF2]">
              <h4 className="font-bold text-sm text-[#111827]">Operational Leakage Audit Matrix</h4>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FC] text-[#64748B] font-semibold uppercase tracking-wider border-b border-[#E5EAF2]">
                <tr>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Root Cause</th>
                  <th className="py-3 px-4">Business Impact</th>
                  <th className="py-3 px-4">Automated Detection</th>
                  <th className="py-3 px-4">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF2]">
                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">Orphaned Invoices</td>
                  <td className="py-3 px-4">Asynchronous teacher form dependent pipeline</td>
                  <td className="py-3 px-4">Student in limbo; parent churn risk</td>
                  <td className="py-3 px-4">Outer-join on invoices without forms after 4h</td>
                  <td className="py-3 px-4 font-medium text-[#2563EB]">Teacher Ops</td>
                </tr>
                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">ID Transposition Typos</td>
                  <td className="py-3 px-4">Manual copy-pasting of IDs into Google Forms</td>
                  <td className="py-3 px-4">Ops triage time: 25-45 mins per incident</td>
                  <td className="py-3 px-4">Fuzzy distance + student_id cross match</td>
                  <td className="py-3 px-4 font-medium text-[#2563EB]">Ops Desk</td>
                </tr>
                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">Capacity Overflow</td>
                  <td className="py-3 px-4">No real-time roster quota enforcement</td>
                  <td className="py-3 px-4">Breach of 1:6 ratio promise or scheduling delay</td>
                  <td className="py-3 px-4">Pre-approval query: active &gt;= max_batch_size</td>
                  <td className="py-3 px-4 font-medium text-[#2563EB]">Scheduling Lead</td>
                </tr>
                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">Phantom Payments</td>
                  <td className="py-3 px-4">Trusting WhatsApp screenshots over webhooks</td>
                  <td className="py-3 px-4">Free session delivery without settled funds</td>
                  <td className="py-3 px-4">Strict gateway settled_id constraint</td>
                  <td className="py-3 px-4 font-medium text-[#2563EB]">Finance Desk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture */}
      {activeTab === 'architecture' && (
        <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#111827]">Proposed Production Automation Architecture</h3>
          <p className="text-[#64748B]">
            To achieve reliable 90%+ automation, the future production architecture leverages event-driven webhooks, low-code orchestration engines (n8n / Make), unified data storage, and WhatsApp Business API:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-2">
              <span className="font-bold text-[#2563EB] text-xs uppercase">Layer 1: Ingestion & Orchestration</span>
              <p className="text-[#64748B]">
                <b>Tools:</b> Razorpay Webhooks, n8n / Make.com.<br/>
                Instantly captures <code>payment.captured</code> events. Pulls student profile and triggers zero-touch validation pipeline within 500ms.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-2">
              <span className="font-bold text-[#2563EB] text-xs uppercase">Layer 2: Logic & Capacity Validation</span>
              <p className="text-[#64748B]">
                <b>Tools:</b> Python / FastAPI Engine, MySQL / PostgreSQL.<br/>
                Runs exact student lookup, verifies available slots in current batch (quota &lt; 6), and verifies educator assignment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-2">
              <span className="font-bold text-[#2563EB] text-xs uppercase">Layer 3: Dispatch & Observability</span>
              <p className="text-[#64748B]">
                <b>Tools:</b> WhatsApp Business API, Metabase.<br/>
                Dispatches schedule confirmations directly to parents and updates educator rosters. Real-time Metabase dashboards monitor SLA compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SOP */}
      {activeTab === 'sop' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-[#111827]">Standard Operating Procedure: Educator (Teacher)</h4>
            <ul className="list-disc pl-4 space-y-1 text-[#64748B]">
              <li>Never solicit or accept offline screenshots as proof of renewal. Parents must pay via official payment links.</li>
              <li>Always select the verified invoice from the portal dropdown rather than manually typing invoice digits.</li>
              <li>If a parent requests a timing change, mark 'No' for same-batch continuation and select alternate requested days.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-[#111827]">Standard Operating Procedure: Operations Team</h4>
            <ul className="list-disc pl-4 space-y-1 text-[#64748B]">
              <li>Daily 9:00 AM Review: Ops Lead reviews Exception Center and checks Stuck Invoices &gt;12h.</li>
              <li>Critical severity items (Payment Failed, Capacity Full) must be resolved within 4 hours.</li>
              <li>When a batch hits 6/6 capacity, do not force-enroll. Create an overflow batch section or offer adjacent slots.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-[#111827]">Standard Operating Procedure: Parent Communication</h4>
            <ul className="list-disc pl-4 space-y-1 text-[#64748B]">
              <li>Instant payment receipt dispatched within 60 seconds of gateway confirmation.</li>
              <li>Batch confirmation and meeting links sent within 2 hours for clean renewals.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Change Management */}
      {activeTab === 'change' && (
        <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-sm text-[#111827]">Change Management Framework for 200+ Educators & 10 Ops Staff</h3>
          <p className="text-[#64748B]">
            Transitioning 200+ freelance and full-time teachers requires a phased, incentive-aligned rollout:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-1.5">
              <span className="font-bold text-[#111827]">Teacher Enablement & Portal Simplicity</span>
              <p className="text-[#64748B]">
                Replace complex Google Forms with a 1-click WhatsApp interactive message or lightweight educator web app with pre-populated student dropdowns. Eliminate manual invoice ID typing entirely.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-1.5">
              <span className="font-bold text-[#111827]">Ops Triage Specialization</span>
              <p className="text-[#64748B]">
                Split 10 Ops team members into 2 dedicated desks: (1) Fast-Path Queue (monitoring auto-approvals) and (2) Exception Resolution Desk (triage of capacity overflows and contact mismatches).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#111827]">30-60-90 Day Phased Implementation Roadmap</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
              <div className="flex items-center justify-between font-bold text-sm text-blue-950 mb-1">
                <span>Phase 1: Days 1–30 (Audit, Rule Engine & Shadow Pilot)</span>
                <span className="text-xs text-[#2563EB]">100% Exception Detection Accuracy</span>
              </div>
              <p className="text-blue-900">
                Deploy reconciliation engine in shadow mode running alongside existing Ops workflows. Validate cross-table integrity against live MySQL databases. Pilot auto-approvals for top 20 educators in English and Maths cohorts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <div className="flex items-center justify-between font-bold text-sm text-emerald-950 mb-1">
                <span>Phase 2: Days 31–60 (Live Auto-Approval & Scale to 200+ Educators)</span>
                <span className="text-xs text-emerald-700">&gt;60% Auto-Approval Rate</span>
              </div>
              <p className="text-emerald-900">
                Turn on live automated booking generation for clean same-batch renewals. Roll out mobile-responsive educator portal to 200+ teachers. Train Ops team on Exception Center triage and automated WhatsApp drafting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200">
              <div className="flex items-center justify-between font-bold text-sm text-purple-950 mb-1">
                <span>Phase 3: Days 61–90 (Full Autonomous Execution & Metabase SLA Dashboards)</span>
                <span className="text-xs text-purple-700">&gt;80% Automation &lt;2h TAT</span>
              </div>
              <p className="text-purple-900">
                Full production cutover across all 5 subject tracks (English, Maths, Gita, Chess, Science). Webhook-based instant scheduling with calendar sync. Metabase executive reporting for daily morning Operations standups.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

