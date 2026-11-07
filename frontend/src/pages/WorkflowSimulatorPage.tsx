import React, { useState } from 'react';
import {
  FastForward,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  FileCheck
} from 'lucide-react';
import { SimulationResult } from '../types';
import { api } from '../api';

export const WorkflowSimulatorPage: React.FC = () => {
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedPath, setSelectedPath] = useState<'happy' | 'exception'>('happy');

  const handleRunSimulation = async () => {
    try {
      setIsSimulating(true);
      const res = await api.simulateWorkflow();
      setSimulation(res);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Hero Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 flex-shrink-0">
            <FastForward size={26} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#111827]">Zero-Touch Autonomous Workflow Simulator</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-[#2563EB]">
                Event-Driven Architecture
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Simulates webhook-triggered execution from payment event to calendar scheduling and message drafting.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          <Play size={14} className="mr-1.5 fill-white" />
          {isSimulating ? 'Simulating Pipeline...' : 'Run Zero-Touch Simulation'}
        </button>
      </div>

      {/* Simulation Metrics if executed */}
      {simulation && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
          <div>
            <span className="text-[11px] text-emerald-800 font-semibold block">Records Ingested</span>
            <div className="text-xl font-bold text-emerald-950">{simulation.total_records_processed}</div>
          </div>
          <div>
            <span className="text-[11px] text-emerald-800 font-semibold block">Valid Payments</span>
            <div className="text-xl font-bold text-emerald-950">{simulation.successful_validations}</div>
          </div>
          <div>
            <span className="text-[11px] text-emerald-800 font-semibold block">Auto-Approved</span>
            <div className="text-xl font-bold text-emerald-950">{simulation.auto_approved_count}</div>
          </div>
          <div>
            <span className="text-[11px] text-amber-800 font-semibold block">Exceptions Isolated</span>
            <div className="text-xl font-bold text-amber-950">{simulation.exceptions_generated}</div>
          </div>
          <div>
            <span className="text-[11px] text-blue-800 font-semibold block">Execution Duration</span>
            <div className="text-xl font-bold text-blue-950">{simulation.processing_duration_ms} ms</div>
          </div>
        </div>
      )}

      {/* Path Selector Tabs */}
      <div className="flex space-x-2 border-b border-[#E5EAF2] pb-2 text-xs font-medium">
        <button
          onClick={() => setSelectedPath('happy')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
            selectedPath === 'happy' ? 'bg-[#16A34A] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>Happy Path (Zero-Touch Auto Approval)</span>
        </button>
        <button
          onClick={() => setSelectedPath('exception')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
            selectedPath === 'exception' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <AlertCircle size={13} />
          <span>Exception Path (Deterministic Triage)</span>
        </button>
      </div>

      {/* Path Diagram */}
      {selectedPath === 'happy' ? (
        <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Zero-Touch Happy Path Architecture</h3>
              <p className="text-xs text-[#64748B]">When all verification criteria pass, student moves from payment to scheduled class in under 1 second.</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
              Target Turnaround: &lt; 5 seconds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#2563EB]">1. Ingestion</span>
              <h4 className="font-bold text-[#111827]">Payment Webhook</h4>
              <p className="text-[#64748B]">Razorpay/Stripe fires webhook. Gateway verifies full course fee receipt.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#2563EB]">2. Matching</span>
              <h4 className="font-bold text-[#111827]">Identity & Form Join</h4>
              <p className="text-[#64748B]">Exact student_id match with registered parent contact. Teacher form confirmed.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#2563EB]">3. Capacity</span>
              <h4 className="font-bold text-[#111827]">Batch Slot Verification</h4>
              <p className="text-[#64748B]">Active students &lt; 6. Roster seat reserved without overbooking risk.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700">4. Dispatch</span>
              <h4 className="font-bold text-emerald-950">Auto-Approval & Calendar</h4>
              <p className="text-emerald-900">24 sessions booked. WhatsApp confirmation drafted to parent & educator.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-[#E5EAF2] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Deterministic Exception Handling Path</h3>
              <p className="text-xs text-[#64748B]">If any condition fails, the system halts auto-approval, isolates root cause, and routes to responsible desks.</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              Safe-Halt Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-red-700">Payment Check</span>
              <h4 className="font-bold text-red-950">Gateway Failure / Installment</h4>
              <p className="text-red-900">Routes to Finance Desk. Automated payment retry or installment agreement link sent.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-700">Teacher Check</span>
              <h4 className="font-bold text-amber-950">Missing Form / Typo</h4>
              <p className="text-amber-900">Routes to Teacher Ops. Dispatches automated reminder to educator.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#2563EB]">Capacity Check</span>
              <h4 className="font-bold text-blue-950">Batch Full (6/6)</h4>
              <p className="text-blue-900">Routes to Academic Scheduling to open overflow section or confirm alternate days.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-700">Audit Check</span>
              <h4 className="font-bold text-purple-950">Already Scheduled</h4>
              <p className="text-purple-900">Prevents duplicate session booking. Preserves current confirmed roster.</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Logs if simulation run */}
      {simulation && simulation.step_logs && (
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-[#111827]">Live Pipeline Execution Audit Logs</h3>
          <div className="space-y-2 text-xs">
            {simulation.step_logs.map(log => (
              <div key={log.step} className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2] flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">
                  <Check size={11} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111827]">Step {log.step}: {log.title}</span>
                    <span className="font-mono text-[11px] font-semibold text-[#2563EB]">{log.records} Records</span>
                  </div>
                  <p className="text-[#64748B] mt-0.5">{log.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

