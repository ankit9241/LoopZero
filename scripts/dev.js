import { spawn } from 'child_process';

// When running on Render or any cloud environment with RENDER=true, start the full production server
if (process.env.RENDER === 'true' || process.env.NODE_ENV === 'production') {
  const port = process.env.PORT || '5000';
  console.log(`[LOOPZERO] Cloud deployment detected (RENDER=${process.env.RENDER}). Starting unified server on port ${port}...`);
  const child = spawn('npx tsx server/index.ts', {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });

  child.on('exit', (code) => process.exit(code || 0));
} else {
  // Local development: launch Vite
  console.log('[LOOPZERO] Starting local Vite dev server...');
  const child = spawn('npx vite --host 0.0.0.0', {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });

  child.on('exit', (code) => process.exit(code || 0));
}
