import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const resolved = normalize(join(root, relative));
    if (!resolved.startsWith(root)) throw new Error("Invalid path");
    const body = await readFile(resolved);
    response.writeHead(200, { "content-type": types[extname(resolved)] || "application/octet-stream", "cache-control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}`));
