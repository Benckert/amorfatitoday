/* The same static server run.js uses, on its own, for the tools in
   tools/ — they measure the page but do not assert anything, so they
   are run by hand against a server left up. `npm run serve`. */
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), PORT = Number(process.env.PORT || 8137);
const TYPES = { ".html":"text/html; charset=utf-8", ".css":"text/css",
  ".js":"text/javascript", ".jpg":"image/jpeg", ".jpeg":"image/jpeg",
  ".png":"image/png", ".woff2":"font/woff2", ".txt":"text/plain; charset=utf-8",
  ".json":"application/json" };
http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`));
