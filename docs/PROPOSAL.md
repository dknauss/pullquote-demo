# Preserve quotation and article-extract intent without rewriting existing content

I propose retaining Quote and Pullquote while testing a more explicit workflow for repeating text from an article. The immediate goal should be to help authors express what the content does, give it appropriate markup, and preserve existing sites. We can then decide how that workflow belongs in core based on evidence from an experiment.

The discussion in [#11610](https://github.com/WordPress/gutenberg/issues/11610), and the restoration of Pullquote in [#75122](https://github.com/WordPress/gutenberg/pull/75122), show that people have established uses for both blocks. [#20606](https://github.com/WordPress/gutenberg/issues/20606) also identifies a longstanding problem with quotation attribution. My open [PR #79494](https://github.com/WordPress/gutenberg/pull/79494) addresses the pullquote element, but the feedback raises an important compatibility question: we cannot recover an author's intent from the block name or its appearance.

There are at least three editorial uses to account for:

- A quotation introduces words from another source, including a person's statement or another work by the same author. A testimonial can be a quotation even when it appears nowhere else on the page.
- An article extract repeats an existing passage to draw attention to it. Its visual placement has an editorial purpose, while the original passage remains part of the article's reading sequence.
- A unique callout provides additional information. A summary, explanation, or sidebar that adds meaning needs to remain available to readers, including people using assistive technology.

These uses can look similar. Choosing a larger type size or a border does not identify which one the author intended.

HTML provides useful guidance. [`blockquote`](https://html.spec.whatwg.org/multipage/grouping-content.html#the-blockquote-element) represents content quoted from another source; its source URL is optional, and attribution belongs outside the element. The [`figure` guidance](https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element) explicitly prefers `aside` for a pullquote that repeats article content. The [`aside` definition](https://html.spec.whatwg.org/multipage/sections.html#the-aside-element) includes pullquotes among its uses. These distinctions give us a basis for appropriate output, but they do not determine how many blocks the editor should offer.

Attribution needs its own correction. [`cite`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-cite-element) identifies a work's title. A person's name should be ordinary text, optionally wrapped for styling. A quotation and its attribution can be associated without putting the attribution inside the quotation. The existing citation field cannot tell us whether its value is a title, a person's name, or something else; preserving that information matters when considering any future conversion.

For repeated content, [DPUB-ARIA's `doc-pullquote` definition](https://www.w3.org/TR/dpub-aria-1.1/#doc-pullquote) requires hiding the presentational duplicate from assistive technologies. General [ARIA guidance for `aria-hidden`](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden) permits hiding redundant visible content only when equivalent meaning and functionality remain exposed. That condition excludes a unique testimonial or a callout containing information unavailable elsewhere. [`role="presentation"`](https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/) leaves inner text exposed, so it does not remove duplicate reading.

I would preserve existing `core/pullquote` content and its default legacy markup during this experiment. A deprecation that keeps old blocks validating solves a serialization problem. Automatically changing their elements when a post is resaved still changes meaning and may affect theme selectors. Validation alone establishes neither editorial correctness nor theme compatibility. Any later conversion should be an explicit author choice with a reviewable result.

That also narrows the accessibility claim. Exposing appropriate semantics gives assistive technologies useful information; it does not guarantee identical announcements from every screen reader. An `aside` does not automatically suppress its text, and its accessibility mapping depends on context. I am not proposing that every repeated passage is a WCAG failure, or that every existing Pullquote should be hidden.

I suggest a phased experiment:

1. **Demonstrate the distinction.** A separate plugin adds `pullquote-demo/article-extract` alongside the unchanged core blocks. The author explicitly selects a whole top-level Paragraph in the same post and copies its plain text into an Article Extract. Any inline formatting and links stay in the canonical source. The demo also includes an ordinary quotation and a unique aside so reviewers can compare their purposes and reading sequences.
2. **Verify the behavior.** Saved extract markup is a visible `aside` containing a paragraph. Front-end JavaScript hides it from the accessibility tree only after finding exactly one matching visible paragraph in the same article scope. A changed, deleted, ambiguous, or hidden source leaves the extract exposed. Authors explicitly recopy changed text; this first version has no persistent source IDs, synchronization system, migrations, or conversions.
3. **Review the editor decision.** Use implementation findings, keyboard testing, manual VoiceOver and NVDA checks, and feedback from authors and theme developers to decide whether core needs a distinct block, a variation, or an explicit semantic setting. These are proposed investigations; the demonstrator is not evidence that those studies have already happened.

The visible saved fallback keeps content available with JavaScript disabled or the plugin deactivated. It also means a duplicate may be exposed before the enhancement runs. Mutation checks can restore exposure when the source changes, but CSS visibility checks have limits. Feeds, REST responses, excerpts, and raw exports need separate policies; the browser enhancement does not deduplicate them.

The first plugin should stay small enough to answer concrete questions: Does selecting existing text make the repeated-content intent clear? Is “Article Extract” understandable? Can authors find the canonical passage and recognize when they need to recopy it? Do the fallback and enhancement behave acceptably in actual reading and editing workflows?

A better distinction between quotation, repetition, and additional content is worth pursuing. An opt-in demonstrator lets us investigate that distinction while preserving the uses people have already built around Quote and Pullquote.
