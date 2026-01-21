#!/usr/bin/env bash
set -e

# Aller à backend/
cd "$(dirname "$0")/.."

java -jar photon/photon-opensearch-0.7.4.jar \
  -data-dir ./photon \
  -listen-port 5000

