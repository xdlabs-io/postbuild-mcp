import { MCP_TOOLS, executeMcpToolCall } from "git-paid/lib/mcp.js";
import { POSTBUILD_VERSION } from "git-paid/lib/stateful-mcp.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === "GET") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json({
      name: "postbuild-mcp",
      version: POSTBUILD_VERSION || "2.1.23",
      protocolVersion: "2024-11-05",
      status: "ok",
      homepage: "https://www.postbuild.dev",
      repository: "https://github.com/xdlabs-io/postbuild-mcp",
      npm: "https://www.npmjs.com/package/git-paid",
      tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description }))
    });
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method Not Allowed" }));
  }

  const msg = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { id, method, params } = msg;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (method === "initialize") {
      return res.status(200).json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {}, prompts: {}, resources: {} },
          serverInfo: { name: "postbuild-mcp", version: POSTBUILD_VERSION || "2.1.23" }
        }
      });
    }

    if (method === "notifications/initialized" || method === "ping") {
      return res.status(200).json({ jsonrpc: "2.0", id: id ?? null, result: {} });
    }

    if (method === "tools/list") {
      return res.status(200).json({ jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } });
    }

    if (method === "prompts/list") {
      return res.status(200).json({ jsonrpc: "2.0", id, result: { prompts: [] } });
    }

    if (method === "resources/list") {
      return res.status(200).json({ jsonrpc: "2.0", id, result: { resources: [] } });
    }

    if (method === "resources/templates/list") {
      return res.status(200).json({ jsonrpc: "2.0", id, result: { resourceTemplates: [] } });
    }

    if (method === "tools/call") {
      const authHeader = String(req.headers?.authorization || "");
      const bearerToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
      const output = await executeMcpToolCall(
        params?.name,
        params?.arguments || {},
        String(req.headers?.["mcp-session-id"] || "mcp-http-session"),
        bearerToken
      );
      return res.status(200).json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          isError: Boolean(output?.isError)
        }
      });
    }

    return res.status(200).json({ jsonrpc: "2.0", id: id ?? null, result: {} });
  } catch (err) {
    return res.status(200).json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code: -32000, message: err?.message || "MCP execution error" }
    });
  }
}
