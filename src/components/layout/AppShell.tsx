import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import { LocalStatusIndicator } from './LocalStatusIndicator';
import { ToastContainer } from '../ui/ToastContainer';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppStore } from '../../lib/store';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { findNewLoops } = useAppStore();
  const [scanning, setScanning] = useState(false);

  // Contextual page header titles
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/app') return { title: 'Today', subtitle: 'Priority queue of neglected business' };
    if (path === '/app/inbox') return { title: 'File Inbox', subtitle: 'Everything entering your workspace' };
    if (path.startsWith('/app/loops/')) return { title: 'Loop Investigation', subtitle: 'Evidence, facts, and proposed next step' };
    if (path === '/app/loops') return { title: 'Discovered Loops', subtitle: 'Commitments inferred across files' };
    if (path === '/app/actions') return { title: 'Action Review', subtitle: 'Approval queue for system proposals' };
    if (path === '/app/history') return { title: 'Audit Trail', subtitle: 'What changed and what remains reversible' };
    if (path === '/app/settings') return { title: 'Settings & Privacy', subtitle: 'Local storage, models, and safety boundaries' };
    return { title: 'Workspace', subtitle: 'LOOPZERO Local-First' };
  };

  const pageInfo = getPageInfo();

  const handleScan = async () => {
    setScanning(true);
    await findNewLoops();
    setScanning(false);
  };

  return (
    <div className="min-h-screen flex bg-[#F7F6F2] text-[#20211D]">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Desktop Compact Sidebar (Left Rail) */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-[#FFFFFF] border-r border-[#E5E4DC] shrink-0 sticky top-0 h-screen z-30">
        <AppNavigation />
      </aside>

      {/* Mobile Header & Overlay Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#FFFFFF] border-b border-[#E5E4DC] z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md hover:bg-[#F0EFE9] text-[#20211D]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-editorial text-lg font-bold text-[#20211D]">LOOPZERO</span>
        </div>
        <LocalStatusIndicator />
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#FFFFFF] z-30 p-4 border-b border-[#E5E4DC] shadow-lg animate-in slide-in-from-top-2 duration-150">
          <AppNavigation onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 md:min-h-screen pt-14 md:pt-0">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between h-14 px-8 bg-[#FAF9F5] border-b border-[#E5E4DC] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-xl font-medium text-[#20211D] tracking-tight">
              {pageInfo.title}
            </h1>
            <span className="text-[#9A9C94] text-xs">/</span>
            <span className="text-xs text-[#777970]">{pageInfo.subtitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleScan}
              isLoading={scanning}
              icon={<Sparkles className="w-3.5 h-3.5 text-[#536B4F]" />}
            >
              Scan Loops
            </Button>
            <LocalStatusIndicator />
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
