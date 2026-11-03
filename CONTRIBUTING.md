# Contributing

Use Node **24.21.0** and npm **11.19.0**. Preserve Electron **44.10.1**, electron-builder **26.17.0** and @electron/fuses **2.1.3**. Install ImageMagick, Minisign, util-linux, `rpmbuild` (Fedora `rpm-build`), `flatpak` and `flatpak-builder`. Configure the user Flathub remote with Freedesktop Platform/SDK and Electron2.BaseApp **26.08** as shown in README.md.

Run `npm run check`, `npm test`, `npm audit --audit-level=high` and `bash build.sh`. Build RPM, Flatpak and AppImage from the same source and shared hardened payload. Review Proton authentication, calendar import/export, invitation links, clipboard, notifications, privacy claims and KDE identity with a disposable account.

Installer changes must also pass the disposable default/custom-root, receipt/marker, profile-preservation, migration and purge regression cases. RPM changes need disposable install/CLI/desktop/upgrade/removal checks, including upgrade-safe hooks and absence of profile migration from root. Flatpak changes need bundle installation with runtime acquisition, launch/restart/removal, portals, external links, Downloads and separate-profile checks. Preserve application identities derived from app.config.js in generated scaffolds.

Verify the namespace sandbox in development, RPM, installed AppImage and direct AppImage modes. Check Flatpak's direct Zypak/native-binary launch and renderer sandbox independently; do not reuse the host `unshare` preflight inside Flatpak. Inspect the native executable's fuses in each package and verify the setuid helper is absent. Test KDE Wayland and X11 integration where available.

Production releases require the app-owned Minisign key and protected `release` environment. Preserve the exact AppImage manifest contract (AppImage + BUILDINFO.json), the package manifest contract (RPM + Flatpak + the same BUILDINFO.json), and both signatures. All eight expected release assets must verify before publication, including missing/duplicate/tampered/wrong-key failure cases. Do not substitute native OpenPGP package signing for Minisign or add an application update remote without an explicit scope change. Preserve historical tags/assets.

Record unfinished live acceptance checks in VALIDATION.md rather than claiming them passed. Existing signed-in service and KDE Wayland acceptance gaps remain pending until supported by recorded evidence.
