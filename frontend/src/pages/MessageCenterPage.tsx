import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  Search,
  Filter,
  Download,
  ShieldAlert,
  Send,
  Edit3
} from 'lucide-react';
import { FollowUpMessage } from '../types';
import { api } from '../api';

interface MessageCenterPageProps {
  messages: FollowUpMessage[];
}

export const MessageCenterPage: React.FC<MessageCenterPageProps> = ({ messages }) => {
  const [recipientFilter, setRecipientFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editedText, setEditedText] = useState<string>('');

  const recipients = ['All', 'Teacher', 'Parent', 'Operations'];

  const filtered = messages.filter(m => {
    const matchesRecipient = recipientFilter === 'All' || m.recipient_type.toLowerCase() === recipientFilter.toLowerCase();
    const s = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      m.subject.toLowerCase().includes(s) ||
      m.message.toLowerCase().includes(s) ||
      m.reason.toLowerCase().includes(s) ||
      (m.recipient_name && m.recipient_name.toLowerCase().includes(s));
    return matchesRecipient && matchesSearch;
  });

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleStartEdit = (idx: number, currentText: string) => {
    setEditingIdx(idx);
    setEditedText(currentText);
  };

  const handleSaveEdit = (idx: number) => {
    messages[idx].message = editedText;
    setEditingIdx(null);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
        <ShieldAlert size={18} className="text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900">
          <span className="font-bold">Human-in-the-Loop Message Drafting Mode:</span> All messages generated here are operational drafts constructed by deterministic rule templates and NLP context. No external WhatsApp messages, SMS, or emails are automatically dispatched without human approval.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search message text, subject, recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex space-x-1">
            {recipients.map(r => (
              <button
                key={r}
                onClick={() => setRecipientFilter(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  recipientFilter === r ? 'bg-[#2563EB] text-white font-semibold' : 'bg-[#F7F9FC] text-[#64748B] hover:text-[#111827]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <a
            href={api.getDownloadUrl('messages')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#111827] bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={13} className="mr-1.5 text-[#2563EB]" />
            Export Drafts CSV
          </a>
        </div>
      </div>

      {/* Message Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl p-8 text-center text-[#64748B] border border-[#E5EAF2]">
            No communication drafts found matching your search.
          </div>
        ) : (
          filtered.map((msg, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-[#E5EAF2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    msg.recipient_type === 'Teacher' ? 'bg-amber-100 text-amber-800' :
                    msg.recipient_type === 'Parent' ? 'bg-blue-100 text-[#2563EB]' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {msg.recipient_type}: {msg.recipient_name || 'Contact'}
                  </span>
                  <span className="text-[10px] text-[#64748B]">{msg.recipient_contact || 'N/A'}</span>
                </div>

                <h4 className="font-bold text-xs text-[#111827]">{msg.subject}</h4>

                {editingIdx === idx ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full h-24 p-2 text-xs bg-[#F7F9FC] border border-[#2563EB] rounded-lg focus:outline-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingIdx(null)}
                        className="px-2 py-1 text-xs text-[#64748B] hover:text-[#111827]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(idx)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#2563EB] text-white rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[#111827] leading-relaxed bg-[#F7F9FC] p-3 rounded-lg border border-[#E5EAF2]">
                    {msg.message}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#E5EAF2] flex items-center justify-between text-[11px]">
                <span className="text-[#64748B] truncate max-w-xs" title={msg.reason}>
                  Trigger: {msg.reason}
                </span>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleStartEdit(idx, msg.message)}
                    className="p-1.5 text-[#64748B] hover:text-[#111827] rounded"
                    title="Edit draft"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    onClick={() => handleCopy(msg.message, idx)}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] rounded hover:bg-blue-100 transition-colors"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check size={12} className="mr-1 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} className="mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

