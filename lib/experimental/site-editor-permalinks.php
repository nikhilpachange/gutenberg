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
