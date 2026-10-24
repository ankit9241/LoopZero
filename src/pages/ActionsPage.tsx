import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { ActionPreview } from '../components/actions/ActionPreview';
import { BatchReviewBar } from '../components/actions/BatchReviewBar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const ActionsPage: React.FC = () => {
  const { actions } = useAppStore();
  const navigate = useNavigate();

  const [filterState, setFilterState] = useState<'pending' | 'executed' | 'all'>('pending');
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);

  const pendingActions = actions.filter((a) => a.status === 'pending');
  const executedActions = actions.filter((a) => a.status === 'executed');

  const displayedActions = actions.filter((a) => {
    if (filterState === 'pending') return a.status === 'pending';
    if (filterState === 'executed') return a.status === 'executed';
    return true;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedActionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllReversible = () => {
    const reversiblePendingIds = pendingActions
      .filter((a) => a.reversible && a.riskLevel === 'low')
      .map((a) => a.id);
    setSelectedActionIds(reversiblePendingIds);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E4DC]">
        <div>
          <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-1 font-semibold">
            APPROVAL QUEUE
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
            Ready to close a few loops?
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#777970]">
            Nothing consequential happens without your explicit approval.
          </p>
        </div>

        {pendingActions.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAllReversible}
            >
              Select all safe actions ({pendingActions.filter((a) => a.reversible).length})
            </Button>
          </div>
        )}
      </div>

      {/* Tabs / Filter Filter */}
      <div className="flex items-center justify-between gap-3 p-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl text-xs font-mono-code">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterState('pending')}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              filterState === 'pending'
                ? 'bg-[#EAF0E6] text-[#536B4F] font-semibold border border-[#C8D8C2]'
                : 'text-[#777970] hover:text-[#20211D]'
            }`}
          >
            Pending Review ({pendingActions.length})
          </button>
          <button
            onClick={() => setFilterState('executed')}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              filterState === 'executed'
                ? 'bg-[#EAF0E6] text-[#536B4F] font-semibold border border-[#C8D8C2]'
                : 'text-[#777970] hover:text-[#20211D]'
            }`}
          >
            Executed ({executedActions.length})
          </button>
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              filterState === 'all'
                ? 'bg-[#EAF0E6] text-[#536B4F] font-semibold border border-[#C8D8C2]'
                : 'text-[#777970] hover:text-[#20211D]'
            }`}
          >
            All Proposed ({actions.length})
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[#777970] text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#536B4F]" />
          <span>Local guardrails active</span>
        </div>
      </div>

      {/* Action List */}
      {displayedActions.length === 0 ? (
        <EmptyState
          heading="You're all caught up."
          description="Nothing is currently waiting for approval. New suggested actions will appear here when commitments are scanned."
          action={
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/app')}
            >
              Return to Today
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {displayedActions.map((action) => (
            <ActionPreview
              key={action.id}
              action={action}
              selected={selectedActionIds.includes(action.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}

      {/* Floating Batch Review Bar */}
      <BatchReviewBar
        selectedIds={selectedActionIds}
        onClearSelection={() => setSelectedActionIds([])}
      />
    </div>
  );
};
