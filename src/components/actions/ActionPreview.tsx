import React, { useState } from 'react';
import type { ProposedAction } from '../../types';
import { useAppStore } from '../../lib/store';
import { getActionStatusBadge } from '../../lib/formatters';
import { Button } from '../ui/Button';
import { ApprovalDialog } from './ApprovalDialog';
import {
  FileText,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActionPreviewProps {
  action: ProposedAction;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const ActionPreview: React.FC<ActionPreviewProps> = ({
  action,
  selected = false,
  onToggleSelect
}) => {
  const { files, commitments, rejectAction } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const statusBadge = getActionStatusBadge(action.status);

  const relatedCommitment = commitments.find((c) => c.id === action.commitmentId);
  const affectedFiles = files.filter((f) => action.affectedResourceIds.includes(f.id));

  return (
    <>
      <div
        className={`border rounded-xl p-5 bg-[#FFFFFF] transition-all ${
          selected ? 'border-[#536B4F] ring-1 ring-[#536B4F]' : 'border-[#E5E4DC] hover:border-[#D0CEBF]'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {onToggleSelect && action.status === 'pending' && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(action.id)}
                className="mt-1 h-4 w-4 rounded border-[#D0CEBF] text-[#536B4F] focus:ring-[#536B4F]"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-editorial text-xl text-[#20211D] font-normal">
                  {action.title}
                </span>
                <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded ${statusBadge.bg} ${statusBadge.text}`}>
                  {statusBadge.label}
                </span>
                {action.reversible ? (
                  <span className="text-[10px] font-mono-code bg-[#EAF0E6] text-[#536B4F] px-1.5 py-0.5 rounded border border-[#C8D8C2]">
                    Reversible
                  </span>
                ) : (
                  <span className="text-[10px] font-mono-code bg-[#FAF6EE] text-[#B27622] px-1.5 py-0.5 rounded border border-[#E9DEC7]">
                    Irreversible
                  </span>
                )}
              </div>

              <p className="text-xs text-[#555750] leading-relaxed max-w-2xl">
                {action.description}
              </p>

              {relatedCommitment && (
                <div className="mt-2 text-[11px] font-mono-code text-[#777970] flex items-center gap-1.5">
                  <span>Related loop:</span>
                  <Link
                    to={`/app/loops/${relatedCommitment.id}`}
                    className="text-[#536B4F] hover:underline font-medium truncate max-w-xs"
                  >
                    {relatedCommitment.title}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {action.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => rejectAction(action.id)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  Preview changes
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setDialogOpen(true)}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Approve
                </Button>
              </>
            ) : action.status === 'failed' ? (
              <div className="text-right">
                <span className="text-xs text-[#A33A2B] font-mono-code block">
                  Execution stopped by guardrail
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => setDialogOpen(true)}
                >
                  Inspect error
                </Button>
              </div>
            ) : (
              <span className="text-xs text-[#536B4F] font-mono-code flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
        </div>

        {/* Proposed Transformation Preview: Before / After */}
        <div className="mt-4 pt-4 border-t border-[#ECEBE4] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono-code">
          <div className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
            <span className="text-[10px] text-[#9A9C94] uppercase tracking-wider block mb-1">
              Before (Current State)
            </span>
            <p className="text-[#555750] truncate">{action.beforePreview}</p>
          </div>
          <div className="p-3 bg-[#EAF0E6]/50 border border-[#C8D8C2] rounded-lg">
            <span className="text-[10px] text-[#536B4F] uppercase tracking-wider block mb-1">
              After (Proposed Result)
            </span>
            <p className="text-[#20211D] font-medium truncate">{action.afterPreview}</p>
          </div>
        </div>

        {/* Target Files chips */}
        {affectedFiles.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono-code text-[#9A9C94] uppercase">
              Target files ({affectedFiles.length}):
            </span>
            {affectedFiles.map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1 text-[11px] font-mono-code bg-[#FAF9F5] border border-[#E5E4DC] text-[#33352E] px-2 py-0.5 rounded"
              >
                <FileText className="w-3 h-3 text-[#777970]" />
                <span className="truncate max-w-[150px]">{file.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <ApprovalDialog
        action={action}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};
