#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[[ "$(uname -m)" == x86_64 ]] || { echo 'Only x86_64 packages are supported.' >&2; exit 1; }
work="$PWD/build/flatpak"
node scripts/prepare-flatpak.js "$work" "$PWD/dist/linux-unpacked"
flatpak-builder --user --install-deps-from=flathub --force-clean --disable-rofiles-fuse --state-dir="$work/state" \
  --repo="$work/repo" "$work/files" "$work/manifest.json"
app_id="$(node -p "require('./app.config.js').appId")"
artifact="$(node -p "require('./package.json').name + '-v' + require('./package.json').version + '-x86_64.flatpak'")"
flatpak build-bundle --arch=x86_64 \
  --runtime-repo=https://dl.flathub.org/repo/flathub.flatpakrepo \
  "$work/repo" "dist/$artifact" "$app_id" stable
