import { Worker } from 'node:worker_threads';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ESM: the worker's directory comes from import.meta.url
export function startWorker() {
  return new Worker(join(dirname(fileURLToPath(import.meta.url)), 'worker.cjs'));
}
