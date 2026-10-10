# Try the demonstration in WordPress Playground

[Open the demonstration](https://playground.wordpress.net/?blueprint-url=https%3A%2F%2Fraw.githubusercontent.com%2Fdknauss%2Fpullquote-demo%2Fmain%2Fblueprints%2Fdemo.json)

No installation or account is needed for this browser demonstration. Wait for the temporary site to load; it opens the comparison article and automatically signs you in so you can try its editor. Follow the steps below even if you are new to the block editor.

## Start here

1. Read **Live test result** near the top of the article. Expect **Original found**.
2. Follow **Open the missing-source example**, then **the ambiguous-source example**. Each page states its expected result and links back to the comparison article.
3. Return to the comparison article, follow **Edit this comparison article**, and try the exercise below.

**The repeated panel always stays visible on screen.** The live result reports whether the browser has marked it to be skipped by assistive technology. It does not report a completed screen-reader test. The original paragraph should remain available in every case.

| Page | Expected live result begins with | Expected reading-order decision |
| --- | --- | --- |
| Comparison article | Original found | Keep the original; mark the repeated panel to be skipped by assistive technology. |
| Missing-source example | Original missing | Keep the repeated panel available because no matching original was found. |
| Ambiguous-source example | More than one original found | Keep both originals and the repeated panel available because the browser cannot choose one original. |

If the result says it is waiting, unsupported, or inconclusive, record that wording and the steps you tried. With JavaScript disabled, the saved repeated panel stays available to readers.

## Try a small edit

Use the existing original paragraph and Article Extract. You do not need to insert another block. All editor content remains available to assistive technology.

If a **Welcome to the editor** dialog opens, select **Close**. **View Page** may open the public page in a new tab; return to your editor tab for the next edit.

If an embedded browser shows an empty editor canvas, open the demo link in a regular browser such as Chrome. The authoring checks were run in Chromium; the Codex in-app browser showed a blank canvas during local inspection.

1. Follow **Edit this comparison article**. Find the ordinary paragraph under **The article’s original paragraph**, beginning “A good article keeps…”. Click it and append **This is the revised version.** Leave the Article Extract below it unchanged.
2. Click **Save**, confirm the save if prompted, then open **View Page** from the editor’s top toolbar. Expect a result beginning **Original missing**. The old repeated panel stays on screen and in the reading order.
3. Return to the editor. Click the existing **Article Extract** directly below the original paragraph. In **Choose a paragraph from this article**, select the revised paragraph beginning “A good article keeps…”. Check that **Extract text** includes your new sentence.
4. **Save** and **View Page** again. Expect **Original found**. Both copies remain on screen; the repeated panel is again marked to be skipped by assistive technology.
5. To restore the sample, remove your added sentence from the original paragraph (or use Undo while editing), then select that paragraph again in the Article Extract. Save and view the page to confirm the match.

The extract is a copy, so changing the original does not update it automatically. Choosing the revised paragraph explicitly copies the new text.

## Optional screen-reader check and feedback

If you use a screen reader, read each public page from its beginning. On the comparison article, check that the original paragraph is spoken and whether the repeated panel is skipped. On the missing-source and ambiguous-source pages, check that every original paragraph and the repeated panel are spoken. Compare the actual reading behavior with **Live test result**.

The result describes text matching and basic browser visibility checks. It cannot establish what every browser, theme, or screen reader exposes, and this demonstration does not claim that manual screen-reader testing has passed.

Useful feedback includes:

- Whether you could find the editor, original paragraph, and paragraph selector without help.
- Whether it was clear why the repeated panel stayed visible.
- The steps you tried, the live result, what you expected, and anything confusing.
- Your browser and operating-system versions; if used, your screen reader’s name and version and what it actually spoke or skipped.

The article also compares the existing WordPress Quote and Pullquote blocks and a supplementary aside that adds new information. Those blocks keep their existing behavior. Deactivating the Article Extract plugin leaves its saved copied text visible and available. Feeds, raw REST content, WordPress exports, and other converters also retain the copied text; this experiment does not implement omission for those channels.

## Developer setup

The generated [demo blueprint](../blueprints/demo.json) contains the built Article Extract plugin, separate demo guidance, and the example pages. It installs no additional theme or plugin from a remote repository. It uses an installed Twenty Twenty-Five theme when available, otherwise the Playground’s existing theme.

Node.js 20.18 or newer is required. From this repository:

```sh
npm ci
npm run build
node scripts/create-blueprint.mjs --smoke
node scripts/validate-blueprint.mjs blueprints/demo.json dist/demo-smoke.json
npx --no-install wp-playground-cli run-blueprint --blueprint=dist/demo-smoke.json
npx --no-install wp-playground-cli server --blueprint=blueprints/demo.json
```

These commands use the Playground CLI pinned in this repository’s lockfile. The server opens a disposable SQLite-backed WordPress instance, normally at `http://localhost:9400`. Its landing page is the comparison article, and the Blueprint logs in as the disposable administrator. No production WordPress site is involved.

The hosted link reads the committed, self-contained Blueprint. Rebuild and regenerate it whenever runtime PHP, JavaScript, CSS, demo guidance, or demo content changes. Validate the hosted link in a browser after publishing; a successful local CLI run does not verify the hosted browser environment.

PHP smoke assertions cover installation, content fixtures, original core blocks, and the visible saved fallback. Browser checks must also cover matching, source edits, JavaScript-disabled behavior, plugin deactivation, and block validation. Manual screen-reader testing is still required.

To create a runtime-only plugin ZIP:

```sh
node scripts/package-plugin.mjs
```

The result is `dist/pullquote-demo.zip`. It includes `article-extract.php`, the GPL license, the plugin readme, and built runtime assets, without development dependencies, source maps, the Blueprint, or demo guidance.
