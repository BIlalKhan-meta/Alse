#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Upload an existing iOS Xcode archive to App Store Connect.

Usage:
  bash scripts/upload-ios-archive.sh [path/to/App.xcarchive]

Environment:
  BUNDLE_ID              Bundle ID used when auto-selecting the latest archive.
                         Defaults to com.appfnh.alenga.
  ASC_APP_ID             App Store Connect app ID. If omitted, the script
                         resolves it from the archive bundle ID using `asc`.
  TEAM_ID                Apple Developer Team ID for export. If omitted, the
                         script reads it from the archive.
  EXPORT_METHOD          Xcode export method. Defaults to app-store-connect.
  EXPORT_OPTIONS_PLIST   Existing export options plist to use instead of
                         generating one.
  EXPORT_ROOT            Directory for exported IPA output.
                         Defaults to ios/build/app-store-upload.
  UPLOAD_WAIT            Set to 1 to wait for App Store processing.
  ASC_DRY_RUN            Set to 1 to reserve upload operations without upload.

Before first use for a new App Store Connect account:
  asc auth login --name "alsepereze" --key-id "KEY_ID" --issuer-id "ISSUER_ID" --private-key /path/to/AuthKey_KEY_ID.p8 --network
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: required command not found: $1" >&2
    exit 1
  fi
}

plist_value() {
  local plist="$1"
  local key_path="$2"
  /usr/libexec/PlistBuddy -c "Print ${key_path}" "$plist" 2>/dev/null || true
}

latest_archive_for_bundle() {
  local bundle_id="$1"
  local archives_dir="${ARCHIVES_DIR:-$HOME/Library/Developer/Xcode/Archives}"

  python3 - "$archives_dir" "$bundle_id" <<'PY'
import pathlib
import plistlib
import sys

archives_dir = pathlib.Path(sys.argv[1]).expanduser()
bundle_id = sys.argv[2]
matches = []

if archives_dir.exists():
    for archive in archives_dir.glob("*/*.xcarchive"):
        info_plist = archive / "Info.plist"
        try:
            with info_plist.open("rb") as handle:
                info = plistlib.load(handle)
        except Exception:
            continue

        app_props = info.get("ApplicationProperties", {})
        if app_props.get("CFBundleIdentifier") == bundle_id:
            matches.append(archive)

if not matches:
    sys.exit(1)

latest = max(matches, key=lambda path: path.stat().st_mtime)
print(latest)
PY
}

resolve_app_id() {
  local bundle_id="$1"
  local json_file

  json_file="$(mktemp)"
  if ! asc apps list --bundle-id "$bundle_id" --output json >"$json_file"; then
    rm -f "$json_file"
    echo "error: failed to query App Store Connect apps for bundle ID ${bundle_id}" >&2
    return 1
  fi

  python3 - "$json_file" <<'PY'
import json
import sys

with open(sys.argv[1], "r", encoding="utf-8") as handle:
    payload = json.load(handle)

apps = payload.get("data", [])
if apps:
    print(apps[0].get("id", ""))
PY
  rm -f "$json_file"
}

require_command asc
require_command python3
require_command xcodebuild

DEFAULT_BUNDLE_ID="com.appfnh.alenga"
ARCHIVE_PATH="${1:-}"
ARCHIVE_SELECTOR_BUNDLE_ID="${BUNDLE_ID:-$DEFAULT_BUNDLE_ID}"

if [[ -z "$ARCHIVE_PATH" ]]; then
  if ! ARCHIVE_PATH="$(latest_archive_for_bundle "$ARCHIVE_SELECTOR_BUNDLE_ID")"; then
    echo "error: no Xcode archive found for bundle ID ${ARCHIVE_SELECTOR_BUNDLE_ID}" >&2
    echo "hint: pass an archive path explicitly, or set BUNDLE_ID to select a different app." >&2
    exit 1
  fi
fi

if [[ ! -d "$ARCHIVE_PATH" || "$ARCHIVE_PATH" != *.xcarchive ]]; then
  echo "error: archive path is not a .xcarchive directory: ${ARCHIVE_PATH}" >&2
  exit 1
fi

ARCHIVE_INFO_PLIST="${ARCHIVE_PATH}/Info.plist"
ARCHIVE_BUNDLE_ID="$(plist_value "$ARCHIVE_INFO_PLIST" ":ApplicationProperties:CFBundleIdentifier")"
VERSION="$(plist_value "$ARCHIVE_INFO_PLIST" ":ApplicationProperties:CFBundleShortVersionString")"
BUILD_NUMBER="$(plist_value "$ARCHIVE_INFO_PLIST" ":ApplicationProperties:CFBundleVersion")"
ARCHIVE_TEAM_ID="$(plist_value "$ARCHIVE_INFO_PLIST" ":ApplicationProperties:Team")"
APP_NAME="$(plist_value "$ARCHIVE_INFO_PLIST" ":Name")"

if [[ -z "$ARCHIVE_BUNDLE_ID" || -z "$VERSION" || -z "$BUILD_NUMBER" ]]; then
  echo "error: could not read bundle/version/build metadata from ${ARCHIVE_INFO_PLIST}" >&2
  exit 1
fi

TEAM_ID="${TEAM_ID:-$ARCHIVE_TEAM_ID}"
if [[ -z "$TEAM_ID" ]]; then
  echo "error: TEAM_ID was not provided and could not be read from the archive." >&2
  exit 1
fi

ASC_LOOKUP_BUNDLE_ID="$ARCHIVE_BUNDLE_ID"
ASC_APP_ID="${ASC_APP_ID:-}"
if [[ -z "$ASC_APP_ID" ]]; then
  ASC_APP_ID="$(resolve_app_id "$ASC_LOOKUP_BUNDLE_ID")"
fi

if [[ -z "$ASC_APP_ID" ]]; then
  cat >&2 <<EOF
error: the active asc credential cannot see an App Store Connect app for bundle ID ${ASC_LOOKUP_BUNDLE_ID}.

Fix one of these before retrying:
  1. Switch/login to the App Store Connect API key for the correct account:
     asc auth login --name "alsepereze" --key-id "KEY_ID" --issuer-id "ISSUER_ID" --private-key /path/to/AuthKey_KEY_ID.p8 --network
  2. If this bundle ID is wrong, update the Xcode bundle ID and create a new archive.
  3. If you already know the matching numeric App Store Connect app ID, rerun with ASC_APP_ID=...
EOF
  exit 1
fi

EXPORT_METHOD="${EXPORT_METHOD:-app-store-connect}"
EXPORT_ROOT="${EXPORT_ROOT:-ios/build/app-store-upload}"
EXPORT_PATH="${EXPORT_ROOT}/${APP_NAME:-App}-${VERSION}-${BUILD_NUMBER}-$(date +%Y%m%d%H%M%S)"
mkdir -p "$EXPORT_PATH"

GENERATED_EXPORT_OPTIONS=""
if [[ -n "${EXPORT_OPTIONS_PLIST:-}" ]]; then
  EXPORT_OPTIONS_PATH="$EXPORT_OPTIONS_PLIST"
else
  GENERATED_EXPORT_OPTIONS="$(mktemp "${TMPDIR:-/tmp}/ExportOptions.XXXXXX.plist")"
  EXPORT_OPTIONS_PATH="$GENERATED_EXPORT_OPTIONS"
  cat >"$EXPORT_OPTIONS_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>${EXPORT_METHOD}</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>teamID</key>
  <string>${TEAM_ID}</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>uploadSymbols</key>
  <true/>
</dict>
</plist>
EOF
fi

cleanup() {
  if [[ -n "$GENERATED_EXPORT_OPTIONS" ]]; then
    rm -f "$GENERATED_EXPORT_OPTIONS"
  fi
}
trap cleanup EXIT

echo "Archive: ${ARCHIVE_PATH}"
echo "Bundle:  ${ARCHIVE_BUNDLE_ID}"
echo "Version: ${VERSION} (${BUILD_NUMBER})"
echo "ASC app: ${ASC_APP_ID}"
echo "Export:  ${EXPORT_PATH}"

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PATH" \
  -allowProvisioningUpdates

IPA_PATH="$(
  python3 - "$EXPORT_PATH" <<'PY'
import pathlib
import sys

export_path = pathlib.Path(sys.argv[1])
ipas = sorted(export_path.glob("*.ipa"), key=lambda path: path.stat().st_mtime, reverse=True)
if ipas:
    print(ipas[0])
PY
)"

if [[ -z "$IPA_PATH" || ! -f "$IPA_PATH" ]]; then
  echo "error: export completed, but no .ipa was found in ${EXPORT_PATH}" >&2
  exit 1
fi

upload_args=(
  builds upload
  --app "$ASC_APP_ID"
  --ipa "$IPA_PATH"
  --platform IOS
  --version "$VERSION"
  --build-number "$BUILD_NUMBER"
  --output "${ASC_OUTPUT:-table}"
)

if [[ "${UPLOAD_WAIT:-0}" == "1" ]]; then
  upload_args+=(--wait --poll-interval "${POLL_INTERVAL:-30s}")
fi

if [[ "${ASC_DRY_RUN:-0}" == "1" ]]; then
  upload_args+=(--dry-run)
fi

asc "${upload_args[@]}"
