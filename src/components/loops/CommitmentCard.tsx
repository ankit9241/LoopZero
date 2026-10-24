import React from 'react';
import type { Commitment } from '../../types';
import { getStatusBadge, formatRelativeTime } from '../../lib/formatters';
import { useAppStore } from '../../lib/store';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface CommitmentCardProps {
  commitment: Commitment;
  featured?: boolean;
}

export const CommitmentCard: React.FC<CommitmentCardProps> = ({
  commitment,
  featured = false
}) => {
  const { updateCommitmentStatus } = useAppStore();
  const navigate = useNavigate();
  const badge = getStatusBadge(commitment.status);

  if (featured) {
    return (
      <div className="relative bg-[#FFFFFF] border-2 border-[#536B4F]/40 hover:border-[#536B4F] rounded-xl p-6 sm:p-7 shadow-xs transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#536B4F] font-semibold bg-[#EAF0E6] px-2 py-0.5 rounded border border-[#C8D8C2]">
              The next useful thing
            </span>
            <span className={`text-[11px] font-mono-code px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>
          <span className="text-xs font-mono-code text-[#777970]">
            Discovered {formatRelativeTime(commitment.createdAt)}
          </span>
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl text-[#20211D] font-normal tracking-tight">
          {commitment.title}
        </h2>

        <p className="mt-2 text-sm text-[#555750] leading-relaxed max-w-2xl">
          {commitment.summary}
        </p>

        {/* Evidence Sources Tag */}
        <div className="mt-4 pt-3.5 border-t border-[#E5E4DC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#777970]">
            <FileText className="w-4 h-4 text-[#536B4F]" />
            <span className="font-medium text-[#20211D]">
              {commitment.evidenceSourceIds.length} connected sources
            </span>
            <span>·</span>
            <span className="text-[#555750] italic truncate max-w-xs sm:max-w-md">
              Next: &ldquo;{commitment.suggestedNextAction}&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateCommitmentStatus(commitment.id, 'snoozed')}
            >
              Not now
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/app/loops/${commitment.id}`)}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Review commitment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Refined Compact List / Grid Item
  return (
    <div className="group bg-[#FFFFFF] border border-[#E5E4DC] hover:border-[#D0CEBF] hover:bg-[#FAF9F5] rounded-lg p-4 sm:p-5 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
            {badge.label}
          </span>
          <span className="text-[11px] font-mono-code text-[#9A9C94]">
            {commitment.evidenceSourceIds.length} source{commitment.evidenceSourceIds.length !== 1 ? 's' : ''}
          </span>
        </div>

        <Link to={`/app/loops/${commitment.id}`} className="block">
          <h3 className="font-editorial text-lg text-[#20211D] group-hover:text-[#536B4F] transition-colors leading-snug">
            {commitment.title}
          </h3>
          <p className="mt-1 text-xs text-[#777970] line-clamp-2 leading-relaxed">
            {commitment.summary}
          </p>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-[#ECEBE4] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#777970] truncate max-w-[180px] font-mono-code">
          {commitment.suggestedNextAction}
        </span>
        <Link
          to={`/app/loops/${commitment.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#536B4F] hover:underline shrink-0"
        >
          Review <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
