#!/usr/bin/env node
import readline from "node:readline";
import { executeMcpToolCall } from "git-paid/lib/mcp.js";
import { ENRICHED_MCP_TOOLS, MCP_SERVER_INSTRUCTIONS } from "./tools-schema.js";

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

function sendJsonRpc(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }

  const { id, method, params } = msg;

  try {
    if (method === "initialize") {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          instructions: MCP_SERVER_INSTRUCTIONS,
          capabilities: {
            tools: {},
            prompts: {},
            resources: {}
          },
          serverInfo: {
            name: "postbuild-mcp",
            version: "2.1.24"
          }
        }
      });
      return;
    }

    if (method === "notifications/initialized") {
      return;
    }

    if (method === "ping") {
      sendJsonRpc({ jsonrpc: "2.0", id, result: {} });
      return;
    }

    if (method === "tools/list") {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          tools: ENRICHED_MCP_TOOLS
        }
      });
      return;
    }

    if (method === "prompts/list") {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          prompts: [
            {
              name: "launch_readiness_audit",
              description: "Run a complete post-deploy technical SEO, AI search crawler, llms.txt, and checkout readiness audit on a live URL.",
              arguments: [
                {
                  name: "url",
                  description: "Public HTTP/HTTPS URL of the deployed web app to audit.",
                  required: true
                }
              ]
            }
          ]
        }
      });
      return;
    }

    if (method === "resources/list") {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          resources: []
        }
      });
      return;
    }

    if (method === "resources/templates/list") {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          resourceTemplates: []
        }
      });
      return;
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const output = await executeMcpToolCall(toolName, toolArgs, "mcp-stdio-session");
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(output, null, 2)
            }
          ],
          isError: Boolean(output?.isError)
        }
      });
      return;
    }

    if (id !== undefined) {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {}
      });
    }
  } catch (err) {
    if (id !== undefined) {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32000,
          message: err?.message || "MCP execution error"
        }
      });
    }
  }
});
