const { Worker } = require('node:worker_threads');
const { join } = require('node:path');

// CJS: the same thing with __dirname
exports.startWorker = function startWorker() {
  return new Worker(join(__dirname, 'worker.cjs'));
};
