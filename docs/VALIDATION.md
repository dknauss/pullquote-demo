# Validation record

Run on 10 October 2026 with Node.js 24.21.0, npm 11.19.0, Playwright 1.64.0/Chromium, and the locked Playground CLI 3.1.57. The generated demo used WordPress 7.1.3, PHP 8.3, and Twenty Twenty-Five. The plugin’s minimum supported WordPress/PHP versions were not separately exercised.

## Completed checks

- `npm run build`: production assets and block manifest generated successfully.
- `npm run lint:js` and `npm run lint:css`: passed.
- PHP syntax checks: plugin bootstrap, demo guide, seed, and smoke assertions passed.
- `npm test`: 58 Chromium browser fixtures passed. The original 50 cover exact text/whitespace/hard-line-break matching, article scope, missing and ambiguous sources, hidden sources, custom semantics, interactive or embedded content, and recovery after supported mutations and viewport changes. Eight additional guide checks cover matching/missing/ambiguous messages, pending and inconsistent flags, separate article scopes, and visible feedback after source loss and recovery through the actual verifier.
- `npm run test:wordpress`: 3 browser workflows passed against a fresh local instance created from the committed Blueprint. They cover explicit source selection, saving/reloading a valid block, the JavaScript-disabled fallback, preservation of original emphasis and links, stale-source guidance and explicit recopy, the main demo’s verification state and live feedback, both fallback pages and their live feedback, JavaScript-disabled guide text, and validation of all seeded core blocks.
- Both `blueprints/demo.json` and `dist/demo-smoke.json` validated against the current official Playground Blueprint schema.
- The pinned CLI completed the generated smoke Blueprint with exit code 0. Assertions cover activation, registration of Article Extract/Quote/Pullquote, guided fixture pages, links retaining the site URL prefix, static front page, a single canonical source, unchanged core Pullquote markup, visible server output, and retained static content without block registration.
- Runtime ZIP generation and archive integrity validation passed. The ZIP contains the PHP bootstrap, readme, license, and built assets; it excludes npm dependencies and source maps.
- Read-only review found and prompted fixes for custom ARIA roles/descriptions, visibility changes through an ID, and hard line breaks.

Initial no-op verification and subsequent edge-case regressions failed before their implementation fixes. The initial WordPress authoring check failed because the required source selector did not exist, then passed after implementation.

The local comparison page was also inspected visually in Chromium. The public hosted Blueprint also booted successfully in the Codex in-app browser. The original article and core examples loaded, the matching extract reached `aria-hidden="true"`, the missing-source example stayed exposed, and the ambiguous-source page reached `data-extract-status="ambiguous"` without `aria-hidden`. The missing-source link and return link worked; the ambiguous page was additionally checked through Playground’s navigation API. This is browser observation, not a manual screen-reader session.

The guided update was inspected in the local Codex in-app browser. Its welcome dialog had a Close button; the editor toolbar contained Save and View Page, and View Page opened the comparison article in another tab. The editor’s blob iframe canvas stayed blank in that browser, while Chromium authoring workflows passed. The guide instructions include the welcome dialog and possible new tab; the Playground documentation advises a regular browser if an embedded editor canvas is blank.

The published guided Blueprint loaded all three live results, and the links between its example pages worked. A wrapped link was not activated by the Codex browser’s default locator click; clicking its visible text opened the destination. This observation does not establish a broken link for human users. The seed now resolves all comparison, fallback, and editor links through WordPress after URL setup so they retain Playground’s site prefix. Smoke and browser assertions cover the generated URLs.

## Limits and additional work

Manual keyboard exploration, VoiceOver and NVDA testing, author research, minimum-version compatibility, third-party themes, mobile layouts, and export/print policy remain proposed work. Browser DOM checks and the visible fallback do not establish universal accessibility conformance. CSS-generated content, CSSOM-only changes, animation-driven visibility, and programmatically attached event handlers are outside the current verification model.

`npm audit` reported 48 dependency advisories (3 low, 17 moderate, 28 high) in the development/install graph; the production-filtered npm graph reported 14 high advisories inherited through WordPress UI packages, ultimately from `braces`. Those npm trees are not shipped in the plugin archive: the build resolves WordPress APIs through host-provided scripts. This record does not claim an advisory-free development toolchain or audit the host WordPress installation.
