import { MCP_TOOLS as BASE_TOOLS } from "git-paid/lib/mcp.js";

export const MCP_SERVER_INSTRUCTIONS =
  "Postbuild MCP (`git-paid`) audits deployed web applications for technical SEO, AI search crawler access (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`), `llms.txt`, `sitemap.xml`, OpenGraph cards, `SoftwareApplication` JSON-LD, and Stripe checkout reachability. Start with `postbuild_scan` (read-only, no authentication required) to inspect a public URL. Use `postbuild_directories` and `postbuild_pseo` for read-only previews of launch directories and generated HTML pages. Mutating tools (`postbuild_fix`, `postbuild_dispatch`, `postbuild_inbox` with `auto_verify: true`, `postbuild_checkout`, `postbuild_vault_sync`) write local project files or require a Launch Pass token (`pb_live_...`) or explicit two-phase confirmation.";

const TOOL_OVERRIDES = {
  postbuild_scan: {
    description:
      "Run a read-only, idempotent 8-point technical SEO, AI search crawler (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`), `llms.txt`, `sitemap.xml`, OpenGraph, JSON-LD, and checkout reachability audit against a public HTTP/HTTPS URL. Requires no authentication or API key (rate-limited to 10 requests/min; SSRF guard rejects loopback, private LAN, and cloud metadata IPs). Computes a deterministic `acme-com@postbuild.dev` inbox address string without creating external state or modifying local files. Returns `{ domain, readinessScore, passedChecks, totalChecks, checks[], botInbox, pseoRoutes[], directories[] }`. Call this tool first when diagnosing a live site; use `postbuild_fix` instead when you want to write the generated fix files to a local repository, or `postbuild_directories` to filter the 85 launch targets.",
    annotations: {
      title: "Scan Live URL for SEO & AI Crawler Readiness",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description:
            "Public HTTP or HTTPS URL or bare domain to audit (e.g. 'https://www.postbuild.dev' or 'cal.com'). Must resolve to a public IP; private/loopback addresses are rejected."
        }
      },
      required: ["url"]
    }
  },
  postbuild_checkout: {
    description:
      "Create a Stripe Product, USD Price, and Payment Link (`https://buy.stripe.com/...`) using `STRIPE_SECRET_KEY` from the environment (uses test mode with an `sk_test_` key; requires `allow_live: true` before using a live `sk_live_` key) and write `.postbuild/PostbuildCheckoutGate.jsx` into `cwd`. Non-destructive to existing source files (writes only under `.postbuild/`), but creates a remote Stripe Product/Price/Payment Link when invoked. Never pass `allow_live: true` unless the user has explicitly asked in their own words to create a live Stripe product. Use this tool only when adding a Stripe payment gate; use `postbuild_scan` to merely check whether a URL already has a working checkout.",
    annotations: {
      title: "Provision Stripe Payment Link & Checkout Gate",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Target project URL used for success/cancel redirect URLs (e.g. 'https://your-app.com')."
        },
        price_usd: {
          type: "number",
          description: "Price in whole USD (default: 29, minimum: 1).",
          default: 29
        },
        interval: {
          type: "string",
          enum: ["one_time", "month", "year"],
          description: "Billing interval: 'one_time' for a single purchase, or 'month'/'year' for recurring subscriptions (default: 'one_time').",
          default: "one_time"
        },
        product_name: {
          type: "string",
          description: "Optional custom Stripe Product name (defaults to the scanned site title + 'Launch Pass')."
        },
        description: {
          type: "string",
          description: "Optional Stripe Product description shown on the hosted checkout page."
        },
        allow_live: {
          type: "boolean",
          description: "Must be true to permit creating objects with a live `sk_live_` key (default: false). Never set true without explicit user approval.",
          default: false
        },
        cwd: {
          type: "string",
          description: "Local repository directory where `.postbuild/PostbuildCheckoutGate.jsx` will be written (defaults to current working directory)."
        }
      },
      required: ["url"]
    }
  },
  postbuild_directories: {
    description:
      "Read-only, idempotent query over the catalog of 85 launch targets (74 software/AI/business directories and 11 launch communities). Requires no authentication for the 5 free sample directories; returns all 85 hydrated URLs when a valid Launch Pass license is configured (`npx git-paid login`). Uses stateful delta compaction across repeated calls within a session unless `bypass_cache: true` is set. Returns `{ mcp, records[] }` where each record contains `{ id, name, category, dr, pricing, authType, prefillMode, url }`. Use this tool to browse or filter directories by category or minimum Domain Rating (`min_da`); use `postbuild_dispatch` instead when generating pre-filled submission links and launch copy.",
    annotations: {
      title: "Search & Filter 85 Launch Directories",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Target project URL used to match relevant directory categories (default: 'https://www.postbuild.dev').",
          default: "https://www.postbuild.dev"
        },
        category: {
          type: "string",
          description: "Case-insensitive substring filter on directory category (e.g. 'AI', 'SaaS', 'Developer', 'MCP', 'Community', 'B2B')."
        },
        status: {
          type: "string",
          enum: ["ready_auto", "queued", "dispatched"],
          description: "Filter by submission readiness: 'ready_auto' (direct/OTP forms), 'queued' (manual login/community), or 'dispatched'."
        },
        min_da: {
          type: "number",
          description: "Minimum Domain Rating (DR) threshold from 0 to 100 (e.g. 70 for high-authority directories only).",
          default: 0
        },
        limit: {
          type: "number",
          description: "Maximum number of directory records to return (1–85, default: 25).",
          default: 25
        },
        bypass_cache: {
          type: "boolean",
          description: "Set true to bypass stateful session delta compaction and return full directory objects (default: false).",
          default: false
        }
      }
    }
  },
  postbuild_pseo: {
    description:
      "Read-only, idempotent generator that previews the 7 targeted HTML product and comparison pages (`features`, `comparison`, `workflow guide`, `developer guide`, `checklist`, `FAQ`, `AI search reference`) tailored to the scanned `url`. Performs a live HTTP GET on `url` to infer site profile (`saas_ai`, `ecommerce`, `agency_b2b`, or `local_service`), does not require authentication, and writes no files to disk. Returns `{ domain, count, mcp, routes[] }` with each route's slug, target keyword, search intent, meta description, and schema type. Use this tool to inspect or filter generated page metadata before writing files; use `postbuild_fix` to write the HTML files to `.postbuild/pseo/`.",
    annotations: {
      title: "Preview 7 Targeted Product SEO Pages",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Public HTTP/HTTPS URL of the site to generate product page previews for (default: 'https://www.postbuild.dev').",
          default: "https://www.postbuild.dev"
        },
        intent: {
          type: "string",
          description: "Optional case-insensitive filter on route intent (e.g. 'High Intent', 'Comparison', 'Transactional')."
        },
        bypass_cache: {
          type: "boolean",
          description: "Set true to bypass stateful session delta compaction and return all 7 route definitions in full (default: false).",
          default: false
        }
      }
    }
  },
  postbuild_dispatch: {
    description:
      "Prepare 85 directory and community launch links (9 URL Auto-Prefill targets + 76 standalone web forms) with tailored Show HN titles, 160-character pitches, and UTM tracking URLs. Enforces a two-phase cryptographic write guard: call with `dry_run: true` first (read-only preview) to receive a single-use HMAC-SHA256 `commit_token` (`ct_...`), then call with `dry_run: false` and `commit_token` to record the dispatch batch. Requires a valid Launch Pass license for `dry_run: false`. Use `postbuild_directories` instead if you only need to search or filter directory metadata without generating launch payloads.",
    annotations: {
      title: "Dispatch & Prefill 85 Directory Launch Links",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Target project URL to generate pre-filled directory submission links for (e.g. 'https://your-app.com')."
        },
        directory_ids: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of directory IDs (e.g. `['dir-01', 'dir-05']`) to scope the dispatch batch; omit to include all 85 targets."
        },
        expected_version: {
          type: "string",
          description: "Optional stateful watermark version (e.g. 'v1') for optimistic concurrency."
        },
        dry_run: {
          type: "boolean",
          description: "When true (default), performs a read-only preview and issues a `commit_token` (`ct_...`). Set false with `commit_token` to commit.",
          default: true
        },
        commit_token: {
          type: "string",
          description: "Single-use cryptographic `ct_...` token returned by a preceding `dry_run: true` call; required when `dry_run` is false."
        }
      },
      required: ["url"]
    }
  },
  postbuild_inbox: {
    description:
      "Inspect verification emails and extract 6-digit OTP codes from a domain-bound `<slug>@postbuild.dev` launch inbox. Requires a valid Launch Pass license (`pb_live_...`) matching the inbox domain. By default (`auto_verify: false`), this operation is read-only and returns `{ inboxAddress, verifiedCount, extractedOtps[], messages[] }` with untrusted email bodies wrapped in `<<<UNTRUSTED_CONTENT_DATA_ONLY>>>` delimiters. When `auto_verify: true`, it performs HTTP GET requests to follow allowlisted directory confirmation links (up to 2 redirects across verified ESP domains). Use this tool after submitting directories via `postbuild_dispatch`.",
    annotations: {
      title: "Read @postbuild.dev Inbox & Verify Directory OTPs",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        inbox: {
          type: "string",
          description: "Assigned `@postbuild.dev` inbox address (e.g. 'acme-com@postbuild.dev'). Defaults to the licensed domain's inbox."
        },
        auto_verify: {
          type: "boolean",
          description: "When false (default), reads messages and OTPs without side effects. Set true to automatically follow allowlisted confirmation URLs.",
          default: false
        }
      }
    }
  },
  postbuild_fix: {
    description:
      "Generate and write drop-in technical SEO and AI search readiness files (`robots.txt` with `OAI-SearchBot`/`ClaudeBot`/`PerplexityBot` rules, `sitemap.xml`, `llms.txt`, `og-card.png`, and 7 draft HTML product pages under `.postbuild/pseo/`) into a local repository directory (`cwd`). Requires a valid Launch Pass license (`pb_live_...`) for the target domain (`npx git-paid login`). Non-destructive by default: preserves existing user `public/robots.txt` rules and writes draft HTML pages only to `.postbuild/pseo/`. Use `postbuild_scan` or `postbuild_pseo` instead if you want a read-only audit or preview without writing files or requiring a license.",
    annotations: {
      title: "Write Local SEO, llms.txt & Sitemap Fix Files",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Production HTTP/HTTPS URL of the project used for canonical tags, sitemap entries, and JSON-LD (e.g. 'https://your-app.com')."
        },
        cwd: {
          type: "string",
          description: "Absolute or relative path to the local repository root where files will be written (defaults to `process.cwd()`)."
        }
      },
      required: ["url"]
    }
  },
  postbuild_vault_sync: {
    description:
      "Audit one or more project URLs and write a Markdown status report (`LAUNCH_STATUS.md`) plus cached telemetry (`.postbuild/telemetry.json`, or `_meta/postbuild-telemetry.json` and `_dashboards/Postbuild Launch.md` when an Obsidian `.obsidian/` directory is present in `vault_path`). Requires a valid Launch Pass license (`pb_live_...`). Overwrites only the generated status/telemetry files (`LAUNCH_STATUS.md` and `postbuild-telemetry.json`) and never modifies user notes. Use `postbuild_scan` instead when you want an in-memory JSON report without writing dashboard files to disk.",
    annotations: {
      title: "Sync Readiness Report to LAUNCH_STATUS.md or Obsidian Vault",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        vault_path: {
          type: "string",
          description: "Local project directory or Obsidian vault root path where `LAUNCH_STATUS.md` and telemetry JSON will be written (defaults to `process.cwd()`)."
        },
        urls: {
          type: "array",
          items: { type: "string" },
          description: "List of public HTTP/HTTPS project URLs to audit and include in the synced report (defaults to the licensed domain)."
        }
      }
    }
  }
};

export const ENRICHED_MCP_TOOLS = BASE_TOOLS.map((tool) => {
  const override = TOOL_OVERRIDES[tool.name];
  if (!override) return tool;
  return {
    ...tool,
    description: override.description,
    inputSchema: override.inputSchema,
    annotations: override.annotations
  };
});
