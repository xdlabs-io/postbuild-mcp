# Postbuild MCP Server (`git-paid`)

[![xdlabs-io/postbuild-mcp MCP server](https://glama.ai/mcp/servers/xdlabs-io/postbuild-mcp/badges/score.svg)](https://glama.ai/mcp/servers/xdlabs-io/postbuild-mcp)
[![npm version](https://img.shields.io/npm/v/git-paid.svg)](https://www.npmjs.com/package/git-paid)
[![Postbuild Launch Readiness](https://www.postbuild.dev/api/badge?url=www.postbuild.dev)](https://www.postbuild.dev/?scan=postbuild.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<a href="https://www.producthunt.com/products/postbuild/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-postbuild" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1375102&theme=neutral" alt="Postbuild - Post&#0045;deploy&#0032;SEO&#0032;audit&#0044;&#0032;llms&#0046;txt&#0032;generator&#0032;&#0038;&#0032;85&#0043;&#0032;launch&#0032;kit | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Official Model Context Protocol (MCP) server for **[Postbuild](https://www.postbuild.dev)** (`git-paid` on npm).

Audits any deployed URL for technical SEO, AI search crawler rules (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`), `llms.txt`, `sitemap.xml`, OpenGraph social cards, `SoftwareApplication` JSON-LD, and Stripe checkout reachability, and generates drop-in fix files.

---

## Quick Start

### Claude Code / Cursor / Windsurf / Claude Desktop

Add `postbuild` to your MCP client configuration (`claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "postbuild": {
      "command": "npx",
      "args": ["-y", "git-paid", "mcp"]
    }
  }
}
```

Or run the CLI directly from your terminal:

```bash
npx git-paid https://yourapp.com
```

---

## Available MCP Tools

| Tool | Description |
| :--- | :--- |
| `postbuild_scan` | Audits a live URL across technical SEO, OpenGraph cards, AI search crawler directives (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`), `llms.txt`, `sitemap.xml`, JSON-LD schema, and Stripe checkout reachability. |
| `postbuild_fix` | Generates drop-in `robots.txt`, `llms.txt`, `sitemap.xml`, JSON-LD, and targeted HTML product pages for a local repository. |
| `postbuild_pseo` | Previews and generates targeted product/guide routes and structured metadata for a domain. |
| `postbuild_directories` | Queries and filters 85 launch directories and communities by category, domain rating (DR), and submission mode. |
| `postbuild_dispatch` | Prepares pre-filled directory launch kits and submission payloads with two-phase confirmation tokens. |
| `postbuild_inbox` | Reads verification emails and extracts 6-digit OTPs from an assigned `@postbuild.dev` launch inbox. |
| `postbuild_checkout` | Inspects or provisions self-serve Stripe checkout gates for a project. |
| `postbuild_vault_sync` | Syncs domain readiness scores and directory status to an Obsidian VaultOS dashboard. |

---

## Links

- **Web App & Free Live Scanner**: [https://www.postbuild.dev](https://www.postbuild.dev)
- **npm Package (`git-paid`)**: [https://www.npmjs.com/package/git-paid](https://www.npmjs.com/package/git-paid)
- **Built by**: [XD Labs](https://www.xdlabs.io)
