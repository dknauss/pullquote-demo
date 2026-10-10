# Article Extract experiment

This brief defines the scope and acceptance criteria for the experimental `pullquote-demo/article-extract` block. It supports the [discussion proposal](PROPOSAL.md); it is not an accessibility certification or a report of completed user research.

The experiment asks whether an explicit repeated-content workflow helps authors distinguish an article extract from a quotation or unique callout. It also tests a conservative front-end enhancement: suppress a duplicate only when its accessible equivalent can be checked in the rendered article, and keep it exposed whenever that check fails.

## Scope

The plugin adds one namespaced block. Core Quote and Pullquote remain available and unchanged. The first version has no block transforms, conversions, migrations, filters that rewrite legacy content, persistent source identifiers, or automatic source synchronization.

An author selects one whole top-level `core/paragraph` in the same post and explicitly copies its plain text into an Article Extract. The source can contain inline emphasis and links: formatting and links are stripped from the duplicate, while the canonical paragraph retains them and their functionality. Embedded images and other objects, nested Paragraphs, and selections spanning part of a paragraph are outside this first experiment. The source paragraph remains unchanged. If its text changes, the author explicitly selects and copies the new text again.

Matching the complete paragraph keeps the prototype small. Persistent identities would introduce questions about copied blocks, duplicated IDs, moved content, and deleted sources. Text matching has a deliberate limitation of its own: if several eligible paragraphs match, the experiment cannot establish one canonical occurrence and keeps the extract exposed.

The demonstration should show four neighboring examples: a normal article passage with its repeated Article Extract, core Quote with unique quoted text, legacy core Pullquote, and a unique aside containing additional information. Labels in the demo explain editorial purpose without claiming the core blocks have been corrected.

## Saved content and authoring

The saved block contains a visible `aside` and a plain-text `p`. It has no saved `aria-hidden` state. For example:

```html
<aside class="wp-block-pullquote-demo-article-extract" data-article-extract="true">
  <p>Editors should make a passage's purpose clear.</p>
</aside>
```

The authoring representation stays available to assistive technologies. Source selection, copy controls, notices, and the extract itself must be reachable and understandable through the keyboard. Editor guidance should explain that this is a repeated passage, that it is a copy rather than a synchronized binding, and that a unique quotation or callout belongs in a different workflow.

Front-end preview is a separate view of the rendering behavior. Do not apply the front-end hiding rule to editor controls or hide the text authors need to review.

Plugin deactivation or JavaScript failure leaves the serialized extract visible. The block may lack its registered editing interface after deactivation, but its content remains in the post. Reenabling the plugin should restore editing without changing core blocks.

## Verification and fallback

Front-end JavaScript checks each extract within its nearest recognized post-content wrapper, entry-content wrapper, or `article`. It does not search the whole document or borrow a matching sentence from another post. A missing recognized scope leaves the extract exposed.

The enhancement may set `aria-hidden="true"` only when:

- The extract retains the expected plain paragraph structure and has no interactive or focusable content.
- Exactly one eligible canonical `p` matches its whole paragraph text under the implementation's documented whitespace normalization.
- That candidate is in the same scope and outside every Article Extract, `aside`, and `blockquote`.
- The candidate and its ancestors pass the implemented visibility and accessibility-exposure checks.

Any failed condition removes the enhancement's hiding state. A mutation observer reevaluates relevant content and restores exposure when the source changes, disappears, becomes ambiguous, or becomes hidden. Unexpected links or controls in an extract also force exposure; `aria-hidden` must not conceal reachable controls. See the [W3C focus-navigation rule](https://www.w3.org/WAI/standards-guidelines/act/rules/6cfa84/).

DOM and computed-style checks are limited evidence of exposure. They cannot prove that every theme, stylesheet change, responsive state, browser, and assistive technology presents the source correctly. CSS-only changes may occur without a relevant DOM mutation. Reviewers must inspect the implemented triggers and record unsupported cases. The enhancement also runs after rendering, so duplicate text can be exposed before verification completes.

The experiment follows the repeated-content case described by [DPUB-ARIA](https://www.w3.org/TR/dpub-aria-1.1/#doc-pullquote) and the requirement to retain equivalent meaning and functionality in [ARIA's hidden-content guidance](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden). It does not add a DPUB role or claim that every `aside` is a complementary landmark. HTML's [pullquote guidance](https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element) informs the element choice. A unique quotation still uses quotation semantics, and [attribution belongs outside `blockquote`](https://html.spec.whatwg.org/multipage/grouping-content.html#the-blockquote-element). A [work title may use `cite`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-cite-element); a speaker's name is ordinary text.

## Acceptance matrix

This table defines expected checks, not their completion status. Record versions, steps, observed behavior, and remaining limitations with test results.

| Case | Expected behavior | Verification |
| --- | --- | --- |
| Valid top-level Paragraph selected | Explicit action copies its complete plain text; original is unchanged | Editor browser test and keyboard review |
| Source has inline emphasis or links | Duplicate contains plain text; canonical formatting and usable links remain | Editor/front-end browser test and keyboard review |
| Embedded object, nested, or partial source | Unsupported source is excluded or rejected with understandable guidance | Editor browser test |
| Saved block before enhancement | Visible `aside > p`; no saved `aria-hidden` | Serialization inspection |
| One matching visible source in scope | Extract is hidden only after verification; source remains exposed | Browser DOM/accessibility inspection and manual AT |
| No source or changed source text | Extract remains exposed | Browser test |
| Two matching eligible paragraphs | Extract remains exposed | Browser test |
| Match only in a different article | Extract remains exposed | Multi-article browser fixture |
| Match inside another extract, aside, or blockquote | Match is excluded; extract remains exposed | Browser test |
| Source or ancestor explicitly hidden | Extract remains exposed | Attribute/style browser fixtures |
| Source removed or changed after verification | Hiding state is removed | Mutation browser test |
| Source becomes ambiguous after verification | Hiding state is removed | Mutation browser test |
| Unexpected link, control, or focusable content added to extract | Extract stays or becomes exposed | Browser test and keyboard check |
| JavaScript disabled or plugin deactivated | Saved text remains visible and present | Local WordPress check |
| Existing Quote and Pullquote | Content, registration, and output stay unchanged | Before/after comparison |
| Unique aside in demo | Text remains exposed independently of Article Extract checks | DOM inspection and manual reading |
| Save and reopen | Block validates; extracted text and source are retained | Local editor round trip |
| Front-end reading with VoiceOver and NVDA | Original and fallback are understandable; verified duplicate handling is evaluated | Manual testing with recorded browser/AT versions |
| Feeds, REST, excerpts, and raw exports | No automatic deduplication or removal is asserted | Output inspection; future policy recorded |

## Local Playground review

Use an ephemeral local WordPress Playground instance with the plugin build installed and a disposable demonstration post. Keep this review isolated from remote WordPress sites. Record the WordPress, Gutenberg where present, browser, and plugin versions so results can be reproduced.

Start with the four editorial examples. Exercise source selection and copying by keyboard, save the post, reopen it, and compare the editor with the front end. Inspect saved HTML before enhancement, the enhanced DOM, and the browser accessibility tree. Then change or remove the source, create a second matching paragraph, hide an ancestor, and introduce an unexpected control into the extract. Check that uncertainty restores exposure.

Repeat the front-end check without JavaScript and after local plugin deactivation. Check a theme with a recognized content wrapper and a fixture without one. Use a multi-article fixture to verify scope isolation. Inspect feed and REST output as separate contexts rather than assuming the browser behavior applies there.

Automated browser assertions can establish matching, mutation, scope, and attribute behavior. They do not establish what a person hears or understands. Manual VoiceOver and NVDA testing, including authoring and front-end reading, is required before drawing production accessibility conclusions. [WAI's interoperability guidance](https://www.w3.org/WAI/ARIA/apg/about/at-support-tables/) also emphasizes testing applications with multiple assistive technologies.

## Learning questions and next decisions

Ask authors to explain the purpose of each example and to create a repeated extract without being told which control to choose. Record misunderstandings, task completion, recovery after source edits, keyboard friction, and reactions to the visible fallback. Review theme behavior and enhancement timing alongside those observations.

Use these findings to consider a separate core block, a variation, or an explicit semantic choice. Partial passages, rich content, synchronization, intentional conversions, and export policies are later questions. No automatic migration of legacy Pullquotes should follow merely from successful block validation or successful matching in this prototype.
