import { Worker } from 'node:worker_threads';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ESM: directory from import.meta.url, file name only known at runtime
export function startWorker(name = 'worker.cjs') {
  return new Worker(join(dirname(fileURLToPath(import.meta.url)), name));
}
