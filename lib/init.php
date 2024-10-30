<?php
/**
 * Init hooks.
 *
 * @package gutenberg
 */

/**
 * Gutenberg's Menu.
 *
 * Adds a new wp-admin menu page for the Gutenberg editor.
 *
 * @since 0.1.0
 */
function gutenberg_menu() {
	add_menu_page(
		__( 'Gutenberg', 'gutenberg' ),
		__( 'Gutenberg', 'gutenberg' ),
		'edit_posts',
		'gutenberg',
		'',
		'dashicons-edit'
	);

	add_submenu_page(
		'gutenberg',
		__( 'Demo', 'gutenberg' ),
		__( 'Demo', 'gutenberg' ),
		'edit_posts',
		'gutenberg'
	);

	if ( current_user_can( 'edit_posts' ) ) {
		add_submenu_page(
			'gutenberg',
			__( 'Support', 'gutenberg' ),
			__( 'Support', 'gutenberg' ),
			'edit_posts',
			__( 'https://wordpress.org/support/plugin/gutenberg/', 'gutenberg' )
		);
		add_submenu_page(
			'gutenberg',
			__( 'Documentation', 'gutenberg' ),
			__( 'Documentation', 'gutenberg' ),
			'edit_posts',
			'https://developer.wordpress.org/block-editor/'
		);
	}

	add_submenu_page(
		'gutenberg',
		__( 'Experiments Settings', 'gutenberg' ),
		__( 'Experiments', 'gutenberg' ),
		'manage_options',
		'gutenberg-experiments',
		'the_gutenberg_experiments'
	);
}
add_action( 'admin_menu', 'gutenberg_menu', 9 );


/**
 * This should be implemented in core as a default
 * post type feature.
 *
 */
if ( ! function_exists( 'add_content_support' ) ) {
	/**
	 * Add the 'content' support to core content post types.
	 *
	 * @since 6.8.0
	 */
	function add_content_support() {
		global $wp_post_types;

		foreach ( array_keys( $wp_post_types ) as $post_type ) {
			if ( in_array( $post_type, array( 'post', 'page', 'wp_template' ), true ) ) {
				add_post_type_support( $post_type, 'content' );
			}
		}
	}
	add_action( 'init', 'add_content_support' );
}
