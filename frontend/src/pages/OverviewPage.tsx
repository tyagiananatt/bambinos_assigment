import React from 'react';
import {
  FileText,
  CheckCircle2,
  Zap,
  Clock,
  AlertOctagon,
  Calendar,
  Layers,
  TrendingUp,
  Download,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { ReconciliationSummary, SlaMetrics } from '../types';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../api';

interface OverviewPageProps {
  summary: ReconciliationSummary | null;
  sla: SlaMetrics | null;
  onNavigateTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  summary,
  sla,
  onNavigateTab
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64 text-[#64748B]">
        Loading executive dashboard metrics...
      </div>
    );
  }

  // Pipeline funnel data
  const funnelData = [
    { stage: '1. Invoices Paid', count: summary.verified_payments, fill: '#2563EB' },
    { stage: '2. Faculty Forms', count: summary.records.filter(r => r.teacher_form_id).length, fill: '#3B82F6' },
    { stage: '3. Booking Reqs', count: summary.records.filter(r => r.booking_request_id || r.is_auto_approvable).length, fill: '#60A5FA' },
    { stage: '4. Classes Scheduled', count: summary.records.filter(r => r.reconciliation_status === 'ALREADY_SCHEDULED' || r.ready_for_scheduling).length, fill: '#16A34A' },
  ];

  // Status Distribution Data
  const statusDistribution = [
    { name: 'Auto-Approved', value: summary.auto_approved_renewals, color: '#16A34A' },
    { name: 'Already Scheduled', value: summary.records.filter(r => r.reconciliation_status === 'ALREADY_SCHEDULED').length, color: '#2563EB' },
    { name: 'Manual Review', value: summary.manual_review_needed, color: '#D97706' },
    { name: 'Missing Teacher Form', value: summary.pending_teacher_forms, color: '#F59E0B' },
    { name: 'Payment Issues / Failed', value: summary.records.filter(r => r.reconciliation_status === 'REJECTED' || r.reconciliation_status === 'PAYMENT_PENDING').length, color: '#DC2626' }
  ].filter(d => d.value > 0);

  // Exception Categories from SLA or Summary
  const categoryData = sla?.category_distribution || [
    { category: 'Data Mismatches', count: 3 },
    { category: 'Payment Issues', count: 2 },
    { category: 'Teacher Issues', count: 2 },
    { category: 'Scheduling Issues', count: 2 },
  ];

  // Daily Trends from SLA
  const trendData = sla?.daily_trends || [
    { date: '2026-11-01', total: 2, approved: 1, exceptions: 1, volume_inr: 22500 },
    { date: '2026-11-02', total: 5, approved: 2, exceptions: 3, volume_inr: 57600 },
    { date: '2026-11-03', total: 6, approved: 2, exceptions: 4, volume_inr: 75500 },
  ];

  // Automation Performance
  const automationPerf = [
    { name: 'Zero-Touch Fast Path', value: summary.auto_approved_renewals, color: '#2563EB' },
    { name: 'Manual Operations Review', value: summary.total_invoices - summary.auto_approved_renewals, color: '#CBD5E1' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any critical exceptions */}
      {summary.flagged_exceptions > 0 && (
        <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">
                Reconciliation Complete: {summary.auto_approved_renewals} Clean Renewals Fast-Tracked, {summary.flagged_exceptions} Exceptions Flagged
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                Every exception has been classified with reason codes, responsible desks, and pre-drafted follow-up messages.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('exceptions')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg shadow-sm transition-colors whitespace-nowrap ml-4"
          >
            Review Exceptions
            <ArrowRight size={13} className="ml-1.5" />
          </button>
        </div>
      )}

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Invoices"
          value={summary.total_invoices}
          subtitle="Processed from 1_invoices.csv"
          icon={FileText}
          color="blue"
          onClick={() => onNavigateTab('data')}
        />
        <MetricCard
          title="Verified Payments"
          value={summary.verified_payments}
          subtitle="Confirmed Paid via Gateway"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Auto-Approved"
          value={summary.auto_approved_renewals}
          subtitle="100% clean rule validation"
          icon={Zap}
          color="emerald"
          onClick={() => onNavigateTab('pipeline')}
        />
        <MetricCard
          title="Pending Teacher Forms"
          value={summary.pending_teacher_forms}
          subtitle="Orphaned payments >4h"
          icon={Clock}
          color="amber"
          onClick={() => onNavigateTab('exceptions')}
        />
        <MetricCard
          title="Pending Bookings"
          value={summary.pending_booking_requests}
          subtitle="Awaiting batch selection"
          icon={Layers}
          color="indigo"
          onClick={() => onNavigateTab('pipeline')}
        />
        <MetricCard
          title="Unscheduled Students"
          value={summary.unscheduled_students}
          subtitle="Paid but class unbooked"
          icon={Calendar}
          color="amber"
        />
        <MetricCard
          title="Flagged Exceptions"
          value={summary.flagged_exceptions}
          subtitle="Requiring Ops intervention"
          icon={AlertOctagon}
          color="red"
          onClick={() => onNavigateTab('exceptions')}
        />
        <MetricCard
          title="Automation Rate"
          value={`${summary.automation_rate_pct}%`}
          subtitle={`~${summary.hours_saved_est} hours manual effort saved`}
          icon={TrendingUp}
          color="blue"
          onClick={() => onNavigateTab('sla')}
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pipeline Funnel */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Renewal Pipeline Funnel</h3>
              <p className="text-xs text-[#64748B]">Progression across the 4 core renewal milestones</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB]">
              Real Data
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5EAF2" />
                <XAxis type="number" stroke="#64748B" fontSize={11} domain={[0, 14]} />
                <YAxis dataKey="stage" type="category" stroke="#111827" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF2', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Students`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Renewal Status Distribution</h3>
              <p className="text-xs text-[#64748B]">System-classified outcomes across all processed records</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              13 Invoices
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF2', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Records`, 'Volume']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Renewal Trends */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Daily Renewal Ingestion Trends</h3>
              <p className="text-xs text-[#64748B]">Renewal payment volumes & approval cadence</p>
            </div>
            <span className="text-xs text-[#64748B]">Nov 1 - Nov 3, 2026</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF2', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="total" name="Total Invoices" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="approved" name="Auto-Approved" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="exceptions" name="Exceptions" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Exception Categories */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Exception Category Breakdown</h3>
              <p className="text-xs text-[#64748B]">Root causes driving operational bottlenecks</p>
            </div>
            <button
              onClick={() => onNavigateTab('exceptions')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View Triage
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF2', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Exception Count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Export Bar */}
      <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#111827]">Operational Data Exports</h4>
          <p className="text-xs text-[#64748B]">Download reconciled output tables and audit files for external reporting</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={api.getDownloadUrl('auto-approved')}
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#111827] bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={13} className="mr-1.5 text-[#2563EB]" />
            Auto-Approved CSV
          </a>
          <a
            href={api.getDownloadUrl('exceptions')}
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#111827] bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={13} className="mr-1.5 text-red-500" />
            Exceptions CSV
          </a>
          <a
            href={api.getDownloadUrl('booking-ready')}
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#111827] bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={13} className="mr-1.5 text-emerald-600" />
            Booking-Ready CSV
          </a>
          <a
            href={api.getDownloadUrl('summary-json')}
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#111827] bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={13} className="mr-1.5 text-[#64748B]" />
            Summary JSON
          </a>
        </div>
      </div>
    </div>
  );
};

