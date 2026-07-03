// Tiny req/res helpers using only standard Node http APIs, so the handlers
// run identically under Vercel serverless functions and the local dev server.

export function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

// Sentinel for an over-limit body, so handlers can answer 413 instead of
// the connection just dropping.
export const TOO_LARGE = Symbol("body too large");

export async function readJson(req, limit = 16 * 1024) {
  // Vercel may have already parsed the body; use it if present.
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "object") return req.body;
    if (typeof req.body === "string" && req.body.length > limit) return TOO_LARGE;
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return new Promise((resolve) => {
    let size = 0;
    let chunks = [];
    req.on("data", (c) => {
      if (chunks === null) return; // over limit: drain and ignore the rest
      size += c.length;
      if (size > limit) {
        chunks = null;
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      if (chunks === null) return resolve(TOO_LARGE);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}
