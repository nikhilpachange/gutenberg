<?php

/**
 * Preload theme and global styles paths to avoid flash of variation styles in
 * post editor.
 *
 * @param array                   $paths REST API paths to preload.
 * @param WP_Block_Editor_Context $context Current block editor context.
 * @return array Filtered preload paths.
 */
function gutenberg_block_editor_preload_paths_6_8( $paths, $context ) {
	if ( 'core/edit-site' === $context->name || 'core/edit-post' === $context->name ) {
        $paths[] = '/wp/v2/global-styles/themes/' . get_stylesheet() . '?context=view';
	}
	return array_diff(
        $paths,
        array(
            '/wp/v2/global-styles/themes/' . get_stylesheet(),
        )
    );
}
add_filter( 'block_editor_rest_api_preload_paths', 'gutenberg_block_editor_preload_paths_6_8', 10, 2 );