import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { CommitmentCard } from '../components/loops/CommitmentCard';
import { FileImportModal } from '../components/files/FileImportModal';
import { FilePreviewPanel } from '../components/files/FilePreviewPanel';
import { ActionPreview } from '../components/actions/ActionPreview';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import type { SourceFile } from '../types';
import { formatRelativeTime } from '../lib/formatters';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';

export const TodayPage: React.FC = () => {
  const { files, commitments, actions, history, findNewLoops } = useAppStore();

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<SourceFile | null>(null);
  const [scanning, setScanning] = useState(false);

  // Pick top featured commitment (prefer 'open' with high priority)
  const openCommitments = commitments.filter(
    (c) => c.status === 'open' || c.status === 'ready_for_review'
  );
  const featuredCommitment = openCommitments[0];
  const otherCommitments = openCommitments.slice(1, 5);

  // Pending actions (up to 3)
  const pendingActions = actions.filter((a) => a.status === 'pending').slice(0, 3);

  // Derived clutter stats (strictly computed from active dataset)
  const importedCount = files.length;
  const discoveredLoopsCount = commitments.length;
  const groupedFilesCount = files.filter((f) => f.relatedLoopIds.length > 0).length;
  const actionsReviewCount = actions.filter((a) => a.status === 'pending').length;

  // Recent activity events (up to 4)
  const recentActivity = history.slice(0, 4);

  const handleScan = async () => {
    setScanning(true);
    await findNewLoops();
    setScanning(false);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E4DC]">
        <div>
          <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-1 font-semibold">
            YOUR WORKSPACE
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
            Today, in fewer loops.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#777970]">
            Here&rsquo;s what your files have been trying to tell you.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleScan}
            isLoading={scanning}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#536B4F]" />}
          >
            Scan for loops
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setImportModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add files
          </Button>
        </div>
      </div>

      {/* Main Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Primary Focus: Focal commitment + Open Loops + Needs Approval) */}
        <div className="lg:col-span-8 space-y-8">
          {/* A. The Next Useful Thing (Featured Hero Commitment) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
                Priority Focus
              </span>
              {openCommitments.length > 1 && (
                <Link
                  to="/app/loops"
                  className="text-xs text-[#536B4F] hover:underline font-medium inline-flex items-center gap-1"
                >
                  View all {openCommitments.length} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {featuredCommitment ? (
              <CommitmentCard commitment={featuredCommitment} featured={true} />
            ) : (
              <EmptyState
                heading="Nothing is demanding your attention."
                description="Your current workspace has no open loops. Drop in a few files to start discovering connections."
                action={
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setImportModalOpen(true)}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add files
                  </Button>
                }
              />
            )}
          </section>

          {/* B. Open Loops (Compact rows) */}
          {otherCommitments.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
                  Other Open Loops ({otherCommitments.length})
                </span>
                <Link
                  to="/app/loops"
                  className="text-xs text-[#777970] hover:text-[#20211D] transition-colors"
                >
                  See all
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherCommitments.map((loop) => (
                  <CommitmentCard key={loop.id} commitment={loop} featured={false} />
                ))}
              </div>
            </section>
          )}

          {/* D. Needs Your Approval */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
                  Needs your approval
                </span>
                {actionsReviewCount > 0 && (
                  <span className="text-[10px] font-mono-code bg-[#FAF6EE] text-[#B27622] px-2 py-0.5 rounded border border-[#E9DEC7]">
                    {actionsReviewCount} pending
                  </span>
                )}
              </div>
              <Link
                to="/app/actions"
                className="text-xs text-[#536B4F] hover:underline font-medium"
              >
                Review queue
              </Link>
            </div>

            {pendingActions.length > 0 ? (
              <div className="space-y-3">
                {pendingActions.map((action) => (
                  <ActionPreview key={action.id} action={action} />
                ))}
              </div>
            ) : (
              <div className="p-6 border border-[#E5E4DC] rounded-xl bg-[#FFFFFF] text-center text-xs text-[#777970]">
                All proposed actions are reviewed and caught up.
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Supporting Modules: Bento Clutter + Recent Activity + Sample Info) */}
        <div className="lg:col-span-4 space-y-6">
          {/* C. Your Clutter, At a Glance (Bento arrangement) */}
          <section className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl p-5 space-y-4">
            <span className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider block">
              Your clutter, at a glance
            </span>

            <div className="grid grid-cols-2 gap-3 font-mono-code">
              <Link
                to="/app/inbox"
                className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg hover:border-[#536B4F] transition-all group"
              >
                <span className="text-[11px] text-[#777970] block">Files imported</span>
                <span className="text-2xl font-semibold text-[#20211D] group-hover:text-[#536B4F]">
                  {importedCount}
                </span>
              </Link>

              <Link
                to="/app/loops"
                className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg hover:border-[#536B4F] transition-all group"
              >
                <span className="text-[11px] text-[#777970] block">Loops found</span>
                <span className="text-2xl font-semibold text-[#20211D] group-hover:text-[#536B4F]">
                  {discoveredLoopsCount}
                </span>
              </Link>

              <div className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
                <span className="text-[11px] text-[#777970] block">Files grouped</span>
                <span className="text-2xl font-semibold text-[#20211D]">{groupedFilesCount}</span>
              </div>

              <Link
                to="/app/actions"
                className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg hover:border-[#536B4F] transition-all group"
              >
                <span className="text-[11px] text-[#777970] block">Awaiting review</span>
                <span className="text-2xl font-semibold text-[#536B4F]">{actionsReviewCount}</span>
              </Link>
            </div>
          </section>

          {/* E. Recent Activity */}
          <section className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
                Recent activity
              </span>
              <Link to="/app/history" className="text-xs text-[#536B4F] hover:underline">
                Audit trail
              </Link>
            </div>

            {recentActivity.length > 0 ? (
              <div className="divide-y divide-[#ECEBE4]">
                {recentActivity.map((event) => (
                  <div key={event.id} className="py-2.5 first:pt-1 last:pb-0 text-xs">
                    <p className="text-[#20211D] leading-snug font-medium line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-[#9A9C94] mt-1">
                      <span>{formatRelativeTime(event.createdAt)}</span>
                      <span
                        className={`capitalize ${
                          event.result === 'completed'
                            ? 'text-[#536B4F]'
                            : event.result === 'failed'
                            ? 'text-[#A33A2B]'
                            : 'text-[#8E6924]'
                        }`}
                      >
                        {event.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#777970]">No recent activity recorded.</p>
            )}
          </section>

          {/* Quick Context Card */}
          <div className="p-4 bg-[#FAF9F5] border border-[#E5E4DC] rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-[#20211D]">
              <Sparkles className="w-3.5 h-3.5 text-[#536B4F]" />
              <span>How LOOPZERO works</span>
            </div>
            <p className="text-[#777970] leading-relaxed text-[11px]">
              Files are evaluated locally for implicit commitments. When a task is detected, evidence
              is attached and proposed actions are queued for your review.
            </p>
          </div>
        </div>
      </div>

      {/* File Import Modal */}
      <FileImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />

      {/* File Preview Panel */}
      <FilePreviewPanel
        file={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
