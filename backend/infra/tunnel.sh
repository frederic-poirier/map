
#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

cloudflared tunnel run --url http://localhost:4000 map-api

