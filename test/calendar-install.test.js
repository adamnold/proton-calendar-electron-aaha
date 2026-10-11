"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createFixture, run } = require("./helpers/installer.js");

test("Calendar rename copies the old profile once, retains its original and redirects both legacy launchers", t => {
  const f = createFixture(t);
  const old = path.join(f.home, ".config", "Proton Calendar");
  fs.mkdirSync(old, { recursive: true });
  fs.writeFileSync(path.join(old, "Preferences"), "legacy preferences");
  assert.equal(run(f, "install.sh").status, 0);
  const current = path.join(f.home, ".config", "proton-calendar-electron-aaha");
  assert.equal(fs.readFileSync(path.join(current, "Preferences"), "utf8"), "legacy preferences");
  assert.equal(fs.readFileSync(path.join(old, "Preferences"), "utf8"), "legacy preferences");
  for (const id of ["com.adamandhisagents.protoncalendar", "proton-calendar"]) {
    const desktop = fs.readFileSync(path.join(f.home, ".local/share/applications", id + ".desktop"), "utf8");
    assert.ok(desktop.includes('Name=proton-calendar-electron-aaha\n'));
    assert.ok(desktop.includes('NoDisplay=true\n'));
    assert.ok(desktop.includes('/proton-calendar-electron-aaha/app/proton-calendar-electron-aaha"\n'));
  }
  fs.writeFileSync(path.join(current, "Preferences"), "new preferences");
  assert.equal(run(f, "install.sh").status, 0);
  assert.equal(fs.readFileSync(path.join(current, "Preferences"), "utf8"), "new preferences");
  assert.equal(run(f, "uninstall.sh", ["--purge"]).status, 0);
  assert.equal(fs.existsSync(current), false);
  assert.equal(fs.readFileSync(path.join(old, "Preferences"), "utf8"), "legacy preferences");
});

test("a linked legacy profile migrates its contents into an independent directory", t => {
  const f = createFixture(t);
  const configRoot = path.join(f.home, ".config");
  const data = path.join(f.root, "legacy-data");
  fs.mkdirSync(configRoot, { recursive: true });
  fs.mkdirSync(data);
  fs.writeFileSync(path.join(data, "Preferences"), "old data");
  fs.symlinkSync(data, path.join(configRoot, "Proton Calendar"));
  assert.equal(run(f, "install.sh").status, 0);
  const migrated = path.join(configRoot, "proton-calendar-electron-aaha");
  assert.equal(fs.lstatSync(migrated).isDirectory(), true);
  fs.writeFileSync(path.join(migrated, "Preferences"), "new data");
  assert.equal(fs.readFileSync(path.join(data, "Preferences"), "utf8"), "old data");
});
