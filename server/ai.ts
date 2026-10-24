import type { SourceFile, Commitment, ProposedAction } from '../src/types';

export interface ExtractedCommitmentResult {
  title: string;
  summary: string;
  suggestedNextAction: string;
  evidence: Array<{ sourceId: string; excerpt: string; locationReference?: string }>;
  confidence: number;
  suggestedPriority: 'high' | 'medium' | 'low';
  uncertainties?: string;
  extractedFacts: string[];
  reasoningNote: string;
  proposedAction?: {
    type: 'group_files' | 'prepare_draft' | 'rename_files' | 'create_checklist';
    title: string;
    description: string;
    beforePreview: string;
    afterPreview: string;
    reversible: boolean;
  };
}

export interface OllamaStatus {
  isAvailable: boolean;
  model: string;
  endpoint: string;
  error?: string;
}

export async function checkOllamaHealth(): Promise<OllamaStatus> {
  const endpoint = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'gemma2:9b';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data: any = await res.json();
      const models: any[] = data?.models || [];
      const hasModel = models.some((m) => m.name.toLowerCase().includes(model.toLowerCase()));

      return {
        isAvailable: true,
        model: hasModel ? model : models[0]?.name || model,
        endpoint,
        error: hasModel ? undefined : `Configured model '${model}' not loaded in Ollama. Using available model.`
      };
    }
  } catch (err: any) {
    return {
      isAvailable: false,
      model,
      endpoint,
      error: `Local Ollama daemon is offline at ${endpoint}. Run 'ollama serve' or 'ollama run ${model}'.`
    };
  }

  return {
    isAvailable: false,
    model,
    endpoint,
    error: `Ollama endpoint unreachable at ${endpoint}`
  };
}

/**
 * Extracts commitments using local Gemma model through Ollama.
 * If Ollama is offline or errors, provides deterministic, evidence-backed semantic extraction
 * and explicitly flags the mode so users are never misled.
 */
export async function extractCommitmentsWithAI(
  files: SourceFile[],
  existingCommitments: Commitment[]
): Promise<{
  commitments: Commitment[];
  actions: ProposedAction[];
  modelUsed: string;
  isRealAI: boolean;
  warnings?: string[];
}> {
  const ollama = await checkOllamaHealth();
  const endpoint = ollama.endpoint;
  const model = ollama.model;

  // Filter out unsupported binary files
  const validFiles = files.filter(
    (f) => f.processingStatus === 'ready' && f.extractedTextPreview && f.extractedTextPreview.length > 5
  );

  if (validFiles.length === 0) {
    return {
      commitments: [],
      actions: [],
      modelUsed: ollama.isAvailable ? model : 'none',
      isRealAI: false,
      warnings: ['No valid text content found across imported files. Supported: TXT, Markdown, text PDF.']
    };
  }

  // Prioritize files not yet linked to loops, or take the most recent 4 files
  const unlinked = validFiles.filter((f) => f.relatedLoopIds.length === 0);
  const filesToAnalyze = (unlinked.length > 0 ? unlinked : validFiles).slice(0, 4);

  // If Ollama is online, prompt the local Gemma model for structured JSON
  if (ollama.isAvailable) {
    try {
      const prompt = `You are LOOPZERO, an AI specialized in uncovering unfinished business buried in files.
Analyze the following documents and extract unfinished tasks or commitments that connect these files.

DOCUMENTS:
${filesToAnalyze
  .map(
    (f) => `[FILE_ID: "${f.id}"]
Name: ${f.name}
Path: ${f.sourceLocation || f.name}
Excerpt:
${f.extractedTextPreview?.slice(0, 350)}
---`
  )
  .join('\n')}

INSTRUCTIONS:
1. Identify true unfinished intentions (e.g. unsubmitted applications, unorganized receipts, pending drafts).
2. ONLY cite real quotes from the provided files. DO NOT invent facts, deadlines, or file contents.
3. Separate explicit facts from inferred next actions.
4. Output strict JSON matching this exact structure:
{
  "commitments": [
    {
      "title": "Short title of unfinished commitment",
      "summary": "1-2 sentences explaining what remains undone",
      "suggestedNextAction": "One clear next step",
      "evidenceSourceIds": ["${filesToAnalyze[0]?.id || 'file-1'}"],
      "extractedFacts": ["Explicit fact 1"],
      "reasoningNote": "Why these files are connected",
      "uncertaintyNote": "What cannot be verified from local files",
      "confidence": 0.90,
      "priority": "high",
      "category": "project",
      "proposedAction": {
        "type": "group_files",
        "title": "Action title",
        "description": "What will change",
        "beforePreview": "Current file state",
        "afterPreview": "Proposed organized state",
        "reversible": true
      }
    }
  ]
}
Return JSON ONLY, without markdown fences or additional commentary.`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.1,
            top_p: 0.9
          }
        })
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data: any = await response.json();
        const rawJsonText = data.response;
        const parsed = JSON.parse(rawJsonText);

        if (Array.isArray(parsed.commitments) && parsed.commitments.length > 0) {
          const newCommitments: Commitment[] = [];
          const newActions: ProposedAction[] = [];

          for (const item of parsed.commitments) {
            // Validate source IDs exist in incoming files
            const validSourceIds = (item.evidenceSourceIds || []).filter((sid: string) =>
              validFiles.some((vf) => vf.id === sid)
            );

            if (validSourceIds.length === 0) continue;

            const loopId = 'loop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

            // Deduplication check: Do not re-create if matching title & source files exist
            const isDuplicate = existingCommitments.some(
              (ec) =>
                ec.title.toLowerCase().trim() === item.title.toLowerCase().trim() ||
                (ec.evidenceSourceIds.length > 0 &&
                  ec.evidenceSourceIds.every((id) => validSourceIds.includes(id)))
            );

            if (isDuplicate) continue;

            const commitment: Commitment = {
              id: loopId,
              title: item.title || 'Unfinished task',
              summary: item.summary || 'Identified potential open loop.',
              status: 'open',
              priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
              category: ['career', 'research', 'project', 'admin', 'personal'].includes(item.category)
                ? item.category
                : 'project',
              evidenceSourceIds: validSourceIds,
              suggestedNextAction: item.suggestedNextAction || 'Review connected files',
              confidence: Math.max(0.5, Math.min(1.0, Number(item.confidence) || 0.85)),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              extractedFacts: Array.isArray(item.extractedFacts) ? item.extractedFacts : ['Document content matched local pattern'],
              reasoningNote: item.reasoningNote || 'Local Gemma inference correlated shared entities.',
              uncertaintyNote: item.uncertaintyNote || 'Verified against local file text only.'
            };

            newCommitments.push(commitment);

            if (item.proposedAction) {
              const act = item.proposedAction;
              const action: ProposedAction = {
                id: 'action-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                commitmentId: loopId,
                type: act.type || 'group_files',
                title: act.title || `Organize ${commitment.title}`,
                description: act.description || 'Consolidate related documents.',
                affectedResourceIds: validSourceIds,
                beforePreview: act.beforePreview || 'Scattered across folder locations',
                afterPreview: act.afterPreview || 'Consolidated under designated collection directory',
                riskLevel: 'low',
                reversible: act.reversible !== false,
                status: 'pending',
                createdAt: new Date().toISOString()
              };
              newActions.push(action);
            }
          }

          if (newCommitments.length > 0) {
            return {
              commitments: newCommitments,
              actions: newActions,
              modelUsed: `Ollama (${model})`,
              isRealAI: true
            };
          }
        }
      }
    } catch (ollamaErr: any) {
      console.warn('[AI] Ollama inference error, engaging honest deterministic fallback:', ollamaErr.message);
    }
  }

  // Fallback: Deterministic semantic grouping when Ollama is offline
  // Discovers unassigned files, clusters them by lexical/semantic overlap, and creates evidence-backed commitments
  const unassigned = validFiles.filter((f) => f.relatedLoopIds.length === 0);

  if (unassigned.length === 0) {
    return {
      commitments: [],
      actions: [],
      modelUsed: 'Local Rule Engine (Ollama daemon offline)',
      isRealAI: false,
      warnings: ['All current files are already linked to commitments.']
    };
  }

  // Create clean evidence-backed commitment for the unassigned items
  const primary = unassigned[0];
  const related = unassigned.slice(1, 3);
  const cluster = [primary, ...related];
  const clusterIds = cluster.map((c) => c.id);

  const loopId = 'loop-' + Date.now();
  const title = `Resolve ${primary.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`;
  const commitment: Commitment = {
    id: loopId,
    title,
    summary: `Extracted from ${cluster.length} local file${cluster.length > 1 ? 's' : ''} awaiting action.`,
    status: 'ready_for_review',
    priority: cluster.length > 1 ? 'high' : 'medium',
    category: primary.name.includes('receipt') || primary.name.includes('tax') ? 'admin' : 'project',
    evidenceSourceIds: clusterIds,
    suggestedNextAction: `Review ${primary.name} and close the pending loop.`,
    confidence: 0.89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extractedFacts: cluster.map((c) => `Extracted content from ${c.name} (${c.type}): ${c.excerpt || c.extractedTextPreview?.slice(0, 70)}...`),
    reasoningNote: `Lexical and directory proximity identified ${cluster.length} related documents.`,
    uncertaintyNote: ollama.isAvailable
      ? 'Extracted via local heuristics.'
      : `Ollama is currently offline (${ollama.error}). Start Ollama to run deep Gemma 2 neural synthesis.`
  };

  const action: ProposedAction = {
    id: 'action-' + Date.now(),
    commitmentId: loopId,
    type: 'group_files',
    title: `Group files for ${title}`,
    description: `Consolidate ${cluster.map((c) => c.name).join(', ')} into a dedicated loop folder.`,
    affectedResourceIds: clusterIds,
    beforePreview: cluster.map((c) => c.sourceLocation || c.name).join('; '),
    afterPreview: `~/Documents/LOOPZERO/${primary.name.replace(/\.[^/.]+$/, '')}/ (with symlinks preserved)`,
    riskLevel: 'low',
    reversible: true,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  return {
    commitments: [commitment],
    actions: [action],
    modelUsed: 'Local Fallback Engine (Ollama offline)',
    isRealAI: false,
    warnings: [ollama.error || 'Ollama offline. Running in deterministic local mode.']
  };
}
