<?php
/**
 * Server-side rendering of the `core/query-no-results` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/query-no-results` block on the server.
 *
 * @since 6.0.0
 *
 * @global WP_Query $wp_query WordPress Query object.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string Returns the wrapper for the no results block.
 */
function render_block_core_query_no_results( $attributes, $content, $block ) {
	if ( empty( trim( $content ) ) ) {
		return '';
	}

	$page_key            = isset( $block->context['queryId'] ) ? 'query-' . $block->context['queryId'] . '-page' : 'query-page';
	$enhanced_pagination = isset( $block->context['enhancedPagination'] ) && $block->context['enhancedPagination'];
	$page                = empty( $_GET[ $page_key ] ) ? 1 : (int) $_GET[ $page_key ];

	// Add check for instant search experiment and search query
	$gutenberg_experiments  = get_option( 'gutenberg-experiments' );
	$instant_search_enabled = isset( $gutenberg_experiments['gutenberg-search-query-block'] ) && $gutenberg_experiments['gutenberg-search-query-block'];
	$search_query_global    = empty( $_GET['instant-search'] ) ? '' : sanitize_text_field( $_GET['instant-search'] );
	$search_query_direct    = '';

	// Get the search query parameter for the specific query if it exists
	if ( isset( $block->context['queryId'] ) ) {
		$search_param = 'instant-search-' . $block->context['queryId'];
		if ( ! empty( $_GET[ $search_param ] ) ) {
			$search_query_direct = sanitize_text_field( $_GET[ $search_param ] );
		}
	}

	// Override the custom query with the global query if needed.
	$use_global_query = ( isset( $block->context['query']['inherit'] ) && $block->context['query']['inherit'] );
	if ( $use_global_query ) {
		global $wp_query;
		$query = $wp_query;

		// If instant search is enabled and we have a search query, run a new query
		if ( $enhanced_pagination && $instant_search_enabled && ! empty( $search_query_global ) ) {
			$args  = array_merge( $wp_query->query_vars, array( 's' => $search_query_global ) );
			$query = new WP_Query( $args );
		}
	} else {
		$query_args = build_query_vars_from_query_block( $block, $page );

		// Add search parameter if instant search is enabled and search query exists
		if ( $enhanced_pagination && $instant_search_enabled && ! empty( $search_query_direct ) ) {
			$query_args['s'] = $search_query_direct;
		}

		$query = new WP_Query( $query_args );
	}

	if ( $query->post_count > 0 ) {
		return '';
	}

	$classes            = ( isset( $attributes['style']['elements']['link']['color']['text'] ) ) ? 'has-link-color' : '';
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => $classes ) );
	return sprintf(
		'<div %1$s>%2$s</div>',
		$wrapper_attributes,
		$content
	);
}

/**
 * Registers the `core/query-no-results` block on the server.
 *
 * @since 6.0.0
 */
function register_block_core_query_no_results() {
	register_block_type_from_metadata(
		__DIR__ . '/query-no-results',
		array(
			'render_callback' => 'render_block_core_query_no_results',
		)
	);
}
add_action( 'init', 'register_block_core_query_no_results' );
