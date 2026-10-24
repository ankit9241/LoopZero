import React, { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Dialog } from '../components/ui/Dialog';
import type { ActivityEvent } from '../types';
import { formatDate, formatTime, getActivityResultBadge } from '../lib/formatters';
import { RotateCcw } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { history, undoAction } = useAppStore();

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    return history.filter((event) => {
      if (filterType === 'all') return true;
      if (filterType === 'completed') return event.result === 'completed';
      if (filterType === 'failed') return event.result === 'failed';
      if (filterType === 'reversed') return event.result === 'reversed';
      if (filterType === 'file_ops')
        return event.type === 'file_imported' || event.type === 'files_grouped';
      if (filterType === 'loop_changes')
        return (
          event.type === 'loop_completed' ||
          event.type === 'loop_reopened' ||
          event.type === 'commitment_discovered'
        );
      return true;
    });
  }, [history, filterType]);

  // Group events by date (e.g. "Today", "Oct 22, 2026")
  const groupedEvents = useMemo(() => {
    const groups: { [date: string]: ActivityEvent[] } = {};
    for (const ev of filteredEvents) {
      const dateKey = formatDate(ev.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(ev);
    }
    return groups;
  }, [filteredEvents]);

  const handleUndo = async (eventId: string) => {
    setIsUndoing(true);
    await undoAction(eventId);
    setIsUndoing(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E4DC]">
        <div>
          <span className="text-[11px] font-mono-code text-[#536B4F] uppercase tracking-wider block mb-1 font-semibold">
            AUDIT TRAIL
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#20211D] font-normal tracking-tight">
            What changed
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#777970]">
            Every approved action leaves a trail and keeps your original files safe.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 p-3 bg-[#FFFFFF] border border-[#E5E4DC] rounded-xl text-xs font-mono-code">
        {[
          { id: 'all', label: 'All activity' },
          { id: 'completed', label: 'Completed' },
          { id: 'failed', label: 'Failed' },
          { id: 'reversed', label: 'Reversed' },
          { id: 'file_ops', label: 'File operations' },
          { id: 'loop_changes', label: 'Loop updates' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? 'bg-[#EAF0E6] text-[#536B4F] font-semibold border border-[#C8D8C2]'
                : 'text-[#777970] hover:text-[#20211D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History Timeline */}
      {history.length === 0 ? (
        <EmptyState
          heading="Your history starts here."
          description="Approved actions will appear here so you can always see what changed and rollback operations."
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          heading="No activity matches this filter."
          description="Try selecting a different filter above."
          action={
            <Button size="sm" variant="secondary" onClick={() => setFilterType('all')}>
              Show all activity
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([dateLabel, events]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-code uppercase text-[#777970] font-semibold tracking-wider">
                  {dateLabel}
                </span>
                <div className="h-px bg-[#E5E4DC] flex-1" />
              </div>

              <div className="border border-[#E5E4DC] rounded-xl divide-y divide-[#ECEBE4] bg-[#FFFFFF] overflow-hidden">
                {events.map((event) => {
                  const badge = getActivityResultBadge(event.result);
                  return (
                    <div
                      key={event.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${badge.dotColor}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-[#20211D] leading-snug">
                            {event.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-mono-code text-[#777970]">
                            <span>{formatTime(event.createdAt)}</span>
                            {event.commitmentTitle && (
                              <>
                                <span>·</span>
                                <span className="text-[#536B4F] truncate max-w-xs">
                                  {event.commitmentTitle}
                                </span>
                              </>
                            )}
                            {event.relatedResourceIds.length > 0 && (
                              <>
                                <span>·</span>
                                <span>
                                  {event.relatedResourceIds.length} file
                                  {event.relatedResourceIds.length !== 1 ? 's' : ''}
                                </span>
                              </>
                            )}
                            <span>·</span>
                            <span className="capitalize">{badge.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedEvent(event)}
                        >
                          Details
                        </Button>
                        {event.undoable && event.result === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndo(event.id)}
                            icon={<RotateCcw className="w-3.5 h-3.5" />}
                          >
                            Undo
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title="Activity Audit Details"
        description={`Event ID: ${selectedEvent?.id}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {selectedEvent?.undoable && selectedEvent.result === 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectedEvent && handleUndo(selectedEvent.id)}
                  isLoading={isUndoing}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Undo this change
                </Button>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs font-mono-code">
            <div className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
              <span className="text-[#9A9C94] uppercase block text-[10px] mb-1">Description</span>
              <p className="text-sm font-sans font-medium text-[#20211D]">
                {selectedEvent.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
                <span className="text-[#9A9C94] uppercase block text-[10px] mb-1">Timestamp</span>
                <span className="text-[#20211D]">
                  {formatDate(selectedEvent.createdAt)} {formatTime(selectedEvent.createdAt)}
                </span>
              </div>
              <div className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
                <span className="text-[#9A9C94] uppercase block text-[10px] mb-1">Result</span>
                <span className="capitalize text-[#20211D]">{selectedEvent.result}</span>
              </div>
            </div>

            {selectedEvent.details && (
              <div className="space-y-2">
                {selectedEvent.details.originalState && (
                  <div className="p-3 bg-[#FAF9F5] border border-[#E5E4DC] rounded-lg">
                    <span className="text-[#9A9C94] uppercase block text-[10px] mb-1">
                      Original State
                    </span>
                    <p className="text-[#555750]">{selectedEvent.details.originalState}</p>
                  </div>
                )}
                {selectedEvent.details.newState && (
                  <div className="p-3 bg-[#EAF0E6] border border-[#C8D8C2] rounded-lg">
                    <span className="text-[#536B4F] uppercase block text-[10px] mb-1">
                      Resulting State
                    </span>
                    <p className="text-[#20211D]">{selectedEvent.details.newState}</p>
                  </div>
                )}
                {selectedEvent.details.errorMessage && (
                  <div className="p-3 bg-[#FCECE9] border border-[#F4C5BE] rounded-lg text-[#A33A2B]">
                    <span className="uppercase block text-[10px] mb-1 font-semibold">
                      Failure Reason
                    </span>
                    <p>{selectedEvent.details.errorMessage}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};
