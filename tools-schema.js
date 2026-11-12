import { MCP_TOOLS as BASE_TOOLS } from "git-paid/lib/mcp.js";

export const MCP_SERVER_INSTRUCTIONS =
  "Postbuild MCP (`git-paid`) audits deployed web applications for technical SEO, AI search crawler access (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`), `llms.txt`, `sitemap.xml`, OpenGraph cards, `SoftwareApplication` JSON-LD, and Stripe checkout reachability. Use `postbuild_scan`, `postbuild_directories`, and `postbuild_pseo` for read-only inspection and previews. Use `postbuild_fix`, `postbuild_dispatch`, `postbuild_inbox`, `postbuild_checkout`, and `postbuild_vault_sync` when writing local artifacts, dispatching launches, verifying inboxes, or provisioning Stripe checkout.";

const TOOL_OVERRIDES = {
  postbuild_scan: {
    title: "Audit Live URL for Technical SEO, AI Crawlers & Checkout Readiness",
    description:
      "Execute a read-only 8-point technical SEO, AI crawler (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`), `llms.txt`, `sitemap.xml`, OpenGraph, JSON-LD, and checkout reachability audit against a live URL. Bare domains in `url` are normalized to `https://` and DNS-resolved through an SSRF guard that rejects loopback, RFC1918 LAN, and cloud metadata IPs before fetching (rate-limited to 10 requests/min; no authentication required; computes the deterministic `<slug>@postbuild.dev` address without creating server state or local files). Use this tool when evaluating a deployed site's readiness score and failing checks; do not use it to write fix files (`postbuild_fix`), filter the 85 launch directories (`postbuild_directories`), or inspect full HTML product page drafts (`postbuild_pseo`).",
    annotations: {
      title: "Audit Live URL for Technical SEO, AI Crawlers & Checkout Readiness",
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
            "Public HTTP/HTTPS URL or bare domain to audit (e.g. 'https://www.postbuild.dev' or 'cal.com')."
        }
      },
      required: ["url"]
    },
    outputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Normalized bare hostname extracted from the audited URL (e.g. 'postbuild.dev')."
        },
        targetUrl: {
          type: "string",
          description: "Canonical HTTPS URL audited after redirect resolution."
        },
        readinessScore: {
          type: "number",
          description: "Composite launch readiness score from 0 to 100 across the 8 technical checks."
        },
        botEmail: {
          type: "string",
          description: "Deterministic `<slug>@postbuild.dev` verification inbox address for the audited domain."
        },
        licenseStatus: {
          type: "string",
          enum: ["PRO_ACTIVE", "FREE_PREVIEW"],
          description: "Whether an active Launch Pass license is configured for this domain."
        },
        checks: {
          type: "array",
          description: "Individual pass/fail results for each of the 8 technical SEO, AI crawler, and checkout checks.",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Stable check identifier (e.g. 'robots_ai', 'llms_txt', 'sitemap', 'checkout')." },
              label: { type: "string", description: "Human-readable check name." },
              passed: { type: "boolean", description: "True if the check passed on the live URL." },
              detail: { type: "string", description: "Diagnostic summary or remediation guidance for the check." }
            }
          }
        },
        pseoRouteCount: {
          type: "number",
          description: "Number of targeted HTML product pages available for generation (7)."
        },
        directoryCount: {
          type: "number",
          description: "Total curated directories and launch communities matched for the domain (85)."
        }
      },
      required: ["domain", "targetUrl", "readinessScore", "botEmail", "licenseStatus", "checks", "pseoRouteCount", "directoryCount"]
    }
  },
  postbuild_checkout: {
    title: "Provision Stripe Product, Payment Link & Local Checkout Gate",
    description:
      "Provision a Stripe Product, USD Price, and hosted Payment Link (`https://buy.stripe.com/...`) via `STRIPE_SECRET_KEY` and write `.postbuild/PostbuildCheckoutGate.jsx` into `cwd`. When `product_name` or `description` are omitted, metadata is inferred by scraping `url`; `interval` switches Price creation between one-time (`one_time`) and recurring (`month`/`year`) billing, while `allow_live` gates `sk_live_` keys (test keys `sk_test_` run immediately, whereas live keys abort with `LIVE_CONFIRMATION_REQUIRED` before any Stripe API call or file write unless the user explicitly requested a live product). Each invocation creates a fresh Stripe Product/Price/Payment Link and overwrites only `.postbuild/PostbuildCheckoutGate.jsx`. Use this tool when adding Stripe monetization to a project; do not use it to check whether a live site already has checkout (`postbuild_scan`) or to generate SEO/llms.txt assets (`postbuild_fix`).",
    annotations: {
      title: "Provision Stripe Product, Payment Link & Local Checkout Gate",
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
          description: "Target project URL used for success/cancel redirects and fallback product metadata (e.g. 'https://your-app.com')."
        },
        price_usd: {
          type: "number",
          description: "Price in whole USD (default: 29, minimum: 1).",
          default: 29
        },
        interval: {
          type: "string",
          enum: ["one_time", "month", "year"],
          description: "Billing cadence: 'one_time' for a single charge, or 'month'/'year' for recurring subscriptions (default: 'one_time').",
          default: "one_time"
        },
        product_name: {
          type: "string",
          description: "Custom Stripe Product name (defaults to the target site's title + 'Launch Pass')."
        },
        description: {
          type: "string",
          description: "Custom Stripe Product description displayed on the hosted Stripe Checkout page."
        },
        allow_live: {
          type: "boolean",
          description: "Explicit confirmation to create live Stripe objects when `STRIPE_SECRET_KEY` is an `sk_live_` key (default: false).",
          default: false
        },
        cwd: {
          type: "string",
          description: "Local repository root where `.postbuild/PostbuildCheckoutGate.jsx` is written (defaults to `process.cwd()`)."
        }
      },
      required: ["url"]
    },
    outputSchema: {
      type: "object",
      properties: {
        ok: {
          type: "boolean",
          description: "True when the Stripe Payment Link and local JSX gate component were created."
        },
        mode: {
          type: "string",
          enum: ["test", "live"],
          description: "Stripe environment mode used ('test' for sk_test_ keys, 'live' for sk_live_ keys)."
        },
        productId: {
          type: "string",
          description: "Created Stripe Product ID (`prod_...`)."
        },
        priceId: {
          type: "string",
          description: "Created Stripe Price ID (`price_...`)."
        },
        paymentLinkId: {
          type: "string",
          description: "Created Stripe Payment Link ID (`plink_...`)."
        },
        checkoutUrl: {
          type: "string",
          description: "Hosted Stripe Payment Link URL (`https://buy.stripe.com/...`)."
        },
        gateFilePath: {
          type: "string",
          description: "Absolute path to the generated `.postbuild/PostbuildCheckoutGate.jsx` file."
        }
      },
      required: ["ok", "mode", "productId", "priceId", "paymentLinkId", "checkoutUrl", "gateFilePath"]
    }
  },
  postbuild_directories: {
    title: "Search & Filter Curated Launch Directories and Communities",
    description:
      "Search and filter the local catalog of 85 launch targets (74 software/AI/SaaS directories and 11 launch communities) without network calls or side effects. Filters (`category` substring, `status` state, and `min_da` Domain Rating floor) combine with logical AND and are capped at `limit` records (unlicensed sessions return a 5-directory preview; a Launch Pass license `pb_live_...` unlocks all 85); repeated calls in the same session return stateful delta stubs unless `bypass_cache: true` forces full record hydration. Use this tool to explore and shortlist directories by authority or submission type; do not use it to generate pre-filled launch URLs and Show HN copy (`postbuild_dispatch`) or to verify directory confirmation emails (`postbuild_inbox`).",
    annotations: {
      title: "Search & Filter Curated Launch Directories and Communities",
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
          description: "Project URL whose domain scopes the session's directory state (default: 'https://www.postbuild.dev').",
          default: "https://www.postbuild.dev"
        },
        category: {
          type: "string",
          description: "Case-insensitive category substring filter (e.g. 'AI', 'SaaS', 'Developer', 'MCP', 'Community', 'B2B')."
        },
        status: {
          type: "string",
          enum: ["ready_auto", "queued", "dispatched"],
          description: "Submission workflow status filter: 'ready_auto', 'queued', or 'dispatched'."
        },
        min_da: {
          type: "number",
          description: "Minimum Domain Rating (DR) threshold from 0 to 100 (default: 0).",
          default: 0
        },
        limit: {
          type: "number",
          description: "Maximum directory records to return, from 1 to 85 (default: 25; capped at 5 without a Launch Pass license).",
          default: 25
        },
        bypass_cache: {
          type: "boolean",
          description: "When true, disables session delta compaction and returns full directory records (default: false).",
          default: false
        }
      }
    },
    outputSchema: {
      type: "object",
      properties: {
        _mcp: {
          type: "object",
          description: "Stateful session cache metadata (`watermark`, `mode`, `total`, `returned`).",
          properties: {
            watermark: { type: "string", description: "Current entity state watermark (e.g. 'v1')." },
            mode: { type: "string", description: "Payload mode ('full' or 'delta')." },
            total: { type: "number", description: "Total matching records before compaction." }
          }
        },
        records: {
          type: "array",
          description: "Matched directory records ordered by relevance and Domain Rating.",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Directory identifier (e.g. 'dir-1')." },
              name: { type: "string", description: "Directory or community name." },
              category: { type: "string", description: "Primary directory category." },
              dr: { type: "number", description: "Domain Rating (0-100)." },
              status: { type: "string", description: "Current dispatch status ('ready_auto', 'queued', or 'dispatched')." },
              authType: { type: "string", description: "Required verification method (e.g. 'OTP (@postbuild.dev)', 'Direct Form', 'OAuth')." },
              url: { type: "string", description: "Submission or listing URL." },
              prefilledUrl: { type: "string", description: "URL with pre-populated query parameters when supported." }
            }
          }
        }
      },
      required: ["records"]
    }
  },
  postbuild_pseo: {
    title: "Preview 7 Targeted HTML Product & Comparison Pages",
    description:
      "Generate a read-only preview of 7 targeted HTML product and comparison pages (`features`, `comparison`, `workflow guide`, `developer guide`, `checklist`, `FAQ`, `AI search reference`) tailored to `url`. Performs a live HTTP GET on `url` to classify the site vertical (`saas_ai`, `ecommerce`, `agency_b2b`, or `local_service`), filters the 7 generated routes by `intent` when supplied, and compacts unchanged fields across repeated session calls unless `bypass_cache: true` is set (returns 3 preview routes without authentication, or all 7 with a Launch Pass license `pb_live_...`; never writes to disk). Use this tool to inspect generated page slugs, target keywords, and HTML copy in memory; do not use it to write HTML files into a repository (`postbuild_fix`) or to run the 8-point site readiness audit (`postbuild_scan`).",
    annotations: {
      title: "Preview 7 Targeted HTML Product & Comparison Pages",
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
          description: "Public HTTP/HTTPS URL of the product to tailor the 7 page drafts for (default: 'https://www.postbuild.dev').",
          default: "https://www.postbuild.dev"
        },
        intent: {
          type: "string",
          description: "Case-insensitive substring filter on route search intent (e.g. 'Comparison', 'Alternative', 'Pricing', 'Guide', 'High Intent')."
        },
        bypass_cache: {
          type: "boolean",
          description: "When true, bypasses stateful session delta compaction and returns full HTML and metadata for every matched route (default: false).",
          default: false
        }
      }
    },
    outputSchema: {
      type: "object",
      properties: {
        _mcp: {
          type: "object",
          description: "Stateful session cache metadata (`watermark`, `mode`, `total`).",
          properties: {
            watermark: { type: "string", description: "Current route state watermark (e.g. 'v1')." },
            mode: { type: "string", description: "Payload mode ('full' or 'delta')." },
            total: { type: "number", description: "Number of matched product page routes." }
          }
        },
        records: {
          type: "array",
          description: "Generated HTML product and comparison page route definitions.",
          items: {
            type: "object",
            properties: {
              slug: { type: "string", description: "URL path slug for the generated page (e.g. 'vs-alternatives', 'features')." },
              h1: { type: "string", description: "Primary H1 headline tailored to the scanned product." },
              targetKeyword: { type: "string", description: "Primary SEO/AI search target keyword." },
              intent: { type: "string", description: "Search intent classification (e.g. 'High Intent Comparison', 'Technical Guide')." },
              metaDescription: { type: "string", description: "Meta description tag content." },
              html: { type: "string", description: "Complete standalone HTML document draft." }
            }
          }
        }
      },
      required: ["records"]
    }
  },
  postbuild_dispatch: {
    title: "Generate & Commit Pre-Filled Directory Submission Links",
    description:
      "Prepare pre-filled submission URLs, Show HN titles, and 160-character launch copy across 85 directories (or the subset in `directory_ids`) and ping IndexNow for direct targets, gated by two-phase optimistic concurrency control. Calling with `dry_run: true` performs a read-only preview against `expected_version` and issues a single-use HMAC-SHA256 `commit_token` (`ct_...`); calling with `dry_run: false` requires that `commit_token` plus a valid Launch Pass license (`pb_live_...`), advancing the domain watermark to `v2`+ or rejecting stale watermarks/tokens with `OCC_REJECTED` before any mutation. Committing records dispatch state and pings IndexNow but does not submit external forms requiring human login or CAPTCHAs. Use this tool when preparing and committing a launch wave; do not use it for read-only directory browsing (`postbuild_directories`) or for clicking email verification links (`postbuild_inbox`).",
    annotations: {
      title: "Generate & Commit Pre-Filled Directory Submission Links",
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
          description: "Public HTTP/HTTPS URL of the product being launched (e.g. 'https://your-app.com')."
        },
        directory_ids: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of directory IDs (e.g. `['dir-1', 'dir-5']`) to dispatch; omit to target all 85 directories."
        },
        expected_version: {
          type: "string",
          description: "Expected domain state watermark (e.g. 'v1') for optimistic concurrency control."
        },
        dry_run: {
          type: "boolean",
          description: "When true (default), runs a read-only preview and returns a `commit_token` (`ct_...`); set false with `commit_token` to commit.",
          default: true
        },
        commit_token: {
          type: "string",
          description: "Single-use `ct_...` token returned by a prior `dry_run: true` call; required when `dry_run` is false."
        }
      },
      required: ["url"]
    },
    outputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["DRY_RUN_APPROVED", "COMMITTED", "OCC_REJECTED", "PRO_LICENSE_REQUIRED"],
          description: "Two-phase execution outcome."
        },
        domain: {
          type: "string",
          description: "Target project domain."
        },
        liveWatermark: {
          type: "string",
          description: "Current state watermark during `dry_run: true`."
        },
        newWatermark: {
          type: "string",
          description: "Incremented state watermark (e.g. 'v2') after `dry_run: false` commits."
        },
        commit_token: {
          type: "string",
          description: "Single-use HMAC-SHA256 `ct_...` token issued during `dry_run: true`."
        },
        diff: {
          type: "object",
          description: "Preview of state transitions to be applied when committed."
        },
        summary: {
          type: "object",
          description: "Committed dispatch batch summary including pre-filled URLs, pitches, and IndexNow status."
        }
      },
      required: ["status", "domain"]
    }
  },
  postbuild_inbox: {
    title: "Read @postbuild.dev Verification Inbox & Confirm Directory Links",
    description:
      "Retrieve inbound directory verification emails and 6-digit OTP codes from a domain-bound `<slug>@postbuild.dev` inbox, and optionally follow allowlisted confirmation links. Requires a valid Launch Pass license (`pb_live_...`) whose verified domain owns `inbox` (when `inbox` is omitted, defaults to the licensed domain's inbox; mismatched domains fail with `FORBIDDEN_INBOX`); when `auto_verify: false` (default), the call is strictly read-only and wraps untrusted email text in `<<<UNTRUSTED_CONTENT_DATA_ONLY>>>` guards, whereas `auto_verify: true` sends SSRF-guarded HTTP GET requests across at most 2 ESP redirect hops to allowlisted directory confirmation paths. Use this tool after submitting directory forms to complete email/OTP verification; do not use it to generate submission links (`postbuild_dispatch`) or to inspect initial domain readiness (`postbuild_scan`).",
    annotations: {
      title: "Read @postbuild.dev Verification Inbox & Confirm Directory Links",
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
          description: "Target `<slug>@postbuild.dev` address (defaults to the inbox bound to the active Launch Pass license)."
        },
        auto_verify: {
          type: "boolean",
          description: "When false (default), performs a side-effect-free read; when true, visits allowlisted confirmation URLs via HTTP GET.",
          default: false
        }
      }
    },
    outputSchema: {
      type: "object",
      properties: {
        inboxAddress: {
          type: "string",
          description: "Resolved `<slug>@postbuild.dev` inbox address."
        },
        verifiedCount: {
          type: "number",
          description: "Number of confirmation links verified across messages."
        },
        extractedOtps: {
          type: "array",
          description: "6-digit OTP verification codes extracted from inbound messages.",
          items: {
            type: "object",
            properties: {
              messageId: { type: "string", description: "Message identifier." },
              from: { type: "string", description: "Sender address." },
              otpCode: { type: "string", description: "Extracted OTP code." }
            }
          }
        },
        mcp: {
          type: "object",
          description: "Stateful session delta compaction metadata."
        },
        messages: {
          type: "array",
          description: "Compacted verification email records with spotlighted untrusted fields.",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Unique message ID." },
              from: { type: "string", description: "Sender email address." },
              subject: { type: "string", description: "Email subject line." },
              otpCode: { type: "string", description: "Extracted verification code if present." },
              primaryLink: { type: "string", description: "Primary confirmation URL wrapped in untrusted content delimiters." },
              autoVerified: { type: "boolean", description: "True if the confirmation link was visited and verified." },
              status: { type: "string", description: "Verification status ('pending' or 'verified')." },
              receivedAt: { type: "string", description: "ISO 8601 timestamp when the email arrived." }
            }
          }
        }
      },
      required: ["inboxAddress", "verifiedCount", "extractedOtps", "messages"]
    }
  },
  postbuild_fix: {
    title: "Write Local SEO, AI Crawler, llms.txt & Sitemap Remediation Files",
    description:
      "Scan `url` over HTTPS and write missing technical SEO and AI search readiness artifacts (`robots.txt` with `OAI-SearchBot`/`ClaudeBot`/`PerplexityBot` allow rules, `sitemap.xml`, `llms.txt`, `og-card.png`, `.postbuild/PostbuildCheckoutGate.jsx`, and 7 HTML product pages under `.postbuild/pseo/`) into `cwd`. `url` supplies the canonical hostname, title, and metadata embedded into the files written under `cwd` (`public/` or repo root); requires a valid Launch Pass license (`pb_live_...`) for `url`'s domain and is idempotent and non-destructive by default, preserving any existing user `robots.txt`/`sitemap.xml`/`llms.txt` files and reporting them in `skippedFiles`. Use this tool when remediating audit gaps in a local repository; do not use it for read-only site audits (`postbuild_scan`), in-memory HTML page previews (`postbuild_pseo`), or provisioning live Stripe Payment Links (`postbuild_checkout`).",
    annotations: {
      title: "Write Local SEO, AI Crawler, llms.txt & Sitemap Remediation Files",
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
          description: "Production HTTP/HTTPS URL scanned for metadata and used in canonical URLs, `sitemap.xml`, and JSON-LD (e.g. 'https://your-app.com')."
        },
        cwd: {
          type: "string",
          description: "Local repository directory where missing SEO and `.postbuild/` files are written (defaults to `process.cwd()`)."
        }
      },
      required: ["url"]
    },
    outputSchema: {
      type: "object",
      properties: {
        ok: {
          type: "boolean",
          description: "True when local remediation completed without error."
        },
        cwd: {
          type: "string",
          description: "Resolved local repository root directory."
        },
        targetDir: {
          type: "string",
          description: "Resolved public static assets directory (`public/` or `cwd`)."
        },
        written: {
          type: "array",
          items: { type: "string" },
          description: "Relative paths of newly created or updated remediation files."
        },
        skipped: {
          type: "array",
          items: { type: "string" },
          description: "Relative paths of pre-existing user files that were preserved without modification."
        },
        pseoFiles: {
          type: "array",
          items: { type: "string" },
          description: "Relative paths of the 7 draft HTML product pages written to `.postbuild/pseo/`."
        }
      },
      required: ["ok", "cwd", "written", "skipped"]
    }
  },
  postbuild_vault_sync: {
    title: "Sync Multi-Site Readiness Telemetry to LAUNCH_STATUS.md or Obsidian VaultOS",
    description:
      "Audit every URL in `urls` over HTTPS and write a consolidated Markdown readiness dashboard plus JSON telemetry cache into `vault_path`. When `vault_path` contains an `.obsidian/` directory, writes `_dashboards/Postbuild Launch.md` and `_meta/postbuild-telemetry.json` for Obsidian VaultOS; otherwise writes `LAUNCH_STATUS.md` and `.postbuild/telemetry.json` at the root of `vault_path` (when `urls` is omitted, audits the domain bound to the active `pb_live_...` Launch Pass license; overwrites only those generated status/telemetry files and never alters user notes). Use this tool to persist multi-project launch telemetry to a repository or Obsidian vault; do not use it for a single-URL in-memory JSON audit (`postbuild_scan`) or to generate `robots.txt`/`sitemap.xml`/`llms.txt` (`postbuild_fix`).",
    annotations: {
      title: "Sync Multi-Site Readiness Telemetry to LAUNCH_STATUS.md or Obsidian VaultOS",
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
          description: "Local repository root or Obsidian vault directory where status Markdown and telemetry JSON are written (defaults to `process.cwd()`)."
        },
        urls: {
          type: "array",
          items: { type: "string" },
          description: "Public HTTP/HTTPS project URLs to audit and aggregate into the synced dashboard (defaults to the licensed domain)."
        }
      }
    },
    outputSchema: {
      type: "object",
      properties: {
        ok: {
          type: "boolean",
          description: "True when all target URLs were audited and dashboard/telemetry files were written."
        },
        mode: {
          type: "string",
          enum: ["obsidian_vault", "repo_markdown"],
          description: "Output layout selected based on whether `.obsidian/` exists in `vault_path`."
        },
        vaultPath: {
          type: "string",
          description: "Resolved absolute path of `vault_path`."
        },
        dashboardPath: {
          type: "string",
          description: "Absolute path to the written Markdown dashboard (`LAUNCH_STATUS.md` or `_dashboards/Postbuild Launch.md`)."
        },
        telemetryPath: {
          type: "string",
          description: "Absolute path to the written JSON telemetry cache (`.postbuild/telemetry.json` or `_meta/postbuild-telemetry.json`)."
        },
        syncedProjects: {
          type: "number",
          description: "Number of project URLs audited and written to the dashboard."
        }
      },
      required: ["ok", "mode", "vaultPath", "dashboardPath", "telemetryPath", "syncedProjects"]
    }
  }
};

export const ENRICHED_MCP_TOOLS = BASE_TOOLS.map((tool) => {
  const override = TOOL_OVERRIDES[tool.name];
  if (!override) return tool;
  return {
    ...tool,
    title: override.title,
    description: override.description,
    inputSchema: override.inputSchema,
    outputSchema: override.outputSchema,
    annotations: override.annotations
  };
});
