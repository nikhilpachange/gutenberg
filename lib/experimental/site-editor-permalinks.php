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

function gutenberg_redirect_site_editor_to_design() {
	global $pagenow;
	if ( 'site-editor.php' === $pagenow && strpos( $_SERVER['REQUEST_URI'], 'wp-admin/site-editor.php' ) ) {
		wp_redirect( admin_url( '/design' ), 301 );
		exit;
	}
}
add_action( 'admin_init', 'gutenberg_redirect_site_editor_to_design' );
