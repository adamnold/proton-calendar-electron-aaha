# Hardening

## Native RPM, AppImage and development launchers

The native launcher selects `--disable-setuid-sandbox` before Chromium starts and probes Linux user namespaces. It refuses root, sandbox-disabling flags, `ELECTRON_DISABLE_SANDBOX`, and `ELECTRON_RUN_AS_NODE`. Development, RPM, per-user installed AppImage and direct AppImage entry points share this policy. The launcher resolves symlinks so the RPM's `/usr/bin` command reaches the application under `/opt`. AppImage builder arguments override its unsandboxed default; a fallback that adds `--no-sandbox` is rejected. The native entry point also rejects unsafe launch inputs before loading remote content.

RPM installation uses the system package manager with administrator privileges, but the application runs as the desktop user. RPM hooks manage system desktop integration only; they neither run the per-user installer nor migrate user profiles. Per-user AppImage installation needs no sudo, root-owned helper or setuid promotion. Sandbox helpers are unlinked without following links in the shared packaged payload.

## Flatpak launcher

Flatpak uses Freedesktop Platform/SDK and Electron2.BaseApp **26.08**. Its launcher invokes Zypak directly on the packaged native `.bin` executable. It does not run the host launcher inside Flatpak, create a nested `unshare` sandbox, or pass `--disable-setuid-sandbox`; Zypak supplies the Electron process integration with the Flatpak sandbox. Unsafe launch inputs remain rejected, and no setuid helper is shipped.

Flatpak permits network, IPC, Wayland with fallback X11, graphics and audio, and access to Downloads. File dialogs and external links use desktop portals. It does not request broad home-directory access. The separate profile lives under `~/.var/app/com.adamandhisagents.protoncalendarelectronaaha/config/proton-calendar-electron-aaha`; native profile copying is not performed. The bundle can add the Flathub runtime source and download runtime dependencies but has no application update remote.

## Shared application controls

The renderer retains `sandbox: true`, context isolation, disabled Node integration, web security, blocked insecure content and webview rejection. Remote content receives no preload or native IPC bridge. Exact HTTPS origins govern navigation, authentication windows and permissions. Missing, malformed or conflicting permission requester identity denies access; it never substitutes the top-level page for a requesting frame.

All formats disable RunAsNode, Node-options and Node-inspection fuses and enable ASAR-only loading. Cookie encryption is unchanged pending profile migration testing. These fuses and ASAR packaging do **not** authenticate a package. Release authenticity comes from independently trusted Minisign keys and signed manifests: `SHA256SUMS` for AppImage and metadata, and `SHA256SUMS.packages` for RPM, Flatpak and the same metadata. Embedded OpenPGP package signatures are intentionally absent.

An attacker who can modify unsigned local builds controls their application payload; `--local-build` deliberately waives publisher authentication and is unsuitable for downloaded releases. User-owned installations do not protect against another process already operating as that user.

No wallet transaction, signing, seed, private-key or key-management functionality belongs in this template. Service owners must validate their authentication, desktop and notification behavior independently. See VALIDATION.md for completed checks and remaining acceptance work; package design alone does not establish live sandbox, portal or KDE behavior.
