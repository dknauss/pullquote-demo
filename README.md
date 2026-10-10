# Pullquote demonstrator

An experimental WordPress plugin and a self-contained Playground demo for discussing the difference between a quotation, a repeated article passage, and a unique callout.

**[Try the demo in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https%3A%2F%2Fraw.githubusercontent.com%2Fdknauss%2Fpullquote-demo%2Fmain%2Fblueprints%2Fdemo.json)** · **[Read the draft Gutenberg proposal](docs/PROPOSAL.md)** · **[Discussion and assessment](docs/DISCUSSION.md)**

The plugin adds **Article Extract** (`pullquote-demo/article-extract`). Insert it in the editor and choose a whole top-level Paragraph from the article. It copies plain text; the original paragraph keeps its formatting and links. Core Quote and Pullquote remain available with their existing behavior. This is a discussion prototype, not a replacement or a migration.

On the public page, an extract is excluded from the accessibility tree only after JavaScript finds exactly one matching, visible article paragraph. A missing, changed, hidden, or ambiguous source leaves the extract exposed. Supported DOM changes and viewport resizing trigger another check. The saved HTML always contains a visible `aside` and paragraph, so disabling JavaScript or deactivating the plugin leaves its content available.

Matching is a conservative browser heuristic. It does not prove equivalent announcements in every screen reader. CSS-generated text, CSSOM-only changes, custom semantics, enhancement timing, feeds, and exports require further investigation. Manual VoiceOver and NVDA testing is still outstanding. See the [experiment and acceptance matrix](docs/EXPERIMENT.md) and [validation record](docs/VALIDATION.md).

## Develop and verify

Requires Node.js 20.18+; the plugin requires WordPress 6.8+ and PHP 7.4+. The Blueprint uses WordPress latest and PHP 8.3 in a disposable local instance.

```sh
npm ci
npx playwright install chromium
npm run build
npm test
npm run lint:js
npm run lint:css
npm run demo:build
npm run demo:check
npm run demo:start
```

With the local demo running at `http://127.0.0.1:9400`, run `npm run test:wordpress` in another terminal. These editor tests allow only localhost URLs because they create disposable content. They exercise explicit source selection, saving, reload validation, and the public-page enhancement. Browser fixture tests exercise source eligibility and recovery. PHP smoke assertions exercise the installed plugin, demo pages, preserved core blocks, and saved fallback.

The demo includes a verified extract, the existing Quote and Pullquote, a unique supplementary aside, and separate missing/ambiguous-source examples. [Playground instructions](docs/PLAYGROUND.md) cover the hosted launch and local checks.

## Install the plugin separately

The repository commits its built assets. Copy `article-extract.php`, `build/`, `readme.txt`, and `LICENSE` into `wp-content/plugins/pullquote-demo/`, then activate **Pullquote Demonstrator**. Or run `npm run package` and install `dist/pullquote-demo.zip` using WordPress’s plugin upload screen.

After changing runtime code or demo content, rebuild and run `npm run demo:build` to update the committed, self-contained Blueprint. No production site or application credentials are required. No content conversion runs on activation.

GPL-2.0-or-later. Based on the official `@wordpress/create-block` scaffold.
