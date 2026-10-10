<?php
/**
 * Plugin Name: Article Extract Demo Guide
 * Description: Visible browser-check feedback for the disposable Playground examples.
 * Version: 0.1.0
 * License: GPL-2.0-or-later
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter(
	'body_class',
	function ( $classes ) {
		if ( is_page( array( 'article-extract-demo', 'missing-source', 'ambiguous-source' ) ) ) {
			$classes[] = 'pullquote-demo-guided-page';
		}
		return $classes;
	}
);

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! is_page( array( 'article-extract-demo', 'missing-source', 'ambiguous-source' ) ) ) {
			return;
		}
		wp_enqueue_style( 'pullquote-demo-guide', plugins_url( 'guide.css', __FILE__ ), array(), '0.1.0' );
		wp_enqueue_script( 'pullquote-demo-guide', plugins_url( 'guide.js', __FILE__ ), array(), '0.1.0', true );
	}
);
