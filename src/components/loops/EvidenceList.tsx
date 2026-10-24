import React from 'react';
import type { SourceFile } from '../../types';
import { useAppStore } from '../../lib/store';
import { FileText, Eye, Unlink, FileCode, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '../../lib/formatters';

interface EvidenceListProps {
  commitmentId: string;
  files: SourceFile[];
  onPreviewFile: (file: SourceFile) => void;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  commitmentId,
  files,
  onPreviewFile
}) => {
  const { unlinkFileFromCommitment } = useAppStore();

  if (files.length === 0) {
    return (
      <div className="p-6 border border-dashed border-[#E5E4DC] rounded-xl text-center bg-[#FAF9F5] text-xs text-[#777970]">
        No evidence sources are currently linked to this commitment.
      </div>
    );
  }

  const getIcon = (type: SourceFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#A33A2B]" />;
      case 'markdown':
      case 'text':
        return <FileCode className="w-4 h-4 text-[#536B4F]" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#3C6488]" />;
      default:
        return <FileText className="w-4 h-4 text-[#777970]" />;
    }
  };

  return (
    <div className="space-y-3">
      {files.map((file, idx) => (
        <div
          key={file.id}
          className="border border-[#E5E4DC] rounded-xl p-4 bg-[#FFFFFF] hover:border-[#D0CEBF] transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#F0EFE9] border border-[#E5E4DC] flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(file.type)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-code text-xs font-semibold text-[#20211D] truncate">
                    {file.name}
                  </span>
                  {file.locationReference && (
                    <span className="text-[10px] font-mono-code text-[#777970] bg-[#F2F1ED] px-1.5 py-0.5 rounded border border-[#E5E4DC]">
                      {file.locationReference}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono-code text-[#9A9C94] mt-0.5">
                  {formatBytes(file.size)} · Source #{idx + 1}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onPreviewFile(file)}
                className="p-1.5 text-[#777970] hover:text-[#20211D] hover:bg-[#F0EFE9] rounded-md transition-colors"
                title="Preview source file"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => unlinkFileFromCommitment(commitmentId, file.id)}
                className="p-1.5 text-[#777970] hover:text-[#A33A2B] hover:bg-[#FCECE9] rounded-md transition-colors"
                title="Unlink file from this loop"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Excerpt quotation */}
          {file.excerpt && (
            <div className="mt-3 pl-3 border-l-2 border-[#536B4F]/40 bg-[#FAF9F5] py-2 pr-3 rounded-r-md text-xs text-[#33352E] font-mono-code leading-relaxed">
              &ldquo;{file.excerpt}&rdquo;
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
