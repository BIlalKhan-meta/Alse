#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR_DIR="$ROOT_DIR/vendor/boringssl-grpc"
COMMIT="16c8d3db1af20fcc04b5190b25242aadcb1fbb30"

if [[ -d "$VENDOR_DIR/.git" ]]; then
  if [[ -f "$VENDOR_DIR/BoringSSL-GRPC.podspec.json" ]]; then
    echo "BoringSSL-GRPC vendor already present at $(git -C "$VENDOR_DIR" rev-parse --short HEAD)"
    exit 0
  fi
  echo "Refreshing BoringSSL-GRPC vendor missing podspec"
  rm -rf "$VENDOR_DIR"
elif [[ -e "$VENDOR_DIR" ]]; then
  echo "Removing incomplete BoringSSL-GRPC vendor at $VENDOR_DIR"
  rm -rf "$VENDOR_DIR"
fi
mkdir -p "$(dirname "$VENDOR_DIR")"

echo "Vendoring BoringSSL-GRPC ($COMMIT) into $VENDOR_DIR"
GIT_HTTP_VERSION=HTTP/1.1 git \
  -c http.version=HTTP/1.1 \
  -c http.postBuffer=524288000 \
  clone --depth 1 https://github.com/google/boringssl.git "$VENDOR_DIR"

GIT_HTTP_VERSION=HTTP/1.1 git \
  -C "$VENDOR_DIR" \
  -c http.version=HTTP/1.1 \
  fetch origin "$COMMIT" --depth 1

git -C "$VENDOR_DIR" checkout "$COMMIT"

PODSPEC_SRC="$ROOT_DIR/local-pods/BoringSSL-GRPC.podspec.json"
PODSPEC_DST="$VENDOR_DIR/BoringSSL-GRPC.podspec.json"
if [[ ! -f "$PODSPEC_SRC" ]]; then
  echo "Missing $PODSPEC_SRC"
  exit 1
fi
cp "$PODSPEC_SRC" "$PODSPEC_DST"
git -C "$VENDOR_DIR" add BoringSSL-GRPC.podspec.json
git -C "$VENDOR_DIR" commit -m "Add BoringSSL-GRPC podspec for local CocoaPods installs" >/dev/null

echo "BoringSSL-GRPC vendor ready at $(git -C "$VENDOR_DIR" rev-parse --short HEAD)."
