import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  Cpu,
  AlertTriangle,
  Database,
  FastForward,
  MessageSquare,
  Clock,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  exceptionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  exceptionCount = 0
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Renewal Pipeline', icon: GitFork },
    { id: 'reconciliation', label: 'Reconciliation Engine', icon: Cpu },
    { id: 'exceptions', label: 'Exception Center', icon: AlertTriangle, badge: exceptionCount },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'automation', label: 'Automation Workflow', icon: FastForward },
    { id: 'messages', label: 'Message Center', icon: MessageSquare },
    { id: 'sla', label: 'SLA Monitoring', icon: Clock },
    { id: 'reports', label: 'Operations Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-white border-r border-[#E5EAF2] flex flex-col transition-all duration-300 select-none z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-[#E5EAF2] flex items-center justify-between px-4">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm flex-shrink-0">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[#111827] tracking-tight whitespace-nowrap">
                BAMBINOS
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
                Operations
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm mx-auto shadow-sm">
            B
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#64748B] hover:text-[#111827] p-1.5 rounded-md hover:bg-[#F7F9FC] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                  : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F7F9FC]'
              } ${collapsed ? 'justify-center' : 'justify-between'}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  size={18}
                  className={isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}
                />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-[#E5EAF2]">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#F7F9FC]">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs flex-shrink-0">
                OP
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-semibold text-[#111827] truncate">
                  Ops Lead
                </span>
                <span className="text-[10px] text-[#64748B] truncate">
                  Head of Operations
                </span>
              </div>
            </div>
            <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs mx-auto">
            OP
          </div>
        )}
      </div>
    </aside>
  );
};

