import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Button } from '../ui/Button';
import { CheckCircle2 } from 'lucide-react';

interface BatchReviewBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export const BatchReviewBar: React.FC<BatchReviewBarProps> = ({
  selectedIds,
  onClearSelection
}) => {
  const { batchApproveActions } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleBatchApprove = async () => {
    setIsProcessing(true);
    await batchApproveActions(selectedIds);
    setIsProcessing(false);
    onClearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#FFFFFF] border-2 border-[#536B4F] shadow-xl rounded-xl px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#536B4F]" />
        <span className="text-xs font-semibold font-mono-code text-[#20211D]">
          {selectedIds.length} action{selectedIds.length > 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="h-4 w-px bg-[#E5E4DC]" />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleBatchApprove}
          isLoading={isProcessing}
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
        >
          Approve selected
        </Button>
      </div>
    </div>
  );
};
