import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const LocalStatusIndicator: React.FC = () => {
  const { settings, testOllamaConnection } = useAppStore();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await testOllamaConnection();
    setTesting(false);
  };

  const isConnected = settings.ollamaStatus === 'connected';

  return (
    <div className="flex items-center gap-2">
      <div
        className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-code bg-[#FFFFFF] border border-[#E5E4DC] text-[#777970] shadow-2xs hover:border-[#C8D8C2] transition-colors cursor-pointer"
        onClick={handleTest}
        title="Click to probe local Ollama daemon"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-[#536B4F]' : 'bg-[#C98A2C]'
          } ${testing ? 'animate-ping' : ''}`}
        />
        <span className="text-[#20211D] font-medium">Local-only</span>
        <span className="text-[#9A9C94] hidden sm:inline">·</span>
        <span className="text-[#777970] hidden sm:inline">
          {isConnected ? 'Ollama live' : 'Offline sandbox'}
        </span>

        {/* Hover popup tooltip */}
        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-lg shadow-lg text-left hidden group-hover:block z-50 pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#20211D] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#536B4F]" />
            <span>Local Privacy Boundary</span>
          </div>
          <p className="text-[11px] text-[#777970] leading-relaxed">
            Your file text and extracted commitments never leave this machine.
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#E5E4DC] flex flex-col gap-1 text-[11px] text-[#555750]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-[#9A9C94]" /> Storage
              </span>
              <span className="font-mono-code text-[#20211D]">IndexedDB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#9A9C94]" /> Local Model
              </span>
              <span className="font-mono-code text-[#20211D]">
                {isConnected ? 'Connected' : 'Simulation'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
