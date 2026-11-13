---
description: Run an 8-point technical SEO and AI crawler readiness audit on a URL
argument-hint: <url>
allowed-tools: [Read]
---

Run a technical audit on the specified URL using Postbuild:

1. Target URL: `$ARGUMENTS`
2. Call `mcp__postbuild__postbuild_scan` or the `postbuild_scan` tool with the URL.
3. Summarize the readiness score, which AI crawlers are blocked/allowed, and provide actionable fixes for failing checks.
