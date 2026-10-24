export type FileType = 'pdf' | 'markdown' | 'image' | 'text' | 'document' | 'other' | 'unsupported';

export type FileProcessingStatus = 'ready' | 'processing' | 'needs_attention' | 'unsupported' | 'failed';

export interface SourceFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  importedAt: string; // ISO string
  processingStatus: FileProcessingStatus;
  extractedTextPreview?: string;
  relatedLoopIds: string[];
  sourceLocation?: string;
  excerpt?: string;
  locationReference?: string; // e.g. "Page 2, Section: Education"
}

export type LoopStatus = 'open' | 'needs_attention' | 'ready_for_review' | 'snoozed' | 'completed' | 'dismissed';

export type LoopPriority = 'high' | 'medium' | 'low';

export type LoopCategory = 'career' | 'research' | 'project' | 'personal' | 'admin';

export interface Commitment {
  id: string;
  title: string;
  summary: string;
  status: LoopStatus;
  priority: LoopPriority;
  category: LoopCategory;
  evidenceSourceIds: string[];
  suggestedNextAction: string;
  confidence: number; // 0.0 to 1.0
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  snoozedUntil?: string;
  dismissReason?: string;
  userVerified?: boolean | null; // true = "This is correct", false = "These files are unrelated"
  extractedFacts: string[];
  reasoningNote: string;
  uncertaintyNote?: string;
}

export type ActionType = 'group_files' | 'prepare_draft' | 'rename_files' | 'create_checklist' | 'archive_reference';

export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';

export interface ProposedAction {
  id: string;
  commitmentId: string;
  type: ActionType;
  title: string;
  description: string;
  affectedResourceIds: string[];
  beforePreview: string;
  afterPreview: string;
  riskLevel: 'low' | 'medium' | 'high';
  reversible: boolean;
  status: ActionStatus;
  createdAt: string;
  executedAt?: string;
  errorReason?: string;
}

export type ActivityEventType =
  | 'file_imported'
  | 'commitment_discovered'
  | 'action_approved'
  | 'action_rejected'
  | 'action_executed'
  | 'action_undone'
  | 'loop_completed'
  | 'loop_reopened'
  | 'loop_snoozed'
  | 'files_grouped'
  | 'error_encountered';

export type ActivityResult = 'completed' | 'failed' | 'reversed' | 'pending';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  description: string;
  relatedResourceIds: string[];
  commitmentTitle?: string;
  result: ActivityResult;
  createdAt: string;
  reversalOfEventId?: string;
  undoable: boolean;
  details?: {
    originalState?: string;
    newState?: string;
    errorMessage?: string;
  };
}

export interface WorkspaceSettings {
  workspaceName: string;
  storageLocation: string;
  modelProvider: string;
  configuredModel: string;
  ollamaStatus: 'connected' | 'not_detected' | 'model_unavailable' | 'connection_failed';
  lastInferenceAt?: string;
  autoGroupRelated: boolean;
  requireReviewForUncertain: boolean;
  defaultActionApproval: 'manual' | 'batch_safe';
  onboardingCompleted: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  undoAction?: () => void;
  duration?: number;
}
