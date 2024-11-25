<?php
/**
 * Suite source for the block bindings.
 *
 * @since 6.8.0
 * @package WordPress
 * @subpackage Block Bindings
 */


if ( ! function_exists( '_block_bindings_site_get_value' ) ) {
	/**
	 * Gets value for Site source.
	 *
	 * @since 6.8.0
	 * @access private
	 *
	 * @param array    $source_args    Array containing source arguments used to look up the override value.
	 *                                 Example: array( "key" => "foo" ).
	 * @param WP_Block $block_instance The block instance.
	 * @return mixed The value computed for the source.
	 */
	function _block_bindings_site_get_value( array $source_args ) {
		if ( empty( $source_args['key'] ) ) {
			return null;
		}

		if ( 'title' === $source_args['key'] ) {
			return esc_html( get_bloginfo( 'name' ) );
		}

		return null;
	}
}


if ( ! function_exists( '_register_block_bindings_site_source' ) ) {
	/**
	 * Registers Site source in the block bindings registry.
	 *
	 * @since 6.8.0
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
}
