import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

export const DataManagementPage: React.FC = () => {
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePreviewTable, setActivePreviewTable] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ columns: string[]; data: any[]; total_records: number; page: number } | null>(null);
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const tableKeys = [
    { id: 'invoices', label: '1. Invoices', file: '1_invoices.csv', desc: 'Parent renewal payment transactions from Razorpay/Stripe' },
    { id: 'faculty_forms', label: '2. Faculty Form Unapproved', file: '2_faculty_form_unapproved.csv', desc: 'Educator submitted renewal forms with payment link & batch preferences' },
    { id: 'booking_requests', label: '3. Booking Requests', file: '3_booking_requests.csv', desc: 'Ops team verification and allocation queue' },
    { id: 'class_schedules', label: '4. Class Schedule Bookings', file: '4_class_schedule_bookings.csv', desc: 'Active scheduled live class session slots' },
    { id: 'reference', label: '5. Reference Active Roster', file: 'reference_active_batches_and_students.csv', desc: 'Master active students, educator mapping, batch capacity (max 6)' },
  ];

  const loadMetadata = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDatasetsMetadata();
      setMetadata(data);
    } catch (err) {
      console.error("Failed to load dataset metadata", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const handleOpenPreview = async (tableName: string, page = 1) => {
    try {
      setActivePreviewTable(tableName);
      const res = await api.previewDataset(tableName, page, 15, previewSearch);
      setPreviewData(res);
    } catch (err) {
      console.error("Failed to load table preview", err);
    }
  };

  const handleFileUpload = async (tableName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadStatus(`Uploading ${file.name}...`);
      await api.uploadDataset(tableName, file);
      setUploadStatus(`Successfully replaced ${file.name} and re-ran reconciliation!`);
      loadMetadata();
      if (activePreviewTable === tableName) {
        handleOpenPreview(tableName, 1);
      }
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.response?.data?.detail || err.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Feedback Toast */}
      {uploadStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{uploadStatus}</span>
          <button onClick={() => setUploadStatus('')}><X size={14} /></button>
        </div>
      )}

      {/* 5 Dataset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tableKeys.map(tk => {
          const meta = metadata[tk.id] || {};
          return (
            <div
              key={tk.id}
              className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet size={18} className="text-[#2563EB]" />
                    <h3 className="font-bold text-sm text-[#111827]">{tk.label}</h3>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={11} className="mr-1" />
                    Valid
                  </span>
                </div>
                <p className="font-mono text-xs text-[#2563EB] mb-2">{tk.file}</p>
                <p className="text-xs text-[#64748B] mb-4">{tk.desc}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-[#F7F9FC] p-3 rounded-lg border border-[#E5EAF2] text-xs">
                  <div>
                    <span className="text-[#64748B]">Total Rows:</span>
                    <div className="font-bold text-[#111827]">{meta.total_rows ?? '-'}</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Total Columns:</span>
                    <div className="font-bold text-[#111827]">{meta.total_cols ?? '-'}</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Missing Values:</span>
                    <div className="font-medium text-[#111827]">{meta.missing_values_count ?? 0}</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Duplicates:</span>
                    <div className="font-medium text-[#111827]">{meta.duplicate_rows ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E5EAF2]">
                <button
                  onClick={() => handleOpenPreview(tk.id, 1)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye size={13} className="mr-1.5" />
                  Preview Data
                </button>

                <label className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#111827] bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload size={13} className="mr-1.5 text-[#64748B]" />
                  Replace CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload(tk.id, e)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dataset Preview Modal */}
      {activePreviewTable && previewData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-[#E5EAF2] shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E5EAF2] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#2563EB] uppercase">Table Preview</span>
                <h3 className="text-base font-bold text-[#111827] font-mono">
                  {tableKeys.find(t => t.id === activePreviewTable)?.file}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewTable(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-gray-100 hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search & Stats Bar */}
            <div className="px-4 py-3 bg-[#F7F9FC] border-b border-[#E5EAF2] flex items-center justify-between">
              <div className="relative w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search in table..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenPreview(activePreviewTable, 1)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <span className="text-xs text-[#64748B]">
                Showing {previewData.data.length} of {previewData.total_records} records
              </span>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F7F9FC] text-[#64748B] font-semibold uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#E5EAF2]">
                  <tr>
                    {previewData.columns.map(col => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap bg-[#F7F9FC]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF2] font-mono text-[11px]">
                  {previewData.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      {previewData.columns.map(col => (
                        <td key={col} className="py-2 px-3 whitespace-nowrap text-[#111827]">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#E5EAF2] bg-[#F7F9FC] flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <button
                  disabled={previewData.page <= 1}
                  onClick={() => handleOpenPreview(activePreviewTable, previewData.page - 1)}
                  className="px-2.5 py-1 border border-[#E5EAF2] rounded bg-white text-[#111827] disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>Page {previewData.page}</span>
                <button
                  disabled={previewData.data.length < 15}
                  onClick={() => handleOpenPreview(activePreviewTable, previewData.page + 1)}
                  className="px-2.5 py-1 border border-[#E5EAF2] rounded bg-white text-[#111827] disabled:opacity-50"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <button
                onClick={() => setActivePreviewTable(null)}
                className="px-4 py-1.5 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1E40AF]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

