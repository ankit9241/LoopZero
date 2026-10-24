import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { formatBytes } from '../lib/formatters';
import {
  HardDrive,
  Cpu,
  ShieldCheck,
  Sliders,
  Download,
  Trash2,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    files,
    commitments,
    history,
    resetToSampleData,
    clearWorkspace,
    testOllamaConnection
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'workspace' | 'model' | 'privacy' | 'preferences' | 'about'>('workspace');
  const [testingModel, setTestingModel] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Storage usage calculation
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);

  const handleTestOllama = async () => {
    setTestingModel(true);
    await testOllamaConnection();
    setTestingModel(false);
  };

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      workspace: settings.workspaceName,
      files,
      commitments,
      history,
      settings
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loopzero-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Header */}
      <div className="pb-6 border-b border-[#E5E4DC]">
        <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-1 font-semibold">
          CONFIGURATION & PRIVACY
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#777970]">
          Inspect local storage, verify local AI pipelines, and define safety preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side Tab Navigation */}
        <div className="md:col-span-3 space-y-1 font-mono-code text-xs">
          {[
            { id: 'workspace', label: 'Workspace', icon: <HardDrive className="w-3.5 h-3.5" /> },
            { id: 'model', label: 'Local AI Model', icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'privacy', label: 'Privacy & Storage', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'preferences', label: 'Preferences', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'about', label: 'About LOOPZERO', icon: <Info className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#EAF0E6] text-[#536B4F] font-semibold border border-[#C8D8C2]'
                  : 'text-[#777970] hover:text-[#20211D] hover:bg-[#FFFFFF]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side Content Panel */}
        <div className="md:col-span-9 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl p-6 sm:p-7 shadow-2xs space-y-6">
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl text-[#20211D]">Workspace Storage</h3>
                <p className="text-xs text-[#777970] mt-1">
                  Manage local document index and workspace persistence boundaries.
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono-code">
                <div>
                  <label className="text-xs font-sans font-medium text-[#20211D] block mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={settings.workspaceName}
                    onChange={(e) => updateSettings({ workspaceName: e.target.value })}
                    className="w-full sm:w-80 px-3 py-1.5 border border-[#E5E4DC] rounded-md focus:outline-none focus:border-[#536B4F] text-[#20211D]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
                  <div>
                    <span className="text-[#9A9C94] uppercase text-[10px] block">Files Indexed</span>
                    <span className="text-sm font-semibold text-[#20211D]">{files.length}</span>
                  </div>
                  <div>
                    <span className="text-[#9A9C94] uppercase text-[10px] block">Storage Usage</span>
                    <span className="text-sm font-semibold text-[#20211D]">
                      {formatBytes(totalSizeBytes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#9A9C94] uppercase text-[10px] block">Discovered Loops</span>
                    <span className="text-sm font-semibold text-[#20211D]">
                      {commitments.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#ECEBE4] flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportData}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Export workspace JSON
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setResetDialogOpen(true)}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Restore sample dataset
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setClearDialogOpen(true)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Clear workspace
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl text-[#20211D]">Local AI Model</h3>
                <p className="text-xs text-[#777970] mt-1">
                  Connect to local Ollama daemon running open weights (e.g. Gemma 2).
                </p>
              </div>

              <div className="border border-[#E5E4DC] rounded-lg p-4 bg-[#FAF9F5] space-y-3 text-xs font-mono-code">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DC]">
                  <span className="text-[#777970]">Provider Daemon</span>
                  <span className="text-[#20211D] font-medium">{settings.modelProvider}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DC]">
                  <span className="text-[#777970]">Configured Model</span>
                  <span className="text-[#536B4F] font-semibold">{settings.configuredModel}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DC]">
                  <span className="text-[#777970]">Daemon Port Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      settings.ollamaStatus === 'connected'
                        ? 'bg-[#EAF0E6] text-[#536B4F] border border-[#C8D8C2]'
                        : 'bg-[#FAF6EE] text-[#B27622] border border-[#E9DEC7]'
                    }`}
                  >
                    {settings.ollamaStatus === 'connected' ? 'Connected (Port 11434)' : 'Not detected (Simulation mode)'}
                  </span>
                </div>
                {settings.lastInferenceAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#777970]">Last Verified Probe</span>
                    <span className="text-[#20211D]">{settings.lastInferenceAt}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#FAF6EE] border border-[#E9DEC7] rounded-lg text-xs text-[#8E6924] leading-relaxed">
                <span className="font-semibold block mb-0.5">Honest Architecture:</span>
                Your configured local model processes supported content on your device when the local
                inference pipeline is used. If Ollama is offline, LOOPZERO operates in local
                demonstration mode without attempting secret remote API calls.
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={handleTestOllama}
                isLoading={testingModel}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Probe localhost:11434
              </Button>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl text-[#20211D]">Privacy Guarantee</h3>
                <p className="text-xs text-[#777970] mt-1">
                  How LOOPZERO enforces on-device isolation.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#555750] leading-relaxed">
                <div className="p-4 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
                  <h4 className="font-sans font-semibold text-[#20211D] mb-1">
                    Browser IndexedDB Storage
                  </h4>
                  <p>
                    All imported documents, OCR extracted text, commitment graphs, and audit history
                    are persisted inside your browser&rsquo;s sandboxed IndexedDB database. Nothing is
                    sent to external telemetry or analytics servers.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
                  <h4 className="font-sans font-semibold text-[#20211D] mb-1">
                    File System Boundaries
                  </h4>
                  <p>
                    When using the File System Access API, LOOPZERO only reads the specific files or
                    directories you grant permission to. We never request unrestricted disk root
                    access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl text-[#20211D]">Processing Preferences</h3>
                <p className="text-xs text-[#777970] mt-1">
                  Fine-tune automated grouping and safety confirmation strictness.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <label className="flex items-start gap-3 p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoGroupRelated}
                    onChange={(e) => updateSettings({ autoGroupRelated: e.target.checked })}
                    className="mt-0.5 rounded text-[#536B4F] focus:ring-[#536B4F]"
                  />
                  <div>
                    <span className="font-medium text-[#20211D] block">
                      Automatically group strongly related files
                    </span>
                    <span className="text-[#777970]">
                      Files with identical project metadata will be grouped together into a shared
                      case file.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireReviewForUncertain}
                    onChange={(e) =>
                      updateSettings({ requireReviewForUncertain: e.target.checked })
                    }
                    className="mt-0.5 rounded text-[#536B4F] focus:ring-[#536B4F]"
                  />
                  <div>
                    <span className="font-medium text-[#20211D] block">
                      Require review for uncertain commitments (&lt;90% confidence)
                    </span>
                    <span className="text-[#777970]">
                      Forces an explicit confirmation step before suggesting automated file changes.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl text-[#20211D]">About LOOPZERO</h3>
                <p className="text-xs text-[#777970] mt-1">
                  Version 0.1.0-alpha · Editorial Desktop Experience
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg space-y-3 text-xs leading-relaxed text-[#555750]">
                <p className="font-medium text-[#20211D]">
                  Stop managing tasks. Start closing loops.
                </p>
                <p>
                  LOOPZERO turns scattered digital clutter into a small, evidence-backed queue of
                  things worth finishing. Built with React 19, TypeScript, Tailwind CSS v4, GSAP, and
                  designed for local inference via Gemma 2.
                </p>
                <p className="font-mono-code text-[11px] text-[#9A9C94] pt-2 border-t border-[#E5E4DC]">
                  Architecture: Local-first · IndexedDB persistence · Zero remote telemetry
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Resetting Sample Data */}
      <Dialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Restore sample workspace data?"
        description="This will reload the initial synthetic documents, open loops, and sample actions."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                resetToSampleData();
                setResetDialogOpen(false);
              }}
            >
              Restore dataset
            </Button>
          </div>
        }
      >
        <p className="text-xs text-[#777970]">
          Any custom files or manual status edits you made will be replaced by the default demo suite.
        </p>
      </Dialog>

      {/* Confirmation Dialog for Clearing Workspace */}
      <Dialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        title="Clear entire local workspace?"
        description="All local files, discovered loops, and queued actions will be erased."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                clearWorkspace();
                setClearDialogOpen(false);
              }}
            >
              Erase workspace
            </Button>
          </div>
        }
      >
        <div className="p-3 bg-[#FCECE9] border border-[#F4C5BE] rounded-lg text-xs text-[#A33A2B] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            This action cannot be undone. You will be left with an empty workspace. (You can still
            restore the sample dataset anytime from Settings).
          </p>
        </div>
      </Dialog>
    </div>
  );
};
