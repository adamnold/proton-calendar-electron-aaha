# Calendar 2.1.0 candidate validation — 2026-11-03

This records candidate-build evidence, not a claim that every desktop or signed-in acceptance check passed. The 2.0.0 record below is retained as historical evidence.

## Source, build and release controls

- Node **24.21.0** / npm **11.19.0**: `npm run check` passed and the final suite passed **98 tests, zero failures/skips**. Tests cover native launcher symlink resolution, generated Flatpak identity/permissions, RPM hooks, package manifests, missing/duplicate/tampered/wrong-key release artifacts and existing AppImage installer/security behavior. GitHub [CI run 41658630214](https://github.com/adamnold/proton-calendar-electron-aaha/actions/runs/41658630214) passed on commit `7aada1b1bf7b8ee97ae3f4cf373f05813f9c9846`.
- Fresh audit passed the high-severity gate with **0 high/critical and 16 moderate build dependency entries**. With owner approval, Electron was updated to **44.10.1** and compatible Undici entries to **6.29.1 / 7.30.1** for security fixes. electron-builder **26.17.0**, @electron/fuses **2.1.3** and build-time Node/npm remain unchanged. See DEPENDENCIES.md for the remaining advisories.
- A complete non-publishing candidate build produced the actual x86_64 RPM, Flatpak bundle and AppImage. Metadata records clean source commit `7aada1b1bf7b8ee97ae3f4cf373f05813f9c9846` with no release tag, Electron 44.10.1 / Chromium 152.0.7977.169 / bundled Node 24.22.1, RPM 6.0.2 and Flatpak 1.16.6 / flatpak-builder 1.4.12. Freedesktop Platform/SDK and Electron2.BaseApp are pinned to **26.08**, with exact build ref commits recorded in BUILDINFO.json. The publication job rebuilds every format from the final tagged checkout.
- Both final checksum manifests verified: `SHA256SUMS` covers exactly AppImage + BUILDINFO.json; `SHA256SUMS.packages` covers exactly RPM + Flatpak + the same BUILDINFO.json. The release pipeline requires both Minisign signatures and all eight expected assets before publication. Native OpenPGP package signatures are intentionally absent. Candidate build checks do not establish public release publication or downloaded-release authentication.

## RPM installation and upgrade

- Installed the actual RPM into a clean, disposable Fedora **43** root using DNF, which resolved and installed the declared runtime dependency closure. No application was installed into the host's real system or personal profile for this check.
- Installed a disposable same-version release-0 fixture, then upgraded it to the actual **2.1.0-1** RPM. The `/usr/bin` launcher symlink and disposable profile survived the real upgrade transaction, exercising removal hooks during replacement.
- Package verification (`rpm -V`), payload permission checks, hardened fuse inspection, absent setuid sandbox helper and desktop-file validation passed. Payload files have no group/world write permissions or special permission bits.
- The clean-root launch check exposed a missing dynamically loaded `libX11-xcb.so.1`; tracing established the failure, and installing Fedora's `libX11-xcb` resolved it. This dependency is now declared explicitly in the RPM configuration. Native launch through `/usr/bin` passed under X11/Xvfb and virtual KWin Wayland using only the disposable Fedora root's libraries. Each renderer had a nested PID namespace, NoNewPrivs=1, seccomp mode 2 and an additional seccomp filter relative to the browser. Actual native unsafe-launch flags were rejected before Electron execution.
- Rebuilt the corrected RPM from the hardened payload and installed it after removing the app and diagnostic X11 library. DNF automatically resolved `libX11-xcb` from the RPM's declared dependencies; installation and installed-file verification passed.
- DNF removal deleted the CLI symlink, desktop entry and application payload files while preserving the profile marker. Empty payload directories remained; no executable remained. No personal profile or account credentials were used.

## Flatpak and AppImage smoke tests

- Installed the actual Flatpak bundle into a disposable user installation initially containing no remotes. Its embedded runtime-repository information allowed acquisition of Freedesktop **26.08** and related runtime dependencies. After correcting disposable test-environment setup, the installed app launched, restarted and uninstalled successfully; uninstall preserved its separate profile. Installed permissions matched network/IPC, display, graphics, audio and Downloads access without broad home/host access.
- Actual Flatpak renderer sandbox checks passed under **X11/Xvfb** and a **virtual KWin Wayland compositor**. The browser had NoNewPrivs=1 and seccomp mode 2 with two filters; the renderer had an additional PID namespace and three filters. Installed Flatpak fuse inspection passed and no setuid sandbox helper was present. These virtual-display checks establish launch and renderer sandbox behavior, not full Plasma desktop acceptance.
- The installed Flatpak explicitly rejected `--no-sandbox`, `--disable-seccomp-filter-sandbox` and `ZYPAK_DISABLE_SANDBOX=1`. Traces confirmed the policy errors occurred before Zypak/Electron execution or Internet socket activity. Uninstallation retained the disposable profile sentinel.
- The actual AppImage passed an anonymous X11 renderer sandbox check with a disposable profile: NoNewPrivs=1, seccomp mode 2, a nested renderer PID namespace and one additional seccomp filter relative to the browser. No personal profile or account credentials were used.

Evidence logs and disposable test scripts are retained locally under `.superpowers/sdd/2026-11-03-rpm-flatpak/`, including `check-final.log`, `test-final.log`, `audit-patched.log`, `build-final.log`, RPM lifecycle logs, `flatpak-check-initial.log`, `flatpak-check.log`, `flatpak-fuses.log` and `appimage-check.log`.

## Pending acceptance

- The document portal could not mount: the tool sandbox hides `/dev/fuse`, and a repeat outside that sandbox still encountered mount-permission restrictions in the isolated test environment. Portal file access, manual file dialogs and import/export/download behavior remain unverified; successful application launch does not establish those flows. External-link dispatch also needs desktop acceptance.
- Full Plasma taskbar grouping, icon/pin identity and repinning need a live desktop session. The virtual KWin Wayland launch and historical native X11 class/title checks do not establish those results.
- Authentication completion, signed-in session continuity after profile copying, invitation links, actual clipboard use and notification delivery need a disposable Proton account. Existing installations still require manual rollout and retirement of old per-user desktop integration. Remaining dependency advisories are documented exceptions, not fully remediated libraries.

---

# Calendar 2.0.0 validation — 2026-10-11

## Source, build and security controls

- Imported AAHA template v3.0.0 from immutable commit `f76f479eaed13dc769c52fd31ad1273fe6de6f26`. Calendar config uses schema v3 and exact Calendar/Account HTTPS origins.
- Node 24.21.0 / npm 11.19.0: configuration, JavaScript and shell checks passed. The Calendar suite passed **45 tests, zero failures/skips**. It covers signature/key/metadata/payload tampering, staging, authenticated extraction, unsafe roots/links, namespace-launch refusal, exact origins, missing/conflicting permission identity, release guards, migration, aliases and preservation/purge. Installer fixtures make any sudo invocation fail.
- A complete non-publishing `bash build.sh` produced the x64 AppImage and metadata/checksum manifest. Electron 44.7.0 embeds Chromium 152.0.7977.130 and Node 24.21.0; builder 26.17.0 and fuses 2.1.3 were observed. The ASAR contains no npm dependency tree.
- Packaged fuse inspection confirmed RunAsNode, Node options and Node inspection disabled; ASAR-only loading enabled. The setuid helper is absent. Generated icons are ignored rather than tracked so ImageMagick differences do not dirty tagged source.
- Neutral disposable fixture renderers passed live sandbox checks in development, installed and direct AppImage modes: nested renderer PID namespaces, NoNewPrivs=1, seccomp mode 2 and an additional seccomp filter relative to the browser. The surrounding execution environment's inherited filter alone was not treated as proof.
- Unsafe double/single-dash sandbox switches were refused before hostname-audit requests across development, installed, direct AppImage and native entry points.
- An independent read-only review identified symlink-profile copy and scaffold test inheritance regressions. Both were reproduced and corrected. Migration copies the legacy directory's contents, preserves original data and never overwrites an existing new profile; service-specific tests are excluded from generated scaffolds. Focused regressions passed. The reviewer found no surviving source-backed original privileged-helper, permission-fallback or unsafe-launch bypass.
- Calendar's audit gate passed: **0 high/critical and 8 moderate build dependency entries**. The upstream cache max-stale defect still reproduced in 4.3.0; got's default HTTP cache was undefined. See DEPENDENCIES.md for the exposure assessment and unresolved upstream defects.

## Product smoke tests and upgrade

- Anonymous Calendar navigation reached `https://account.proton.me/calendar` in development, installed and direct AppImage modes using fresh temporary profiles. No account credentials or personal profiles were used. Observed unauthenticated resource hosts were Calendar, Account and account-api.proton.me; resource access does not grant account-api navigation or permission privileges.
- Remote pages had no Node globals. A file popup was denied. The native X11 window retained the exact `proton-calendar-electron-aaha` title after the page attempted to change it; the new application class was observed.
- A disposable old installation was retired with the original guarded uninstaller without purge. The actual new AppImage installed with explicit unsigned-local mode, copied legacy fixture data, retained the original and included no privileged helper. Unit tests also exercise signed install/upgrade with a separately supplied trust key.
- Calendar has its own public release key; its private key is outside Git and in the protected GitHub release environment. The manual release workflow requires an immutable matching tag, a clean source tree, an empty draft, signature verification and a final tag recheck. Public release CI and downloaded artifact verification are reported in the release notes.

## Pending acceptance

The owner explicitly requested that available tests proceed and signed-in checks be reported as pending. Authentication completion, signed-in session continuity after profile copying, import/export/downloads, invitation links, actual clipboard use and notification delivery need a disposable Proton account. KDE Wayland panel grouping/repinning also needs a live Wayland session; X11 class/title checks do not establish that result. Existing installations require manual rollout and retirement of the old executable. Upstream dependency advisories remain documented exceptions, not fully remediated libraries.
