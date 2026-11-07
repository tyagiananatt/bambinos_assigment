import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { OverviewPage } from './pages/OverviewPage';
import { PipelinePage } from './pages/PipelinePage';
import { ReconciliationEnginePage } from './pages/ReconciliationEnginePage';
import { ExceptionCenterPage } from './pages/ExceptionCenterPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { WorkflowSimulatorPage } from './pages/WorkflowSimulatorPage';
import { MessageCenterPage } from './pages/MessageCenterPage';
import { SlaTrackerPage } from './pages/SlaTrackerPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './api';
import { ReconciliationSummary, SlaMetrics, ExceptionRecord, FollowUpMessage } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [sla, setSla] = useState<SlaMetrics | null>(null);
  const [messages, setMessages] = useState<FollowUpMessage[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, slaRes, msgRes, excRes] = await Promise.all([
        api.getReconciliation(),
        api.getSlaMetrics(),
        api.getMessages(),
        api.getExceptions()
      ]);
      setSummary(sumRes);
      setSla(slaRes);
      setMessages(msgRes);
      setExceptions(excRes);
    } catch (err: any) {
      console.error("Failed to load platform data", err);
      showToast("Backend connection failed. Please ensure FastAPI is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRunReconciliation = async () => {
    try {
      setIsLoading(true);
      showToast("Running cross-dataset reconciliation engine...");
      const updated = await api.runReconciliation();
      setSummary(updated);
      const [slaRes, msgRes, excRes] = await Promise.all([
        api.getSlaMetrics(),
        api.getMessages(),
        api.getExceptions()
      ]);
      setSla(slaRes);
      setMessages(msgRes);
      setExceptions(excRes);
      showToast(`Reconciliation complete! ${updated.auto_approved_renewals} auto-approved, ${updated.flagged_exceptions} exceptions.`);
    } catch (err: any) {
      console.error("Reconciliation execution failed", err);
      showToast("Reconciliation failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateException = async (id: string, payload: { status?: string; assigned_to?: string; note?: string }) => {
    try {
      await api.updateException(id, payload);
      const excRes = await api.getExceptions();
      setExceptions(excRes);
      showToast("Exception updated successfully.");
    } catch (err) {
      console.error("Failed to update exception", err);
      showToast("Failed to update exception.");
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC] text-[#111827] overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#111827] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        exceptionCount={summary?.flagged_exceptions || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          lastSyncTime={summary?.last_sync_timestamp}
          onRefresh={loadAllData}
          onRunReconciliation={handleRunReconciliation}
          isLoading={isLoading}
        />

        {/* Page View Container */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && (
              <OverviewPage
                summary={summary}
                sla={sla}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'pipeline' && (
              <PipelinePage
                records={summary?.records || []}
              />
            )}

            {currentTab === 'reconciliation' && (
              <ReconciliationEnginePage
                summary={summary}
                onRunReconciliation={handleRunReconciliation}
                isLoading={isLoading}
              />
            )}

            {currentTab === 'exceptions' && (
              <ExceptionCenterPage
                exceptions={exceptions}
                onUpdateException={handleUpdateException}
              />
            )}

            {currentTab === 'data' && (
              <DataManagementPage />
            )}

            {currentTab === 'automation' && (
              <WorkflowSimulatorPage />
            )}

            {currentTab === 'messages' && (
              <MessageCenterPage
                messages={messages}
              />
            )}

            {currentTab === 'sla' && (
              <SlaTrackerPage
                sla={sla}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsPage />
            )}

            {currentTab === 'settings' && (
              <SettingsPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
