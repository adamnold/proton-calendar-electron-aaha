# Add RPM and Flatpak Downloads

User-approved implementation plan, 2026-11-03.

Approved revision: after the fresh audit found new high-severity advisories, the user explicitly approved patched dependency versions and publication. Electron is 44.10.1; compatible Undici lock entries are 6.29.1 and 7.30.1. All other direct/tool pins remain unchanged. This supersedes the original Electron/dependency retention constraint below.

## Goal and constraints

Publish v2.1.0 on GitHub with Linux x86_64 RPM, Flatpak and existing AppImage downloads. RPM is the recommended Fedora KDE package. Installation must require no Node.js, source checkout, or project installer. Updates are manual; no DNF repository, hosted app Flatpak remote or Flathub submission. Preserve Electron 44.7.0 and all dependency pins, renderer isolation, fuses and no-setuid policy. Existing Minisign authentication remains; no embedded OpenPGP package signatures.

## Task 1: Packaging and launchers

- Add electron-builder RPM target, complete Fedora runtime dependencies, SHA256 file digests and upgrade-safe custom hooks. Install under /opt with working /usr/bin command, desktop entry and icons. Never run the per-user installer as root or modify profiles from scriptlets.
- Fix native launcher symlink resolution and retain sandbox preflight.
- Build Flatpak from hardened linux-unpacked using a dedicated manifest and launcher invoking Zypak directly on the ELF .bin. Pin Freedesktop Platform/SDK and Electron2.BaseApp 26.08. Permit network, display, graphics, audio and Downloads, with portals and no broad home access.
- Embed Flathub runtime-repository URL, omit app-update remote. Keep app identity derived from app.config.js and generated scaffolds consistent.
- Test launcher symlink behavior, manifest generation/permissions, hooks and scaffold identity before building artifacts.

## Task 2: Release integrity and build pipeline

- Build all formats from one tagged checkout/job; refuse publication unless every expected artifact verifies.
- Preserve two-entry AppImage SHA256SUMS and strict installer verification. Add signed SHA256SUMS.packages for RPM, Flatpak and shared BUILDINFO.json.
- Record RPM, Flatpak, runtime/base tooling in metadata. Bump synchronized app/package/lockfile version to 2.1.0.
- Add missing/duplicate/tampered/wrong-key release verification tests; retain tag/source/provenance and immutable publication checks.

## Task 3: Documentation, validation and publication

- Lead README/release notes with RPM and Flatpak download links and one-command installation. Document manual update/remove/switch instructions; remove prior per-user install without --purge before RPM, preserve native profile, separate Flatpak profile/fresh sign-in.
- Validate clean Fedora RPM install/CLI/desktop/upgrade/removal and real Flatpak install/runtime acquisition/restart/removal, KDE Wayland/X11 integration, external links, file dialogs, sandbox and fuse enforcement.
- Record account-dependent or unavailable live acceptance checks honestly. Run existing check/test/audit/build gates and independent whole-branch review.
- Publish new v2.1.0 only after required checks pass; do not alter historical tags/releases/assets.

## Interfaces and review focus

All package identities originate in app.config.js/package.json. Shared hardened unpacked app is consumed by RPM and Flatpak. AppImage SHA256SUMS remains exactly AppImage + BUILDINFO.json; package manifest covers exactly RPM + Flatpak + same BUILDINFO.json. Release upload list is explicit. Watch symlink CLI invocation, RPM postun during upgrades, Flatpak renderer sandbox (portal-spawned processes), missing runtime remote, and per-user desktop entries shadowing RPM.
