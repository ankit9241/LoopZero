import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import {
  Sparkles,
  Inbox,
  RotateCcw,
  CheckSquare,
  Clock,
  Settings,
  Shield
} from 'lucide-react';

interface AppNavigationProps {
  onItemClick?: () => void;
  collapsed?: boolean;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({ onItemClick, collapsed = false }) => {
  const { actions, commitments, files } = useAppStore();

  const pendingActionsCount = actions.filter((a) => a.status === 'pending').length;
  const openLoopsCount = commitments.filter((c) => c.status === 'open' || c.status === 'ready_for_review').length;
  const readyFilesCount = files.length;

  const navItems = [
    {
      to: '/app',
      label: 'Today',
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
      exact: true
    },
    {
      to: '/app/inbox',
      label: 'Inbox',
      icon: <Inbox className="w-4 h-4 shrink-0" />,
      badge: readyFilesCount > 0 ? readyFilesCount : undefined
    },
    {
      to: '/app/loops',
      label: 'Open Loops',
      icon: <RotateCcw className="w-4 h-4 shrink-0" />,
      badge: openLoopsCount > 0 ? openLoopsCount : undefined
    },
    {
      to: '/app/actions',
      label: 'Actions',
      icon: <CheckSquare className="w-4 h-4 shrink-0" />,
      badge: pendingActionsCount > 0 ? pendingActionsCount : undefined,
      badgeHighlight: pendingActionsCount > 0
    },
    {
      to: '/app/history',
      label: 'Activity',
      icon: <Clock className="w-4 h-4 shrink-0" />
    },
    {
      to: '/app/settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 shrink-0" />
    }
  ];

  return (
    <nav className="flex flex-col justify-between h-full py-4 select-none">
      <div className="flex flex-col gap-6 px-3">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 rounded-md bg-[#536B4F] flex items-center justify-center text-[#F7F6F2] shadow-2xs shrink-0">
            <span className="font-editorial text-lg font-bold leading-none select-none">0</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-editorial text-lg tracking-tight text-[#20211D] leading-none font-bold">
                LOOPZERO
              </span>
              <span className="text-[10px] font-mono-code text-[#777970] tracking-wider uppercase mt-0.5">
                Local-First
              </span>
            </div>
          )}
        </div>

        {/* Primary Nav Links */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onItemClick}
              className={({ isActive }) =>
                `group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EAF0E6] text-[#536B4F] font-semibold shadow-2xs'
                    : 'text-[#777970] hover:text-[#20211D] hover:bg-[#F0EFE9]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.icon}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono-code rounded-full ${
                    item.badgeHighlight
                      ? 'bg-[#536B4F] text-[#F7F6F2]'
                      : 'bg-[#E5E4DC] text-[#777970]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Info / Local Security */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 rounded-lg bg-[#FAF9F5] border border-[#E5E4DC] text-[11px] text-[#777970]">
          <div className="flex items-center gap-1.5 font-medium text-[#20211D] mb-1">
            <Shield className="w-3.5 h-3.5 text-[#536B4F]" />
            <span>Device Sandbox</span>
          </div>
          <p className="leading-tight text-[10px] text-[#9A9C94]">
            Files & model weights remain strictly on device.
          </p>
        </div>
      )}
    </nav>
  );
};
