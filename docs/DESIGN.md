# Pullquote demonstrator design

The user authorized a public `dknauss/pullquote-demo` repository and a WordPress Playground demo after reviewing the proposed experimental Article Extract approach. This is a discussion demonstrator, not a production replacement for core blocks.

## Contract

- Keep `core/quote` and `core/pullquote` available and unchanged. Do not migrate saved posts.
- Register one API v3 block, `pullquote-demo/article-extract`, with a `text` attribute sourced from its sole paragraph.
- The author explicitly copies a whole top-level Paragraph. Inline links and formatting stay in the original; the extract is plain text. Images and embedded objects are unsupported.
- Save a visible `<aside data-article-extract="true"><p>text</p></aside>` fallback. The editor remains accessible.
- A front-end enhancement hides a duplicate only after finding exactly one matching visible canonical paragraph within the same post-content/entry-content/article. It ignores other extracts, asides, blockquotes, hidden sources and sources whose ARIA replaces the text.
- Source removal, changes, ambiguity or unsupported content expose the extract again. A mutation observer and resize listener recheck supported changes. No source ID or live text synchronization is introduced.
- Without JavaScript or the plugin, saved text remains visible. Raw exports are not deduplicated by ARIA.
- This browser heuristic cannot establish universal accessibility-tree equivalence. Enhancement timing, print contexts and manual VoiceOver/NVDA testing remain material limits.

## Deliverables and verification

1. Official create-block scaffold, minimal editor/save/view implementation, scoped CSS, GPL license and reproducible build.
2. Real Chromium fixture tests for duplicate/source/visibility/interactive-content cases and mutation recovery.
3. A local Playground editor test for selecting a source, saving, reloading and front-end enhancement; PHP smoke checks for registration and existing core blocks.
4. A self-contained Blueprint embedding the runtime plugin and demonstration content, checked against the current schema and run in ephemeral Playground.
5. A copy-ready upstream proposal, experimental test brief, runtime ZIP, public GitHub repository and Try in Playground link.

The implementation is divided among independent agents: duplicate verification and fixture tests; Blueprint/demo packaging; proposal documentation. The primary agent owns registration/editor/save/CSS and integration verification, and reviews the combined result before publishing.
