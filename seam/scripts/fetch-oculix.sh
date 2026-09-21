#!/usr/bin/env bash
set -euo pipefail

# Fetch the latest stable Oculix JAR from GitHub releases.
# If OCULIX_VER is set, use that version; otherwise, get the latest release.
if [ -n "${OCULIX_VER:-}" ]; then
    VERSION="${OCULIX_VER}"
else
    # Get the latest release tag (e.g., v4.0.0)
    VERSION_TAG=$(curl -s https://api.github.com/repos/oculix-org/Oculix/releases/latest | jq -r .tag_name)
    # Remove leading 'v' if present
    VERSION="${VERSION_TAG#v}"
fi

# Construct the expected asset name
ASSET_NAME="oculixapi-${VERSION}-linux.jar"
# Get the release assets and find the download URL for our asset
DOWNLOAD_URL=$(curl -s https://api.github.com/repos/oculix-org/Oculix/releases/tags/${VERSION_TAG} | \
    jq -r --arg ASSET "$ASSET_NAME" '.assets[] | select(.name == $ASSET) | .browser_download_url' || echo "")

if [ -z "$DOWNLOAD_URL" ]; then
    # Fallback to the conventional URL pattern
    DOWNLOAD_URL="https://github.com/oculix-org/Oculix/releases/download/${VERSION_TAG}/${ASSET_NAME}"
fi

DEST="lib/oculixapi-${VERSION}-linux.jar"

echo "Fetching Oculix ${VERSION} from $DOWNLOAD_URL..."
mkdir -p "$(dirname "$DEST")"
curl -L -f -o "$DEST" "$DOWNLOAD_URL"
echo "Saved to $DEST"