/* Runs the suites against a local copy of the site and exits non-zero
   if any of them fail, which is the whole point: these checks existed
   for months in a scratch directory where nothing ran them.

   `node run.js` runs everything. `node run.js layout` (or gesture, or
   perf) runs one group. Any other argument is treated as suite names.

   The server is started here rather than left to the caller, so there
   is one command to run and no way to test a stale copy by accident. */
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 8137);

const GROUPS = {
  /* the page's shape: does everything fit, on one line, inside its box */
  layout: ["deck", "fits", "credits", "rail", "pillbox", "about", "verse",
           "navcheck", "linkmark", "ios"],
  /* the page's behaviour under a finger, a wheel and a trackpad */
  gesture: ["touch", "behave", "rapid", "trackpad", "grab", "sens", "noisy"],
  /* frames, measured against the same page with the effect removed */
  perf: ["rimperf", "ctaperf"],
};
/* perf is not in the default run: it turns the page ten times per
   condition and reports frame counts rather than pass or fail, so it
   is a measurement to take deliberately, not a gate. `npm run
   test:perf`. */
const ALL = [...GROUPS.layout, ...GROUPS.gesture];

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css",
  ".js": "text/javascript", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".woff2": "font/woff2", ".mp3": "audio/mpeg",
  ".txt": "text/plain; charset=utf-8", ".json": "application/json" };

function serve() {
  return new Promise((resolve, reject) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404).end("not found"); return; }
        res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
        res.end(buf);
      });
    });
    s.on("error", reject);
    s.listen(PORT, "127.0.0.1", () => resolve(s));
  });
}

function run(name) {
  return new Promise((resolve) => {
    const out = [];
    const p = spawn(process.execPath, [path.join(__dirname, name + ".js")],
                    { env: Object.assign({}, process.env, { SP: __dirname }) });
    p.stdout.on("data", d => out.push(d.toString()));
    p.stderr.on("data", d => out.push(d.toString()));
    p.on("close", code => {
      const text = out.join("");
      /* a suite fails if it says so, or if it fell over */
      const failed = code !== 0 || /\bFAIL\b/.test(text);
      resolve({ name, failed, text });
    });
  });
}

(async () => {
  const arg = process.argv[2];
  const names = !arg ? ALL : (GROUPS[arg] || process.argv.slice(2));
  const unknown = names.filter(n => !fs.existsSync(path.join(__dirname, n + ".js")));
  if (unknown.length) { console.error("no such suite: " + unknown.join(", ")); process.exit(2); }

  let server;
  try { server = await serve(); }
  catch (e) {
    console.error(`could not serve ${ROOT} on :${PORT} — ${e.code === "EADDRINUSE"
      ? "something is already using that port; set PORT= to move it" : e.message}`);
    process.exit(2);
  }

  const { EXE } = require("./browser");
  console.log(`${names.length} suites · serving ${ROOT} on :${PORT}`);
  console.log(`browser: ${EXE || "playwright's own"}\n`);

  const bad = [];
  for (const n of names) {
    const r = await run(n);
    console.log(`${r.failed ? "FAIL" : "ok  "}  ${n}`);
    if (r.failed) { bad.push(n); console.log(r.text.replace(/^/gm, "        ")); }
  }
  server.close();
  console.log(bad.length ? `\n${bad.length} failed: ${bad.join(", ")}`
                         : `\nall ${names.length} passed`);
  process.exit(bad.length ? 1 : 0);
})();
