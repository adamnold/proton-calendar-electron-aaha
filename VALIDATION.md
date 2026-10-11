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
