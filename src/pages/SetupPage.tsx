import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../lib/store';
import {
  ShieldCheck,
  Cpu,
  FolderOpen,
  Sparkles,
  AlertCircle,
  HardDrive
} from 'lucide-react';

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetToSampleData, files } = useAppStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedSource, setSelectedSource] = useState<'sample' | 'folder'>('sample');

  const handleChooseSample = () => {
    setSelectedSource('sample');
    resetToSampleData();
    setCurrentStep(3);
  };

  const handleChooseFolder = () => {
    setSelectedSource('folder');
    // Set up workspace source
    updateSettings({
      storageLocation: 'IndexedDB & User-Selected Directory',
      onboardingCompleted: true
    });
    setCurrentStep(3);
  };

  const handleEnterWorkspace = () => {
    updateSettings({ onboardingCompleted: true });
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#20211D] flex flex-col justify-between p-6 sm:p-12 font-sans">
      {/* Top Wordmark */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#536B4F] flex items-center justify-center text-[#F7F6F2] font-editorial font-bold text-sm">
            0
          </div>
          <span className="font-editorial text-lg font-bold">LOOPZERO</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono-code text-[#777970]">
          <span className={currentStep === 1 ? 'text-[#536B4F] font-bold' : ''}>1. Welcome</span>
          <span>→</span>
          <span className={currentStep === 2 ? 'text-[#536B4F] font-bold' : ''}>2. Source</span>
          <span>→</span>
          <span className={currentStep === 3 ? 'text-[#536B4F] font-bold' : ''}>3. Ready</span>
        </div>
      </div>

      {/* Main Centered Setup Card */}
      <div className="max-w-xl mx-auto w-full my-auto py-8">
        {currentStep === 1 && (
          <div className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-2xl p-7 sm:p-9 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-2 font-semibold">
                First-Run Setup
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
                Let&rsquo;s clear a few open loops.
              </h1>
              <p className="mt-3 text-sm text-[#555750] leading-relaxed">
                Start with a folder of files you&rsquo;ve been meaning to deal with. You choose what
                enters LOOPZERO.
              </p>
            </div>

            {/* Three concise facts */}
            <div className="border border-[#E5E4DC] rounded-xl p-4 bg-[#FAF9F5] space-y-3">
              <div className="flex items-start gap-3 text-xs text-[#33352E]">
                <ShieldCheck className="w-4 h-4 text-[#536B4F] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#20211D]">
                    You control which files enter.
                  </span>
                  <span className="text-[#777970]">
                    Only documents you explicitly select or place in your workspace folder are
                    scanned.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#33352E]">
                <Cpu className="w-4 h-4 text-[#536B4F] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#20211D]">
                    Local AI never sends content to the cloud.
                  </span>
                  <span className="text-[#777970]">
                    Inference runs locally using small language models via Ollama on your machine.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#33352E]">
                <HardDrive className="w-4 h-4 text-[#536B4F] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#20211D]">
                    Nothing consequential is executed without approval.
                  </span>
                  <span className="text-[#777970]">
                    All proposed file grouping, renaming, and drafting require your explicit
                    confirmation.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="md"
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() => setCurrentStep(2)}
              >
                Choose a workspace source
              </Button>
              <Button
                size="md"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleChooseSample}
              >
                Explore a sample workspace
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-2xl p-7 sm:p-9 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-mono-code text-[#777970] uppercase tracking-wider block mb-2">
                Step 2 of 3
              </span>
              <h2 className="font-editorial text-3xl text-[#20211D] font-normal tracking-tight">
                Choose a workspace source
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#777970]">
                Select how you would like to initiate your LOOPZERO index.
              </p>
            </div>

            <div className="space-y-3">
              {/* Option A: Folder */}
              <div
                onClick={handleChooseFolder}
                className="border-2 border-[#E5E4DC] hover:border-[#536B4F] rounded-xl p-5 cursor-pointer transition-all bg-[#FAF9F5] hover:bg-[#FFFFFF] group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#E5E4DC] flex items-center justify-center text-[#536B4F] group-hover:border-[#536B4F] transition-colors shrink-0">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-xl text-[#20211D] font-medium">
                      Select local folder
                    </h3>
                    <p className="text-xs text-[#777970] mt-1 leading-relaxed">
                      Import supported files from a directory on your machine (e.g. ~/Downloads or
                      ~/Desktop/Projects). Files are stored in browser storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B: Explore sample data */}
              <div
                onClick={handleChooseSample}
                className="border-2 border-[#E5E4DC] hover:border-[#536B4F] rounded-xl p-5 cursor-pointer transition-all bg-[#FAF9F5] hover:bg-[#FFFFFF] group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#E5E4DC] flex items-center justify-center text-[#536B4F] group-hover:border-[#536B4F] transition-colors shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-xl text-[#20211D] font-medium">
                      Explore sample workspace
                    </h3>
                    <p className="text-xs text-[#777970] mt-1 leading-relaxed">
                      Load a synthetic demo workspace with 16 realistic documents, 5 discovered
                      commitments (internship, paper synthesis, expenses), and 5 reviewable actions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <Button size="sm" variant="ghost" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-2xl p-7 sm:p-9 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-2 font-semibold">
                Ready to Begin
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
                Your workspace is ready.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#777970]">
                Everything is configured to run locally inside your browser sandbox.
              </p>
            </div>

            {/* Diagnostic readout */}
            <div className="border border-[#E5E4DC] rounded-xl divide-y divide-[#E5E4DC] text-xs font-mono-code bg-[#FAF9F5]">
              <div className="flex items-center justify-between p-3">
                <span className="text-[#777970]">Files loaded</span>
                <span className="text-[#20211D] font-medium">
                  {files.length} document{files.length !== 1 ? 's' : ''} ({selectedSource === 'sample' ? 'Sample dataset' : 'Local folder'})
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-[#777970]">Supported types</span>
                <span className="text-[#20211D]">PDF, Markdown, Plain Text, PNG/JPG</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-[#777970]">Storage adapter</span>
                <span className="text-[#20211D]">IndexedDB (Client-side persistent)</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-[#777970]">Local AI model</span>
                <span className="text-[#536B4F] font-semibold">
                  {settings.ollamaStatus === 'connected' ? 'Ollama (gemma2:9b)' : 'Simulated local sandbox'}
                </span>
              </div>
            </div>

            {settings.ollamaStatus !== 'connected' && (
              <div className="p-3 bg-[#FAF6EE] border border-[#E9DEC7] rounded-lg text-xs text-[#8E6924] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#B27622] shrink-0 mt-0.5" />
                <p>
                  No local Ollama daemon was detected on port 11434. You can explore the sample
                  workspace fully in simulation mode. You can connect a real model anytime in
                  Settings.
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <Button size="sm" variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button size="lg" variant="primary" onClick={handleEnterWorkspace}>
                Enter workspace
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom privacy reassurance */}
      <div className="text-center text-xs font-mono-code text-[#9A9C94]">
        LOOPZERO operates locally · No remote credentials or account required
      </div>
    </div>
  );
};
