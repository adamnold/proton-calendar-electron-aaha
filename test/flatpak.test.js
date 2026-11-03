"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

function directory(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "aaha-flatpak-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test("Flatpak preparation exports the configured identity with restricted permissions", t => {
  const root = directory(t);
  const cfg = { ...require("../app.config.js"), repoName: "fixture-aaha", executable: "fixture-aaha", appId: "com.example.Fixture", productName: "Fixture & Calendar" };
  const { prepareFlatpak } = require("../scripts/prepare-flatpak.js");
  const manifestFile = prepareFlatpak(root, path.join(root, "payload"), cfg, { ...require("../package.json"), version: "2.1.0" });
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  assert.equal(manifest["app-id"], "com.example.Fixture");
  assert.equal(manifest.command, "fixture-aaha");
  assert.equal(manifest["runtime-version"], "26.08");
  assert.equal(manifest["base-version"], "26.08");
  assert.equal(manifest.branch, "stable");
  assert.ok(manifest["finish-args"].includes("--socket=wayland"));
  assert.ok(manifest["finish-args"].includes("--socket=fallback-x11"));
  assert.deepEqual(manifest["finish-args"].filter(arg => arg.startsWith("--filesystem=")), ["--filesystem=xdg-download"]);
  const desktop = fs.readFileSync(path.join(root, "com.example.Fixture.desktop"), "utf8");
  assert.match(desktop, /Exec=fixture-aaha %U/);
  assert.match(desktop, /Icon=com\.example\.Fixture/);
  assert.match(fs.readFileSync(path.join(root, "com.example.Fixture.metainfo.xml"), "utf8"), /Fixture &amp; Calendar/);
  assert.ok(manifest.modules[0]["build-commands"].some(command => command.includes("/app/lib/fixture-aaha")));
});

test("Flatpak launcher calls Zypak on the ELF without host namespace flags", t => {
  const root = directory(t);
  const executable = path.join(root, "calendar");
  fs.copyFileSync(path.join(__dirname, "../scripts/flatpak-launch.sh"), executable);
  fs.chmodSync(executable, 0o755);
  fs.writeFileSync(executable + ".bin", "inert ELF fixture");
  fs.chmodSync(executable + ".bin", 0o755);
  fs.writeFileSync(path.join(root, "zypak-wrapper"), '#!/bin/sh\nprintf "%s\\n" "$@"\n');
  fs.chmodSync(path.join(root, "zypak-wrapper"), 0o755);
  const env = { ...process.env, PATH: `${root}:${process.env.PATH}` };
  let result = spawnSync(executable, ["https://calendar.proton.me/"], { encoding: "utf8", env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, `${executable}.bin\nhttps://calendar.proton.me/\n`);
  for (const flag of ["--no-sandbox", "-disable-seccomp-filter-sandbox"]) {
    result = spawnSync(executable, [flag], { encoding: "utf8", env });
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, "");
  }
  result = spawnSync(executable, [], { encoding: "utf8", env: { ...env, ZYPAK_DISABLE_SANDBOX: "1" } });
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
});

test("Flatpak preparation accepts the scaffold's optional repository configuration", t => {
  const root = directory(t);
  const cfg = { ...require("../app.config.js") };
  delete cfg.repository;
  require("../scripts/prepare-flatpak.js").prepareFlatpak(root, path.join(root, "payload"), cfg, {
    ...require("../package.json"), repository: { url: "https://github.com/example/fixture.git" }
  });
  assert.match(fs.readFileSync(path.join(root, cfg.appId + ".metainfo.xml"), "utf8"), /https:\/\/github\.com\/example\/fixture<\/url>/);
});
