import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const [html, css, js] = await Promise.all([
  readFile("index.html", "utf8"), readFile("app/globals.css", "utf8"), readFile("game.js", "utf8"),
]);
await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/static/app", { recursive: true });
await writeFile("dist/static/index.html", html);
await writeFile("dist/static/app/globals.css", css);
await writeFile("dist/static/game.js", js);

const worker = `const files = {
  "/": ["text/html; charset=utf-8", ${JSON.stringify(html)}],
  "/index.html": ["text/html; charset=utf-8", ${JSON.stringify(html)}],
  "/app/globals.css": ["text/css; charset=utf-8", ${JSON.stringify(css)}],
  "/game.js": ["text/javascript; charset=utf-8", ${JSON.stringify(js)}]
};
export default { async fetch(request) {
  const path = new URL(request.url).pathname;
  const file = files[path];
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file[1], { headers: {
    "content-type": file[0],
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; media-src 'none'; frame-ancestors 'none'"
  }});
}};`;
await writeFile("dist/server/index.js", worker);
console.log("Built Orbit Breaker to dist/");
