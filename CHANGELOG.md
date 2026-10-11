# Changelog

Last Updated: 2026-10-11

## v2.0.0 — 2026-10-11

- Renamed repository, executable, product, desktop name and fixed window title to `proton-calendar-electron-aaha`; added profile-copy migration and hidden legacy desktop aliases.
- Integrated AAHA template v3.0.0 at `f76f479eaed13dc769c52fd31ad1273fe6de6f26`. Pinned Electron 44.7.0, electron-builder 26.17.0, @electron/fuses 2.1.3, Node 24.21.0 and npm 11.19.0.
- Restricted Calendar navigation, Proton Account authentication and permission requesters to explicit HTTPS origins. Removed top-level permission fallback and broad Proton sibling trust.
- Added namespace-only launch enforcement, packaged fuses and authenticated AppImage extraction. Removed privileged sandbox-helper installation.
- Added app-owned signing, build provenance and guarded manual release publication. Documented remaining upstream build dependency advisories and pending signed-in acceptance checks.

## Unreleased — 2026-09-24

- Fixed stale AppImages being installed next to the new one: `build.sh` now
  clears `dist/` before building, and both `build.sh` and `install.sh` require
  exactly one AppImage.
- Added a manual-only Release workflow that builds the AppImage from the
  draft release's target commit, attaches it with `SHA256SUMS`, and publishes
  the draft. CI validation builds remain non-publishing.

## v1.3.0 — 2026-09-24

- Updated from exact Electron 43.1.0 to exact Electron 44.4.5 (Chromium
  security fixes); no application source, security policy, or profile changes
  were needed for the Electron 44 breaking changes.
- Refreshed the locked build tooling to clear every `npm audit` finding,
  including the `brace-expansion`, `tar`, `undici`, and `js-yaml` advisories
  that had begun failing the required CI audit step on `master`.
- Supersedes the unmerged Copilot Electron 44.3.0 draft.

## v1.2.0 — 2026-07-23

- Reconciled documentation dates and corrected the bundled icon source path.
- Restored the regular Proton Calendar description on the hidden compatibility
  launcher while preserving its stable KDE panel identity and hidden status.
- Made validation builds explicitly non-publishing, added regression coverage,
  and upgraded the GitHub Actions runtimes used by CI.
- Updated the locked build dependency tree to use the patched `fast-uri` 3.1.4
  release.

## v1.1.1 — 2026-07-15

- Added the standard `~/.local/opt/aaha/proton-calendar-aaha` default and
  explicit custom-root installation without changing AppImage execution.
- Added guarded installation receipts, identity markers, and regression tests
  for unsafe paths, mismatches, profile preservation, and purge.
- Made icon generation deterministic by removing variable PNG metadata.

## v1.1.0 — 2026-07-11

- Updated to exact Electron 43.1.0 and the AAHA v2 sandbox, navigation, permission, privacy, reproducible-build, icon, installer, checksum, test, and CI standard.
- Restricted notifications to Proton Calendar origins.

## v1.0.0

- Initial wrapper. Superseded because its Electron runtime is unsupported.
