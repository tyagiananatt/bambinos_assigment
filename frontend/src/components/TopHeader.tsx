import React from 'react';
import { Search, RefreshCw, Play, Bell, Download } from 'lucide-react';
import { api } from '../api';

interface TopHeaderProps {
  currentTab: string;
  lastSyncTime?: string;
  onRefresh: () => void;
  onRunReconciliation: () => void;
  isLoading?: boolean;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Overview',
    subtitle: 'High-level monitor for renewals, gateway receipts, exceptions, and automation throughput.'
  },
  pipeline: {
    title: 'Renewal Pipeline',
    subtitle: 'Track students traversing Invoices → Faculty Submissions → Booking Allocations → Active Classes.'
  },
  reconciliation: {
    title: 'Reconciliation Engine',
    subtitle: 'Transparent, rule-governed cross-table validation engine with audit trails.'
  },
  exceptions: {
    title: 'Exception Center',
    subtitle: 'Triage, inspect, assign, and resolve flagged discrepancies with one-click resolutions.'
  },
  data: {
    title: 'Data Management',
    subtitle: 'Direct inspection, preview, search, schema validation, and upload for all 5 production tables.'
  },
  automation: {
    title: 'Automation Workflow Simulator',
    subtitle: 'Simulate zero-touch execution across the 5-layer pipeline and measure latency avoidance.'
  },
  messages: {
    title: 'Message Center',
    subtitle: 'Contextual, AI-templated draft notifications for Teachers, Parents, and Operations desks.'
  },
  sla: {
    title: 'SLA Monitoring & Operations',
    subtitle: 'Track Turnaround Times (TAT), compliance against targets, and orphaned invoice rates.'
  },
  reports: {
    title: 'Operations Reports & Documentation',
    subtitle: 'Comprehensive Root Cause Audit, Re-engineered Architecture, SOPs, and 30-60-90 Day Roadmap.'
  },
  settings: {
    title: 'Platform Settings & Governance',
    subtitle: 'Manage automation thresholds, API connections, notification channels, and operational rules.'
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  lastSyncTime,
  onRefresh,
  onRunReconciliation,
  isLoading = false
}) => {
  const currentMeta = TAB_TITLES[currentTab] || {
    title: 'Renewal Operations',
    subtitle: 'Monitor payments, approvals, exceptions, and class scheduling.'
  };

  return (
    <header className="bg-white border-b border-[#E5EAF2] px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-[#64748B] mb-1">
          <span>Operations</span>
          <span>/</span>
          <span className="text-[#2563EB] font-medium capitalize">{currentTab.replace('-', ' ')}</span>
        </div>
        <h1 className="text-xl font-bold text-[#111827] tracking-tight">{currentMeta.title}</h1>
        <p className="text-xs text-[#64748B] mt-0.5">{currentMeta.subtitle}</p>
      </div>

      {/* Actions & Live Status */}
      <div className="flex items-center space-x-3">
        {/* Sync Indicator */}
        <div className="hidden sm:flex flex-col text-right pr-2">
          <div className="flex items-center space-x-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">Live Sync</span>
          </div>
          <span className="text-[10px] text-[#64748B]">
            {lastSyncTime ? `Synced: ${lastSyncTime.split(' ')[1] || lastSyncTime}` : 'Synced'}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#111827] bg-white border border-[#E5EAF2] rounded-lg hover:bg-[#F7F9FC] transition-colors disabled:opacity-50"
          title="Reload latest data from backend"
        >
          <RefreshCw size={14} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>

        {/* Run Reconciliation Button */}
        <button
          onClick={onRunReconciliation}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg shadow-sm transition-all disabled:opacity-50"
          title="Execute full cross-dataset reconciliation"
        >
          <Play size={14} className="mr-1.5 fill-white" />
          Run Reconciliation
        </button>

        {/* Download PDF Case Report Pill */}
        <a
          href={api.getDownloadUrl('case-report-pdf')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          title="Download the official Case Report PDF"
        >
          <Download size={14} className="mr-1.5" />
          Case Report PDF
        </a>
      </div>
    </header>
  );
};

