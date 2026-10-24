import React, { useState, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { useAppStore } from '../../lib/store';
import { UploadCloud, FileText, X } from 'lucide-react';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StagedFile {
  name: string;
  size: number;
  type: string;
  supported: boolean;
  fileObj?: File;
}

export const FileImportModal: React.FC<FileImportModalProps> = ({ isOpen, onClose }) => {
  const { addFiles } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const supportedExtensions = ['pdf', 'md', 'markdown', 'txt', 'png', 'jpg', 'jpeg', 'webp', 'csv'];

  const processFileObjects = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items: StagedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      items.push({
        name: f.name,
        size: f.size,
        type: ext,
        supported: supportedExtensions.includes(ext),
        fileObj: f
      });
    }
    setStagedFiles((prev) => [...prev, ...items]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      processFileObjects(e.dataTransfer.files);
    }
  };

  const removeStaged = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (stagedFiles.length === 0) return;
    setIsProcessing(true);

    const rawFileObjs = stagedFiles.map((sf) => sf.fileObj).filter((f): f is File => Boolean(f));

    await addFiles(
      stagedFiles.map((sf) => ({
        name: sf.name,
        size: sf.size,
        sourceLocation: `~/Workspace/Incoming/${sf.name}`,
        extractedTextPreview: sf.supported
          ? `Text content extracted from ${sf.name}. Key entities identified across document sections.`
          : undefined
      })),
      rawFileObjs.length > 0 ? rawFileObjs : undefined
    );

    setIsProcessing(false);
    setStagedFiles([]);
    onClose();
  };

  const handleAddSample = () => {
    setStagedFiles([
      { name: 'fellowship-application-guidelines.pdf', size: 412000, type: 'pdf', supported: true },
      { name: 'recommendation-letter-request.md', size: 2840, type: 'md', supported: true },
      { name: 'grant-eligibility-notes.txt', size: 1400, type: 'txt', supported: true },
      { name: 'raw-core-dump.bin', size: 2048500, type: 'bin', supported: false }
    ]);
  };

  const supportedCount = stagedFiles.filter((f) => f.supported).length;
  const unsupportedCount = stagedFiles.filter((f) => !f.supported).length;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add files to workspace"
      description="Select documents or folders from your local machine. Nothing leaves your device."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={handleAddSample}>
            Stage sample files
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImport}
              isLoading={isProcessing}
              disabled={stagedFiles.length === 0}
            >
              Import {stagedFiles.length > 0 ? `(${stagedFiles.length})` : ''}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-[#536B4F] bg-[#EAF0E6]/50'
              : 'border-[#DCDAD0] hover:border-[#536B4F] bg-[#FAF9F5]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => processFileObjects(e.target.files)}
          />
          <UploadCloud className="w-8 h-8 text-[#536B4F] mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-medium text-[#20211D]">
            Drag & drop files here, or <span className="text-[#536B4F] underline">browse</span>
          </p>
          <p className="text-[11px] text-[#777970] mt-1">
            Supports PDFs, Markdown notes, text documents, and images (OCR)
          </p>
        </div>

        {/* Selected Staged List */}
        {stagedFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-[#777970] mb-2 font-mono-code">
              <span>
                {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} staged
              </span>
              <span>
                <span className="text-[#536B4F] font-semibold">{supportedCount} supported</span>
                {unsupportedCount > 0 && (
                  <span className="text-[#C98A2C] ml-2">({unsupportedCount} unsupported)</span>
                )}
              </span>
            </div>

            <div className="border border-[#E5E4DC] rounded-lg divide-y divide-[#E5E4DC] max-h-48 overflow-y-auto bg-[#FFFFFF]">
              {stagedFiles.map((sf, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-[#777970] shrink-0" />
                    <span className="font-mono-code text-[#20211D] truncate">{sf.name}</span>
                    {!sf.supported && (
                      <span className="text-[10px] bg-[#FAF6EE] text-[#C98A2C] px-1.5 py-0.2 rounded border border-[#E9DEC7] font-mono-code shrink-0">
                        binary
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeStaged(idx)}
                    className="text-[#9A9C94] hover:text-[#A33A2B] p-1 rounded-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
