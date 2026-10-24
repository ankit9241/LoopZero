import React, { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { CommitmentCard } from '../components/loops/CommitmentCard';
import { SearchField } from '../components/ui/SearchField';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Dialog } from '../components/ui/Dialog';
import type { Commitment, LoopStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const LoopsPage: React.FC = () => {
  const { commitments, findNewLoops, updateCommitmentStatus } = useAppStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LoopStatus>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'category'>('none');
  const [isScanning, setIsScanning] = useState(false);

  // Dialog state for confirming manual loop completion
  const [completeTarget, setCompleteTarget] = useState<Commitment | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    await findNewLoops();
    setIsScanning(false);
  };

  const filteredCommitments = useMemo(() => {
    return commitments.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.suggestedNextAction.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? item.status !== 'dismissed'
          : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [commitments, searchQuery, statusFilter]);

  const confirmComplete = () => {
    if (completeTarget) {
      updateCommitmentStatus(completeTarget.id, 'completed');
      setCompleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E4DC]">
        <div>
          <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-1 font-semibold">
            SYNTHESIZED INTENTIONS
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
            Open loops
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#777970]">
            Related files, unfinished intentions, and the next step that matters.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleScan}
          isLoading={isScanning}
          icon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Find new loops
        </Button>
      </div>

      {/* Filter and Group Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search commitments..."
            className="w-full sm:w-60"
          />

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 font-mono-code">
            {(
              [
                { id: 'all', label: 'Active' },
                { id: 'open', label: 'Open' },
                { id: 'ready_for_review', label: 'Ready' },
                { id: 'snoozed', label: 'Snoozed' },
                { id: 'completed', label: 'Completed' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-[#EAF0E6] text-[#536B4F] font-semibold border border-[#C8D8C2]'
                    : 'text-[#777970] hover:text-[#20211D] hover:bg-[#FAF9F5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grouping Selector */}
        <div className="flex items-center gap-2 font-mono-code text-[#777970]">
          <span className="text-[11px] hidden sm:inline">Group:</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="bg-[#FAF9F5] border border-[#E5E4DC] rounded-md px-2.5 py-1 text-xs text-[#20211D] focus:outline-none focus:border-[#536B4F]"
          >
            <option value="none">Ungrouped</option>
            <option value="priority">By Suggested Priority</option>
            <option value="category">By Commitment Domain</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {commitments.length === 0 ? (
        <EmptyState
          heading="Nothing is demanding your attention."
          description="Your current workspace has no open loops."
          action={
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/app/inbox')}
            >
              Review imported files
            </Button>
          }
        />
      ) : filteredCommitments.length === 0 ? (
        <EmptyState
          heading="No commitments match your filter."
          description="Try selecting a different status filter or clearing your search query."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Reset view
            </Button>
          }
        />
      ) : groupBy === 'none' ? (
        <div className="space-y-3">
          {filteredCommitments.map((loop) => (
            <div key={loop.id} className="relative">
              <CommitmentCard commitment={loop} featured={false} />
            </div>
          ))}
        </div>
      ) : groupBy === 'priority' ? (
        <div className="space-y-8">
          {(['high', 'medium', 'low'] as const).map((prio) => {
            const groupItems = filteredCommitments.filter((c) => c.priority === prio);
            if (groupItems.length === 0) return null;
            return (
              <div key={prio} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#536B4F]" />
                  <h3 className="text-xs uppercase font-mono-code tracking-wider font-semibold text-[#777970]">
                    {prio} priority ({groupItems.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {groupItems.map((loop) => (
                    <CommitmentCard key={loop.id} commitment={loop} featured={false} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-8">
          {(['career', 'research', 'admin', 'project', 'personal'] as const).map((cat) => {
            const groupItems = filteredCommitments.filter((c) => c.category === cat);
            if (groupItems.length === 0) return null;
            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#536B4F]" />
                  <h3 className="text-xs uppercase font-mono-code tracking-wider font-semibold text-[#777970]">
                    {cat} commitments ({groupItems.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {groupItems.map((loop) => (
                    <CommitmentCard key={loop.id} commitment={loop} featured={false} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Completing Unverified Loops */}
      <Dialog
        isOpen={Boolean(completeTarget)}
        onClose={() => setCompleteTarget(null)}
        title="Confirm loop completion"
        description="Verify this task has been fully closed."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setCompleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmComplete}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Mark complete
            </Button>
          </div>
        }
      >
        <div className="text-xs text-[#555750] space-y-2">
          <p>
            LOOPZERO cannot independently verify external completion (such as portal submissions).
            Are you sure you want to close &ldquo;
            <span className="font-semibold text-[#20211D]">{completeTarget?.title}</span>&rdquo;?
          </p>
          <p className="text-[#9A9C94]">
            You can always reopen this commitment from your history or completed filter.
          </p>
        </div>
      </Dialog>
    </div>
  );
};
