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
	pullquote_demo_seed_heading( 'The article’s original paragraph' ),
	pullquote_demo_seed_paragraph( esc_html( $source ) ),
	pullquote_demo_seed_extract( $source ),
	pullquote_demo_seed_paragraph( 'The panel above copies the whole paragraph. In this controlled example, the frontend checks for one visible matching paragraph before excluding the repeated panel from assistive technology. The original paragraph remains in the reading order.' ),
	pullquote_demo_seed_heading( 'Quote: another voice in the argument' ),
	'<!-- wp:quote --><blockquote class="wp-block-quote"><!-- wp:paragraph --><p>Typography is a tool for making the argument easier to follow.</p><!-- /wp:paragraph --></blockquote><!-- /wp:quote -->',
	pullquote_demo_seed_paragraph( '— A fictional editor, quoted for this demonstration.' ),
	pullquote_demo_seed_paragraph( 'This is the existing WordPress Quote block. Its quoted passage belongs in the article’s reading order; the attribution above is a separate paragraph.' ),
	pullquote_demo_seed_heading( 'Pullquote: the existing WordPress block' ),
	'<!-- wp:pullquote --><figure class="wp-block-pullquote"><blockquote><p>A repeated line is a visual invitation to continue reading.</p></blockquote></figure><!-- /wp:pullquote -->',
	pullquote_demo_seed_paragraph( 'This is the existing WordPress Pullquote block, with its original markup and behavior. The demonstration does not replace it or change saved articles.' ),
	pullquote_demo_seed_heading( 'A supplementary aside can add new information' ),
	'<!-- wp:group {"tagName":"aside"} --><aside class="wp-block-group"><!-- wp:paragraph --><p><strong>Editor’s note:</strong> A short supplementary note can be useful without repeating the article. Keep this new information available to every reader.</p><!-- /wp:paragraph --></aside><!-- /wp:group -->',
	pullquote_demo_seed_heading( 'Try the visible fallbacks' ),
	pullquote_demo_seed_paragraph( '<a href="/?page_id=__MISSING_ID__">Open the missing-source example</a> or <a href="/?page_id=__AMBIGUOUS_ID__">the ambiguous-source example</a>. Both extracts stay available to assistive technology.' ),
	pullquote_demo_seed_paragraph( 'Disabling JavaScript or deactivating this demonstration plugin also leaves the saved extract visible. Feeds, raw exports, and other converters still contain the copied text; this browser demonstration does not implement channel-specific omission.' ),
	pullquote_demo_seed_heading( 'Try it in the editor' ),
	pullquote_demo_seed_paragraph( '<a href="__EDITOR_URL__">Edit this comparison article</a>. Insert an Article Extract block, then use “Choose a paragraph from this article” to copy an ordinary Paragraph. The editor keeps both the paragraph and extract accessible.' ),
	pullquote_demo_seed_paragraph( 'Change or delete the original paragraph, save the page, and view it again. The copied extract stays visible when its source no longer matches. Copy the revised paragraph again if you want a new matching extract.' ),
	pullquote_demo_seed_paragraph( 'A matching rendered paragraph and basic visibility checks are useful evidence, not a universal accessibility guarantee. Browser and screen-reader testing still matters, especially with custom themes or conditional content.' ),
);

$missing_id = pullquote_demo_seed_page(
	'missing-source',
	'A missing source keeps the extract visible',
	implode(
		"\n\n",
		array(
			pullquote_demo_seed_paragraph( 'This page deliberately contains no matching article paragraph. The copied passage is therefore available in the ordinary reading order.' ),
			pullquote_demo_seed_extract( $missing ),
			pullquote_demo_seed_paragraph( '<a href="/">Return to the comparison article</a>. Add an ordinary paragraph containing exactly the extract’s text to try a match, or leave the source absent to inspect the fallback.' ),
		)
	)
);

$ambiguous_id = pullquote_demo_seed_page(
	'ambiguous-source',
	'An ambiguous source keeps the extract visible',
	implode(
		"\n\n",
		array(
			pullquote_demo_seed_paragraph( 'This page has two matching article paragraphs. The demonstration requires exactly one source and therefore keeps the extract available.' ),
			pullquote_demo_seed_paragraph( esc_html( $ambiguous ) ),
			pullquote_demo_seed_paragraph( esc_html( $ambiguous ) ),
			pullquote_demo_seed_extract( $ambiguous ),
			pullquote_demo_seed_paragraph( '<a href="/">Return to the comparison article</a>. Remove one of the two original paragraphs to try a single-source match.' ),
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
