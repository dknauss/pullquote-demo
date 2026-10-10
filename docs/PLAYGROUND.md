# Run the demonstration in WordPress Playground

The generated [demo blueprint](../blueprints/demo.json) contains the built plugin and its example pages. It installs no additional theme or plugin from a remote repository. It uses an installed Twenty Twenty-Five theme when available, otherwise the Playground’s existing theme.

Node.js 20.18 or newer is required. From this repository:

```sh
npm install
npm run build
node scripts/create-blueprint.mjs --smoke
node scripts/validate-blueprint.mjs blueprints/demo.json dist/demo-smoke.json
npx --no-install wp-playground-cli run-blueprint --blueprint=dist/demo-smoke.json
npx --no-install wp-playground-cli server --blueprint=blueprints/demo.json
```

These commands use the Playground CLI pinned in this repository’s lockfile. The server opens a disposable SQLite-backed WordPress instance, normally at `http://localhost:9400`. Its landing page is the comparison article, and the Blueprint logs in as the disposable administrator. The article links directly to its editor and the missing-source and ambiguous-source fixtures. No production WordPress site is involved.

For a hosted browser demonstration, open:

[Try in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https%3A%2F%2Fraw.githubusercontent.com%2Fdknauss%2Fpullquote-demo%2Fmain%2Fblueprints%2Fdemo.json)

The link reads the committed, self-contained Blueprint. Rebuild and regenerate it whenever runtime PHP, JavaScript, CSS, or demo content changes. Validate the hosted link in a browser after publishing; a successful local CLI run does not verify the hosted browser environment.

To create a runtime-only plugin ZIP:

```sh
node scripts/package-plugin.mjs
```

The result is `dist/pullquote-demo.zip`. It includes `article-extract.php`, the GPL license, the plugin readme, and built runtime assets, without development dependencies, source maps, or the Blueprint.

## What to inspect

- The original article Paragraph remains accessible. Its single matching Article Extract is excluded from assistive technology only after the browser’s matching and basic visibility checks.
- The existing WordPress Quote and Pullquote keep their own markup and behavior.
- A supplementary Group with an `aside` element supplies new information and stays accessible.
- The missing-source and ambiguous-source fixtures leave their extract content exposed.
- Delete or change a source Paragraph, save, and inspect the public page: a mismatched extract stays exposed until recopied.
- Disable JavaScript, or deactivate the demonstration plugin: the saved extract still appears as a visible aside.
- Open the editor, insert an Article Extract block, and use “Choose a paragraph from this article” to copy an ordinary Paragraph. No part of the editor is hidden from assistive technology.

PHP smoke assertions cover installation, content fixtures, original core blocks, and the visible saved fallback. Browser checks must also cover matching, source edits, JavaScript-disabled behavior, plugin deactivation, and block validation. Manual screen-reader testing is still required; text matching and basic DOM visibility cannot establish accessibility-tree behavior for every theme.

Feeds, raw REST content, WordPress exports, and other converters contain the saved copied text. The demonstrator does not implement channel-specific omission or a live connection to an original paragraph.
