# Contributing

Use the pinned Node/npm versions, run `npm run check`, `npm test`, `npm audit --audit-level=high` and `bash build.sh`. Review Proton authentication, calendar import/export, invitation links, clipboard, notifications, privacy claims and KDE identity with a disposable account.

Installer changes must also pass the disposable default/custom-root, receipt/marker, profile-preservation, migration and purge regression cases.

Verify the namespace sandbox in development, installed and direct AppImage modes; inspect the packaged native executable's fuses. Production releases require the app-owned key and a protected `release` environment. Preserve historical tags/assets. Record unfinished live acceptance checks in VALIDATION.md rather than claiming them passed.
