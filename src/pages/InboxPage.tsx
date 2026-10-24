import React, { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { FileRow } from '../components/files/FileRow';
import { FileImportModal } from '../components/files/FileImportModal';
import { FilePreviewPanel } from '../components/files/FilePreviewPanel';
import { SearchField } from '../components/ui/SearchField';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import type { SourceFile } from '../types';
import { Plus, LayoutList, LayoutGrid } from 'lucide-react';

export const InboxPage: React.FC = () => {
  const { files, resetToSampleData } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size' | 'status'>('recent');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<SourceFile | null>(null);

  // Filter & sort files
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        const matchesQuery =
          searchQuery.trim() === '' ||
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.extractedTextPreview?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || file.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || file.processingStatus === statusFilter;

        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return b.size - a.size;
        if (sortBy === 'status') return a.processingStatus.localeCompare(b.processingStatus);
        return new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime();
      });
  }, [files, searchQuery, typeFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E4DC]">
        <div>
          <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-1 font-semibold">
            WORKSPACE INVENTORY
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
            The inbox
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#777970]">
            Everything you&rsquo;ve brought in, ready to make sense of.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setImportModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add files
        </Button>
      </div>

      {/* Toolbar: Search, Filters, Sort, View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by filename or content..."
            className="w-full sm:w-64"
          />

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#FAF9F5] border border-[#E5E4DC] rounded-md px-2.5 py-1.5 text-xs text-[#20211D] font-mono-code focus:outline-none focus:border-[#536B4F]"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF documents</option>
            <option value="markdown">Markdown notes</option>
            <option value="text">Plain text</option>
            <option value="image">Images / OCR</option>
            <option value="unsupported">Unsupported</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF9F5] border border-[#E5E4DC] rounded-md px-2.5 py-1.5 text-xs text-[#20211D] font-mono-code focus:outline-none focus:border-[#536B4F]"
          >
            <option value="all">All States</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="needs_attention">Needs attention</option>
            <option value="unsupported">Unsupported</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-[#777970] font-mono-code">
            <span className="text-[11px] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF9F5] border border-[#E5E4DC] rounded-md px-2.5 py-1.5 text-xs text-[#20211D] font-mono-code focus:outline-none focus:border-[#536B4F]"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Filename A–Z</option>
              <option value="size">File Size</option>
              <option value="status">Processing State</option>
            </select>
          </div>

          {/* List / Grid toggle */}
          <div className="hidden sm:flex items-center border border-[#E5E4DC] rounded-md overflow-hidden bg-[#FAF9F5]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-[#536B4F] text-[#F7F6F2]' : 'text-[#777970] hover:text-[#20211D]'}`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#536B4F] text-[#F7F6F2]' : 'text-[#777970] hover:text-[#20211D]'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main File List / Grid Content */}
      {files.length === 0 ? (
        <EmptyState
          heading="Nothing here yet."
          description="Start with the files you've been putting off. Bring in PDFs, notes, or receipts."
          action={
            <Button
              size="sm"
              variant="primary"
              onClick={() => setImportModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add your first files
            </Button>
          }
          secondaryAction={
            <Button size="sm" variant="secondary" onClick={resetToSampleData}>
              Explore sample data
            </Button>
          }
        />
      ) : filteredFiles.length === 0 ? (
        <EmptyState
          heading="No files match your filters."
          description="Try relaxing your search terms or clearing status filters."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onPreview={(f) => setPreviewFile(f)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => setPreviewFile(file)}
              className="p-4 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl hover:border-[#536B4F] cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono-code uppercase text-[#777970] block mb-1">
                  {file.type} · {file.processingStatus}
                </span>
                <h4 className="font-mono-code text-xs font-semibold text-[#20211D] truncate">
                  {file.name}
                </h4>
                {file.excerpt && (
                  <p className="mt-2 text-xs text-[#555750] line-clamp-3 leading-relaxed">
                    &ldquo;{file.excerpt}&rdquo;
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#ECEBE4] text-[11px] font-mono-code text-[#9A9C94] flex items-center justify-between">
                <span>{file.sourceLocation ? file.sourceLocation.split('/').pop() : 'Local'}</span>
                <span className="text-[#536B4F]">Inspect</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Import Modal */}
      <FileImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />

      {/* File Preview Modal */}
      <FilePreviewPanel
        file={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
