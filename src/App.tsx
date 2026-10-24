import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SetupPage } from './pages/SetupPage';
import { TodayPage } from './pages/TodayPage';
import { InboxPage } from './pages/InboxPage';
import { LoopsPage } from './pages/LoopsPage';
import { LoopDetailPage } from './pages/LoopDetailPage';
import { ActionsPage } from './pages/ActionsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AppShell } from './components/layout/AppShell';
import { useAppStore } from './lib/store';

export function App() {
  const { initBackendSync } = useAppStore();

  useEffect(() => {
    initBackendSync();
  }, [initBackendSync]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<SetupPage />} />

        {/* Workspace App Shell Routes */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<TodayPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="loops" element={<LoopsPage />} />
          <Route path="loops/:id" element={<LoopDetailPage />} />
          <Route path="actions" element={<ActionsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
