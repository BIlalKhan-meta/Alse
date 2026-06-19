#!/usr/bin/env bash
# Run Maestro Android E2E: build bundled APK, install on connected device, run all flows.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="$PATH:${HOME}/.maestro/bin:${HOME}/Library/Android/sdk/platform-tools"

if ! command -v maestro >/dev/null 2>&1; then
  echo "Maestro CLI not found. Install: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi

adb start-server >/dev/null 2>&1 || true

# Prefer physical device; fall back to emulator
DEVICE="$(adb devices | awk '/\tdevice$/{print $1}' | awk '!/^emulator-/{print; exit}')"
if [ -z "${DEVICE}" ]; then
  DEVICE="$(adb devices | awk '/\tdevice$/{print $1; exit}')"
fi
if [ -z "${DEVICE}" ]; then
  echo "ERROR: No Android device connected."
  echo "  - Enable USB debugging on your phone"
  echo "  - Accept the RSA fingerprint prompt"
  echo "  - Run: adb devices   (should show your device as 'device', not 'unauthorized')"
  exit 1
fi

echo "==> Device: ${DEVICE}"

# Load credentials from gitignored local env file
MAESTRO_ENV_ARGS=()
if [ -f ".maestro/.env.local.yaml" ]; then
  TEST_EMAIL="$(grep 'TEST_EMAIL:' .maestro/.env.local.yaml | sed -n 's/.*"\([^"]*\)".*/\1/p')"
  TEST_PASSWORD="$(grep 'TEST_PASSWORD:' .maestro/.env.local.yaml | sed -n 's/.*"\([^"]*\)".*/\1/p')"
  if [ -n "${TEST_EMAIL}" ]; then
    MAESTRO_ENV_ARGS+=(-e "TEST_EMAIL=${TEST_EMAIL}")
  fi
  if [ -n "${TEST_PASSWORD}" ]; then
    MAESTRO_ENV_ARGS+=(-e "TEST_PASSWORD=${TEST_PASSWORD}")
  fi
  echo "==> Using credentials from .maestro/.env.local.yaml"
fi

echo "==> Bundling JS into Android assets..."
if [ "${SKIP_BUILD:-}" != "1" ]; then
  yarn bundle
else
  echo "    (skipped, SKIP_BUILD=1)"
fi

echo "==> Detecting device CPU ABI..."
if [[ "${DEVICE}" == emulator-* ]]; then
  E2E_ABI="x86_64"
else
  E2E_ABI="$(adb -s "${DEVICE}" shell getprop ro.product.cpu.abi 2>/dev/null | tr -d '\r' || true)"
  if [ -z "${E2E_ABI}" ]; then
    E2E_ABI="arm64-v8a"
  fi
fi
echo "    ABI: ${E2E_ABI}"
echo "==> Building debug APK for ABI: ${E2E_ABI}"
if [ "${SKIP_BUILD:-}" != "1" ]; then
  (cd android && ./gradlew assembleDebug -Pe2eAbi="${E2E_ABI}")
else
  echo "    (skipped, SKIP_BUILD=1)"
fi

APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "${APK}" ]; then
  echo "ERROR: APK not found at ${APK}"
  exit 1
fi

if [ "${SKIP_APK_INSTALL:-}" = "1" ]; then
  echo "==> Skipping APK install (SKIP_APK_INSTALL=1)"
else
  echo "==> Installing APK on ${DEVICE} via Gradle (confirm on phone if prompted)..."
  if ! (cd android && ./gradlew installDebug -Pe2eAbi="${E2E_ABI}"); then
    echo "==> Gradle install failed, trying adb install..."
    if ! adb -s "${DEVICE}" install -r -d "${APK}"; then
      echo "ERROR: Could not install APK. On physical devices, approve the install prompt."
      exit 1
    fi
  fi
fi

echo "==> Verifying app is installed..."
if ! adb -s "${DEVICE}" shell pm path com.blitzapp.alenga.alse >/dev/null 2>&1; then
  echo "ERROR: com.blitzapp.alenga.alse is not installed after adb install."
  exit 1
fi

FLOW_TARGETS=("$@")
if [ ${#FLOW_TARGETS[@]} -eq 0 ]; then
  FLOW_TARGETS=(".maestro/smoke/" ".maestro/settings/")
fi

echo "==> Running Maestro on ${DEVICE} (sequential)..."
MAESTRO_EXIT=0
for target in "${FLOW_TARGETS[@]}"; do
  echo ""
  echo "==> Flow target: ${target}"
  if ! maestro test \
    --config .maestro/config.yaml \
    --device "${DEVICE}" \
    --platform android \
    --no-reinstall-driver \
    "${MAESTRO_ENV_ARGS[@]}" \
    "${target}"; then
    MAESTRO_EXIT=1
  fi
  sleep 3
done
exit "${MAESTRO_EXIT}"
