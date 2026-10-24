import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import { initialFiles, initialCommitments, initialActions, initialHistory, initialSettings } from '../src/data/mockData';
import type { SourceFile, Commitment, ProposedAction, ActivityEvent, WorkspaceSettings } from '../src/types';

dotenv.config();

export interface DatabaseState {
  isConnectedToAtlas: boolean;
  connectionError?: string;
  files: SourceFile[];
  commitments: Commitment[];
  actions: ProposedAction[];
  history: ActivityEvent[];
  settings: WorkspaceSettings;
}

// In-memory fallback storage when MONGODB_URI is absent or unreachable
const memoryStore: {
  files: SourceFile[];
  commitments: Commitment[];
  actions: ProposedAction[];
  history: ActivityEvent[];
  settings: WorkspaceSettings;
} = {
  files: [...initialFiles],
  commitments: [...initialCommitments],
  actions: [...initialActions],
  history: [...initialHistory],
  settings: { ...initialSettings }
};

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let lastError: string | undefined;

export async function initDatabase(): Promise<{ isConnected: boolean; error?: string }> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    lastError = 'MONGODB_URI not configured in environment. Using resilient in-memory local adapter.';
    console.log(`[Database] ${lastError}`);
    return { isConnected: false, error: lastError };
  }

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
    });

    await client.connect();
    db = client.db('loopzero');
    isConnected = true;
    lastError = undefined;

    console.log('[Database] Connected successfully to MongoDB Atlas (database: loopzero).');

    // Create collections and indexes
    try {
      await db.collection('files').createIndex({ id: 1 }, { unique: true });
      await db.collection('commitments').createIndex({ id: 1 }, { unique: true });
      await db.collection('actions').createIndex({ id: 1 }, { unique: true });
      await db.collection('history').createIndex({ id: 1 }, { unique: true });
      await db.collection('history').createIndex({ createdAt: -1 });

      // Seed if empty
      const fileCount = await db.collection('files').countDocuments();
      if (fileCount === 0) {
        console.log('[Database] Seeding initial collections in MongoDB Atlas...');
        await db.collection('files').insertMany(initialFiles as any);
        await db.collection('commitments').insertMany(initialCommitments as any);
        await db.collection('actions').insertMany(initialActions as any);
        await db.collection('history').insertMany(initialHistory as any);
        await db.collection('settings').insertOne(initialSettings as any);
      }
    } catch (idxErr) {
      console.warn('[Database] Indexing notice:', idxErr);
    }

    return { isConnected: true };
  } catch (err: any) {
    isConnected = false;
    lastError = `MongoDB connection error: ${err.message || err}. Resilient in-memory storage active.`;
    console.warn(`[Database] ${lastError}`);
    return { isConnected: false, error: lastError };
  }
}

export function getDatabaseStatus(): {
  isAtlasConnected: boolean;
  provider: string;
  error?: string;
} {
  return {
    isAtlasConnected: isConnected,
    provider: isConnected ? 'MongoDB Atlas (Live)' : 'In-Memory Local Fallback (Isolated)',
    error: lastError
  };
}

// Data Access Layer with automatic Atlas / In-Memory dispatch
export const dbService = {
  async getFiles(): Promise<SourceFile[]> {
    if (isConnected && db) {
      const docs = await db.collection('files').find({}, { projection: { _id: 0 } }).toArray();
      return docs as unknown as SourceFile[];
    }
    return memoryStore.files;
  },

  async saveFile(file: SourceFile): Promise<void> {
    if (isConnected && db) {
      await db.collection('files').updateOne({ id: file.id }, { $set: file }, { upsert: true });
    } else {
      const idx = memoryStore.files.findIndex((f) => f.id === file.id);
      if (idx >= 0) memoryStore.files[idx] = file;
      else memoryStore.files.unshift(file);
    }
  },

  async deleteFile(id: string): Promise<void> {
    if (isConnected && db) {
      await db.collection('files').deleteOne({ id });
      await db.collection('commitments').updateMany(
        { evidenceSourceIds: id },
        { $pull: { evidenceSourceIds: id } as any }
      );
    } else {
      memoryStore.files = memoryStore.files.filter((f) => f.id !== id);
      memoryStore.commitments.forEach((c) => {
        c.evidenceSourceIds = c.evidenceSourceIds.filter((fid) => fid !== id);
      });
    }
  },

  async getCommitments(): Promise<Commitment[]> {
    if (isConnected && db) {
      const docs = await db.collection('commitments').find({}, { projection: { _id: 0 } }).toArray();
      return docs as unknown as Commitment[];
    }
    return memoryStore.commitments;
  },

  async saveCommitment(commitment: Commitment): Promise<void> {
    if (isConnected && db) {
      await db.collection('commitments').updateOne({ id: commitment.id }, { $set: commitment }, { upsert: true });
    } else {
      const idx = memoryStore.commitments.findIndex((c) => c.id === commitment.id);
      if (idx >= 0) memoryStore.commitments[idx] = commitment;
      else memoryStore.commitments.unshift(commitment);
    }
  },

  async getActions(): Promise<ProposedAction[]> {
    if (isConnected && db) {
      const docs = await db.collection('actions').find({}, { projection: { _id: 0 } }).toArray();
      return docs as unknown as ProposedAction[];
    }
    return memoryStore.actions;
  },

  async saveAction(action: ProposedAction): Promise<void> {
    if (isConnected && db) {
      await db.collection('actions').updateOne({ id: action.id }, { $set: action }, { upsert: true });
    } else {
      const idx = memoryStore.actions.findIndex((a) => a.id === action.id);
      if (idx >= 0) memoryStore.actions[idx] = action;
      else memoryStore.actions.unshift(action);
    }
  },

  async getHistory(): Promise<ActivityEvent[]> {
    if (isConnected && db) {
      const docs = await db.collection('history').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return docs as unknown as ActivityEvent[];
    }
    return memoryStore.history;
  },

  async recordHistory(event: ActivityEvent): Promise<void> {
    if (isConnected && db) {
      await db.collection('history').insertOne({ ...event } as any);
    } else {
      memoryStore.history.unshift(event);
    }
  },

  async updateHistory(id: string, updates: Partial<ActivityEvent>): Promise<void> {
    if (isConnected && db) {
      await db.collection('history').updateOne({ id }, { $set: updates });
    } else {
      const idx = memoryStore.history.findIndex((h) => h.id === id);
      if (idx >= 0) memoryStore.history[idx] = { ...memoryStore.history[idx], ...updates };
    }
  },

  async getSettings(): Promise<WorkspaceSettings> {
    if (isConnected && db) {
      const doc = await db.collection('settings').findOne({}, { projection: { _id: 0 } });
      if (doc) return doc as unknown as WorkspaceSettings;
    }
    return memoryStore.settings;
  },

  async updateSettings(updates: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    if (isConnected && db) {
      await db.collection('settings').updateOne({}, { $set: updates }, { upsert: true });
      const doc = await db.collection('settings').findOne({}, { projection: { _id: 0 } });
      return doc as unknown as WorkspaceSettings;
    }
    memoryStore.settings = { ...memoryStore.settings, ...updates };
    return memoryStore.settings;
  },

  async resetData(): Promise<void> {
    if (isConnected && db) {
      await db.collection('files').deleteMany({});
      await db.collection('commitments').deleteMany({});
      await db.collection('actions').deleteMany({});
      await db.collection('history').deleteMany({});
      await db.collection('settings').deleteMany({});

      await db.collection('files').insertMany(initialFiles as any);
      await db.collection('commitments').insertMany(initialCommitments as any);
      await db.collection('actions').insertMany(initialActions as any);
      await db.collection('history').insertMany(initialHistory as any);
      await db.collection('settings').insertOne(initialSettings as any);
    }
    memoryStore.files = [...initialFiles];
    memoryStore.commitments = [...initialCommitments];
    memoryStore.actions = [...initialActions];
    memoryStore.history = [...initialHistory];
    memoryStore.settings = { ...initialSettings };
  }
};
