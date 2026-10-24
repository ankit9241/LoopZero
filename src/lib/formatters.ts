import type { FileProcessingStatus, LoopStatus, ActionStatus, ActivityResult } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(isoString);
  } catch {
    return isoString;
  }
}

export function getStatusBadge(status: LoopStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'open':
      return { label: 'Open', bg: 'bg-[#FAF6EE]', text: 'text-[#8E6924]', border: 'border-[#E9DEC7]' };
    case 'needs_attention':
      return { label: 'Needs attention', bg: 'bg-[#FDF2EC]', text: 'text-[#B44C27]', border: 'border-[#F1D2C2]' };
    case 'ready_for_review':
      return { label: 'Ready for review', bg: 'bg-[#EAF0E6]', text: 'text-[#536B4F]', border: 'border-[#C8D8C2]' };
    case 'snoozed':
      return { label: 'Snoozed', bg: 'bg-[#F2F1ED]', text: 'text-[#777970]', border: 'border-[#E5E4DC]' };
    case 'completed':
      return { label: 'Completed', bg: 'bg-[#EAF0E6]', text: 'text-[#415C3E]', border: 'border-[#C8D8C2]' };
    case 'dismissed':
      return { label: 'Dismissed', bg: 'bg-[#F2F1ED]', text: 'text-[#9A9C94]', border: 'border-[#E5E4DC]' };
  }
}

export function getFileProcessingBadge(status: FileProcessingStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'ready':
      return { label: 'Ready', bg: 'bg-[#EAF0E6]', text: 'text-[#536B4F]', border: 'border-[#C8D8C2]' };
    case 'processing':
      return { label: 'Processing', bg: 'bg-[#FAF6EE]', text: 'text-[#8E6924]', border: 'border-[#E9DEC7]' };
    case 'needs_attention':
      return { label: 'Needs attention', bg: 'bg-[#FDF2EC]', text: 'text-[#B44C27]', border: 'border-[#F1D2C2]' };
    case 'unsupported':
      return { label: 'Unsupported', bg: 'bg-[#F2F1ED]', text: 'text-[#777970]', border: 'border-[#E5E4DC]' };
    case 'failed':
      return { label: 'Failed', bg: 'bg-[#FCECE9]', text: 'text-[#A33A2B]', border: 'border-[#F4C5BE]' };
  }
}

export function getActionStatusBadge(status: ActionStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending review', bg: 'bg-[#FAF6EE]', text: 'text-[#8E6924]' };
    case 'approved':
      return { label: 'Approved', bg: 'bg-[#EAF0E6]', text: 'text-[#536B4F]' };
    case 'rejected':
      return { label: 'Dismissed', bg: 'bg-[#F2F1ED]', text: 'text-[#777970]' };
    case 'executed':
      return { label: 'Executed', bg: 'bg-[#EAF0E6]', text: 'text-[#415C3E]' };
    case 'failed':
      return { label: 'Execution failed', bg: 'bg-[#FCECE9]', text: 'text-[#A33A2B]' };
  }
}

export function getActivityResultBadge(result: ActivityResult): { label: string; dotColor: string } {
  switch (result) {
    case 'completed':
      return { label: 'Completed', dotColor: 'bg-[#536B4F]' };
    case 'failed':
      return { label: 'Failed', dotColor: 'bg-[#A33A2B]' };
    case 'reversed':
      return { label: 'Reversed', dotColor: 'bg-[#8E6924]' };
    case 'pending':
      return { label: 'In progress', dotColor: 'bg-[#9A9C94]' };
  }
}
