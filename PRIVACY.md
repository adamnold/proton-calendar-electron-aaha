# Privacy and network behavior

The wrapper adds no AAHA analytics. It reduces optional Chromium background/update/reporting traffic and blocks the template's known Google update and telemetry hosts. Electron remains Chromium-based; Proton services, authentication and CDN traffic remain required. These controls do not establish a completely Google-free runtime.

Calendar and Proton Account are the only trusted navigation/authentication origins. Resource loading is broader because Proton's web application needs its own service endpoints and CDNs. `AAHA_NETWORK_AUDIT=1` logs observed hostnames for a disposable test; it is a diagnostic option, not a telemetry service.

Notification permission and sanitized clipboard writes are limited to `https://calendar.proton.me`, with missing or conflicting requester identity denied. The app must remain open for web notifications. No background notification daemon is installed.

The new profile contains sessions, web storage, cache and preferences under `$XDG_CONFIG_HOME/proton-calendar-electron-aaha` when XDG_CONFIG_HOME is absolute, otherwise `~/.config/proton-calendar-electron-aaha`. The installer can copy the legacy `Proton Calendar` profile and retains that original. Normal uninstall preserves data; `--purge` removes only the new local profile, leaving calendars and the Proton account intact. Copied signed-in sessions have not yet been validated with a disposable account.
