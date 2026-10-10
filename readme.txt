=== Pullquote Demonstrator ===
Contributors: dknauss
Tags: block, accessibility, pullquote
Requires at least: 6.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An experimental Article Extract block for discussing pullquote semantics and reading order.

== Description ==

Insert Article Extract and choose a whole top-level Paragraph from the same article. The block copies plain text into a visible aside. The original keeps its formatting and links. Existing WordPress Quote and Pullquote blocks remain available and unchanged.

Frontend JavaScript excludes the extract from assistive technology only after finding exactly one matching visible original paragraph in the same article scope. Missing, changed, hidden, ambiguous, or unsupported sources leave it exposed. Supported content and visibility changes trigger another check.

Saved HTML never hides the extract. Without JavaScript or this plugin, its text remains available. This is a discussion demonstrator, not an accessibility conformance claim or a production migration. Manual screen-reader testing remains outstanding. Feeds and exports still contain copied text.

Source, proposal, and Playground demonstration: https://github.com/dknauss/pullquote-demo

== Installation ==

1. Upload the generated pullquote-demo.zip via Plugins > Add New > Upload Plugin, or copy the plugin runtime into wp-content/plugins/pullquote-demo.
2. Activate Pullquote Demonstrator.
3. Insert Article Extract into an article with a Paragraph, then select its source.

== Changelog ==

= 0.1.0 =
* Experimental Article Extract, conservative duplicate verification, and a self-contained Playground comparison.
