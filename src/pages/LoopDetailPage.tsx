import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { EvidenceList } from '../components/loops/EvidenceList';
import { ReasoningCard } from '../components/loops/ReasoningCard';
import { ActionPreview } from '../components/actions/ActionPreview';
import { FilePreviewPanel } from '../components/files/FilePreviewPanel';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import type { SourceFile } from '../types';
import { getStatusBadge, formatDate, formatRelativeTime } from '../lib/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  Sparkles,
  ArrowRight,
  History
} from 'lucide-react';

export const LoopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    commitments,
    files,
    actions,
    history,
    updateCommitmentStatus,
    editCommitment
  } = useAppStore();

  const [previewFile, setPreviewFile] = useState<SourceFile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const commitment = commitments.find((c) => c.id === id);

  if (!commitment) {
    return (
      <div className="py-12 text-center">
        <h2 className="font-editorial text-2xl text-[#20211D]">Loop not found</h2>
        <p className="mt-2 text-xs text-[#777970]">
          The commitment you are searching for does not exist or was removed.
        </p>
        <Button size="sm" variant="secondary" className="mt-4" onClick={() => navigate('/app/loops')}>
          Return to loops
        </Button>
      </div>
    );
  }

  const badge = getStatusBadge(commitment.status);
  const linkedFiles = files.filter((f) => commitment.evidenceSourceIds.includes(f.id));
  const loopActions = actions.filter((a) => a.commitmentId === commitment.id);
  const loopHistory = history.filter(
    (h) =>
      h.commitmentTitle === commitment.title ||
      h.relatedResourceIds.some((r) => commitment.evidenceSourceIds.includes(r))
  );

  const openEditDialog = () => {
    setEditTitle(commitment.title);
    setEditSummary(commitment.summary);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      editCommitment(commitment.id, {
        title: editTitle.trim(),
        summary: editSummary.trim()
      });
      setEditDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Back button and case file badge */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/loops"
          className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#777970] hover:text-[#20211D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to open loops
        </Link>
        <span className="text-[11px] font-mono-code text-[#9A9C94]">
          Case File #{commitment.id}
        </span>
      </div>

      {/* Case File Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono-code px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
            <span className="text-xs font-mono-code text-[#777970]">
              Discovered {formatDate(commitment.createdAt)}
            </span>
          </div>

          {/* Quick status actions */}
          <div className="flex items-center gap-2">
            {commitment.status !== 'completed' ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateCommitmentStatus(commitment.id, 'snoozed')}
                  icon={<Clock className="w-3.5 h-3.5" />}
                >
                  Snooze
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCommitmentStatus(commitment.id, 'completed')}
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#536B4F]" />}
                >
                  Mark complete
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateCommitmentStatus(commitment.id, 'open')}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reopen loop
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={openEditDialog}>
              Edit details
            </Button>
          </div>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
          {commitment.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#555750] leading-relaxed max-w-3xl">
          {commitment.summary}
        </p>
      </div>

      {/* Case File Sections: Evidence first, Interpretation second, Action third */}

      {/* SECTION A: What remains (The Proposed Next Step) */}
      <section className="bg-[#FAF9F5] border-2 border-[#536B4F]/30 rounded-xl p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono-code text-[#536B4F] tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Section A · What remains to be finished</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h3 className="font-editorial text-2xl text-[#20211D]">
              {commitment.suggestedNextAction}
            </h3>
            <p className="mt-1 text-xs text-[#777970] leading-relaxed">
              Distinguishing extracted ground-truth facts from model proposals: review below evidence
              sources before executing changes.
            </p>
          </div>
          {loopActions.length > 0 && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                const el = document.getElementById('suggested-actions-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Review actions
            </Button>
          )}
        </div>
      </section>

      {/* SECTION B: Why these files are connected (Evidence timeline) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
              Section B · Why these files are connected ({linkedFiles.length} sources)
            </h2>
            <p className="text-xs text-[#9A9C94] mt-0.5">
              Direct citations and locations extracted from your local files without fabrication.
            </p>
          </div>
        </div>

        <EvidenceList
          commitmentId={commitment.id}
          files={linkedFiles}
          onPreviewFile={(f) => setPreviewFile(f)}
        />
      </section>

      {/* SECTION C: Reasoning & Ground Truth Facts */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
          Section C · Model Reasoning & Uncertainty
        </h2>
        <ReasoningCard commitment={commitment} onEdit={openEditDialog} />
      </section>

      {/* SECTION D: Suggested Actions */}
      <section id="suggested-actions-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
            Section D · Proposed Actions ({loopActions.length})
          </h2>
          <span className="text-xs text-[#777970]">
            Requires explicit approval before execution
          </span>
        </div>

        {loopActions.length > 0 ? (
          <div className="space-y-3">
            {loopActions.map((action) => (
              <ActionPreview key={action.id} action={action} />
            ))}
          </div>
        ) : (
          <div className="p-6 border border-[#E5E4DC] rounded-xl bg-[#FFFFFF] text-center text-xs text-[#777970]">
            No proposed actions are currently pending for this loop.
          </div>
        )}
      </section>

      {/* SECTION E & F: Related Files & Audit History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section E: Related Files */}
        <section className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
            Section E · Linked Source Files
          </h3>

          <div className="divide-y divide-[#ECEBE4]">
            {linkedFiles.map((f) => (
              <div key={f.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-3.5 h-3.5 text-[#536B4F] shrink-0" />
                  <span className="font-mono-code text-[#20211D] truncate">{f.name}</span>
                </div>
                <button
                  onClick={() => setPreviewFile(f)}
                  className="text-[11px] font-mono-code text-[#536B4F] hover:underline shrink-0"
                >
                  View text
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section F: History */}
        <section className="bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase font-mono-code text-[#777970] tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Section F · Case File History</span>
          </div>

          {loopHistory.length > 0 ? (
            <div className="divide-y divide-[#ECEBE4] max-h-56 overflow-y-auto">
              {loopHistory.map((h) => (
                <div key={h.id} className="py-2 text-xs">
                  <p className="text-[#20211D] leading-snug">{h.description}</p>
                  <span className="text-[10px] font-mono-code text-[#9A9C94] mt-0.5 block">
                    {formatRelativeTime(h.createdAt)} · {h.result}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#777970]">No historical events recorded for this loop.</p>
          )}
        </section>
      </div>

      {/* Edit Commitment Dialog */}
      <Dialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="Edit commitment title & summary"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Save updates
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#20211D] block mb-1">
              Commitment Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E5E4DC] rounded-md focus:outline-none focus:border-[#536B4F]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#20211D] block mb-1">
              Interpretation / Summary
            </label>
            <textarea
              rows={3}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E5E4DC] rounded-md focus:outline-none focus:border-[#536B4F]"
            />
          </div>
        </div>
      </Dialog>

      {/* File Preview Panel */}
      <FilePreviewPanel
        file={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
