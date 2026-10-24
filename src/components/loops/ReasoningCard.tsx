import React from 'react';
import type { Commitment } from '../../types';
import { useAppStore } from '../../lib/store';
import { BrainCircuit, Check, X, Edit3, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ReasoningCardProps {
  commitment: Commitment;
  onEdit: () => void;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({ commitment, onEdit }) => {
  const { verifyCommitment } = useAppStore();

  return (
    <div className="border border-[#E5E4DC] rounded-xl p-5 bg-[#FFFFFF] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#536B4F]" />
          <h3 className="font-editorial text-lg text-[#20211D] font-normal">
            Local Inference Reasoning
          </h3>
        </div>
        <span className="text-xs font-mono-code text-[#536B4F] bg-[#EAF0E6] px-2 py-0.5 rounded border border-[#C8D8C2]">
          {Math.round(commitment.confidence * 100)}% confidence
        </span>
      </div>

      <p className="text-xs sm:text-sm text-[#33352E] leading-relaxed">
        {commitment.reasoningNote}
      </p>

      {/* Extracted Facts Checklist */}
      {commitment.extractedFacts && commitment.extractedFacts.length > 0 && (
        <div className="bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E5E4DC]">
          <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#777970] block mb-2 font-semibold">
            Extracted Ground Truth Facts:
          </span>
          <ul className="space-y-1.5 text-xs text-[#555750]">
            {commitment.extractedFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#536B4F] mt-1.5 shrink-0" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uncertainty Note */}
      {commitment.uncertaintyNote && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF6EE] border border-[#E9DEC7] text-xs text-[#8E6924]">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B27622]" />
          <div>
            <span className="font-medium">System Boundary & Uncertainty: </span>
            <span>{commitment.uncertaintyNote}</span>
          </div>
        </div>
      )}

      {/* User Verification Feedback Controls */}
      <div className="pt-3 border-t border-[#ECEBE4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#777970]">Is this inference accurate?</span>
          {commitment.userVerified === true && (
            <span className="text-[11px] font-mono-code text-[#536B4F] bg-[#EAF0E6] px-2 py-0.5 rounded border border-[#C8D8C2] flex items-center gap-1">
              <Check className="w-3 h-3" /> Verified by you
            </span>
          )}
          {commitment.userVerified === false && (
            <span className="text-[11px] font-mono-code text-[#A33A2B] bg-[#FCECE9] px-2 py-0.5 rounded border border-[#F4C5BE] flex items-center gap-1">
              <X className="w-3 h-3" /> Marked unrelated
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={commitment.userVerified === true ? 'primary' : 'secondary'}
            onClick={() => verifyCommitment(commitment.id, true)}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            This is correct
          </Button>
          <Button
            size="sm"
            variant={commitment.userVerified === false ? 'danger' : 'secondary'}
            onClick={() => verifyCommitment(commitment.id, false)}
            icon={<X className="w-3.5 h-3.5" />}
          >
            These are unrelated
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};
