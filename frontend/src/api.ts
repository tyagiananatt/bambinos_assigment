import axios from 'axios';
import { ReconciliationSummary, SimulationResult, ExceptionRecord, SlaMetrics, FollowUpMessage } from './types';

const API_BASE = 'http://localhost:8000/api';

export const api = {
  getReconciliation: async (): Promise<ReconciliationSummary> => {
    const res = await axios.get(`${API_BASE}/reconciliation`);
    return res.data;
  },

  runReconciliation: async (): Promise<ReconciliationSummary> => {
    const res = await axios.post(`${API_BASE}/reconciliation/run`);
    return res.data;
  },

  simulateWorkflow: async (): Promise<SimulationResult> => {
    const res = await axios.post(`${API_BASE}/reconciliation/simulate`);
    return res.data;
  },

  getExceptions: async (filters?: { category?: string; severity?: string; status?: string; search?: string }): Promise<ExceptionRecord[]> => {
    const res = await axios.get(`${API_BASE}/exceptions`, { params: filters });
    return res.data;
  },

  updateException: async (id: string, payload: { status?: string; assigned_to?: string; note?: string }) => {
    const res = await axios.patch(`${API_BASE}/exceptions/${id}`, payload);
    return res.data;
  },

  getSlaMetrics: async (): Promise<SlaMetrics> => {
    const res = await axios.get(`${API_BASE}/sla`);
    return res.data;
  },

  getDatasetsMetadata: async () => {
    const res = await axios.get(`${API_BASE}/data`);
    return res.data;
  },

  previewDataset: async (tableName: string, page = 1, pageSize = 20, search = '') => {
    const res = await axios.get(`${API_BASE}/data/preview/${tableName}`, {
      params: { page, page_size: pageSize, search }
    });
    return res.data;
  },

  uploadDataset: async (tableName: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/data/upload/${tableName}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getMessages: async (recipientType?: string): Promise<FollowUpMessage[]> => {
    const res = await axios.get(`${API_BASE}/messages`, { params: { recipient_type: recipientType } });
    return res.data;
  },

  getAuditLogs: async () => {
    const res = await axios.get(`${API_BASE}/audit-logs`);
    return res.data;
  },

  getDownloadUrl: (type: 'auto-approved' | 'exceptions' | 'messages' | 'booking-ready' | 'summary-json' | 'case-report-pdf') => {
    return `${API_BASE}/exports/${type}`;
  }
};

