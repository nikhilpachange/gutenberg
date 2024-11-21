<?php

function gutenberg_rewrite_wp_admin_permalinks() {
	add_rewrite_rule(
		'^wp-admin/design/?(.*)?',
		'wp-admin/site-editor.php?path=$1',
		'top'
	);
	flush_rewrite_rules();
}
add_action( 'init', 'gutenberg_rewrite_wp_admin_permalinks' );

add_action(
	'block_editor_settings_all',
	function ( $settings ) {
		$settings['__experimentalDashboardLink'] = admin_url();
		return $settings;
	}
);

function gutenberg_remove_query_args( $args ) {
	$query_string = $_SERVER['QUERY_STRING'];
	$query        = wp_parse_args( $query_string );
	foreach ( $args as $arg_name ) {
		unset( $query[ $arg_name ] );
	}
	return build_query( $query );
}

function gutenberg_redirect_site_editor_to_design() {
	global $pagenow;
	if ( 'site-editor.php' !== $pagenow || ! strpos( $_SERVER['REQUEST_URI'], 'wp-admin/site-editor.php' ) ) {
		return;
	}

	// The following redirects are for the new permalinks in the site editor.
	if ( isset( $_REQUEST['postType'] ) && 'wp_navigation' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( admin_url( '/design/wp_navigation/' . $_REQUEST['postId'] . '?' . gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_navigation' === $_REQUEST['postType'] && empty( $_REQUEST['postId'] ) ) {
		wp_redirect( admin_url( '/design/navigation?' . gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/wp_global_styles' === $_REQUEST['path'] ) {
		wp_redirect( admin_url( '/design/styles?' . gutenberg_remove_query_args( array( 'path' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'page' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( admin_url( '/design/page?' . gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'page' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( admin_url( '/design/page/' . $_REQUEST['postId'] . '?' . gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( admin_url( '/design/template?' . gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( admin_url( '/design/wp_template/' . $_REQUEST['postId'] . '?' . gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_block' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( admin_url( '/design/pattern?' . gutenberg_remove_query_args( array( 'postType' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_block' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( admin_url( '/design/wp_block/' . $_REQUEST['postId'] . '?' . gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template_part' === $_REQUEST['postType'] && ( empty( $_REQUEST['canvas'] ) || empty( $_REQUEST['postId'] ) ) ) {
		wp_redirect( admin_url( '/design/pattern?' . $_SERVER['QUERY_STRING'] ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['postType'] ) && 'wp_template_part' === $_REQUEST['postType'] && ! empty( $_REQUEST['postId'] ) ) {
		wp_redirect( admin_url( '/design/wp_template_part/' . $_REQUEST['postId'] . '?' . gutenberg_remove_query_args( array( 'postType', 'postId' ) ) ), 301 );
		exit;
	}

	// The following redirects are for backward compatibility with the old site editor URLs.
	if ( isset( $_REQUEST['path'] ) && '/wp_template_part/all' === $_REQUEST['path'] ) {
		wp_redirect( admin_url( '/design/pattern?postType=wp_template_part' ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/page' === $_REQUEST['path'] ) {
		wp_redirect( admin_url( '/design/page' ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/wp_template' === $_REQUEST['path'] ) {
		wp_redirect( admin_url( '/design/template' ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/patterns' === $_REQUEST['path'] ) {
		wp_redirect( admin_url( '/design/pattern' ), 301 );
		exit;
	}

	if ( isset( $_REQUEST['path'] ) && '/navigation' === $_REQUEST['path'] ) {
		wp_redirect( admin_url( '/design/navigation' ), 301 );
		exit;
	}

	wp_redirect( admin_url( '/design' ), 301 );
	exit;
}
add_action( 'admin_init', 'gutenberg_redirect_site_editor_to_design' );
