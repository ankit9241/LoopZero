import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  FileText,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../lib/store';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAppStore();

  const handleEnterWorkspace = () => {
    if (settings.onboardingCompleted) {
      navigate('/app');
    } else {
      navigate('/setup');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#20211D] flex flex-col font-sans selection:bg-[#EAF0E6] selection:text-[#536B4F]">
      {/* Slim Editorial Header */}
      <header className="border-b border-[#E5E4DC] bg-[#F7F6F2]/90 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#536B4F] flex items-center justify-center text-[#F7F6F2] shadow-2xs font-editorial font-bold text-lg">
              0
            </div>
            <span className="font-editorial text-xl font-bold tracking-tight text-[#20211D]">
              LOOPZERO
            </span>
            <span className="hidden sm:inline text-[11px] font-mono-code text-[#777970] pl-2 border-l border-[#E5E4DC]">
              Local-first · Device sandbox
            </span>
          </div>

          <nav className="flex items-center gap-6 text-xs text-[#777970]">
            <a href="#how-it-works" className="hover:text-[#20211D] transition-colors">
              How it works
            </a>
            <a href="#privacy" className="hover:text-[#20211D] transition-colors">
              Privacy
            </a>
            <Button size="sm" variant="primary" onClick={handleEnterWorkspace}>
              Open workspace
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-16 px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono-code bg-[#EAF0E6] text-[#536B4F] border border-[#C8D8C2]">
              <span>YOUR DIGITAL CLUTTER, RESOLVED</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#20211D] font-normal tracking-tight leading-[1.08]">
              Some things don&rsquo;t need another reminder.
            </h1>

            <p className="text-base sm:text-lg text-[#555750] leading-relaxed max-w-xl font-normal">
              LOOPZERO finds the unfinished business buried in your files and helps you close it.
              No endless task lists. Just evidence-backed commitments ready for resolution.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="primary"
                onClick={handleEnterWorkspace}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Open your workspace
              </Button>
              <a href="#how-it-works">
                <Button size="lg" variant="secondary">
                  See how it works
                </Button>
              </a>
            </div>

            <div className="pt-3 flex items-center gap-2 text-xs font-mono-code text-[#777970]">
              <ShieldCheck className="w-4 h-4 text-[#536B4F]" />
              <span>Local-first · Your files stay yours · No cloud training</span>
            </div>
          </div>

          {/* Right Column: Real Live Interface Preview */}
          <div className="lg:col-span-6">
            <div className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl shadow-lg p-5 sm:p-6 transition-all relative">
              {/* Fake Window Chrome */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E4DC]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5E4DC]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5E4DC]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5E4DC]" />
                  <span className="text-[11px] font-mono-code text-[#777970] ml-2">
                    loopzero-workspace / today
                  </span>
                </div>
                <span className="text-[10px] font-mono-code text-[#536B4F] bg-[#EAF0E6] px-2 py-0.5 rounded border border-[#C8D8C2]">
                  Live Preview
                </span>
              </div>

              {/* Inferred Commitment Card */}
              <div className="border border-[#536B4F]/40 rounded-xl p-5 bg-[#FAF9F5]/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono-code text-[#536B4F] font-semibold bg-[#EAF0E6] px-2 py-0.5 rounded border border-[#C8D8C2]">
                    Needs one final step
                  </span>
                  <span className="text-[11px] font-mono-code text-[#777970]">94% confidence</span>
                </div>

                <h3 className="font-editorial text-2xl text-[#20211D]">
                  Internship application
                </h3>
                <p className="mt-1 text-xs text-[#555750]">
                  Your resume draft and saved job posting belong to the same unfinished task.
                </p>

                {/* 3 Evidence sources connected */}
                <div className="mt-4 pt-3 border-t border-[#E5E4DC] space-y-2">
                  <div className="text-[11px] font-mono-code text-[#777970] uppercase">
                    3 Evidence Sources Connected:
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 bg-[#FFFFFF] border border-[#E5E4DC] rounded text-xs font-mono-code">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-[#A33A2B] shrink-0" />
                        <span className="text-[#20211D] truncate">resume-final-draft.pdf</span>
                      </div>
                      <span className="text-[10px] text-[#9A9C94] shrink-0">Page 1 · CV</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-[#FFFFFF] border border-[#E5E4DC] rounded text-xs font-mono-code">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-[#536B4F] shrink-0" />
                        <span className="text-[#20211D] truncate">deepmind-research-intern.pdf</span>
                      </div>
                      <span className="text-[10px] text-[#9A9C94] shrink-0">Due Nov 15</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-[#FFFFFF] border border-[#E5E4DC] rounded text-xs font-mono-code">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-[#777970] shrink-0" />
                        <span className="text-[#20211D] truncate">apply-later-notes.md</span>
                      </div>
                      <span className="text-[10px] text-[#536B4F] font-semibold shrink-0">
                        1 unchecked item
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Preview in Hero */}
                <div className="mt-4 pt-3 border-t border-[#E5E4DC] flex items-center justify-between">
                  <span className="text-xs text-[#777970] italic">
                    Action: Draft 200-word SOP scaffold
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/app/loops/loop-1')}
                  >
                    Review next step
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: The things you meant to finish */}
      <section className="py-16 px-6 border-t border-[#E5E4DC] bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-left">
            <span className="text-[11px] font-mono-code text-[#777970] uppercase tracking-wider block mb-2">
              Common Neglected Loops
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#20211D]">
              The things you meant to finish.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono-code text-[#536B4F] block mb-2">01 · Downloaded</span>
                <h3 className="font-editorial text-2xl text-[#20211D] mb-2">
                  The paper you downloaded
                </h3>
                <p className="text-xs text-[#777970] leading-relaxed">
                  You downloaded an influential paper, took two screenshots of equations, and saved a note with half-written thoughts. LOOPZERO synthesizes them into an actionable presentation outline.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ECEBE4] text-xs font-mono-code text-[#536B4F]">
                Outcome: Slide outline synthesized
              </div>
            </div>

            <div className="p-6 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono-code text-[#536B4F] block mb-2">02 · Abandoned</span>
                <h3 className="font-editorial text-2xl text-[#20211D] mb-2">
                  The application saved for later
                </h3>
                <p className="text-xs text-[#777970] leading-relaxed">
                  Your updated resume and the opportunity description sit in different folders. LOOPZERO identifies the missing statement of purpose and prepares the scaffold before the deadline passes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ECEBE4] text-xs font-mono-code text-[#536B4F]">
                Outcome: One single missing step surfaced
              </div>
            </div>

            <div className="p-6 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono-code text-[#536B4F] block mb-2">03 · Cluttered</span>
                <h3 className="font-editorial text-2xl text-[#20211D] mb-2">
                  The screenshots you never revisited
                </h3>
                <p className="text-xs text-[#777970] leading-relaxed">
                  Design moodboards and OCR text fragments piled up on your Desktop. LOOPZERO clusters related visual references and proposes clean semantic folder groupings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ECEBE4] text-xs font-mono-code text-[#536B4F]">
                Outcome: Grouped with reversible undo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Three-Stage Process */}
      <section id="how-it-works" className="py-16 px-6 border-t border-[#E5E4DC] bg-[#F7F6F2]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-[11px] font-mono-code text-[#777970] uppercase tracking-wider block mb-2">
              System Mechanics
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#20211D]">
              From scattered files to one clear next step.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E5E4DC] flex items-center justify-center font-mono-code text-sm font-semibold text-[#536B4F]">
                1
              </div>
              <h3 className="font-editorial text-2xl text-[#20211D]">Collect</h3>
              <p className="text-xs sm:text-sm text-[#777970] leading-relaxed">
                Bring in the clutter. Point LOOPZERO to your Downloads, desktop folders, or individual notes. Files are indexed strictly inside your local browser or filesystem sandbox.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E5E4DC] flex items-center justify-center font-mono-code text-sm font-semibold text-[#536B4F]">
                2
              </div>
              <h3 className="font-editorial text-2xl text-[#20211D]">Connect</h3>
              <p className="text-xs sm:text-sm text-[#777970] leading-relaxed">
                Find related commitments. Local inference recognizes cross-document relationships, extracts ground truth facts, and identifies what is still missing.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E5E4DC] flex items-center justify-center font-mono-code text-sm font-semibold text-[#536B4F]">
                3
              </div>
              <h3 className="font-editorial text-2xl text-[#20211D]">Close</h3>
              <p className="text-xs sm:text-sm text-[#777970] leading-relaxed">
                Review and complete useful actions. Nothing consequential happens without explicit preview and approval. Every action leaves a reversible audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Private by Design */}
      <section id="privacy" className="py-16 px-6 border-t border-[#E5E4DC] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block">
              Honest Architecture
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#20211D]">
              Private by design. Verifiably local.
            </h2>
            <p className="text-sm text-[#555750] leading-relaxed">
              LOOPZERO runs local inference on your own hardware using small open models (like Gemma 2)
              orchestrated via Ollama or WebAssembly. Your documents, extracted text, and personal notes
              never transit remote cloud servers or third-party training pipelines.
            </p>
            <p className="text-xs text-[#777970] leading-relaxed">
              We believe in honest systems: LOOPZERO clearly flags what is local, when a model daemon is
              unreachable, and never pretends an external operation succeeded when permissions prevent it.
            </p>
          </div>

          <div className="lg:col-span-5 bg-[#FAF9F5] border border-[#E5E4DC] rounded-xl p-6 space-y-3 text-xs font-mono-code">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DC]">
              <span className="text-[#777970]">Document storage</span>
              <span className="text-[#536B4F] font-semibold">IndexedDB / Local Disk</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DC]">
              <span className="text-[#777970]">Inference runtime</span>
              <span className="text-[#536B4F] font-semibold">Local Gemma / Ollama</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DC]">
              <span className="text-[#777970]">Remote telemetry</span>
              <span className="text-[#536B4F] font-semibold">Zero / None</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#777970]">Write permission</span>
              <span className="text-[#536B4F] font-semibold">Explicit approval required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E5E4DC] bg-[#FAF9F5] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#777970]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-editorial text-lg font-bold text-[#20211D]">LOOPZERO</span>
              <span>·</span>
              <span className="font-editorial italic text-sm text-[#555750]">
                A quieter way to finish things.
              </span>
            </div>
            <p className="text-[11px] text-[#9A9C94]">
              Stop managing tasks. Start closing loops.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a href="#how-it-works" className="hover:text-[#20211D] transition-colors">
              How it works
            </a>
            <a href="#privacy" className="hover:text-[#20211D] transition-colors">
              Privacy
            </a>
            <Button size="sm" variant="primary" onClick={handleEnterWorkspace}>
              Open workspace
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
