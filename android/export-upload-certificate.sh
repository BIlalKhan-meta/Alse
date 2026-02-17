#!/bin/bash
# Export the upload key certificate from your keystore so you can register it in Play Console.
# Use this when you've created a NEW upload keystore and need to upload its certificate to Play.
#
# Play Console: Your app → Setup → App signing → Upload a new key → paste or upload this .pem

set -e
KEYSTORE="${1:-app/Alse.jks}"
ALIAS="${2:-alse_key}"
OUTPUT="${3:-app/upload_certificate_exported.pem}"

echo "Keystore: $KEYSTORE"
echo "Alias: $ALIAS"
echo "Output: $OUTPUT"
echo ""
echo "You will be prompted for the keystore password."
echo ""

keytool -exportcert -alias "$ALIAS" -keystore "$KEYSTORE" -rfc -file "$OUTPUT"

echo ""
echo "Certificate exported to $OUTPUT"
echo "Upload this file in Play Console: Setup → App signing → Upload a new key"
