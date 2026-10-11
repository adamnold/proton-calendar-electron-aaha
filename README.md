# proton-calendar-electron-aaha

Unofficial Proton Calendar desktop wrapper for Linux by Adam And His Agents (AAHA). Application version **2.0.0** uses AAHA Electron template **3.0.0**, imported from immutable commit `f76f479eaed13dc769c52fd31ad1273fe6de6f26`.

The repository, executable, desktop entry name and window title are `proton-calendar-electron-aaha`. The window loads Proton's live Calendar web application; the wrapper version and Proton's web application version advance independently. This project is unaffiliated with Proton.

## Build and run

Use Node **24.21.0**, npm **11.19.0**, ImageMagick, Minisign and util-linux (`unshare`). The runtime pins are Electron **44.7.0**, electron-builder **26.17.0** and @electron/fuses **2.1.3**. See [DEPENDENCIES.md](DEPENDENCIES.md) for the remaining build dependency advisories.

```sh
npm ci
npm start
bash build.sh
```

Builds produce one x64 AppImage, `BUILDINFO.json` and `SHA256SUMS` in `dist/`. Official releases also include `SHA256SUMS.minisig`. Verify the publisher's independently trusted public key before installing:

```sh
bash install.sh --public-key /absolute/path/to/trusted-calendar-release.pub
```

For your own unsigned development build, use `bash install.sh --local-build`. Desktop integration defaults to `~/.local/opt/aaha/proton-calendar-electron-aaha`; a custom `--install-root` must be absolute and end with `proton-calendar-electron-aaha`. The installer extracts the verified AppImage. Direct AppImage execution also works; `APPIMAGE_EXTRACT_AND_RUN=1` supports hosts without FUSE.

The launcher requires working unprivileged user namespaces. It refuses root execution, sandbox-disabling flags and Electron environment overrides. The packaged application removes the setuid helper and hardens Electron fuses. See [HARDENING.md](HARDENING.md).

## Upgrade from proton-calendar-aaha

Quit the old app first. Use the old checkout's `uninstall.sh` **without `--purge`** before installing this version; that script validates its old receipt and identity marker and preserves `Proton Calendar` data. Supply the old custom root if necessary. This retires the old executable and any privileged helper. Keep historical release tags intact.

The new installer copies the `Proton Calendar` profile to `proton-calendar-electron-aaha` when the new profile is absent. It preserves the original and keeps an existing new profile intact. Both use an absolute `XDG_CONFIG_HOME`, or otherwise `~/.config`. Install before the first new launch to perform this migration. Direct AppImage execution and `npm start` alone do not migrate profiles. Hidden legacy desktop aliases support existing launchers; KDE panel pins may need repinning because the application ID changed.

Upgrade by installing each new signed release and restarting. There is no automatic updater. `bash uninstall.sh` preserves the new profile; `--purge` removes only the new profile after receipt/marker validation. The retained old profile must be removed separately if desired.

## Service behavior and validation

Calendar navigation is trusted only at `https://calendar.proton.me`; authentication uses `https://account.proton.me`. Other HTTP/HTTPS/mailto links open externally. Notifications and sanitized clipboard writes require an identified Calendar origin; other permissions are denied. Notifications require the application to remain running.

See [PRIVACY.md](PRIVACY.md), [SIGNING.md](SIGNING.md) and [VALIDATION.md](VALIDATION.md). Signed-in authentication, profile continuity, calendar import/export, invitation links, clipboard and notification delivery remain pending disposable-account acceptance tests.
