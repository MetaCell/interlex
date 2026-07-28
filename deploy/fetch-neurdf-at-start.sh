#!/bin/sh
# Fetch the neurdf ontology into the directory nginx serves, at container start, in the background.
#
# The image does not ship the ontology (it is ~16MB, and baking it froze the data to build time),
# so this is where the same-origin copy comes from. Everything in /docker-entrypoint.d/ runs before
# nginx binds, so the work is **backgrounded**: nginx comes up in ~2s and the download lands a few
# tens of seconds later.
#
# That is safe precisely because the front end falls back to upstream on its own: while /data/ is
# still missing it 404s in milliseconds and the app reads the source endpoint directly, exactly as
# it did before any of this existed (see loadGraphWithRetry / PREFER_LOCAL_NEURDF). So the worst
# case for an early visitor is the old slow path, not a broken page — and because nothing waits on
# the download, it cannot delay start-up or trip the k8s liveness probe
# (deploy/k8s/interlex.yaml: livenessProbe.initialDelaySeconds 45).
#
#   NEURDF_FETCH_ON_START=0    disable (the app then always reads upstream)
#   NEURDF_FETCH_TIMEOUT=300   wall-clock budget, seconds (generous: nothing is waiting on it)
#   NEURDF_URL=...             override the source
#
# Never serves a partial file: the download goes to a temp path and is only moved into place after
# it validates. Any failure leaves /data/ empty, which the front end handles as above.

set -eu

DATA_DIR=/usr/share/nginx/html/data
TARGET="$DATA_DIR/npo-merged-neurdf.jsonld"
DEFAULT_URL="https://uri.olympiangods.org/base/ontologies/dns/raw.githubusercontent.com/SciCrunch/NIF-Ontology/neurons/ttl/npo-merged-reasoned-neurdf.ttl"
URL="${NEURDF_URL:-$DEFAULT_URL}"
TIMEOUT="${NEURDF_FETCH_TIMEOUT:-300}"
MIN_BYTES=1000000

if [ "${NEURDF_FETCH_ON_START:-1}" != "1" ]; then
  echo "[neurdf] fetch disabled — the app will read the source endpoint directly"
  exit 0
fi

if [ -f "$TARGET" ] && [ "$(wc -c < "$TARGET")" -gt "$MIN_BYTES" ]; then
  echo "[neurdf] $TARGET already present — skipping fetch"
  exit 0
fi

fetch() {
  TMP="$(mktemp)"
  # shellcheck disable=SC2064  # expand TMP now, not when the trap fires
  trap "rm -f '$TMP'" EXIT

  # `timeout` because busybox `wget -T` is a *per-read* timeout: a source that trickles bytes
  # steadily never trips it, so -T alone bounds nothing. -T stays as the stalled-socket guard.
  if ! timeout "$TIMEOUT" wget -q -T 30 --header="Accept: application/ld+json" -O "$TMP" "$URL"; then
    echo "[neurdf] WARN download failed or exceeded ${TIMEOUT}s — the app will read upstream"
    return 0
  fi

  SIZE=$(wc -c < "$TMP")
  if [ "$SIZE" -lt "$MIN_BYTES" ]; then
    echo "[neurdf] WARN got only ${SIZE} bytes (expected >${MIN_BYTES}) — the app will read upstream"
    return 0
  fi
  # An error page or a redirect body starts with '<'; the real payload is JSON.
  if [ "$(head -c 1 "$TMP")" = "<" ]; then
    echo "[neurdf] WARN got HTML, not JSON-LD — the app will read upstream"
    return 0
  fi

  mkdir -p "$DATA_DIR"
  # Move the plain file into place first. nginx `try_files $uri =404` tests *this* path, so a .gz
  # on its own would still 404; until the .gz appears, `gzip on` compresses this one on the fly.
  mv "$TMP" "$TARGET"
  chmod 0644 "$TARGET"
  trap - EXIT

  # Pre-compress for gzip_static (~2s for 16MB): 1.3MB instead of 16MB on the wire, and no
  # per-request CPU. Written to a temp name and moved, so nginx never sees a half-written .gz.
  if timeout "$TIMEOUT" gzip -9 -c "$TARGET" > "${TARGET}.gz.part" 2>/dev/null; then
    mv "${TARGET}.gz.part" "${TARGET}.gz"
    chmod 0644 "${TARGET}.gz"
    echo "[neurdf] ready — ${SIZE} bytes, $(wc -c < "${TARGET}.gz") gzipped"
  else
    rm -f "${TARGET}.gz.part"
    echo "[neurdf] ready — ${SIZE} bytes (uncompressed; nginx will gzip per request)"
  fi
}

echo "[neurdf] fetching in the background from $URL — nginx starts now, the app uses upstream until this lands"

# Backgrounded, then this script returns so the entrypoint proceeds to `exec nginx`. The child is
# orphaned and reparented to PID 1 (nginx), which reaps it.
fetch &

exit 0
