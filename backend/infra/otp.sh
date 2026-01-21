#!/usr/bin/env sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OTP_DIR="$SCRIPT_DIR/../opentripplaner"

cd "$OTP_DIR"

STM_CLIENT_ID=l706f8b99db9c34d7eaa09bcfddedc9798 \
java -Xmx8G \
  -jar otp-shaded-2.8.1.jar \
  --load .

