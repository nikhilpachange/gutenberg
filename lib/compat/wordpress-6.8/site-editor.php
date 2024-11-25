<?php
/**
 * Updates to the site editor in 6.8.
 *
 * Adds a mandatory dashboard link and redirects old urls.
 *
 * @package gutenberg
 */

add_filter(
	'block_editor_settings_all',
	function ( $settings ) {
		$settings['__experimentalDashboardLink'] = admin_url();
		return $settings;
	}
);

function gutenberg_remove_query_args( $args = array() ) {
	$query_string = $_SERVER['QUERY_STRING'];
	$query        = wp_parse_args( $query_string );
	foreach ( $args as $arg_name ) {
		unset( $query[ $arg_name ] );
	}
	return $query;
}

function gutenberg_get_site_editor_url( $path = '', $query = array() ) {
	$query_string = build_query( array_merge( $query, array( 'p' => $path ) ) );
	$base_url     = admin_url( 'site-editor.php' );
	return $query_string ? $base_url . '?' . $query_string : $base_url;
}

function gutenberg_get_posts_dataviews_url( $path = '', $query = array() ) {
	$query_string = build_query(
		array_merge(
			$query,
			$path ? array(
				'page' => 'gutenberg-posts-dashboard',
				'p'    => $path,
			) : array( 'page' => 'gutenberg-posts-dashboard' )
		)
	);
	$base_url     = admin_url( 'admin.php' );
	return $query_string ? $base_url . '?' . $query_string : $base_url;
}

function gutenberg_redirect_site_editor_to_design() {
	global $pagenow;
	if ( 'site-editor.php' !== $pagenow || isset( $_REQUEST['p'] ) || ! $_SERVER['QUERY_STRING'] ) {
		return;
	}

	// The following redirects are for the new permalinks in the site editor.
	if ( isset( $_REQUEST['postType'] ) && 'wp_navigation' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/wp_navigation/' . $_REQUEST['postId'], gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_navigation' === $_REQUEST['postType'] && empty( $_REQUEST['postId'] ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/navigation', gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/wp_global_styles' === $_REQUEST['path'] ) {
		wp_redirect( gutenberg_get_site_editor_url( '/styles', gutenberg_remove_query_args( array( 'path' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'page' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/page', gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'page' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/page/' . $_REQUEST['postId'], gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/template', gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/wp_template/' . $_REQUEST['postId'], gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_block' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/pattern', gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_block' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/wp_block/' . $_REQUEST['postId'], gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template_part' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/pattern', gutenberg_remove_query_args() ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template_part' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( gutenberg_get_site_editor_url( '/wp_template_part/' . $_REQUEST['postId'], gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	// The following redirects are for backward compatibility with the old site editor URLs.
	if ( isset( $_REQUEST['path'] ) && '/wp_template_part/all' === $_REQUEST['path'] ) {
		wp_redirect( gutenberg_get_site_editor_url( '/pattern?postType=wp_template_part', gutenberg_remove_query_args( 'path' ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/page' === $_REQUEST['path'] ) {
		wp_redirect( gutenberg_get_site_editor_url( '/page', gutenberg_remove_query_args( 'path' ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/wp_template' === $_REQUEST['path'] ) {
		wp_redirect( gutenberg_get_site_editor_url( '/template', gutenberg_remove_query_args( 'path' ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/patterns' === $_REQUEST['path'] ) {
		wp_redirect( gutenberg_get_site_editor_url( '/pattern', gutenberg_remove_query_args( 'path' ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/navigation' === $_REQUEST['path'] ) {
		wp_redirect( gutenberg_get_site_editor_url( '/navigation', gutenberg_remove_query_args( 'path' ) ), 301 );
		exit;
	}

	wp_redirect( gutenberg_get_site_editor_url( '', gutenberg_remove_query_args() ), 301 );
	exit;
}
add_action( 'admin_init', 'gutenberg_redirect_site_editor_to_design' );

function gutenberg_redirect_posts_dataviews_to_post() {
	global $pagenow;
	if (
		'admin.php' !== $pagenow ||
		! isset( $_REQUEST['page'] ) ||
		'gutenberg-posts-dashboard' !== $_REQUEST['page'] ||
		isset( $_REQUEST['p'] )
	) {
		return;
	}

	wp_redirect( gutenberg_get_posts_dataviews_url( '/' ), 301 );
	exit;
}

add_action( 'admin_init', 'gutenberg_redirect_posts_dataviews_to_post' );
