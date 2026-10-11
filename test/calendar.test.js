"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const cfg = require("../app.config.js");
const { classifyNavigation, permissionAllowed, permissionOrigin, validateConfig } = require("../src/policy.js");

test("Calendar and Proton Account retain navigation while sibling products use external handling", () => {
  assert.deepEqual(validateConfig(cfg), []);
  assert.equal(classifyNavigation("https://calendar.proton.me/u/0/", cfg), "internal");
  assert.equal(classifyNavigation("https://account.proton.me/calendar/login", cfg), "authentication");
  for (const url of ["https://mail.proton.me", "https://drive.proton.me", "https://proton.me", "https://calendar.proton.me:8443/"])
    assert.equal(classifyNavigation(url, cfg), "external", url);
  assert.equal(classifyNavigation("mailto:guest@example.com", cfg), "external");
  assert.equal(classifyNavigation("file:///etc/passwd", cfg), "deny");
});

test("only an identified Calendar origin can notify or write sanitized clipboard data", () => {
  for (const permission of ["notifications", "clipboard-sanitized-write"]) {
    assert.equal(permissionAllowed(permission, "https://calendar.proton.me:443/u/0/", cfg), true);
    for (const origin of ["https://account.proton.me", "https://mail.proton.me", "https://calendar.proton.me:8443", "http://calendar.proton.me", ""])
      assert.equal(permissionAllowed(permission, origin, cfg), false, `${permission}: ${origin}`);
    assert.equal(permissionAllowed(permission, permissionOrigin("", {}), cfg), false);
    assert.equal(permissionAllowed(permission, permissionOrigin("https://calendar.proton.me", { requestingUrl: "https://mail.proton.me" }), cfg), false);
  }
  for (const permission of ["clipboard-read", "media", "geolocation", "midi", "openExternal"])
    assert.equal(permissionAllowed(permission, "https://calendar.proton.me", cfg), false, permission);
});
