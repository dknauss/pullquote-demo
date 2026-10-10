<?php
/** Create the disposable Playground comparison pages. */
require '/wordpress/wp-load.php';
wp_set_current_user( 1 );

function pullquote_demo_seed_paragraph( $html ) {
	return '<!-- wp:paragraph --><p>' . $html . '</p><!-- /wp:paragraph -->';
}

function pullquote_demo_seed_heading( $text ) {
	return '<!-- wp:heading --><h2 class="wp-block-heading">' . esc_html( $text ) . '</h2><!-- /wp:heading -->';
}

function pullquote_demo_seed_extract( $text ) {
	return '<!-- wp:pullquote-demo/article-extract --><aside class="wp-block-pullquote-demo-article-extract" data-article-extract="true"><p>' . esc_html( $text ) . '</p></aside><!-- /wp:pullquote-demo/article-extract -->';
}

function pullquote_demo_seed_status() {
	return '<!-- wp:html --><section class="pullquote-demo-test-status" aria-labelledby="pullquote-demo-status-title"><h2 id="pullquote-demo-status-title">Live test result</h2><p data-pullquote-demo-status aria-live="polite" aria-atomic="true">Waiting for the browser check. If JavaScript is disabled, the repeated panel stays available to readers.</p></section><!-- /wp:html -->';
}

function pullquote_demo_seed_steps( $items ) {
	$blocks = array_map(
		static function ( $item ) {
			return '<!-- wp:list-item --><li>' . $item . '</li><!-- /wp:list-item -->';
		},
		$items
	);
	return '<!-- wp:list {"ordered":true} --><ol class="wp-block-list">' . implode( '', $blocks ) . '</ol><!-- /wp:list -->';
}

function pullquote_demo_seed_page( $slug, $title, $content ) {
	$existing = get_page_by_path( $slug, OBJECT, 'page' );
	$id       = wp_insert_post(
		array(
			'ID'           => $existing ? $existing->ID : 0,
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_name'    => $slug,
			'post_title'   => $title,
			'post_content' => $content,
			'post_author'  => 1,
		),
		true
	);
	if ( is_wp_error( $id ) ) {
		throw new RuntimeException( $id->get_error_message() );
	}
	return $id;
}

$theme = wp_get_theme( 'twentytwentyfive' );
if ( $theme->exists() ) {
	switch_theme( 'twentytwentyfive' );
}

$source = 'A good article keeps its argument in the main reading order. A pull quote repeats a complete passage to draw the eye, while an external quotation adds another voice to the argument.';
$missing = 'This copied passage has no matching paragraph in this page, so the experimental extract remains available to readers.';
$ambiguous = 'Two identical article paragraphs make the intended source ambiguous, so this extract remains available to readers.';

$content = array(
	pullquote_demo_seed_paragraph( 'A quote contributes another voice. An article extract repeats something the article already says. This demonstration gives those intentions separate blocks and keeps WordPress’s existing blocks available.' ),
	pullquote_demo_seed_heading( 'Start here: no installation or account needed' ),
	pullquote_demo_seed_paragraph( 'You are already signed in to this temporary WordPress site. Start with the three checks below; then try a small edit. Follow the steps below even if you are new to the block editor.' ),
	pullquote_demo_seed_status(),
	pullquote_demo_seed_steps(
		array(
			'<strong>Read the live result above.</strong> This page should report “Original found.” The original paragraph and its repeated Article Extract panel both stay visible on screen.',
			'<strong>Compare the fallbacks.</strong> <a href="/?page_id=__MISSING_ID__">Open the missing-source example</a> (expect “Original missing”) and <a href="/?page_id=__AMBIGUOUS_ID__">the ambiguous-source example</a> (expect “More than one original found”). Both keep the repeated panel in the reading order.',
			'<strong>Try an edit.</strong> <a href="__EDITOR_URL__">Edit this comparison article</a>, then follow “Try it in the editor” below. Use the existing paragraph and extract.',
		)
	),
	pullquote_demo_seed_paragraph( '<strong>The panel never disappears from the screen.</strong> The browser result describes whether the repeated panel is marked to be skipped by assistive technology. It does not report a completed screen-reader test. The original paragraph should always remain available.' ),
	pullquote_demo_seed_heading( 'The article’s original paragraph' ),
	pullquote_demo_seed_paragraph( esc_html( $source ) ),
	pullquote_demo_seed_extract( $source ),
	pullquote_demo_seed_paragraph( 'The Article Extract panel above copies the whole original paragraph. The browser checks for exactly one matching, visible paragraph before marking the repeated panel to be skipped by assistive technology. The copy does not update itself when the original changes.' ),
	pullquote_demo_seed_heading( 'Quote: another voice in the argument' ),
	'<!-- wp:quote --><blockquote class="wp-block-quote"><!-- wp:paragraph --><p>Typography is a tool for making the argument easier to follow.</p><!-- /wp:paragraph --></blockquote><!-- /wp:quote -->',
	pullquote_demo_seed_paragraph( '— A fictional editor, quoted for this demonstration.' ),
	pullquote_demo_seed_paragraph( 'This is the existing WordPress Quote block. Its quoted passage belongs in the article’s reading order; the attribution above is a separate paragraph.' ),
	pullquote_demo_seed_heading( 'Pullquote: the existing WordPress block' ),
	'<!-- wp:pullquote --><figure class="wp-block-pullquote"><blockquote><p>A repeated line is a visual invitation to continue reading.</p></blockquote></figure><!-- /wp:pullquote -->',
	pullquote_demo_seed_paragraph( 'This is the existing WordPress Pullquote block, with its original markup and behavior. The demonstration does not replace it or change saved articles.' ),
	pullquote_demo_seed_heading( 'A supplementary aside can add new information' ),
	'<!-- wp:group {"tagName":"aside"} --><aside class="wp-block-group"><!-- wp:paragraph --><p><strong>Editor’s note:</strong> A short supplementary note can be useful without repeating the article. Keep this new information available to every reader.</p><!-- /wp:paragraph --></aside><!-- /wp:group -->',
	pullquote_demo_seed_heading( 'Try it in the editor' ),
	pullquote_demo_seed_paragraph( 'Use the edit link near the top of this page. Keep the existing Article Extract; you do not need to insert another block. Both the original and copied text remain available in the editor.' ),
	pullquote_demo_seed_paragraph( 'If a “Welcome to the editor” dialog opens, select <strong>Close</strong> to reach the article. <strong>View Page</strong> may open the public page in a new tab; return to your editor tab for the next edit.' ),
	pullquote_demo_seed_steps(
		array(
			'Find the paragraph under <strong>The article’s original paragraph</strong>, beginning “A good article keeps…”. Click that ordinary paragraph and append <strong>This is the revised version.</strong> Leave the Article Extract below it unchanged.',
			'Click <strong>Save</strong>, confirm the save if prompted, and open <strong>View Page</strong> from the top toolbar. Read the live result: expect <strong>Original missing</strong>. The old repeated panel still appears and stays in the reading order.',
			'Return to the editor. Click the existing <strong>Article Extract</strong> block directly below the original paragraph. In <strong>Choose a paragraph from this article</strong>, select the revised paragraph beginning “A good article keeps…”. The <strong>Extract text</strong> field should now include your new sentence.',
			'<strong>Save</strong> and <strong>View Page</strong> again. Expect <strong>Original found</strong>. Both copies still appear on screen; the repeated panel is again marked to be skipped by assistive technology.',
			'To restore the sample, remove your added sentence from the original paragraph (or use Undo while editing), then select that paragraph again in the Article Extract. Save and view the page to confirm the match.',
		)
	),
	pullquote_demo_seed_heading( 'Optional: listen with your screen reader' ),
	pullquote_demo_seed_paragraph( 'If you use a screen reader, read through each public page from its beginning. On the comparison page, check that the original paragraph is spoken and whether the repeated panel is skipped. On the missing-source and ambiguous-source pages, check that every original paragraph and the repeated panel are spoken. The live result announces a browser decision; it cannot confirm what your screen reader actually reads.' ),
	pullquote_demo_seed_paragraph( 'A matching paragraph and basic visibility checks are useful evidence, not a universal accessibility guarantee. Custom themes, conditional content, browsers, and assistive technology can change the result. This demonstration does not claim that manual screen-reader testing has passed.' ),
	pullquote_demo_seed_heading( 'Tell us what happened' ),
	pullquote_demo_seed_paragraph( 'Was it clear where to start, how to open the editor, and which paragraph to choose? Did you understand why the repeated panel stayed visible? Note anything confusing, the steps you tried, the live result you saw, and whether it matched your expectation. Include your browser and operating-system versions; if you used a screen reader, include its name and version and what it actually spoke or skipped.' ),
	pullquote_demo_seed_paragraph( 'Disabling JavaScript or deactivating the Article Extract plugin leaves the saved extract visible and available to readers. Feeds, raw exports, and other converters still contain the copied text; this browser demonstration does not implement channel-specific omission.' ),
);

$missing_id = pullquote_demo_seed_page(
	'missing-source',
	'A missing source keeps the extract visible',
	implode(
		"\n\n",
		array(
			pullquote_demo_seed_heading( 'Start here: check the missing original' ),
			pullquote_demo_seed_paragraph( 'No installation or account is needed; this temporary site has already signed you in. Expect the live result to begin “Original missing”. The repeated panel stays visible on screen and available in the reading order.' ),
			pullquote_demo_seed_status(),
			pullquote_demo_seed_paragraph( 'This page deliberately contains no matching article paragraph. The copied passage is therefore available in the ordinary reading order.' ),
			pullquote_demo_seed_extract( $missing ),
			pullquote_demo_seed_paragraph( '<a href="/">Return to the comparison article</a> (expect “Original found”) or <a href="/ambiguous-source/">open the ambiguous-source example</a> (expect “More than one original found”). Every repeated panel remains visible; the live result describes whether assistive technology is told to skip it, not a completed screen-reader test.' ),
			pullquote_demo_seed_paragraph( 'For an optional screen-reader check, read through this page and note whether the copied passage is spoken. In your feedback, include the steps, live result, any confusing instructions, your browser and operating-system versions, and your screen-reader name, version, and actual reading behavior if used.' ),
		)
	)
);

$ambiguous_id = pullquote_demo_seed_page(
	'ambiguous-source',
	'An ambiguous source keeps the extract visible',
	implode(
		"\n\n",
		array(
			pullquote_demo_seed_heading( 'Start here: check two possible originals' ),
			pullquote_demo_seed_paragraph( 'No installation or account is needed; this temporary site has already signed you in. Expect the live result to say “More than one original found.” Both original paragraphs and the repeated panel stay visible and available in the reading order.' ),
			pullquote_demo_seed_status(),
			pullquote_demo_seed_paragraph( 'This page has two matching article paragraphs. The demonstration requires exactly one source and therefore keeps the extract available.' ),
			pullquote_demo_seed_paragraph( esc_html( $ambiguous ) ),
			pullquote_demo_seed_paragraph( esc_html( $ambiguous ) ),
			pullquote_demo_seed_extract( $ambiguous ),
			pullquote_demo_seed_paragraph( '<a href="/">Return to the comparison article</a> (expect “Original found”) or <a href="/missing-source/">open the missing-source example</a> (expect “Original missing”). Every repeated panel remains visible; the live result describes whether assistive technology is told to skip it, not a completed screen-reader test.' ),
			pullquote_demo_seed_paragraph( 'For an optional screen-reader check, read through this page and note whether both original paragraphs and the repeated panel are spoken. In your feedback, include the steps, live result, any confusing instructions, your browser and operating-system versions, and your screen-reader name, version, and actual reading behavior if used.' ),
		)
	)
);

$front_id = pullquote_demo_seed_page( 'article-extract-demo', 'Article extracts, without losing the article', implode( "\n\n", $content ) );
$editor_url = get_edit_post_link( $front_id, 'raw' );
$final_content = str_replace(
	array( '__MISSING_ID__', '__AMBIGUOUS_ID__', '__EDITOR_URL__' ),
	array( (string) $missing_id, (string) $ambiguous_id, esc_url( $editor_url ) ),
	implode( "\n\n", $content )
);
$result = wp_update_post( array( 'ID' => $front_id, 'post_content' => $final_content ), true );
if ( is_wp_error( $result ) ) {
	throw new RuntimeException( $result->get_error_message() );
}

update_option( 'blogname', 'Article Extract demonstration' );
update_option( 'blogdescription', 'Distinct blocks for quoted voices, repeated passages, and supplementary notes.' );
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $front_id );
update_option( 'permalink_structure', '/%postname%/' );
flush_rewrite_rules( false );

echo wp_json_encode( array( 'front_page' => $front_id, 'missing_source' => $missing_id, 'ambiguous_source' => $ambiguous_id ) );
