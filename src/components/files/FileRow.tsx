import React from 'react';
import type { SourceFile } from '../../types';
import { formatBytes, formatRelativeTime, getFileProcessingBadge } from '../../lib/formatters';
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  FileQuestion,
  AlertTriangle,
  RotateCcw,
  Eye,
  Trash2
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Link } from 'react-router-dom';

interface FileRowProps {
  file: SourceFile;
  onPreview: (file: SourceFile) => void;
}

export const FileRow: React.FC<FileRowProps> = ({ file, onPreview }) => {
  const { removeFile, commitments } = useAppStore();
  const badge = getFileProcessingBadge(file.processingStatus);

  const getFileIcon = () => {
    switch (file.type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#A33A2B]" />;
      case 'markdown':
      case 'text':
        return <FileCode className="w-4 h-4 text-[#536B4F]" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#3C6488]" />;
      case 'unsupported':
        return <AlertTriangle className="w-4 h-4 text-[#C98A2C]" />;
      default:
        return <FileQuestion className="w-4 h-4 text-[#777970]" />;
    }
  };

  const linkedCommitment = commitments.find((c) => file.relatedLoopIds.includes(c.id));

  return (
    <div className="group flex items-center justify-between px-4 py-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-lg hover:border-[#D0CEBF] hover:bg-[#FAF9F5] transition-all">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-md bg-[#F0EFE9] border border-[#E5E4DC] flex items-center justify-center shrink-0">
          {getFileIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              onClick={() => onPreview(file)}
              className="font-medium text-xs sm:text-sm text-[#20211D] truncate cursor-pointer hover:text-[#536B4F] transition-colors"
            >
              {file.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono-code ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-[11px] font-mono-code text-[#777970]">
            <span>{formatBytes(file.size)}</span>
            <span>·</span>
            <span>{formatRelativeTime(file.importedAt)}</span>
            {file.sourceLocation && (
              <>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline truncate max-w-xs text-[#9A9C94]">
                  {file.sourceLocation}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4 shrink-0">
        {linkedCommitment ? (
          <Link
            to={`/app/loops/${linkedCommitment.id}`}
            className="hidden sm:flex items-center gap-1 text-[11px] text-[#536B4F] bg-[#EAF0E6] hover:bg-[#DDE7D8] px-2.5 py-1 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="truncate max-w-[130px] font-medium">{linkedCommitment.title}</span>
          </Link>
        ) : (
          <span className="hidden sm:inline text-[11px] font-mono-code text-[#9A9C94]">
            Unassigned
          </span>
        )}

        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPreview(file)}
            className="p-1.5 text-[#777970] hover:text-[#20211D] hover:bg-[#EFECE3] rounded-md transition-colors"
            title="Preview file"
            aria-label="Preview file"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeFile(file.id)}
            className="p-1.5 text-[#777970] hover:text-[#A33A2B] hover:bg-[#FCECE9] rounded-md transition-colors"
            title="Remove from workspace"
            aria-label="Remove from workspace"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
