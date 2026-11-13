---
name: postbuild
description: Audit deployed websites and web applications for technical SEO, AI crawler access (OAI-SearchBot, ClaudeBot, PerplexityBot), llms.txt, sitemaps, OpenGraph cards, JSON-LD schema, and Stripe checkout readiness using the Postbuild MCP connector.
---

# Postbuild Technical SEO & AI Search Readiness

Postbuild audits live web applications to maximize discovery across traditional search engines and AI search engines (ChatGPT Search, Claude, Perplexity).

## Recommended Workflows

### 1. Run a 8-Point Technical Audit
When evaluating any deployed site URL or domain:
- Call `postbuild_scan` with the target `url`.
- Review the composite `readinessScore` (0-100) and inspect failing checks:
  - `robots_ai`: Allow rules for `OAI-SearchBot`, `ClaudeBot`, and `PerplexityBot`.
  - `llms_txt`: Clean `llms.txt` and `llms-full.txt` markdown index.
  - `sitemap`: Valid XML sitemap reachable and listed in `robots.txt`.
  - `opengraph`: Social preview cards and meta tags.
  - `json_ld`: `SoftwareApplication` or `WebSite` structured data.
  - `checkout`: Reachable Stripe checkout or payment gateway.

### 2. Discover Launch Directories
- Call `postbuild_directories` to retrieve curated developer tools and startup directories (up to 85 directories) categorized by domain relevance.

### 3. Generate Programmatic Product Pages
- Call `postbuild_pseo` to inspect high-intent draft HTML product pages and structured launch copy.

### 4. Remediate Local Codebase
- If working inside a local project repo and configured with a license, call `postbuild_fix` to generate missing `robots.txt`, `sitemap.xml`, and `llms.txt` files.
