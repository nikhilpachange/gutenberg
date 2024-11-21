<?php

// How does this work?
// 1. For wp_template, we remove the custom templates controller, so it becomes
// and normals posts endpoint.

function gutenberg_modify_wp_template_post_type_args( $args, $post_type ) {
	if ( 'wp_template' === $post_type ) {
		$args['rest_base']                       = 'wp_template';
		$args['rest_controller_class']           = 'Gutenberg_REST_Templates_Controller';
		$args['autosave_rest_controller_class']  = null;
		$args['revisions_rest_controller_class'] = null;
	}
	return $args;
}

add_filter( 'register_post_type_args', 'gutenberg_modify_wp_template_post_type_args', 10, 2 );

// 2. We maintain the routes for /templates and /templates/lookup. I think we'll
// need to deprecate /templates eventually, but we'll still want to be able to
// lookup the active template for a specific slug, and probably get a list of
// all _active_ templates. For that we can keep /lookup.

function gutenberg_maintain_templates_routes() {
	// This should later be changed in core so we don't need initialise
	// WP_REST_Templates_Controller with a post type.
	global $wp_post_types;
	$wp_post_types['wp_template']->rest_base = 'templates';
	$controller                              = new Gutenberg_REST_Templates_Controller_6_7( 'wp_template' );
	$wp_post_types['wp_template']->rest_base = 'wp_template';
	$controller->register_routes();
}
add_action( 'rest_api_init', 'gutenberg_maintain_templates_routes' );

// 3. Even though this doesn't need to exist as a post type, we need routes to
// get that raw static templates from themes and plugins. I did not want to
// templates for back-compat. Also I registered these as a post type route
// because right now the EditorProvider assumes templates are posts.

function gutenberg_setup_static_template() {
	global $wp_post_types;
	$wp_post_types['_wp_static_template']                        = clone $wp_post_types['wp_template'];
	$wp_post_types['_wp_static_template']->name                  = '_wp_static_template';
	$wp_post_types['_wp_static_template']->rest_base             = '_wp_static_template';
	$wp_post_types['_wp_static_template']->rest_controller_class = 'Gutenberg_REST_Static_Templates_Controller';

	register_setting(
		'reading',
		'active_templates',
		array(
			'type'         => 'object',
			'show_in_rest' => array(
				'schema' => array(
					'type'                 => 'object',
					'additionalProperties' => true,
				),
			),
			'default'      => array(),
		)
	);
}
add_action( 'init', 'gutenberg_setup_static_template' );

function gutenberg_allow_template_slugs_to_be_duplicated( $override, $slug, $post_id, $post_status, $post_type ) {
	return 'wp_template' === $post_type ? $slug : $override;
}

add_filter( 'pre_wp_unique_post_slug', 'gutenberg_allow_template_slugs_to_be_duplicated', 10, 5 );

function gutenberg_pre_get_block_templates( $output, $query, $template_type ) {
	if ( 'wp_template' === $template_type && ! empty( $query['slug__in'] ) ) {
		$active_templates = get_option( 'active_templates', array() );
		$slugs            = $query['slug__in'];
		$output           = array();
		foreach ( $slugs as $slug ) {
			if ( isset( $active_templates[ $slug ] ) ) {
				if ( false !== $active_templates[ $slug ] ) {
					$post = get_post( $active_templates[ $slug ] );
					if ( $post ) {
						$output[] = _build_block_template_result_from_post( $post );
					}
				} else {
					// Deactivated template, fall back to next slug.
					$output[] = array();
				}
			}
		}
		if ( empty( $output ) ) {
			$output = null;
		}
	}
	return $output;
}

add_filter( 'pre_get_block_templates', 'gutenberg_pre_get_block_templates', 10, 3 );

// Bypass the terms check in _build_block_template_result_from_post.
function gutenberg_get_the_terms( $terms, $object_id, $taxonomy ) {
	if ( 'wp_theme' === $taxonomy ) {
		$stylesheet = get_stylesheet();
		return array(
			new WP_Term(
				(object) array(
					'term_id'  => 0,
					'name'     => $stylesheet,
					'slug'     => $stylesheet,
					'taxonomy' => 'wp_theme',
				)
			),
		);
	}
	return $terms;
}
add_filter( 'get_the_terms', 'gutenberg_get_the_terms', 10, 3 );

// We need to set the theme for the template when it's created. See:
// https://github.com/WordPress/wordpress-develop/blob/b2c8d8d2c8754cab5286b06efb4c11e2b6aa92d5/src/wp-includes/rest-api/endpoints/class-wp-rest-templates-controller.php#L571-L578
function gutenberg_set_active_template_theme( $changes, $request ) {
	$template = $request['id'] ? get_block_template( $request['id'], 'wp_template' ) : null;
	if ( $template ) {
		return $changes;
	}
	$changes->tax_input = array(
		'wp_theme' => isset( $request['theme'] ) ? $request['theme'] : get_stylesheet(),
	);
	return $changes;
}

add_action( 'rest_pre_insert_wp_template', 'gutenberg_set_active_template_theme', 10, 2 );
