import type { SourceFile, Commitment, ProposedAction, ActivityEvent, WorkspaceSettings, LoopStatus } from '../types';

const API_BASE = '/api';

export interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
  database: {
    connected: boolean;
    provider: string;
    error?: string;
  };
  ai: {
    available: boolean;
    model: string;
    endpoint: string;
    error?: string;
  };
  stats: {
    filesCount: number;
    commitmentsCount: number;
  };
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getFiles(): Promise<SourceFile[]> {
    const res = await fetch(`${API_BASE}/files`);
    if (!res.ok) throw new Error('Failed to load files');
    return res.json();
  },

  async uploadFiles(fileObjects: File[]): Promise<{ message: string; files: SourceFile[] }> {
    const formData = new FormData();
    for (const f of fileObjects) {
      formData.append('files', f);
    }
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload files');
    }
    return res.json();
  },

  async deleteFile(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/files/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete file');
  },

  async getCommitments(): Promise<Commitment[]> {
    const res = await fetch(`${API_BASE}/loops`);
    if (!res.ok) throw new Error('Failed to load commitments');
    return res.json();
  },

  async getCommitment(id: string): Promise<Commitment> {
    const res = await fetch(`${API_BASE}/loops/${id}`);
    if (!res.ok) throw new Error('Failed to load commitment');
    return res.json();
  },

  async updateCommitmentStatus(id: string, status: LoopStatus, dismissReason?: string): Promise<Commitment> {
    const res = await fetch(`${API_BASE}/loops/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, dismissReason })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async verifyCommitment(id: string, isCorrect: boolean): Promise<Commitment> {
    const res = await fetch(`${API_BASE}/loops/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect })
    });
    if (!res.ok) throw new Error('Failed to record verification');
    return res.json();
  },

  async scanLoops(): Promise<{
    discovered: number;
    commitments: Commitment[];
    actions: ProposedAction[];
    modelUsed: string;
    isRealAI: boolean;
    warnings?: string[];
  }> {
    const res = await fetch(`${API_BASE}/loops/scan`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to scan loops');
    return res.json();
  },

  async getActions(): Promise<ProposedAction[]> {
    const res = await fetch(`${API_BASE}/actions`);
    if (!res.ok) throw new Error('Failed to load actions');
    return res.json();
  },

  async approveAction(id: string): Promise<{ message: string; action: ProposedAction; historyEvent?: ActivityEvent }> {
    const res = await fetch(`${API_BASE}/actions/${id}/approve`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Action execution failed' }));
      throw new Error(err.error || 'Execution failed');
    }
    return res.json();
  },

  async rejectAction(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/actions/${id}/reject`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reject action');
  },

  async batchApproveActions(actionIds: string[]): Promise<{ succeeded: number; failed: number }> {
    const res = await fetch(`${API_BASE}/actions/batch-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionIds })
    });
    if (!res.ok) throw new Error('Batch approval failed');
    return res.json();
  },

  async getHistory(): Promise<ActivityEvent[]> {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
  },

  async undoAction(id: string): Promise<{ message: string; undoEvent: ActivityEvent }> {
    const res = await fetch(`${API_BASE}/history/${id}/undo`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Undo failed' }));
      throw new Error(err.error || 'Undo operation failed');
    }
    return res.json();
  },

  async getSettings(): Promise<WorkspaceSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(updates: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },

  async resetData(): Promise<void> {
    const res = await fetch(`${API_BASE}/settings/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset dataset');
  }
};
