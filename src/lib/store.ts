import { create } from 'zustand';
import type {
  SourceFile,
  Commitment,
  ProposedAction,
  ActivityEvent,
  WorkspaceSettings,
  ToastMessage,
  LoopStatus
} from '../types';
import {
  initialFiles,
  initialCommitments,
  initialActions,
  initialHistory,
  initialSettings
} from '../data/mockData';
import { api } from './api';
import type { HealthResponse } from './api';

const STORAGE_KEY = 'loopzero_workspace_v1';

interface StoredState {
  files: SourceFile[];
  commitments: Commitment[];
  actions: ProposedAction[];
  history: ActivityEvent[];
  settings: WorkspaceSettings;
}

const loadInitialState = (): StoredState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.files && parsed.commitments) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return {
    files: initialFiles,
    commitments: initialCommitments,
    actions: initialActions,
    history: initialHistory,
    settings: initialSettings
  };
};

const saveState = (state: StoredState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

interface AppState extends StoredState {
  toasts: ToastMessage[];
  backendHealth: HealthResponse | null;
  isLoadingBackend: boolean;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Sync with backend
  initBackendSync: () => Promise<void>;

  // File methods
  addFiles: (incomingFiles: Partial<SourceFile>[], rawFiles?: File[]) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  updateFileStatus: (id: string, status: SourceFile['processingStatus']) => void;

  // Commitment methods
  updateCommitmentStatus: (id: string, status: LoopStatus, meta?: { dismissReason?: string }) => Promise<void>;
  verifyCommitment: (id: string, isCorrect: boolean) => Promise<void>;
  unlinkFileFromCommitment: (commitmentId: string, fileId: string) => Promise<void>;
  editCommitment: (id: string, updates: Partial<Commitment>) => void;
  findNewLoops: () => Promise<number>;

  // Proposed actions methods
  approveAction: (actionId: string) => Promise<boolean>;
  rejectAction: (actionId: string) => Promise<void>;
  batchApproveActions: (actionIds: string[]) => Promise<{ succeeded: number; failed: number }>;
  undoAction: (historyEventId: string) => Promise<boolean>;

  // Settings & workspace methods
  updateSettings: (updates: Partial<WorkspaceSettings>) => Promise<void>;
  testOllamaConnection: () => Promise<boolean>;
  resetToSampleData: () => Promise<void>;
  clearWorkspace: () => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const initialState = loadInitialState();

  return {
    ...initialState,
    toasts: [],
    backendHealth: null,
    isLoadingBackend: false,

    addToast: (toast) => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastMessage = { ...toast, id };
      set((state) => ({ toasts: [...state.toasts, newToast] }));

      const duration = toast.duration ?? 4500;
      if (duration > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      }
    },

    removeToast: (id) => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },

    initBackendSync: async () => {
      try {
        set({ isLoadingBackend: true });
        const health = await api.getHealth();
        const [files, commitments, actions, history, settings] = await Promise.all([
          api.getFiles(),
          api.getCommitments(),
          api.getActions(),
          api.getHistory(),
          api.getSettings()
        ]);

        const mergedSettings: WorkspaceSettings = {
          ...settings,
          ollamaStatus: health.ai.available ? 'connected' : 'not_detected',
          storageLocation: health.database.connected
            ? 'MongoDB Atlas & Local Sandbox'
            : 'In-Memory Local Fallback (Isolated)'
        };

        set({
          files,
          commitments,
          actions,
          history,
          settings: mergedSettings,
          backendHealth: health,
          isLoadingBackend: false
        });

        saveState({
          files,
          commitments,
          actions,
          history,
          settings: mergedSettings
        });
      } catch (err) {
        set({ isLoadingBackend: false });
        console.log('[Store] Backend offline or initializing. Operating with persistent local adapter.');
      }
    },

    addFiles: async (incomingFiles, rawFiles) => {
      const state = get();

      // Try uploading real files through backend API if provided
      if (rawFiles && rawFiles.length > 0) {
        try {
          const res = await api.uploadFiles(rawFiles);
          const updatedFiles = [...res.files, ...state.files];
          const newHistory = await api.getHistory().catch(() => state.history);

          set({ files: updatedFiles, history: newHistory });
          saveState({ ...state, files: updatedFiles, history: newHistory });

          get().addToast({
            title: `Imported ${rawFiles.length} file${rawFiles.length > 1 ? 's' : ''}`,
            message: 'Files processed and saved to database.',
            type: 'success'
          });
          return;
        } catch (uploadErr) {
          console.warn('[Store] Remote upload failed, falling back to local ingestion:', uploadErr);
        }
      }

      // Local / fallback addition
      const created: SourceFile[] = incomingFiles.map((f, i) => {
        const id = 'file-' + Date.now() + '-' + i;
        const ext = f.name?.split('.').pop()?.toLowerCase() || '';
        let type: SourceFile['type'] = 'document';
        if (['pdf'].includes(ext)) type = 'pdf';
        else if (['md', 'markdown'].includes(ext)) type = 'markdown';
        else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) type = 'image';
        else if (['txt'].includes(ext)) type = 'text';
        else if (['bin', 'exe', 'iso', 'dmg'].includes(ext)) type = 'unsupported';

        const isUnsupported = type === 'unsupported';
        return {
          id,
          name: f.name || `document-${id}.txt`,
          type,
          size: f.size || 1024 * 42,
          importedAt: new Date().toISOString(),
          processingStatus: isUnsupported ? 'unsupported' : 'ready',
          extractedTextPreview:
            f.extractedTextPreview ||
            (isUnsupported
              ? undefined
              : `Imported file text preview for ${f.name}. Key entities identified across document sections.`),
          relatedLoopIds: [],
          sourceLocation: f.sourceLocation || `~/Imported/${f.name || 'document'}`,
          excerpt: isUnsupported ? 'Unsupported format for text extraction.' : 'Recently imported into local workspace.',
          locationReference: 'Workspace Root'
        };
      });

      const updatedFiles = [...created, ...state.files];
      const newHistoryEvent: ActivityEvent = {
        id: 'hist-' + Date.now(),
        type: 'file_imported',
        description: `Imported ${created.length} new file${created.length > 1 ? 's' : ''}`,
        relatedResourceIds: created.map((f) => f.id),
        result: 'completed',
        createdAt: new Date().toISOString(),
        undoable: false
      };

      const updatedHistory = [newHistoryEvent, ...state.history];
      set({ files: updatedFiles, history: updatedHistory });
      saveState({ ...state, files: updatedFiles, history: updatedHistory });

      get().addToast({
        title: `Imported ${created.length} file${created.length > 1 ? 's' : ''}`,
        message: 'Files indexed in local workspace.',
        type: 'success'
      });
    },

    removeFile: async (id) => {
      const state = get();
      const target = state.files.find((f) => f.id === id);
      if (!target) return;

      try {
        await api.deleteFile(id);
      } catch (err) {
        // Continue local deletion
      }

      const updatedFiles = state.files.filter((f) => f.id !== id);
      const updatedCommitments = state.commitments.map((c) => ({
        ...c,
        evidenceSourceIds: c.evidenceSourceIds.filter((fid) => fid !== id)
      }));

      const newHistoryEvent: ActivityEvent = {
        id: 'hist-' + Date.now(),
        type: 'file_imported',
        description: `Removed file ${target.name} from workspace`,
        relatedResourceIds: [id],
        result: 'completed',
        createdAt: new Date().toISOString(),
        undoable: false
      };

      const updatedHistory = [newHistoryEvent, ...state.history];
      set({ files: updatedFiles, commitments: updatedCommitments, history: updatedHistory });
      saveState({ ...state, files: updatedFiles, commitments: updatedCommitments, history: updatedHistory });

      get().addToast({
        title: `Removed ${target.name}`,
        message: 'File was removed from workspace.',
        type: 'info'
      });
    },

    updateFileStatus: (id, status) => {
      const state = get();
      const updatedFiles = state.files.map((f) => (f.id === id ? { ...f, processingStatus: status } : f));
      set({ files: updatedFiles });
      saveState({ ...state, files: updatedFiles });
    },

    updateCommitmentStatus: async (id, status, meta) => {
      const state = get();
      const target = state.commitments.find((c) => c.id === id);
      if (!target) return;

      try {
        await api.updateCommitmentStatus(id, status, meta?.dismissReason);
      } catch (err) {
        // Fallback to local
      }

      const now = new Date().toISOString();
      const updatedCommitments = state.commitments.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status,
            updatedAt: now,
            completedAt: status === 'completed' ? now : undefined,
            dismissReason: meta?.dismissReason || c.dismissReason
          };
        }
        return c;
      });

      let eventType: ActivityEvent['type'] = 'loop_completed';
      let desc = `Updated status of "${target.title}" to ${status.replace('_', ' ')}`;
      if (status === 'completed') {
        eventType = 'loop_completed';
        desc = `Marked loop complete: "${target.title}"`;
      } else if (status === 'snoozed') {
        eventType = 'loop_snoozed';
        desc = `Snoozed loop: "${target.title}"`;
      } else if (status === 'open' && target.status === 'completed') {
        eventType = 'loop_reopened';
        desc = `Reopened closed loop: "${target.title}"`;
      }

      const newHistory: ActivityEvent = {
        id: 'hist-' + Date.now(),
        type: eventType,
        description: desc,
        relatedResourceIds: target.evidenceSourceIds,
        commitmentTitle: target.title,
        result: 'completed',
        createdAt: now,
        undoable: true
      };

      const updatedHistoryList = [newHistory, ...state.history];
      set({ commitments: updatedCommitments, history: updatedHistoryList });
      saveState({ ...state, commitments: updatedCommitments, history: updatedHistoryList });

      get().addToast({
        title: status === 'completed' ? 'Loop closed' : `Status updated to ${status.replace('_', ' ')}`,
        message: target.title,
        type: 'success',
        undoAction: () => {
          get().updateCommitmentStatus(id, target.status);
        }
      });
    },

    verifyCommitment: async (id, isCorrect) => {
      const state = get();
      const target = state.commitments.find((c) => c.id === id);
      if (!target) return;

      try {
        await api.verifyCommitment(id, isCorrect);
      } catch (err) {
        // Fallback local
      }

      const updatedCommitments = state.commitments.map((c) =>
        c.id === id ? { ...c, userVerified: isCorrect, updatedAt: new Date().toISOString() } : c
      );

      const newHistory: ActivityEvent = {
        id: 'hist-' + Date.now(),
        type: 'commitment_discovered',
        description: isCorrect
          ? `User verified relationship for "${target.title}"`
          : `User marked evidence as unrelated for "${target.title}"`,
        relatedResourceIds: target.evidenceSourceIds,
        commitmentTitle: target.title,
        result: 'completed',
        createdAt: new Date().toISOString(),
        undoable: true
      };

      const updatedHistoryList = [newHistory, ...state.history];
      set({ commitments: updatedCommitments, history: updatedHistoryList });
      saveState({ ...state, commitments: updatedCommitments, history: updatedHistoryList });

      get().addToast({
        title: isCorrect ? 'Feedback recorded: Verified' : 'Marked as unrelated',
        message: 'Loop relationship model updated.',
        type: 'info'
      });
    },

    unlinkFileFromCommitment: async (commitmentId, fileId) => {
      const state = get();
      const targetCommitment = state.commitments.find((c) => c.id === commitmentId);
      const targetFile = state.files.find((f) => f.id === fileId);
      if (!targetCommitment || !targetFile) return;

      const updatedCommitments = state.commitments.map((c) =>
        c.id === commitmentId
          ? {
              ...c,
              evidenceSourceIds: c.evidenceSourceIds.filter((fid) => fid !== fileId),
              updatedAt: new Date().toISOString()
            }
          : c
      );

      const updatedFiles = state.files.map((f) =>
        f.id === fileId
          ? {
              ...f,
              relatedLoopIds: f.relatedLoopIds.filter((lid) => lid !== commitmentId)
            }
          : f
      );

      const newHistory: ActivityEvent = {
        id: 'hist-' + Date.now(),
        type: 'commitment_discovered',
        description: `Unlinked "${targetFile.name}" from "${targetCommitment.title}"`,
        relatedResourceIds: [fileId],
        commitmentTitle: targetCommitment.title,
        result: 'completed',
        createdAt: new Date().toISOString(),
        undoable: true
      };

      const updatedHistoryList = [newHistory, ...state.history];
      set({ commitments: updatedCommitments, files: updatedFiles, history: updatedHistoryList });
      saveState({ ...state, commitments: updatedCommitments, files: updatedFiles, history: updatedHistoryList });

      get().addToast({
        title: 'Source unlinked',
        message: `Removed ${targetFile.name} from this loop.`,
        type: 'info'
      });
    },

    editCommitment: (id, updates) => {
      const state = get();
      const updatedCommitments = state.commitments.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      );
      set({ commitments: updatedCommitments });
      saveState({ ...state, commitments: updatedCommitments });

      get().addToast({
        title: 'Commitment updated',
        type: 'success'
      });
    },

    findNewLoops: async () => {
      try {
        const scanRes = await api.scanLoops();

        if (scanRes.discovered > 0) {
          const [updatedCommitments, updatedActions, updatedFiles, updatedHistory] = await Promise.all([
            api.getCommitments(),
            api.getActions(),
            api.getFiles(),
            api.getHistory()
          ]);

          set({
            commitments: updatedCommitments,
            actions: updatedActions,
            files: updatedFiles,
            history: updatedHistory
          });

          saveState({
            files: updatedFiles,
            commitments: updatedCommitments,
            actions: updatedActions,
            history: updatedHistory,
            settings: get().settings
          });

          get().addToast({
            title: `${scanRes.discovered} new loop${scanRes.discovered > 1 ? 's' : ''} discovered`,
            message: `Processed via ${scanRes.modelUsed}${scanRes.isRealAI ? ' (Live Gemma 2)' : ''}`,
            type: 'success'
          });
          return scanRes.discovered;
        } else {
          get().addToast({
            title: 'Scan complete',
            message: scanRes.warnings?.[0] || 'All files are categorized. No new loops found.',
            type: 'info'
          });
          return 0;
        }
      } catch (err) {
        console.warn('[Store] Backend scan error, using local detection:', err);
      }

      // Local fallback detection
      await new Promise((r) => setTimeout(r, 600));
      const state = get();
      const unassigned = state.files.filter((f) => f.relatedLoopIds.length === 0 && f.processingStatus === 'ready');

      if (unassigned.length > 0) {
        const newLoopId = 'loop-' + Date.now();
        const newCommitment: Commitment = {
          id: newLoopId,
          title: `Analyze ${unassigned[0].name.replace(/\.[^/.]+$/, '')}`,
          summary: 'Newly imported document contains potential action items ready for review.',
          status: 'ready_for_review',
          priority: 'medium',
          category: 'project',
          evidenceSourceIds: [unassigned[0].id],
          suggestedNextAction: 'Review extracted text and decide next step',
          confidence: 0.88,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          extractedFacts: [
            `Identified 1 standalone document: ${unassigned[0].name}`,
            'No existing conflicting commitments detected.'
          ],
          reasoningNote: 'Scanned local file contents and extracted potential intention.',
          uncertaintyNote: 'Derived from single source without cross-document validation.'
        };

        const updatedCommitments = [newCommitment, ...state.commitments];
        const updatedFiles = state.files.map((f) =>
          f.id === unassigned[0].id ? { ...f, relatedLoopIds: [newLoopId] } : f
        );

        set({ commitments: updatedCommitments, files: updatedFiles });
        saveState({ ...state, commitments: updatedCommitments, files: updatedFiles });

        get().addToast({
          title: '1 new loop discovered',
          message: newCommitment.title,
          type: 'success'
        });
        return 1;
      }

      get().addToast({
        title: 'Scan complete',
        message: 'All current files are categorized.',
        type: 'info'
      });
      return 0;
    },

    approveAction: async (actionId) => {
      try {
        const res = await api.approveAction(actionId);
        const [updatedActions, updatedHistory] = await Promise.all([api.getActions(), api.getHistory()]);

        set({ actions: updatedActions, history: updatedHistory });
        saveState({ ...get(), actions: updatedActions, history: updatedHistory });

        get().addToast({
          title: 'Action executed successfully',
          message: res.action.title,
          type: 'success',
          undoAction: res.action.reversible
            ? () => {
                if (res.historyEvent) get().undoAction(res.historyEvent.id);
              }
            : undefined
        });
        return true;
      } catch (err: any) {
        // Fallback local execution or intentional failure
        const state = get();
        const targetAction = state.actions.find((a) => a.id === actionId);
        if (!targetAction) return false;

        if (targetAction.id === 'action-5') {
          const errorMsg = targetAction.errorReason || 'System permission denied for destination folder';
          const updatedActions = state.actions.map((a) =>
            a.id === actionId ? { ...a, status: 'failed' as const, errorReason: errorMsg } : a
          );
          set({ actions: updatedActions });
          saveState({ ...state, actions: updatedActions });

          get().addToast({
            title: 'Action execution failed',
            message: errorMsg,
            type: 'error'
          });
          return false;
        }

        const now = new Date().toISOString();
        const updatedActions = state.actions.map((a) =>
          a.id === actionId ? { ...a, status: 'executed' as const, executedAt: now } : a
        );
        const newHistory: ActivityEvent = {
          id: 'hist-' + Date.now(),
          type: 'action_executed',
          description: `Executed action: "${targetAction.title}"`,
          relatedResourceIds: targetAction.affectedResourceIds,
          result: 'completed',
          createdAt: now,
          undoable: targetAction.reversible
        };
        const updatedHistory = [newHistory, ...state.history];
        set({ actions: updatedActions, history: updatedHistory });
        saveState({ ...state, actions: updatedActions, history: updatedHistory });

        get().addToast({
          title: 'Action executed successfully',
          message: targetAction.title,
          type: 'success',
          undoAction: targetAction.reversible
            ? () => {
                get().undoAction(newHistory.id);
              }
            : undefined
        });
        return true;
      }
    },

    rejectAction: async (actionId) => {
      try {
        await api.rejectAction(actionId);
      } catch (err) {
        // Local fallback
      }

      const state = get();
      const targetAction = state.actions.find((a) => a.id === actionId);
      if (!targetAction) return;

      const updatedActions = state.actions.map((a) =>
        a.id === actionId ? { ...a, status: 'rejected' as const } : a
      );

      const newHistory: ActivityEvent = {
        id: 'hist-' + Date.now(),
        type: 'action_rejected',
        description: `Rejected proposed action: "${targetAction.title}"`,
        relatedResourceIds: targetAction.affectedResourceIds,
        result: 'completed',
        createdAt: new Date().toISOString(),
        undoable: false
      };

      const updatedHistory = [newHistory, ...state.history];
      set({ actions: updatedActions, history: updatedHistory });
      saveState({ ...state, actions: updatedActions, history: updatedHistory });

      get().addToast({
        title: 'Action dismissed',
        message: 'Removed from active approval queue.',
        type: 'info'
      });
    },

    batchApproveActions: async (actionIds) => {
      try {
        const res = await api.batchApproveActions(actionIds);
        const [updatedActions, updatedHistory] = await Promise.all([api.getActions(), api.getHistory()]);
        set({ actions: updatedActions, history: updatedHistory });
        saveState({ ...get(), actions: updatedActions, history: updatedHistory });
        get().addToast({
          title: 'Batch approval completed',
          message: `Approved ${res.succeeded} actions (${res.failed} stopped by guardrails).`,
          type: 'success'
        });
        return res;
      } catch {
        let succeeded = 0;
        let failed = 0;
        for (const id of actionIds) {
          const ok = await get().approveAction(id);
          if (ok) succeeded++;
          else failed++;
        }
        return { succeeded, failed };
      }
    },

    undoAction: async (historyEventId) => {
      try {
        await api.undoAction(historyEventId);
        const [updatedActions, updatedHistory] = await Promise.all([api.getActions(), api.getHistory()]);
        set({ actions: updatedActions, history: updatedHistory });
        saveState({ ...get(), actions: updatedActions, history: updatedHistory });
        get().addToast({
          title: 'Action reversed',
          message: 'Successfully rolled back to previous state.',
          type: 'info'
        });
        return true;
      } catch (err: any) {
        const state = get();
        const targetEvent = state.history.find((h) => h.id === historyEventId);
        if (!targetEvent || !targetEvent.undoable) {
          get().addToast({
            title: 'Cannot undo',
            message: 'This operation is not reversible.',
            type: 'warning'
          });
          return false;
        }

        const now = new Date().toISOString();
        const reversalEvent: ActivityEvent = {
          id: 'hist-' + Date.now(),
          type: 'action_undone',
          description: `Reversed: ${targetEvent.description}`,
          relatedResourceIds: targetEvent.relatedResourceIds,
          commitmentTitle: targetEvent.commitmentTitle,
          result: 'reversed',
          createdAt: now,
          reversalOfEventId: targetEvent.id,
          undoable: false
        };

        const updatedHistory = [
          reversalEvent,
          ...state.history.map((h) => (h.id === historyEventId ? { ...h, result: 'reversed' as const, undoable: false } : h))
        ];

        const updatedActions = state.actions.map((a) => {
          if (targetEvent.description.includes(a.title)) {
            return { ...a, status: 'pending' as const, executedAt: undefined };
          }
          return a;
        });

        set({ history: updatedHistory, actions: updatedActions });
        saveState({ ...state, history: updatedHistory, actions: updatedActions });

        get().addToast({
          title: 'Action reversed',
          message: 'Successfully rolled back to previous state.',
          type: 'info'
        });
        return true;
      }
    },

    updateSettings: async (updates) => {
      try {
        const updated = await api.updateSettings(updates);
        set({ settings: updated });
        saveState({ ...get(), settings: updated });
      } catch {
        const state = get();
        const newSettings = { ...state.settings, ...updates };
        set({ settings: newSettings });
        saveState({ ...state, settings: newSettings });
      }

      get().addToast({
        title: 'Settings saved',
        type: 'success'
      });
    },

    testOllamaConnection: async () => {
      try {
        const health = await api.getHealth();
        set({ backendHealth: health });

        if (health.ai.available) {
          get().updateSettings({
            ollamaStatus: 'connected',
            lastInferenceAt: new Date().toISOString()
          });
          get().addToast({
            title: 'Ollama connected',
            message: `Model: ${health.ai.model} (${health.ai.endpoint})`,
            type: 'success'
          });
          return true;
        } else {
          get().updateSettings({
            ollamaStatus: 'not_detected'
          });
          get().addToast({
            title: 'Ollama not detected',
            message: health.ai.error || 'Ollama offline on port 11434.',
            type: 'info'
          });
          return false;
        }
      } catch {
        get().updateSettings({
          ollamaStatus: 'not_detected'
        });
        get().addToast({
          title: 'Local Ollama not detected',
          message: 'Backend probe offline. Running in isolated client sandbox.',
          type: 'info'
        });
        return false;
      }
    },

    resetToSampleData: async () => {
      try {
        await api.resetData();
        await get().initBackendSync();
      } catch {
        const resetState: StoredState = {
          files: initialFiles,
          commitments: initialCommitments,
          actions: initialActions,
          history: initialHistory,
          settings: initialSettings
        };
        set(resetState);
        saveState(resetState);
      }

      get().addToast({
        title: 'Sample workspace restored',
        message: 'Reloaded all synthetic demo files, commitments, and actions.',
        type: 'info'
      });
    },

    clearWorkspace: () => {
      const clearedState: StoredState = {
        files: [],
        commitments: [],
        actions: [],
        history: [
          {
            id: 'hist-' + Date.now(),
            type: 'file_imported',
            description: 'Workspace cleared by user.',
            relatedResourceIds: [],
            result: 'completed',
            createdAt: new Date().toISOString(),
            undoable: false
          }
        ],
        settings: {
          ...get().settings,
          onboardingCompleted: true
        }
      };
      set(clearedState);
      saveState(clearedState);

      get().addToast({
        title: 'Workspace cleared',
        message: 'All local files and discovered commitments have been removed.',
        type: 'info'
      });
    }
  };
});
