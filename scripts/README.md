# scripts/

## `fetch-neurdf.mjs` — ontology download (temporary workaround)

Downloads the reasoned neurdf ontology to `public/data/`, plus a `.gz` beside it, so the app can
serve it same-origin instead of every browser fetching it from the source endpoint.

```
yarn fetch-data            # no-op if already present
yarn fetch-data --force    # refetch
```

### Why this exists

The source endpoint has no caching yet. It serves a ~16MB body in about 9 seconds, and flakily
enough that the client retries three times before giving up. Every first visit to the grid or a
Cell Card paid that cost.

Serving our own copy turns that into a local static GET: nginx sends the pre-compressed **1.3MB**
`.gz` (92% smaller) with a 7-day `max-age`. The copy is fetched at container start rather than
built into the image — see below.

### How the pieces fit

| Where | What |
|---|---|
| `deploy/fetch-neurdf-at-start.sh` | Copied to `/docker-entrypoint.d/`, so the container downloads the ontology into `/usr/share/nginx/html/data/` at start. Runs **in the background** — nginx binds in ~2s and the file lands a few tens of seconds later. `NEURDF_FETCH_ON_START=0` disables it. |
| `.dockerignore` | Excludes `public/data/`. Load-bearing: `COPY . /app` + `yarn build` would otherwise copy a developer's local ontology into `dist/` and silently bake it into the image. |
| `nginx/default.conf` | A dedicated `location /data/` with `gzip_static on`, `expires 7d`, and `try_files $uri =404` — a miss must 404, not fall through to the SPA's `index.html`, because the front end relies on that 404 to fall back. |
| `src/.../gridConfig.ts` | `NEURDF_LOCAL_URL` + `PREFER_LOCAL_NEURDF`. The loader tries the local copy first and upstream second. |
| this script | The same download for local development, and for regenerating the parser fixture. |

The script parses `NEURDF_URL` out of `gridConfig.ts` rather than duplicating the URL, so the two
cannot drift apart — if that constant is renamed, this script fails loudly.

### Why the image does not ship the ontology

It was baked in at first. Two reasons that changed:

- it froze the data to image-build time, so picking up a new ontology release needed a rebuild;
- it added ~16MB to every image.

Fetching at container start fixes both, and it is safe to do **without blocking startup** only
because the front end already falls back to upstream. While `/data/` is missing the app takes the
old slow path; nothing breaks, and nothing waits on the download — so it cannot delay the port
opening or trip `livenessProbe.initialDelaySeconds: 45` in `deploy/k8s/interlex.yaml`.

That is also why `NEURDF_FETCH_TIMEOUT` defaults to a generous 300s: with no probe to race, a slow
source just means the local copy appears later.

### Verified in the built image

| Check | Result |
|---|---|
| `nginx -t` on `nginx/default.conf` | passes |
| `gzip_static` module in `nginx:1.19.3-alpine` | present (`--with-http_gzip_static_module`) |
| nginx binds after container start | **2s** (the fetch is backgrounded) |
| image size | **45.2MB**, down from 65.3MB with the ontology baked in |
| build context upload | 5s, down from 65s (`.dockerignore`) |
| `/data/…jsonld` before the fetch lands | `404` — not the SPA's `index.html`, so the front end falls back |
| Cell Card **during** that gap | renders in **8.9s** from upstream, correct data |
| background fetch completes | ~15s after start |
| Cell Card **after** it lands | renders in **1.6s**, one local request, no upstream call |
| `/data/…jsonld` with gzip | `200`, `Content-Encoding: gzip`, `Content-Length: 1314785`, `application/ld+json`, `max-age=604800` |
| before the `.gz` exists | still gzipped, chunked — the dynamic `gzip on` fallback covers the window |
| background child after `exec nginx` | survives, then is reaped by nginx — no zombie |
| container memory serving it | 4.7MiB against a 250Mi limit (nginx uses `sendfile`) |
| fetch failure (bad URL) | warns, leaves `/data/` empty, app reads upstream |

### Removing this workaround

Once the source server caches:

1. Drop the `fetch-neurdf-at-start.sh` copy from the `Dockerfile`.
2. Set `VITE_PREFER_LOCAL_NEURDF=false` (or delete the branch in `loadGraphWithRetry`).
3. Delete the `location /data/` block, this script, `deploy/fetch-neurdf-at-start.sh`, and the
   `public/data/` entries in `.gitignore` and `.dockerignore`.

The parser fixture under `src/parsers/__fixtures__/` does **not** depend on this and should stay —
it is regenerated from a fresh download with `yarn fetch-data --force && yarn build-fixture`.
