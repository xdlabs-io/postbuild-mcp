export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const upstream = await fetch("https://www.postbuild.dev/api/mcp", {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
        ...(req.headers["authorization"] ? { Authorization: req.headers["authorization"] } : {}),
        ...(req.headers["mcp-session-id"] ? { "Mcp-Session-Id": req.headers["mcp-session-id"] } : {})
      },
      body: req.method === "POST" ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body)) : undefined
    });
    const text = await upstream.text();
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    res.statusCode = upstream.status;
    return res.end(text);
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err.message }));
  }
}
