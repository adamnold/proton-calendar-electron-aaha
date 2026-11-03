#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm ci
npm run check
npm test
npm run icons
# Start from an empty dist/ so stale AppImages from older builds are never
# checksummed, installed, or uploaded alongside the new one.
rm -rf dist
npm run dist -- --x64
bash scripts/build-flatpak.sh
mapfile -t appimages < <(find dist -maxdepth 1 -type f -name '*.AppImage')
if [[ ${#appimages[@]} -ne 1 ]]; then
  echo "ERROR: expected exactly one AppImage in dist/, found ${#appimages[@]}." >&2
  exit 1
fi
appimage="${appimages[0]}"
node scripts/build-info.js dist
(
  cd dist
  sha256sum "$(basename "$appimage")" BUILDINFO.json > SHA256SUMS
  sha256sum -c SHA256SUMS
  mapfile -t rpms < <(find . -maxdepth 1 -type f -name '*.rpm' -printf '%f\n')
  mapfile -t flatpaks < <(find . -maxdepth 1 -type f -name '*.flatpak' -printf '%f\n')
  [[ ${#rpms[@]} == 1 && ${#flatpaks[@]} == 1 ]] || { echo 'Expected exactly one RPM and one Flatpak.' >&2; exit 1; }
  sha256sum "${rpms[0]}" "${flatpaks[0]}" BUILDINFO.json > SHA256SUMS.packages
  sha256sum -c SHA256SUMS.packages
)
node scripts/verify-packages.js dist --local-build
echo "Build complete: $appimage"
