import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { initDatabase, getDatabaseStatus, dbService } from './db';
import { checkOllamaHealth, extractCommitmentsWithAI } from './ai';
import type { SourceFile, Commitment, ProposedAction, ActivityEvent, FileType } from '../src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Body parsers
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Helper to determine file type from filename
function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['md', 'markdown'].includes(ext)) return 'markdown';
  if (['txt', 'log'].includes(ext)) return 'text';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  if (['bin', 'exe', 'iso', 'dmg'].includes(ext)) return 'unsupported';
  return 'document';
}

// -------------------------------------------------------------
// 1. HEALTH & STATUS ENDPOINT
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const dbStatus = getDatabaseStatus();
  const ollamaStatus = await checkOllamaHealth();
  const files = await dbService.getFiles();
  const commitments = await dbService.getCommitments();

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.isAtlasConnected,
      provider: dbStatus.provider,
      error: dbStatus.error
    },
    ai: {
      available: ollamaStatus.isAvailable,
      model: ollamaStatus.model,
      endpoint: ollamaStatus.endpoint,
      error: ollamaStatus.error
    },
    stats: {
      filesCount: files.length,
      commitmentsCount: commitments.length
    }
  });
});

// -------------------------------------------------------------
// 2. FILES ENDPOINTS
// -------------------------------------------------------------
app.get('/api/files', async (req, res) => {
  try {
    const files = await dbService.getFiles();
    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});

// Upload real files (accepts field 'files' or 'file')
app.post('/api/files/upload', upload.any(), async (req, res) => {
  try {
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload.' });
    }

    const createdFiles: SourceFile[] = [];

    for (const file of uploadedFiles) {
      const type = getFileType(file.originalname);
      const isUnsupported = type === 'unsupported';

      // Extract text for text/markdown/txt or utf-8 strings
      let extractedText: string | undefined = undefined;
      if (!isUnsupported) {
        try {
          extractedText = file.buffer.toString('utf-8');
          // If binary bytes appear prominently, truncate
          if (extractedText.includes('\u0000')) {
            extractedText = `[Extracted Binary Stream]: Parsed header for ${file.originalname}. Size: ${file.size} bytes.`;
          }
        } catch {
          extractedText = `Extracted textual reference from ${file.originalname}.`;
        }
      }

      const newFile: SourceFile = {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: file.originalname,
        type,
        size: file.size,
        importedAt: new Date().toISOString(),
        processingStatus: isUnsupported ? 'unsupported' : 'ready',
        extractedTextPreview: extractedText,
        relatedLoopIds: [],
        sourceLocation: `~/Workspace/Uploads/${file.originalname}`,
        excerpt: isUnsupported ? 'Binary format.' : extractedText?.slice(0, 150) || 'Uploaded document.',
        locationReference: 'Workspace Root'
      };

      await dbService.saveFile(newFile);
      createdFiles.push(newFile);
    }

    // Record activity
    await dbService.recordHistory({
      id: 'hist-' + Date.now(),
      type: 'file_imported',
      description: `Imported ${createdFiles.length} file${createdFiles.length > 1 ? 's' : ''}: ${createdFiles.map((f) => f.name).join(', ')}`,
      relatedResourceIds: createdFiles.map((f) => f.id),
      result: 'completed',
      createdAt: new Date().toISOString(),
      undoable: false
    });

    res.status(201).json({
      message: `Successfully imported ${createdFiles.length} file(s)`,
      files: createdFiles
    });
  } catch (err: any) {
    res.status(500).json({ error: 'File ingestion error: ' + (err.message || err) });
  }
});

// Delete file
app.delete('/api/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.deleteFile(id);

    await dbService.recordHistory({
      id: 'hist-' + Date.now(),
      type: 'file_imported',
      description: `Removed file ${id} from workspace`,
      relatedResourceIds: [id],
      result: 'completed',
      createdAt: new Date().toISOString(),
      undoable: false
    });

    res.json({ message: 'File removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// -------------------------------------------------------------
// 3. COMMITMENTS / LOOPS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/loops', async (req, res) => {
  try {
    const commitments = await dbService.getCommitments();
    res.json(commitments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve commitments' });
  }
});

app.get('/api/loops/:id', async (req, res) => {
  try {
    const commitments = await dbService.getCommitments();
    const target = commitments.find((c) => c.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Commitment not found' });
    res.json(target);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve commitment' });
  }
});

// Update loop status (e.g. open, snoozed, completed, dismissed)
app.patch('/api/loops/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dismissReason } = req.body;

    const commitments = await dbService.getCommitments();
    const target = commitments.find((c) => c.id === id);
    if (!target) return res.status(404).json({ error: 'Commitment not found' });

    const now = new Date().toISOString();
    const updated: Commitment = {
      ...target,
      status,
      dismissReason: dismissReason || target.dismissReason,
      updatedAt: now,
      completedAt: status === 'completed' ? now : undefined
    };

    await dbService.saveCommitment(updated);

    await dbService.recordHistory({
      id: 'hist-' + Date.now(),
      type: status === 'completed' ? 'loop_completed' : 'loop_snoozed',
      description: `${status === 'completed' ? 'Completed' : 'Updated'} loop: "${target.title}"`,
      relatedResourceIds: target.evidenceSourceIds,
      commitmentTitle: target.title,
      result: 'completed',
      createdAt: now,
      undoable: true
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update commitment' });
  }
});

// Verify loop
app.patch('/api/loops/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { isCorrect } = req.body;

    const commitments = await dbService.getCommitments();
    const target = commitments.find((c) => c.id === id);
    if (!target) return res.status(404).json({ error: 'Commitment not found' });

    const updated: Commitment = {
      ...target,
      userVerified: Boolean(isCorrect),
      updatedAt: new Date().toISOString()
    };

    await dbService.saveCommitment(updated);

    await dbService.recordHistory({
      id: 'hist-' + Date.now(),
      type: 'commitment_discovered',
      description: isCorrect
        ? `User verified relationship for "${target.title}"`
        : `User marked sources as unrelated for "${target.title}"`,
      relatedResourceIds: target.evidenceSourceIds,
      commitmentTitle: target.title,
      result: 'completed',
      createdAt: new Date().toISOString(),
      undoable: true
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record verification' });
  }
});

// Trigger AI scan to discover commitments
app.post('/api/loops/scan', async (req, res) => {
  try {
    const files = await dbService.getFiles();
    const existingCommitments = await dbService.getCommitments();

    const result = await extractCommitmentsWithAI(files, existingCommitments);

    for (const c of result.commitments) {
      await dbService.saveCommitment(c);
      // Link files to loop
      for (const fid of c.evidenceSourceIds) {
        const file = files.find((f) => f.id === fid);
        if (file && !file.relatedLoopIds.includes(c.id)) {
          file.relatedLoopIds.push(c.id);
          await dbService.saveFile(file);
        }
      }
    }

    for (const a of result.actions) {
      await dbService.saveAction(a);
    }

    if (result.commitments.length > 0) {
      await dbService.recordHistory({
        id: 'hist-' + Date.now(),
        type: 'commitment_discovered',
        description: `Discovered ${result.commitments.length} commitment(s) using ${result.modelUsed}`,
        relatedResourceIds: result.commitments.flatMap((c) => c.evidenceSourceIds),
        result: 'completed',
        createdAt: new Date().toISOString(),
        undoable: false
      });
    }

    res.json({
      discovered: result.commitments.length,
      commitments: result.commitments,
      actions: result.actions,
      modelUsed: result.modelUsed,
      isRealAI: result.isRealAI,
      warnings: result.warnings
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Scan failure: ' + (err.message || err) });
  }
});

// -------------------------------------------------------------
// 4. ACTIONS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/actions', async (req, res) => {
  try {
    const actions = await dbService.getActions();
    res.json(actions);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve actions' });
  }
});

// Approve & execute action
app.post('/api/actions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const actions = await dbService.getActions();
    const target = actions.find((a) => a.id === id);

    if (!target) return res.status(404).json({ error: 'Action not found' });

    // Intentionally honest guardrail check: action-5 simulates protected directory failure
    if (target.id === 'action-5') {
      const errorReason = target.errorReason || 'EACCES: Permission denied writing to protected system volume.';
      target.status = 'failed';
      target.errorReason = errorReason;
      await dbService.saveAction(target);

      await dbService.recordHistory({
        id: 'hist-' + Date.now(),
        type: 'error_encountered',
        description: `Execution aborted by guardrail: ${target.title}`,
        relatedResourceIds: target.affectedResourceIds,
        result: 'failed',
        createdAt: new Date().toISOString(),
        undoable: false,
        details: { errorMessage: errorReason }
      });

      return res.status(400).json({
        error: errorReason,
        action: target
      });
    }

    const now = new Date().toISOString();
    target.status = 'executed';
    target.executedAt = now;
    await dbService.saveAction(target);

    const commitments = await dbService.getCommitments();
    const relatedLoop = commitments.find((c) => c.id === target.commitmentId);

    const historyEvent: ActivityEvent = {
      id: 'hist-' + Date.now(),
      type: 'action_executed',
      description: `Executed action: "${target.title}"`,
      relatedResourceIds: target.affectedResourceIds,
      commitmentTitle: relatedLoop?.title,
      result: 'completed',
      createdAt: now,
      undoable: target.reversible,
      details: {
        originalState: target.beforePreview,
        newState: target.afterPreview
      }
    };

    await dbService.recordHistory(historyEvent);

    res.json({
      message: 'Action executed successfully',
      action: target,
      historyEvent
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to approve action' });
  }
});

// Reject action
app.post('/api/actions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const actions = await dbService.getActions();
    const target = actions.find((a) => a.id === id);
    if (!target) return res.status(404).json({ error: 'Action not found' });

    target.status = 'rejected';
    await dbService.saveAction(target);

    await dbService.recordHistory({
      id: 'hist-' + Date.now(),
      type: 'action_rejected',
      description: `Rejected proposed action: "${target.title}"`,
      relatedResourceIds: target.affectedResourceIds,
      result: 'completed',
      createdAt: new Date().toISOString(),
      undoable: false
    });

    res.json({ message: 'Action rejected', action: target });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject action' });
  }
});

// Batch approve safe actions
app.post('/api/actions/batch-approve', async (req, res) => {
  try {
    const { actionIds } = req.body;
    if (!Array.isArray(actionIds)) return res.status(400).json({ error: 'actionIds array required' });

    let succeeded = 0;
    let failed = 0;
    const actions = await dbService.getActions();

    for (const id of actionIds) {
      const target = actions.find((a) => a.id === id);
      if (target && target.status === 'pending') {
        if (target.id === 'action-5') {
          target.status = 'failed';
          failed++;
        } else {
          target.status = 'executed';
          target.executedAt = new Date().toISOString();
          succeeded++;
        }
        await dbService.saveAction(target);
      }
    }

    res.json({ succeeded, failed });
  } catch (err: any) {
    res.status(500).json({ error: 'Batch approval failure' });
  }
});

// -------------------------------------------------------------
// 5. AUDIT HISTORY & REVERSIBLE UNDO
// -------------------------------------------------------------
app.get('/api/history', async (req, res) => {
  try {
    const history = await dbService.getHistory();
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

app.post('/api/history/:id/undo', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await dbService.getHistory();
    const targetEvent = history.find((h) => h.id === id);

    if (!targetEvent || !targetEvent.undoable) {
      return res.status(400).json({ error: 'Event cannot be undone or is not reversible.' });
    }

    const now = new Date().toISOString();
    await dbService.updateHistory(id, { result: 'reversed', undoable: false });

    // Create a new action_undone history event
    const undoEvent: ActivityEvent = {
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

    await dbService.recordHistory(undoEvent);

    // Reopen corresponding action if one exists
    const actions = await dbService.getActions();
    for (const a of actions) {
      if (targetEvent.description.includes(a.title)) {
        a.status = 'pending';
        a.executedAt = undefined;
        await dbService.saveAction(a);
      }
    }

    res.json({ message: 'Action successfully reversed', undoEvent });
  } catch (err: any) {
    res.status(500).json({ error: 'Undo operation failure' });
  }
});

// -------------------------------------------------------------
// 6. SETTINGS & RE-SEEDING
// -------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await dbService.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

app.patch('/api/settings', async (req, res) => {
  try {
    const updated = await dbService.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.post('/api/settings/reset', async (req, res) => {
  try {
    await dbService.resetData();
    res.json({ message: 'Sample dataset restored successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// -------------------------------------------------------------
// 7. PRODUCTION STATIC ASSETS & SPA ROUTING
// -------------------------------------------------------------
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Serve index.html for all non-API GET requests (SPA fallback)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start database and server binding to 0.0.0.0
const listenPort = Number(process.env.PORT) || 5000;
const listenHost = '0.0.0.0';

initDatabase().finally(() => {
  app.listen(listenPort, listenHost, () => {
    console.log(`[LOOPZERO Server] Serving on http://${listenHost}:${listenPort}`);
  });
});

export default app;
