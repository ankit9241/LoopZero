import type { SourceFile, Commitment, ProposedAction, ActivityEvent, WorkspaceSettings } from '../types';

export const initialFiles: SourceFile[] = [
  {
    id: 'file-1',
    name: 'resume-draft-october.pdf',
    type: 'pdf',
    size: 248102,
    importedAt: '2026-10-22T09:14:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Ankit Sharma · Machine Learning Engineer · Experienced with PyTorch, distributed inference, agentic orchestration. Education: B.Tech Computer Science (2025). Seeking Summer 2027 Research Internship.',
    relatedLoopIds: ['loop-1'],
    sourceLocation: '~/Downloads/resume-draft-october.pdf',
    excerpt: 'Seeking Summer 2027 Research Internship in Autonomous Systems.',
    locationReference: 'Page 1 · Header & Objective'
  },
  {
    id: 'file-2',
    name: 'deepmind-research-internship-2027.pdf',
    type: 'pdf',
    size: 512400,
    importedAt: '2026-10-22T09:14:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Google DeepMind Research Internship (London/Mountain View). Requirements: CV, statement of purpose, 1 code sample repository link. Deadline: November 15, 2026. Application portal: careers.google.com/internships',
    relatedLoopIds: ['loop-1'],
    sourceLocation: '~/Downloads/deepmind-research-internship-2027.pdf',
    excerpt: 'Requires CV, statement of purpose, and repository link before Nov 15.',
    locationReference: 'Page 2 · Application Checklist'
  },
  {
    id: 'file-3',
    name: 'apply-later-notes.md',
    type: 'markdown',
    size: 3410,
    importedAt: '2026-10-22T09:15:00Z',
    processingStatus: 'ready',
    extractedTextPreview: '# To Finish for DeepMind\n- [x] Polish resume format\n- [ ] Write statement of purpose (draft 200 words on memory-augmented transformers)\n- [ ] Clean up GitHub agent-bench repo\n- [ ] Submit application via portal',
    relatedLoopIds: ['loop-1'],
    sourceLocation: '~/Desktop/Notes/apply-later-notes.md',
    excerpt: 'Write statement of purpose (draft 200 words) and clean up GitHub repo.',
    locationReference: 'Lines 4–8 · Checklist'
  },
  {
    id: 'file-4',
    name: 'vaswani2017-attention.pdf',
    type: 'pdf',
    size: 1420800,
    importedAt: '2026-10-21T14:30:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Attention Is All You Need. Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin. We propose the Transformer, a model architecture eschewing recurrence...',
    relatedLoopIds: ['loop-2'],
    sourceLocation: '~/Documents/Papers/vaswani2017-attention.pdf',
    excerpt: 'Section 3.2: Multi-Head Attention equations and scaling factor sqrt(d_k).',
    locationReference: 'Page 4 · Equation 1 & 2'
  },
  {
    id: 'file-5',
    name: 'transformer-synthesis-reading-note.md',
    type: 'markdown',
    size: 8920,
    importedAt: '2026-10-21T14:31:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Notes on Transformer Self-Attention: Need to write a concise summary comparing scaled dot-product attention with flash attention for lab presentation next Tuesday. Still missing complexity comparison table.',
    relatedLoopIds: ['loop-2'],
    sourceLocation: '~/Desktop/Notes/transformer-synthesis-reading-note.md',
    excerpt: 'Need to write a concise summary comparing scaled dot-product with Flash Attention.',
    locationReference: 'Paragraph 2 · Presentation notes'
  },
  {
    id: 'file-6',
    name: 'screenshot-2024-10-18-equations.png',
    type: 'image',
    size: 820412,
    importedAt: '2026-10-21T14:31:00Z',
    processingStatus: 'ready',
    extractedTextPreview: '[OCR Extracted]: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V. Scaled dot-product comparison diagrams.',
    relatedLoopIds: ['loop-2'],
    sourceLocation: '~/Pictures/Screenshots/screenshot-2024-10-18-equations.png',
    excerpt: 'Mathematical formulation of multi-head scaled dot product.',
    locationReference: 'Image Annotation · Visual Formula'
  },
  {
    id: 'file-7',
    name: 'screenshot-2024-10-19-kv-cache-diagram.png',
    type: 'image',
    size: 1102940,
    importedAt: '2026-10-21T14:32:00Z',
    processingStatus: 'ready',
    extractedTextPreview: '[OCR Extracted]: KV Cache memory allocation breakdown per token during autoregressive generation.',
    relatedLoopIds: ['loop-2'],
    sourceLocation: '~/Pictures/Screenshots/screenshot-2024-10-19-kv-cache-diagram.png',
    excerpt: 'Memory consumption curves for extended context windows.',
    locationReference: 'Diagram Chart · Context scaling'
  },
  {
    id: 'file-8',
    name: 'uber-travel-receipt-q3.pdf',
    type: 'pdf',
    size: 114500,
    importedAt: '2026-10-20T11:05:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Uber Technologies Inc. Receipt: Trip to Bangalore Airport (BLR). Total: $48.50. Payment Method: Personal Card ending in 4112. Date: September 28, 2026.',
    relatedLoopIds: ['loop-3'],
    sourceLocation: '~/Downloads/uber-travel-receipt-q3.pdf',
    excerpt: 'Airport transfer invoice eligible for conference travel reimbursement.',
    locationReference: 'Receipt Header · Transaction #8491'
  },
  {
    id: 'file-9',
    name: 'medical-expense-reimbursement-form.pdf',
    type: 'pdf',
    size: 384000,
    importedAt: '2026-10-20T11:06:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Employee Health Benefit Reimbursement Claim Form (Partially Filled). Employee ID: 10492. Claim Type: Dental & Vision. Total Claimed: $210.00. Status: Incomplete - Missing Physician Stamp.',
    relatedLoopIds: ['loop-3'],
    sourceLocation: '~/Documents/Financial/medical-expense-reimbursement-form.pdf',
    excerpt: 'Claim Form requires physician signature and supporting invoice.',
    locationReference: 'Section 4 · Signature & Verification'
  },
  {
    id: 'file-10',
    name: 'reimbursement-pending-memo.txt',
    type: 'text',
    size: 1204,
    importedAt: '2026-10-20T11:06:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Reminder to self: Company quarterly reimbursement cutoff is Oct 31st. Still need to merge the Uber receipt with the dental bill and send to HR finance inbox.',
    relatedLoopIds: ['loop-3'],
    sourceLocation: '~/Desktop/Notes/reimbursement-pending-memo.txt',
    excerpt: 'Company quarterly cutoff Oct 31st. Merge receipts and submit.',
    locationReference: 'Note body · Line 1'
  },
  {
    id: 'file-11',
    name: 'brand-moodboard-palette.png',
    type: 'image',
    size: 940320,
    importedAt: '2026-10-19T16:20:00Z',
    processingStatus: 'ready',
    extractedTextPreview: '[OCR Extracted]: Primary Color Swatches: Paper Canvas #F7F6F2, Forest Accent #536B4F, Ink Primary #20211D. Typographic pairings: Instrument Serif + Geist.',
    relatedLoopIds: ['loop-4'],
    sourceLocation: '~/Desktop/Redesign/brand-moodboard-palette.png',
    excerpt: 'Color system tokens and serif display typography pairing.',
    locationReference: 'Color Grid · Palette Section'
  },
  {
    id: 'file-12',
    name: 'brand-navigation-sketch.png',
    type: 'image',
    size: 1240100,
    importedAt: '2026-10-19T16:21:00Z',
    processingStatus: 'ready',
    extractedTextPreview: '[OCR Extracted]: Desktop left rail navigation wireframe. Compact 56px collapsed width, expanded 240px drawer, quiet top bar.',
    relatedLoopIds: ['loop-4'],
    sourceLocation: '~/Desktop/Redesign/brand-navigation-sketch.png',
    excerpt: 'Wireframe for compact left rail desktop shell.',
    locationReference: 'Component Annotation #3'
  },
  {
    id: 'file-13',
    name: 'design-system-spec-draft.md',
    type: 'markdown',
    size: 5120,
    importedAt: '2026-10-19T16:22:00Z',
    processingStatus: 'ready',
    extractedTextPreview: '# Design System Spec v0.1\nWe need to reconcile the screenshot palette with the token names in the Tailwind v4 theme. Open issue: decide whether buttons use 6px or 8px border-radius.',
    relatedLoopIds: ['loop-4'],
    sourceLocation: '~/Desktop/Redesign/design-system-spec-draft.md',
    excerpt: 'Reconcile palette screenshots with token names in Tailwind v4.',
    locationReference: 'Section 2.1 · Token definitions'
  },
  {
    id: 'file-14',
    name: 'domain-renewal-notice.pdf',
    type: 'pdf',
    size: 89400,
    importedAt: '2026-10-18T10:00:00Z',
    processingStatus: 'ready',
    extractedTextPreview: 'Namecheap Notice: Domain loopzero.dev and SSL Certificate auto-renewed successfully on October 18, 2026. Card charged: $14.28.',
    relatedLoopIds: ['loop-5'],
    sourceLocation: '~/Downloads/domain-renewal-notice.pdf',
    excerpt: 'Domain loopzero.dev renewed successfully on Oct 18.',
    locationReference: 'Confirmation receipt #NC-99120'
  },
  {
    id: 'file-15',
    name: 'cryptic-dump-firmware.bin',
    type: 'unsupported',
    size: 4194304,
    importedAt: '2026-10-17T08:00:00Z',
    processingStatus: 'unsupported',
    extractedTextPreview: undefined,
    relatedLoopIds: [],
    sourceLocation: '~/Downloads/cryptic-dump-firmware.bin',
    excerpt: 'Binary file format (.bin) is not supported for textual semantic loop extraction.',
    locationReference: 'Raw Binary'
  },
  {
    id: 'file-16',
    name: 'corrupted-experiment-metrics.csv',
    type: 'text',
    size: 61400,
    importedAt: '2026-10-17T08:05:00Z',
    processingStatus: 'needs_attention',
    extractedTextPreview: 'epoch,loss,accuracy\n1,0.892,0.61\n2,NaN,NaN\n[PARSER WARNING: Corrupted UTF-8 byte sequence at offset 0x3FA0. Processing paused.]',
    relatedLoopIds: [],
    sourceLocation: '~/Desktop/Research/corrupted-experiment-metrics.csv',
    excerpt: 'Contains unparseable byte sequences at offset 0x3FA0. Manual encoding repair required.',
    locationReference: 'Byte offset 0x3FA0'
  }
];

export const initialCommitments: Commitment[] = [
  {
    id: 'loop-1',
    title: 'Finish the internship application',
    summary: 'Your resume draft and the saved job description belong to the same unfinished task.',
    status: 'open',
    priority: 'high',
    category: 'career',
    evidenceSourceIds: ['file-1', 'file-2', 'file-3'],
    suggestedNextAction: 'Review requirement checklist and draft 200-word statement of purpose',
    confidence: 0.94,
    createdAt: '2026-10-22T09:16:00Z',
    updatedAt: '2026-10-24T14:10:00Z',
    extractedFacts: [
      'Resume draft lists target objective as Summer 2027 Research Internship.',
      'Google DeepMind application posting specifies a November 15 deadline.',
      'Saved markdown note includes an unfinished item: "Write statement of purpose (draft 200 words)".',
      'Code repository link is marked pending in apply-later-notes.md.'
    ],
    reasoningNote: 'These three files share the same opportunity context (DeepMind 2027 internship), and the markdown checklist explicitly refers to a future submission step that has not yet been marked completed.',
    uncertaintyNote: 'The files clearly suggest an unfinished application, but LOOPZERO cannot verify whether you submitted it through an external browser portal without saving confirmation.'
  },
  {
    id: 'loop-2',
    title: 'Synthesize transformer research paper notes',
    summary: 'Downloaded Attention paper and handwritten equation screenshots are awaiting a unified lab presentation.',
    status: 'ready_for_review',
    priority: 'medium',
    category: 'research',
    evidenceSourceIds: ['file-4', 'file-5', 'file-6', 'file-7'],
    suggestedNextAction: 'Generate structured slide outline comparing dot-product and Flash Attention',
    confidence: 0.89,
    createdAt: '2026-10-21T14:35:00Z',
    updatedAt: '2026-10-23T18:00:00Z',
    extractedFacts: [
      'Reading note notes upcoming lab presentation on "next Tuesday".',
      'Equation screenshot #1 matches Section 3.2 of vaswani2017-attention.pdf.',
      'KV Cache screenshot contains handwritten notes on context length overhead.',
      'Reading notes explicitly state: "Still missing complexity comparison table".'
    ],
    reasoningNote: 'The reading notes and screenshot annotations cross-reference the exact equations and section numbers of the PDF paper, targeting an impending presentation.',
    uncertaintyNote: 'Presentation date was listed relative to note creation ("next Tuesday"). Actual calendar target date may have shifted.'
  },
  {
    id: 'loop-3',
    title: 'Submit Q3 healthcare & travel reimbursements',
    summary: 'Airport Uber receipt and dental claim form must be submitted before the October 31 cutoff.',
    status: 'open',
    priority: 'high',
    category: 'admin',
    evidenceSourceIds: ['file-8', 'file-9', 'file-10'],
    suggestedNextAction: 'Assemble expense packet ($258.50 total) for HR finance submission',
    confidence: 0.96,
    createdAt: '2026-10-20T11:08:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
    extractedFacts: [
      'Reimbursement memo notes company cutoff is October 31.',
      'Uber trip receipt from September 28 totals $48.50 for airport commute.',
      'Dental claim form indicates $210.00 claim awaiting doctor signature.'
    ],
    reasoningNote: 'The personal reminder memo directly aggregates the specific amounts and vendors from the two accompanying PDF files and flags an urgent deadline.',
    uncertaintyNote: 'LOOPZERO cannot detect if physical doctor stamp was obtained on paper form.'
  },
  {
    id: 'loop-4',
    title: 'Consolidate brand redesign screenshots & spec',
    summary: 'Visual moodboard swatches, navigation wireframes, and draft spec need to be grouped into one workspace folder.',
    status: 'ready_for_review',
    priority: 'medium',
    category: 'project',
    evidenceSourceIds: ['file-11', 'file-12', 'file-13'],
    suggestedNextAction: 'Group design assets and resolve button border-radius in spec',
    confidence: 0.91,
    createdAt: '2026-10-19T16:25:00Z',
    updatedAt: '2026-10-22T08:30:00Z',
    extractedFacts: [
      'Moodboard screenshot defines exact hex codes matching design tokens (#F7F6F2, #536B4F).',
      'Navigation wireframe illustrates desktop left rail and mobile drawer.',
      'Markdown spec leaves unresolved open issue on button border radius (6px vs 8px).'
    ],
    reasoningNote: 'All three files were created on October 19 in the Desktop/Redesign folder and describe the same visual design language.',
    uncertaintyNote: 'Spec is marked v0.1 draft and may be superseded by unimported Figma links.'
  },
  {
    id: 'loop-5',
    title: 'Renew domain registration & SSL cert',
    summary: 'Auto-renewal for loopzero.dev was completed and logged.',
    status: 'completed',
    priority: 'low',
    category: 'personal',
    evidenceSourceIds: ['file-14'],
    suggestedNextAction: 'No further action required; receipt archived',
    confidence: 0.99,
    createdAt: '2026-10-18T10:05:00Z',
    updatedAt: '2026-10-18T10:06:00Z',
    completedAt: '2026-10-18T10:06:00Z',
    extractedFacts: [
      'Confirmation from Namecheap for loopzero.dev renewal.',
      'Payment processed on October 18, 2026.'
    ],
    reasoningNote: 'Receipt indicates automatic completion of billing event.',
    uncertaintyNote: 'None. Transaction verified complete.'
  }
];

export const initialActions: ProposedAction[] = [
  {
    id: 'action-1',
    commitmentId: 'loop-1',
    type: 'group_files',
    title: 'Group internship application documents',
    description: 'Three related application files will be grouped into a designated folder while preserving original source files.',
    affectedResourceIds: ['file-1', 'file-2', 'file-3'],
    beforePreview: '3 scattered files in ~/Downloads and ~/Desktop/Notes',
    afterPreview: 'Grouped under ~/Documents/LOOPZERO/Internships/DeepMind-2027/ with relative symlinks',
    riskLevel: 'low',
    reversible: true,
    status: 'pending',
    createdAt: '2026-10-22T09:18:00Z'
  },
  {
    id: 'action-2',
    commitmentId: 'loop-1',
    type: 'prepare_draft',
    title: 'Generate statement of purpose scaffold',
    description: 'Extract relevant project bullet points from your resume to scaffold the 200-word statement of purpose.',
    affectedResourceIds: ['file-1', 'file-3'],
    beforePreview: 'Empty draft note in apply-later-notes.md',
    afterPreview: 'Pre-populated 3-paragraph outline with distributed inference citations in ~/Desktop/Notes/sop-draft.md',
    riskLevel: 'low',
    reversible: true,
    status: 'pending',
    createdAt: '2026-10-22T09:20:00Z'
  },
  {
    id: 'action-3',
    commitmentId: 'loop-2',
    type: 'rename_files',
    title: 'Rename screenshot captures with semantic labels',
    description: 'Rename raw timestamp screenshots into descriptive filenames matching paper sections.',
    affectedResourceIds: ['file-6', 'file-7'],
    beforePreview: 'screenshot-2024-10-18-equations.png, screenshot-2024-10-19-kv-cache-diagram.png',
    afterPreview: 'vaswani-sec3-attention-formula.png, transformer-kv-cache-scaling.png',
    riskLevel: 'low',
    reversible: true,
    status: 'pending',
    createdAt: '2026-10-21T14:40:00Z'
  },
  {
    id: 'action-4',
    commitmentId: 'loop-3',
    type: 'create_checklist',
    title: 'Compile Q3 expense submission checklist',
    description: 'Generate an audit-ready summary sheet consolidating Uber ($48.50) and medical ($210.00) claims for HR.',
    affectedResourceIds: ['file-8', 'file-9', 'file-10'],
    beforePreview: 'Separate receipt PDF and partial claim form',
    afterPreview: 'Formatted expense summary markdown ready for PDF export: total $258.50',
    riskLevel: 'low',
    reversible: true,
    status: 'pending',
    createdAt: '2026-10-20T11:15:00Z'
  },
  {
    id: 'action-5',
    commitmentId: 'loop-3',
    type: 'archive_reference',
    title: 'Attempt sync to external corporate finance directory',
    description: 'Demonstration action to test local filesystem permissions guardrails.',
    affectedResourceIds: ['file-8'],
    beforePreview: 'Local PDF in ~/Downloads',
    afterPreview: 'Write attempt to restricted /Volumes/SecureHR/dropzone',
    riskLevel: 'high',
    reversible: false,
    status: 'failed',
    createdAt: '2026-10-20T11:20:00Z',
    errorReason: 'EACCES: Permission denied writing to protected system volume. System guardrail stopped operation.'
  }
];

export const initialHistory: ActivityEvent[] = [
  {
    id: 'hist-1',
    type: 'file_imported',
    description: 'Imported 3 application files from ~/Downloads and ~/Desktop',
    relatedResourceIds: ['file-1', 'file-2', 'file-3'],
    commitmentTitle: 'Finish the internship application',
    result: 'completed',
    createdAt: '2026-10-22T09:15:00Z',
    undoable: false
  },
  {
    id: 'hist-2',
    type: 'commitment_discovered',
    description: 'Identified unfinished commitment: Finish the internship application (confidence 94%)',
    relatedResourceIds: ['file-1', 'file-2', 'file-3'],
    commitmentTitle: 'Finish the internship application',
    result: 'completed',
    createdAt: '2026-10-22T09:16:00Z',
    undoable: false
  },
  {
    id: 'hist-3',
    type: 'action_executed',
    description: 'Grouped 4 brand redesign files into ~/Desktop/Redesign/Archive/',
    relatedResourceIds: ['file-11', 'file-12', 'file-13'],
    commitmentTitle: 'Consolidate brand redesign screenshots & spec',
    result: 'completed',
    createdAt: '2026-10-23T11:30:00Z',
    undoable: true,
    details: {
      originalState: 'Files scattered across root Desktop and Downloads',
      newState: 'Files consolidated in ~/Desktop/Redesign/Archive/ with preserved timestamps'
    }
  },
  {
    id: 'hist-4',
    type: 'error_encountered',
    description: 'Failed to write to external network share /Volumes/SecureHR/dropzone',
    relatedResourceIds: ['file-8'],
    commitmentTitle: 'Submit Q3 healthcare & travel reimbursements',
    result: 'failed',
    createdAt: '2026-10-23T15:10:00Z',
    undoable: false,
    details: {
      errorMessage: 'EACCES: Target directory is read-only. Safe fallback preserved original file in ~/Downloads.'
    }
  },
  {
    id: 'hist-5',
    type: 'loop_completed',
    description: 'Loop "Renew domain registration & SSL cert" marked completed automatically from verified invoice',
    relatedResourceIds: ['file-14'],
    commitmentTitle: 'Renew domain registration & SSL cert',
    result: 'completed',
    createdAt: '2026-10-18T10:06:00Z',
    undoable: true
  }
];

export const initialSettings: WorkspaceSettings = {
  workspaceName: 'Local Workspace — Primary',
  storageLocation: 'IndexedDB & Browser File System API (Local-Only)',
  modelProvider: 'Ollama (Local daemon)',
  configuredModel: 'gemma2:9b (Q4_K_M)',
  ollamaStatus: 'not_detected',
  lastInferenceAt: undefined,
  autoGroupRelated: true,
  requireReviewForUncertain: true,
  defaultActionApproval: 'manual',
  onboardingCompleted: true
};
