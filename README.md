# Turbopack: `new Worker()` with an `import.meta.url`-based path fails at runtime in ESM packages

Minimal reproduction.

`fixtures/worker-pkg` is a tiny package (installed from a tarball, so it is a real copy in `node_modules`) with two entry points that start the same `worker.cjs`:

- `worker-pkg/esm` (`dist/esm.js`, ESM): `new Worker(join(dirname(fileURLToPath(import.meta.url)), name))`
- `worker-pkg/cjs` (`dist/cjs.cjs`, CommonJS): `new Worker(join(__dirname, name))`

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
The ESM case also fails with a literal file name: `join(dirname(fileURLToPath(import.meta.url)), 'worker.cjs')`.

With `next build --webpack`, `/api/esm` returns `{"message":"ready"}`.

## What the compiled output shows

Turbopack rewrites the `Worker` call into a lookup of known worker entries.

For CommonJS, `__dirname` is replaced with `/ROOT/node_modules/worker-pkg/dist` and the lookup is keyed by the same `/ROOT/...` paths, so it matches:

```js
e.f({"/ROOT/node_modules/worker-pkg/dist/worker.cjs": ..., ...})(join("/ROOT/node_modules/worker-pkg/dist", r))(Worker)
```

For ESM, the lookup is keyed by bare file names, but the argument is still the real absolute path computed from `import.meta.url` at runtime, so the lookup never matches:

```js
e.f({"worker.cjs": ..., "esm.js": ..., "cjs.cjs": ...})(join(dirname(fileURLToPath(o.url)), n))(Worker)
```
