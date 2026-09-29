# Turbopack: `new Worker()` with an `import.meta.url`-based path fails at runtime in ESM packages

Minimal reproduction.

`fixtures/worker-pkg` is a tiny package (installed from a tarball, so it is a real copy in `node_modules`) with two entry points that start the same `worker.cjs`:

- `worker-pkg/esm` (`dist/esm.js`, ESM): `new Worker(join(dirname(fileURLToPath(import.meta.url)), 'worker.cjs'))`
- `worker-pkg/cjs` (`dist/cjs.cjs`, CommonJS): `new Worker(join(__dirname, 'worker.cjs'))`

`/api/esm` and `/api/cjs` each start the worker and return its first message.

## Steps

```bash
npm install
npm run build
npm start
curl localhost:3000/api/esm
curl localhost:3000/api/cjs
```

## Result with Turbopack (`next build`, and also `next dev`)

```
/api/esm -> {"error":"Error: Cannot find module '<project>/node_modules/worker-pkg/dist/worker.cjs'"}
/api/cjs -> {"message":"ready"}
```

The file exists at that path.

With `next build --webpack`, `/api/esm` returns `{"message":"ready"}`.

## Versions

Tested with `next build` + `next start`:

- 16.0.0 and 16.0.2: works.
- 16.0.3, 16.0.5, 16.0.10, 16.1.0, 16.1.4, 16.1.7: the build panics before reaching this (`NftJsonAsset: cannot handle filepath node:worker_threads`).
- 16.2.0, 16.3.7 (latest stable) and 16.4.0-canary.52 (latest canary): fails at runtime as above.

A variant where the file name comes from a default parameter (`function startWorker(name = 'worker.cjs')` with `join(..., name)`) still works on 16.3.7, and fails from 16.4.0-canary.9 (canary.8 works).
The only analyzer change in that range is vercel/next.js#97867 (default parameter values), which likely made that variant analyzable and exposed it to the same lookup.

## What the compiled output shows

Turbopack rewrites the `Worker` call into a lookup of known worker entries.

For CommonJS, `__dirname` is replaced with `/ROOT/node_modules/worker-pkg/dist` and the lookup is keyed by the same `/ROOT/...` paths, so it matches:

```js
e.f({"/ROOT/node_modules/worker-pkg/dist/worker.cjs": ..., ...})(join("/ROOT/node_modules/worker-pkg/dist", "worker.cjs"))(Worker)
```

For ESM, the lookup is keyed by bare file names, but the argument is still the real absolute path computed from `import.meta.url` at runtime, so the lookup never matches:

```js
e.f({"worker.cjs": ..., "esm.js": ..., "cjs.cjs": ...})(join(dirname(fileURLToPath(o.url)), "worker.cjs"))(Worker)
```
