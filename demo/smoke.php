<?php
/** Server-side assertions for an ephemeral Playground run. */
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';

function pullquote_demo_smoke_assert( $condition, $message ) {
	if ( ! $condition ) {
		throw new RuntimeException( 'Article Extract smoke check failed: ' . $message );
	}
}

$registry = WP_Block_Type_Registry::get_instance();
$block_name = 'pullquote-demo/article-extract';
pullquote_demo_smoke_assert( is_plugin_active( 'pullquote-demo/article-extract.php' ), 'the demonstration plugin is active' );
pullquote_demo_smoke_assert( is_plugin_active( 'pullquote-demo-guide/demo-guide.php' ), 'the separate test guide is active' );
foreach ( array( $block_name, 'core/quote', 'core/pullquote' ) as $name ) {
	pullquote_demo_smoke_assert( $registry->is_registered( $name ), $name . ' is registered' );
}

$front = get_page_by_path( 'article-extract-demo', OBJECT, 'page' );
$missing = get_page_by_path( 'missing-source', OBJECT, 'page' );
$ambiguous = get_page_by_path( 'ambiguous-source', OBJECT, 'page' );
pullquote_demo_smoke_assert( $front && $missing && $ambiguous, 'all comparison and fallback pages exist' );
foreach ( array( $front, $missing, $ambiguous ) as $example ) {
	pullquote_demo_smoke_assert( 1 === substr_count( $example->post_content, 'data-pullquote-demo-status' ), 'each example has one visible test-result placeholder' );
}
pullquote_demo_smoke_assert( 'page' === get_option( 'show_on_front' ) && (int) $front->ID === (int) get_option( 'page_on_front' ), 'the comparison article is the static front page' );

$blocks = parse_blocks( $front->post_content );
$names = array_column( $blocks, 'blockName' );
foreach ( array( $block_name, 'core/quote', 'core/pullquote', 'core/group' ) as $name ) {
	pullquote_demo_smoke_assert( in_array( $name, $names, true ), 'the article includes ' . $name );
}

$extracts = array_values( array_filter( $blocks, static function ( $block ) use ( $block_name ) {
	return $block_name === $block['blockName'];
} ) );
pullquote_demo_smoke_assert( 1 === count( $extracts ), 'the main article has one experimental extract' );
$saved = $extracts[0]['innerHTML'];
pullquote_demo_smoke_assert( false !== strpos( $saved, 'data-article-extract="true"' ), 'post insertion preserves the extract marker' );
pullquote_demo_smoke_assert( false !== strpos( $saved, '<aside ' ) && false !== strpos( $saved, '<p>' ), 'the saved fallback is an aside with paragraph content' );
pullquote_demo_smoke_assert( false === stripos( $saved, 'aria-hidden' ), 'stored extract markup never hides its content' );

$text = trim( html_entity_decode( wp_strip_all_tags( $saved ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
$canonical = array_values( array_filter( $blocks, static function ( $block ) use ( $text ) {
	return 'core/paragraph' === $block['blockName'] && $text === trim( html_entity_decode( wp_strip_all_tags( $block['innerHTML'] ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
} ) );
pullquote_demo_smoke_assert( 1 === count( $canonical ), 'exactly one ordinary paragraph is the main extract’s source' );

$rendered = do_blocks( $front->post_content );
pullquote_demo_smoke_assert( false !== strpos( $rendered, 'data-article-extract="true"' ), 'rendered content preserves the extract' );
pullquote_demo_smoke_assert( false === stripos( $rendered, 'aria-hidden' ), 'server rendering leaves the fallback visible before browser verification' );
pullquote_demo_smoke_assert( false !== strpos( $rendered, 'class="wp-block-pullquote"' ) && false !== strpos( $rendered, '<blockquote>' ), 'the existing Pullquote retains its original wrapper' );

// Unknown static blocks retain their saved HTML when their registration is absent.
// This is an in-memory check, not plugin deactivation or a database mutation.
unregister_block_type( $block_name );
$fallback = render_block( $extracts[0] );
pullquote_demo_smoke_assert( false !== strpos( $fallback, 'data-article-extract="true"' ) && false !== strpos( $fallback, esc_html( $text ) ), 'saved content survives absent block registration' );
pullquote_demo_smoke_assert( false === stripos( $fallback, 'aria-hidden' ), 'the absent-plugin fallback remains exposed' );
register_block_type( WP_PLUGIN_DIR . '/pullquote-demo/build/article-extract' );

echo wp_json_encode( array(
	'smoke' => 'passed',
	'wordpress' => get_bloginfo( 'version' ),
	'php' => PHP_VERSION,
	'theme' => get_stylesheet(),
	'checks' => array( 'plugin and separate guide active', 'three block types registered', 'three guided demo pages', 'static front page', 'one canonical paragraph', 'core blocks preserved', 'visible saved and rendered fallback', 'fallback without block registration' ),
) );
