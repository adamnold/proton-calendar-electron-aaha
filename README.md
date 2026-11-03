# proton-calendar-electron-aaha

Proton Calendar (Electron Wrapped) by adamsagents.com. Version **2.1.0** provides Linux **x86_64** downloads:

| System | Download | Install from the download directory |
| --- | --- | --- |
| Fedora KDE — recommended | [RPM](https://github.com/adamnold/proton-calendar-electron-aaha/releases/download/v2.1.0/proton-calendar-electron-aaha-v2.1.0-x86_64.rpm) | `sudo dnf install ./proton-calendar-electron-aaha-*.rpm` |
| Other Linux distributions with Flatpak | [Flatpak bundle](https://github.com/adamnold/proton-calendar-electron-aaha/releases/download/v2.1.0/proton-calendar-electron-aaha-v2.1.0-x86_64.flatpak) | `flatpak install --user ./proton-calendar-electron-aaha-*.flatpak` |
| Portable alternative | [AppImage](https://github.com/adamnold/proton-calendar-electron-aaha/releases/download/v2.1.0/proton-calendar-electron-aaha-v2.1.0-x86_64.AppImage) | Make executable and launch |

Choose one format and keep only the intended package in the download directory when using these wildcards. RPM and Flatpak installation need no source checkout, Node.js, npm or project installer. Install Flatpak itself through your distribution if needed. The bundle may ask to add Flathub as a **runtime** source and download dependencies; it does not configure an application update remote. There is no automatic updater, DNF repository or Flathub application listing. Download each new release manually.

[Authenticate the release with Minisign](SIGNING.md) before installation. RPM and Flatpak have no embedded OpenPGP package signatures; their publisher authentication comes from the signed release checksum manifest. See the [v2.1.0 release](https://github.com/adamnold/proton-calendar-electron-aaha/releases/tag/v2.1.0) for all integrity files.

The repository, executable, desktop entry name and window title are `proton-calendar-electron-aaha`. The window loads Proton's live Calendar web application; wrapper and web application versions advance independently. This project is unaffiliated with Proton. It uses AAHA Electron template **3.0.0**, imported from immutable commit `f76f479eaed13dc769c52fd31ad1273fe6de6f26`.

## Launch, update and remove

Launch the RPM from your application menu or with `proton-calendar-electron-aaha`. It installs under `/opt` with a command in `/usr/bin`, a desktop entry and icons. Launch Flatpak from the application menu or with:

```sh
flatpak run com.adamandhisagents.protoncalendarelectronaaha
```

Quit the application before updating. Download and authenticate the new package, then use `sudo dnf upgrade ./proton-calendar-electron-aaha-*.rpm` for RPM or `flatpak install --user --reinstall ./proton-calendar-electron-aaha-*.flatpak` for Flatpak. Replace an AppImage with the newly verified image; per-user AppImage installations can repeat the installer described below. Restart after updating.

Remove the RPM with `sudo dnf remove proton-calendar-electron-aaha`, or Flatpak with `flatpak uninstall --user com.adamandhisagents.protoncalendarelectronaaha`. These commands preserve application data. The per-user AppImage installer has its own `bash uninstall.sh`; ordinary uninstall preserves the profile, while `--purge` removes only the new profile after receipt/marker validation.

## Switch formats and preserve profiles

Before switching an existing per-user AppImage installation to RPM, quit it and run that installation's checkout's `bash uninstall.sh` **without `--purge`**. Supply its old custom install root if needed. This preserves the profile and removes local desktop entries that could shadow the RPM entry. RPM and AppImage use the same `proton-calendar-electron-aaha` profile under an absolute `XDG_CONFIG_HOME`, or otherwise `~/.config`.

Flatpak uses a separate profile at `~/.var/app/com.adamandhisagents.protoncalendarelectronaaha/config/proton-calendar-electron-aaha` and requires a fresh sign-in. It does not automatically copy native profiles. Quit and remove the previous format's desktop integration when switching to avoid duplicate launchers. KDE panel pins may need repinning.

For installations predating the rename from `proton-calendar-aaha`, the old profile is named `Proton Calendar`. Only the existing per-user AppImage installer copies it to `proton-calendar-electron-aaha` when the new profile is absent, preserving both the original and any existing new profile. Run that installer before the first new native launch if this migration is needed. RPM hooks never migrate user homes; direct AppImage execution, Flatpak and `npm start` do not perform this copy. Retire the old installation with its original checkout's uninstaller without purge. See [MIGRATION.md](MIGRATION.md).

## Build and run from source

Developers need Node **24.21.0**, npm **11.19.0**, ImageMagick, Minisign, util-linux (`unshare`), `rpmbuild` (Fedora packages `rpm-build` and `libxcrypt-compat`), `flatpak` and `flatpak-builder`. Runtime pins remain Electron **44.10.1**, electron-builder **26.17.0** and @electron/fuses **2.1.3**. See [DEPENDENCIES.md](DEPENDENCIES.md) for remaining build dependency advisories.

Configure a user Flathub remote and the pinned Flatpak build dependencies:

```sh
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user flathub org.freedesktop.Platform//26.08 org.freedesktop.Sdk//26.08 org.electronjs.Electron2.BaseApp//26.08
npm ci
npm start
bash build.sh
```

Builds produce RPM, Flatpak and AppImage from the shared hardened application payload. `dist/` contains the three packages, shared `BUILDINFO.json`, `SHA256SUMS` (AppImage + metadata) and `SHA256SUMS.packages` (RPM + Flatpak + the same metadata). Official releases add a Minisign signature for each manifest, for eight release assets total.

For AppImage desktop integration, place the authenticated AppImage integrity files in `dist/` beside the matching checkout and run `bash install.sh --public-key /absolute/path/to/trusted-calendar-release.pub`. Your own unsigned development build can use `bash install.sh --local-build`. The installer extracts the verified AppImage to `~/.local/opt/aaha/proton-calendar-electron-aaha` by default; a custom `--install-root` must be absolute and end with `proton-calendar-electron-aaha`. Direct AppImage execution also works; `APPIMAGE_EXTRACT_AND_RUN=1` supports hosts without FUSE.

Native RPM, installed AppImage, direct AppImage and development launchers require working unprivileged user namespaces and reject unsafe sandbox inputs. Flatpak invokes the native binary through Zypak within the Flatpak sandbox, with network, display, graphics, audio, Downloads and portal access rather than broad home access. All formats remove the setuid helper and retain the hardened Electron fuses. See [HARDENING.md](HARDENING.md).

## Service behavior and validation

Calendar navigation is trusted only at `https://calendar.proton.me`; authentication uses `https://account.proton.me`. Other HTTP/HTTPS/mailto links open externally. Notifications and sanitized clipboard writes require an identified Calendar origin; other permissions are denied. Notifications require the application to remain running.

See [PRIVACY.md](PRIVACY.md), [SIGNING.md](SIGNING.md) and [VALIDATION.md](VALIDATION.md). Signed-in authentication, profile continuity, calendar import/export, invitation links, clipboard and notification delivery remain pending disposable-account acceptance tests. KDE Wayland panel grouping/repinning remains pending a live Wayland session; historical X11 checks do not establish that result.
