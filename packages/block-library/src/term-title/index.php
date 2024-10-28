<?php
/**
 * Server-side rendering of the `core/term-title` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/term-title` block on the server.
 *
 * @since 6.8.0
 *
 * @param array $attributes Block attributes.
 *
 * @return string Returns the title of the current taxonomy term, if available
 */
function render_block_core_term_title( $attributes ) {
	$term_title = '';

	if ( is_category() || is_tag() || is_tax() ) {
		$term_title = single_term_title();
	}

	if ( empty( $term_title ) ) {
		return '';
	}

	$classes = array();
	if ( isset( $attributes['textAlign'] ) ) {
		$classes[] = 'has-text-align-' . $attributes['textAlign'];
	}
	if ( isset( $attributes['style']['elements']['link']['color']['text'] ) ) {
		$classes[] = 'has-link-color';
	}
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );

	return sprintf(
		'<a %1$s>%2$s</a>',
		$wrapper_attributes,
		$title
	);
}

/**
 * Registers the `core/term-title` block on the server.
 *
 * @since 6.8.0
 */
function register_block_core_term_title() {
	register_block_type_from_metadata(
		__DIR__ . '/term-title',
		array(
			'render_callback' => 'render_block_core_term_title',
		)
	);
}
add_action( 'init', 'register_block_core_term_title' );
