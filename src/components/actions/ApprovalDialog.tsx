import React, { useState } from 'react';
import type { ProposedAction } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { useAppStore } from '../../lib/store';
import {
  ShieldAlert,
  RotateCcw,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface ApprovalDialogProps {
  action: ProposedAction;
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({ action, isOpen, onClose }) => {
  const { approveAction, files } = useAppStore();
  const [isExecuting, setIsExecuting] = useState(false);

  const affectedFiles = files.filter((f) => action.affectedResourceIds.includes(f.id));

  const handleConfirm = async () => {
    setIsExecuting(true);
    await approveAction(action.id);
    setIsExecuting(false);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Review proposed file modification"
      description="Verify explicit scope, affected resources, and safety rollback guarantees."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isExecuting}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              isLoading={isExecuting}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Confirm action
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Operation Title & Objective */}
        <div className="p-4 bg-[#FAF9F5] border border-[#E5E4DC] rounded-xl">
          <h3 className="font-editorial text-xl text-[#20211D] font-medium">{action.title}</h3>
          <p className="mt-1 text-xs text-[#555750] leading-relaxed">{action.description}</p>
        </div>

        {/* Explicit Change Scope */}
        <div>
          <h4 className="text-xs font-semibold uppercase font-mono-code text-[#777970] mb-2 tracking-wider">
            Scope of changes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono-code">
            <div className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
              <span className="text-[10px] text-[#777970] uppercase block mb-1">Current state</span>
              <p className="text-[#33352E]">{action.beforePreview}</p>
            </div>
            <div className="p-3 bg-[#EAF0E6] border border-[#C8D8C2] rounded-lg">
              <span className="text-[10px] text-[#536B4F] uppercase block mb-1 font-semibold">
                Result after execution
              </span>
              <p className="text-[#20211D] font-medium">{action.afterPreview}</p>
            </div>
          </div>
        </div>

        {/* Affected Files List */}
        <div>
          <h4 className="text-xs font-semibold uppercase font-mono-code text-[#777970] mb-2 tracking-wider">
            Target files ({affectedFiles.length})
          </h4>
          <div className="border border-[#E5E4DC] rounded-lg divide-y divide-[#E5E4DC] max-h-40 overflow-y-auto bg-[#FFFFFF]">
            {affectedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between px-3 py-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-[#536B4F] shrink-0" />
                  <span className="font-mono-code text-[#20211D] truncate">{file.name}</span>
                </div>
                <span className="text-[11px] font-mono-code text-[#9A9C94] truncate">
                  {file.sourceLocation || 'Workspace Root'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Failure Contract */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-lg">
            <div className="flex items-center gap-1.5 font-medium text-[#20211D] mb-1">
              <RotateCcw className="w-3.5 h-3.5 text-[#536B4F]" />
              <span>Reversibility</span>
            </div>
            <p className="text-[11px] text-[#777970]">
              {action.reversible
                ? 'Yes. An undo checkpoint will be created in your local activity log.'
                : 'Irreversible. Files modified during this operation cannot be automatically rolled back.'}
            </p>
          </div>

          <div className="p-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-lg">
            <div className="flex items-center gap-1.5 font-medium text-[#20211D] mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B27622]" />
              <span>Failure Guarantee</span>
            </div>
            <p className="text-[11px] text-[#777970]">
              If write operations fail or permissions are restricted, the action aborts without modifying original files.
            </p>
          </div>
        </div>

        {/* Error reason if failed */}
        {action.errorReason && (
          <div className="p-3 bg-[#FCECE9] border border-[#F4C5BE] rounded-lg text-xs text-[#A33A2B]">
            <span className="font-semibold block mb-0.5">Last Execution Error:</span>
            <span className="font-mono-code">{action.errorReason}</span>
          </div>
        )}
      </div>
    </Dialog>
  );
};
