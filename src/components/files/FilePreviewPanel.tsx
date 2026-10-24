import React from 'react';
import type { SourceFile } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { formatBytes, formatDate, formatTime, getFileProcessingBadge } from '../../lib/formatters';
import { useAppStore } from '../../lib/store';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Trash2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface FilePreviewPanelProps {
  file: SourceFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({ file, isOpen, onClose }) => {
  const { commitments, removeFile, findNewLoops } = useAppStore();

  if (!file) return null;

  const badge = getFileProcessingBadge(file.processingStatus);
  const linkedLoops = commitments.filter((c) => file.relatedLoopIds.includes(c.id));

  const handleDelete = () => {
    removeFile(file.id);
    onClose();
  };

  const handleScan = async () => {
    await findNewLoops();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={file.name}
      description={`Imported on ${formatDate(file.importedAt)} at ${formatTime(file.importedAt)}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Remove from workspace
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleScan}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Find related loops
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metadata summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg text-xs">
          <div>
            <span className="text-[#9A9C94] block text-[10px] font-mono-code uppercase">Size</span>
            <span className="font-mono-code font-medium text-[#20211D]">
              {formatBytes(file.size)}
            </span>
          </div>
          <div>
            <span className="text-[#9A9C94] block text-[10px] font-mono-code uppercase">Format</span>
            <span className="font-mono-code uppercase text-[#20211D]">{file.type}</span>
          </div>
          <div>
            <span className="text-[#9A9C94] block text-[10px] font-mono-code uppercase">Status</span>
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono-code border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>
          <div>
            <span className="text-[#9A9C94] block text-[10px] font-mono-code uppercase">Sources</span>
            <span className="font-mono-code text-[#20211D]">
              {file.relatedLoopIds.length} Linked Loop{file.relatedLoopIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Source location path */}
        {file.sourceLocation && (
          <div className="text-xs">
            <span className="text-[#777970] font-medium block mb-1">Local Filesystem Origin:</span>
            <code className="block p-2 bg-[#F0EFE9] border border-[#E5E4DC] rounded text-[#20211D] font-mono-code text-[11px] truncate">
              {file.sourceLocation}
            </code>
          </div>
        )}

        {/* Extracted Text Content / Honest Preview */}
        <div>
          <h4 className="text-xs font-semibold text-[#20211D] uppercase tracking-wider mb-2">
            Extracted Text & Local OCR
          </h4>

          {file.processingStatus === 'unsupported' ? (
            <div className="p-4 border border-[#E5E4DC] rounded-lg bg-[#FAF9F5] text-center">
              <AlertTriangle className="w-6 h-6 text-[#C98A2C] mx-auto mb-2" />
              <p className="text-xs font-medium text-[#20211D]">Unsupported binary file format</p>
              <p className="text-xs text-[#777970] mt-1 max-w-sm mx-auto">
                LOOPZERO only runs local semantic analysis on supported formats: PDFs, Markdown files,
                plain text documents, and images with OCR text.
              </p>
            </div>
          ) : file.processingStatus === 'failed' ? (
            <div className="p-4 border border-[#F4C5BE] rounded-lg bg-[#FCECE9]">
              <p className="text-xs font-medium text-[#A33A2B]">Extraction failure</p>
              <p className="text-xs text-[#777970] mt-1">
                A parser error occurred while scanning byte boundaries. The original file has been
                preserved unmodified in your local filesystem.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg font-mono-code text-xs text-[#33352E] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-text">
              {file.extractedTextPreview || 'No text extracted yet.'}
            </div>
          )}
        </div>

        {/* Connected loops */}
        <div>
          <h4 className="text-xs font-semibold text-[#20211D] uppercase tracking-wider mb-2">
            Related Discovered Commitments
          </h4>

          {linkedLoops.length > 0 ? (
            <div className="space-y-2">
              {linkedLoops.map((loop) => (
                <Link
                  key={loop.id}
                  to={`/app/loops/${loop.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 border border-[#E5E4DC] rounded-lg hover:border-[#536B4F] bg-[#FFFFFF] hover:bg-[#FAF9F5] transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-editorial text-base text-[#20211D] group-hover:text-[#536B4F] transition-colors block truncate">
                      {loop.title}
                    </span>
                    <span className="text-xs text-[#777970] truncate block">{loop.summary}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#777970] group-hover:text-[#536B4F] shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-[#E5E4DC] rounded-lg text-center text-xs text-[#777970]">
              This file is not yet linked to any open loop. Click &ldquo;Find related loops&rdquo; to
              evaluate it.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
