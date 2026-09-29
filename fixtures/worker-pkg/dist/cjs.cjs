const { Worker } = require('node:worker_threads');
const { join } = require('node:path');

// CJS: same thing with __dirname
exports.startWorker = function startWorker(name = 'worker.cjs') {
  return new Worker(join(__dirname, name));
};
