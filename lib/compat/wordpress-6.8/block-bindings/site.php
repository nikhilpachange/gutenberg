<?php
/**
 * Post Meta source for the block bindings.
 *
 * @since 6.5.0
 * @package WordPress
 * @subpackage Block Bindings
 */

/**
 * Gets value for Post Meta source.
 *
 * @since 6.5.0
 * @access private
 *
 * @param array    $source_args    Array containing source arguments used to look up the override value.
 *                                 Example: array( "key" => "foo" ).
 * @param WP_Block $block_instance The block instance.
 * @return mixed The value computed for the source.
 */
function _block_bindings_site_get_value( array $source_args, $block_instance ) {
	if ( empty( $source_args['key'] ) ) {
		return null;
	}

	if ( $source_args['key'] === 'title' ) {
		return esc_html( get_bloginfo( 'name' ) );
	}

	return null;
}

/**
 * Registers Post Meta source in the block bindings registry.
 *
 * @since 6.5.0
 * @access private
 */
function _register_block_bindings_site_source() {
	register_block_bindings_source(
		'core/site',
		array(
			'label'              => _x( 'Site', 'block bindings source' ),
			'get_value_callback' => '_block_bindings_site_get_value',
		)
	);
}

add_action( 'init', '_register_block_bindings_site_source' );
