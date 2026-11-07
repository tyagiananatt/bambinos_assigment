import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  Database,
  Check,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState<boolean>(true);
  const [maxBatchCapacity, setMaxBatchCapacity] = useState<number>(6);
  const [paymentToFormSla, setPaymentToFormSla] = useState<number>(4);
  const [paymentToApprovalSla, setPaymentToApprovalSla] = useState<number>(8);
  const [paymentToScheduleSla, setPaymentToScheduleSla] = useState<number>(24);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Check size={14} />
          <span>Operational settings saved successfully!</span>
        </div>
      )}

      {/* Engine Controls */}
      <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm space-y-4 text-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-[#E5EAF2]">
          <Sliders size={20} className="text-[#2563EB]" />
          <div>
            <h3 className="font-bold text-sm text-[#111827]">Reconciliation Automation Controls</h3>
            <p className="text-[#64748B]">Configure thresholds for zero-touch auto-approvals and capacity safeguards.</p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#111827] block">Enable Zero-Touch Auto-Approval</span>
              <span className="text-[#64748B]">Automatically approve clean renewals meeting 100% of validation rules.</span>
            </div>
            <button
              onClick={() => setAutoApprovalEnabled(!autoApprovalEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                autoApprovalEnabled ? 'bg-[#2563EB]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoApprovalEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5EAF2]">
            <div>
              <span className="font-semibold text-[#111827] block">Maximum Batch Capacity Safeguard</span>
              <span className="text-[#64748B]">Halt auto-approval and flag BATCH_UNAVAILABLE when student count reaches cap.</span>
            </div>
            <input
              type="number"
              value={maxBatchCapacity}
              onChange={(e) => setMaxBatchCapacity(Number(e.target.value))}
              className="w-20 px-3 py-1.5 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg font-bold text-center text-xs"
            />
          </div>
        </div>
      </div>

      {/* SLA Thresholds */}
      <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm space-y-4 text-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-[#E5EAF2]">
          <Shield size={20} className="text-[#2563EB]" />
          <div>
            <h3 className="font-bold text-sm text-[#111827]">Operational SLA Targets (Hours)</h3>
            <p className="text-[#64748B]">Set breach warning thresholds for operations telemetry.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="font-semibold text-[#111827] block mb-1">Payment-to-Form SLA (Hours)</label>
            <input
              type="number"
              value={paymentToFormSla}
              onChange={(e) => setPaymentToFormSla(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-[#111827] block mb-1">Payment-to-Approval SLA (Hours)</label>
            <input
              type="number"
              value={paymentToApprovalSla}
              onChange={(e) => setPaymentToApprovalSla(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-[#111827] block mb-1">Payment-to-Scheduling SLA (Hours)</label>
            <input
              type="number"
              value={paymentToScheduleSla}
              onChange={(e) => setPaymentToScheduleSla(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 bg-[#2563EB] text-white font-semibold text-xs rounded-lg hover:bg-[#1E40AF] transition-colors shadow-sm"
        >
          <Save size={14} className="mr-1.5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

