#!/usr/bin/env bash
set -euo pipefail
# Consumer fixtures must already be built using npm run test:consumers.
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
consumer_root="$(node -e "const fs=require('node:fs');const p=JSON.parse(fs.readFileSync('artifacts/consumer-paths.json'));process.stdout.write(require('node:path').dirname(p['vite-react']));")"
docker run --rm --ipc=host --init \
  --user "$(id -u):$(id -g)" \
  -e CI=1 -e NEXT_TELEMETRY_DISABLED=1 \
  -v "$repo_root:$repo_root" -v "$consumer_root:$consumer_root" \
  -w "$repo_root" \
  mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf \
  node node_modules/@playwright/test/cli.js test "$@"
