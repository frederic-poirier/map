
#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

PHOTON_DIR="$ROOT_DIR/photon"
OTP_DIR="$ROOT_DIR/opentripplanner"
GATEWAY_DIR="$ROOT_DIR/gateway"
LOG_DIR="$ROOT_DIR/logs"


GATEWAY_PORT=4000
PHOTON_PORT=5000
OTP_PORT=6000

mkdir -p "$LOG_DIR"

echo "Starting map services"
echo "Base directory: $ROOT_DIR"

# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

wait_for_port () {
  local port=$1
  local name=$2

  echo "Waiting for $name on port $port..."
  for i in {1..30}; do
    if nc -z localhost "$port"; then
      echo "✅ $name is up"
      return
    fi
    sleep 1
  done

  echo "$name failed to start"
  exit 1
}

wait_for_http () {
  local url=$1
  local name=$2

  echo "Waiting for $name"
  for i in {1..30}; do
    if curl -sf "$url" > /dev/null; then
      echo "✅ $name is up"
      return
    fi
    sleep 1
  done

  echo "$name failed to start"
  exit 1
}

# -------------------------------------------------------------------
# Photon
# -------------------------------------------------------------------

echo "Starting Photon"

java -jar "$PHOTON_DIR/photon-opensearch-0.7.4.jar" \
  -data-dir "$PHOTON_DIR" \
  -listen-port "$PHOTON_PORT" \
  > "$LOG_DIR/photon.log" 2>&1 &

PHOTON_PID=$!

wait_for_port "$PHOTON_PORT" "Photon"

# -------------------------------------------------------------------
# OpenTripPlanner
# -------------------------------------------------------------------

echo "Starting OpenTripPlanner"

cd "$OTP_DIR"

STM_CLIENT_ID=l706f8b99db9c34d7eaa09bcfddedc9798 \
java -Xmx8G \
  -jar otp-shaded-2.8.1.jar \
  --load --port 6000 . \
  > "$LOG_DIR/otp.log" 2>&1 &

OTP_PID=$!

wait_for_port "$OTP_PORT" "OpenTripPlanner"

echo "Starting Gateway"

SIGNING_SECRET=f92cc2565883198666da00e86a40190bfa70e3b42ea6681af420abb177c5f1a8 \
PORT="$GATEWAY_PORT" \
node "$GATEWAY_DIR/server.js" \
  > "$LOG_DIR/gateway.log" 2>&1 &

GATEWAY_PID=$!

wait_for_port "$GATEWAY_PORT" "Gateway" 


# -------------------------------------------------------------------
# Cloudflare Tunnel
# -------------------------------------------------------------------

echo "Starting Cloudflare Tunnel"

cloudflared tunnel run map-services \
  > "$LOG_DIR/cloudflared.log" 2>&1 &

TUNNEL_PID=$!

sleep 2

echo "All services started"
echo "Photon PID: $PHOTON_PID"
echo "OTP PID: $OTP_PID"
echo "Status PID: $GATEWAY_PID"
echo "Tunnel PID: $TUNNEL_PID"

# -------------------------------------------------------------------
# Graceful shutdown
# -------------------------------------------------------------------


cleanup () {
  echo "Stopping services..."
  kill "$PHOTON_PID" "$OTP_PID" "$GATEWAY_PID" "$TUNNEL_PID"
  wait
  echo "All services stopped"
}


trap cleanup SIGINT SIGTERM
wait

