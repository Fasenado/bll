const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "app");

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".wasm": "application/wasm",
    ".bin": "application/octet-stream",
    ".flat": "application/octet-stream",
    ".proto": "application/octet-stream",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".woff2": "font/woff2",
    ".icns": "application/octet-stream",
};

http.createServer((req, res) => {
    const url = req.url.split("?")[0].split("#")[0];
    let filePath = path.join(ROOT, url === "/" ? "index.html" : decodeURIComponent(url));

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    // If path is a directory, try index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Required for SharedArrayBuffer (used by WASM threads)
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            res.end("<h1>404 — Not Found</h1>");
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log(`Blob Opera running at http://localhost:${PORT}`);
    console.log(`Custom songs manager: http://localhost:${PORT}/customsong.html`);
});
