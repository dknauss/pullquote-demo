# Discussion found and argument assessed

Checked on 10 October 2026 against the public WordPress/gutenberg discussion and current source. This document distinguishes the editorial argument from assumptions that would be unsafe to apply automatically to existing content.

## Dan Knauss’s participation

The main discussion is [#11610, “Pullquote: Deprecate the block in favor of Quote block”](https://github.com/WordPress/gutenberg/issues/11610).

| Date (UTC) | Contribution |
| --- | --- |
| [17 December 2025](https://github.com/WordPress/gutenberg/issues/11610#issuecomment-3663379017) | Distinguished a quotation in the argument from a repeated, visually positioned article extract; proposed `aside` and programmatic identification of duplicates. |
| [17 December 2025](https://github.com/WordPress/gutenberg/issues/11610#issuecomment-3666442379) | Supported clarifying the description and explored an HTML-element setting with straightforward presets. |
| [22 December 2025](https://github.com/WordPress/gutenberg/issues/11610#issuecomment-3681195510) | Asked whether an element setting or retaining Pullquote would be the better interim solution. |
| [24 January 2026](https://github.com/WordPress/gutenberg/issues/11610#issuecomment-3795677282) | Explicitly opposed removing the block. |

The removal proposal is no longer the current outcome. [#73228](https://github.com/WordPress/gutenberg/pull/73228) deprecated Pullquote in November 2025; [#75122](https://github.com/WordPress/gutenberg/pull/75122) restored it on 2 February 2026, when #11610 closed as not planned. Current Gutenberg retains the block and its `figure > blockquote` output.

Your [PR #79494](https://github.com/WordPress/gutenberg/pull/79494), opened 24 June 2026, proposes `figure > aside` in place of `figure > blockquote`. It remains open and unmerged. Its compatibility concern is worth addressing explicitly: a deprecation can preserve text and block validation while still changing semantics and theme behavior when an old post is saved. [Feedback on mixed author intent](https://github.com/WordPress/gutenberg/pull/79494#issuecomment-4899208917) is a substantive objection to automatic conversion, rather than a refutation of the editorial distinction.

## Where the argument is strong

A quotation introduces another source’s words into the argument. A true pullquote repeats something already present for visual emphasis. A unique sidebar adds information. Treating these as interchangeable appearances makes authors’ intent harder to express. The [HTML figure guidance](https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element) specifically favors `aside` for a repeated article pullquote, and the [aside definition](https://html.spec.whatwg.org/multipage/sections.html#the-aside-element) includes pullquotes.

Separately, [DPUB-ARIA’s `doc-pullquote`](https://www.w3.org/TR/dpub-aria-1.1/#doc-pullquote) requires hiding a presentational duplicate from assistive technology. This supports investigating repeated reading. It does not support hiding unique content. [General ARIA guidance](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden) requires equivalent meaning and functionality to remain accessible.

## Qualifications that strengthen the proposal

- **Avoid “never blockquote.”** A visually extracted passage can itself quote another source. An `aside` can contain a genuine `blockquote`; the two elements describe different relationships. “Another source” does not require another author.
- **Separate repetition from summary.** A paraphrase or unique summary may add meaning. It should not inherit the duplicate-hiding policy without an equivalence decision.
- **Correct attribution.** HTML puts attribution outside `blockquote`; [`cite`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-cite-element) is for a work’s title, not a person’s name. [#20606](https://github.com/WordPress/gutenberg/issues/20606) remains relevant. The current field cannot distinguish those meanings reliably.
- **An aside does not deduplicate reading.** [HTML-AAM](https://www.w3.org/TR/html-aam-1.0/#el-aside) maps some scoped unnamed asides to generic containers and others to complementary landmarks. Neither mapping suppresses inner text. [`role="presentation"`](https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/) also leaves text available.
- **Do not infer intent from existing blocks.** Users have used Pullquote for external quotations, testimonials, and unique callouts as well as repeated text. Replacing all saved wrappers or adding blanket `aria-hidden` could change meaning or hide essential content.
- **Make export rules explicit.** Browser ARIA does not remove duplicated text from feeds, raw REST responses, WXR, Markdown, or print. Those channels need their own policy.

## Possible solutions

| Approach | Value | Main limitation |
| --- | --- | --- |
| Clarify names/descriptions and attribution guidance | Low-risk improvement for everyone | Does not fix repeated reading or existing markup |
| Add an explicit semantic setting or variation | Reuses editor tools and can offer clear presets | Must distinguish unique information from duplicates; styling alone is insufficient |
| Opt-in Article Extract block/plugin | Makes authors select canonical content and supplies reviewable behavior | Adds a block and requires testing author comprehension and fallback behavior |
| Automatically change all legacy Pullquotes | Broad immediate markup change | Cannot establish intent; can change theme selectors and reading semantics |
| Explicit, previewed legacy conversion later | Lets authors review each change | Requires a compatibility plan and evidence before shipping |

The recommendation is to retain both core blocks, improve descriptions, handle quotation attribution as a separate issue, and use this small plugin to investigate the extract workflow. A future core implementation could be a separate block, variation, or purpose setting; this demonstrator does not settle that product decision.
