/**
 * Copies @chenglou/pretext dist/*.js into js/vendor/pretext for browser ESM imports.
 * npm run vendor:pretext  |  postinstall
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const srcDir = path.join(root, "node_modules", "@chenglou", "pretext", "dist");
const dstDir = path.join(root, "js", "vendor", "pretext");
const files = ["layout.js", "bidi.js", "analysis.js", "measurement.js", "line-break.js"];

if (!fs.existsSync(srcDir)) {
  console.error("Missing:", srcDir, "\nRun: npm install");
  process.exit(1);
}
fs.mkdirSync(dstDir, { recursive: true });
for (const f of files) {
  fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f));
}
console.log("Pretext vendor copied to js/vendor/pretext/");
