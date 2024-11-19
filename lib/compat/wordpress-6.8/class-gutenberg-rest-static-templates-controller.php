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

class Gutenberg_REST_Templates_Controller extends WP_REST_Posts_Controller {
	protected function handle_status_param( $status, $request ) {
		if ( $status === 'auto-draft' ) {
			return $status;
		}
		return parent::handle_status_param( $status, $request );
	}
	protected function add_additional_fields_schema( $schema ) {
		$schema = parent::add_additional_fields_schema( $schema );
		$schema['properties']['status']['enum'][] = 'auto-draft';
		return $schema;
	}
}

// 2. We maintain the routes for /templates and /templates/lookup. I think we'll
// need to deprecate /templates eventually, but we'll still want to be able to
// lookup the active template for a specific slug, and probably get a list of
// all _active_ templates. For that we can keep /lookup.

function gutenberg_maintain_templates_routes() {
	// This should later be changed in core so we don't need initialise
	// WP_REST_Templates_Controller with a post type.
	global $wp_post_types;
	$wp_post_types['wp_template']->rest_base = 'templates';
	$controller                              = new WP_REST_Templates_Controller( 'wp_template' );
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
	$wp_post_types['_wp_static_template']                          = clone $wp_post_types['wp_template'];
	$wp_post_types['_wp_static_template']->name =                  '_wp_static_template';
	$wp_post_types['_wp_static_template']->rest_base =             '_wp_static_template';
	$wp_post_types['_wp_static_template']->rest_controller_class = 'Gutenberg_REST_Static_Templates_Controller';

	register_setting( 'reading', 'active_templates', array(
		'type' => 'object',
		'show_in_rest' => array(
			'schema' => array(
				'type' => 'object',
				'additionalProperties' => true,
			),
		),
		'default' => array(),
	) );
}
add_action( 'init', 'gutenberg_setup_static_template' );

class Gutenberg_REST_Static_Templates_Controller extends WP_REST_Templates_Controller {
	public function __construct( $post_type ) {
		parent::__construct( $post_type );
	}

	public function register_routes() {
		// Lists all templates.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		// Lists/updates a single template based on the given id.
		register_rest_route(
			$this->namespace,
			// The route.
			sprintf(
				'/%s/(?P<id>%s%s)',
				$this->rest_base,
				/*
				 * Matches theme's directory: `/themes/<subdirectory>/<theme>/` or `/themes/<theme>/`.
				 * Excludes invalid directory name characters: `/:<>*?"|`.
				 */
				'([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)',
				// Matches the template name.
				'[\/\w%-]+'
			),
			array(
				'args'   => array(
					'id' => array(
						'description'       => __( 'The id of a template' ),
						'type'              => 'string',
						'sanitize_callback' => array( $this, '_sanitize_template_id' ),
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'context' => $this->get_context_param( array( 'default' => 'view' ) ),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	public function get_item_schema() {
		$schema = parent::get_item_schema();
		$schema['properties']['is_custom'] = array(
			'description' => __( 'Whether a template is a custom template.' ),
			'type'        => 'bool',
			'context'     => array( 'embed', 'view', 'edit' ),
			'readonly'    => true,
		);
		$schema['properties']['plugin']    = array(
			'type'        => 'string',
			'description' => __( 'Plugin that registered the template.' ),
			'readonly'    => true,
			'context'     => array( 'view', 'edit', 'embed' ),
		);
		return $schema;
	}

	public function get_items( $request ) {
		$query = array();
		if ( isset( $request['area'] ) ) {
			$query['area'] = $request['area'];
		}
		if ( isset( $request['post_type'] ) ) {
			$query['post_type'] = $request['post_type'];
		}
		$template_files        = _get_block_templates_files( 'wp_template', $query );
		foreach ( $template_files as $template_file ) {
			$query_result[] = _build_block_template_result_from_file( $template_file, 'wp_template' );
		}

		// Add templates registered in the template registry. Filtering out the ones which have a theme file.
		$registered_templates          = WP_Block_Templates_Registry::get_instance()->get_by_query( $query );
		$matching_registered_templates = array_filter(
			$registered_templates,
			function ( $registered_template ) use ( $template_files ) {
				foreach ( $template_files as $template_file ) {
					if ( $template_file['slug'] === $registered_template->slug ) {
						return false;
					}
				}
				return true;
			}
		);
		$query_result                  = array_merge( $query_result, $matching_registered_templates );

		$templates = array();
		foreach ( $query_result as $template ) {
			$item        = $this->prepare_item_for_response( $template, $request );
			$item->data['type'] = '_wp_static_template';
			$templates[] = $this->prepare_response_for_collection( $item );
		}

		return rest_ensure_response( $templates );
	}

	public function get_item( $request ) {
		$template = get_block_file_template( $request['id'], 'wp_template' );

		if ( ! $template ) {
			return new WP_Error( 'rest_template_not_found', __( 'No templates exist with that id.' ), array( 'status' => 404 ) );
		}

		$item = $this->prepare_item_for_response( $template, $request );
		// adjust the template type here instead
		$item->data['type'] = '_wp_static_template';
		return rest_ensure_response( $item );
	}
}

function gutenberg_allow_template_slugs_to_be_duplicated( $override, $slug, $post_id, $post_status, $post_type ) {
	return $post_type === 'wp_template' ? $slug : $override;
}

add_filter( 'pre_wp_unique_post_slug', 'gutenberg_allow_template_slugs_to_be_duplicated', 10, 5 );

function gutenberg_pre_get_block_templates( $output, $query, $template_type ) {
	if ( $template_type === 'wp_template' && ! empty( $query['slug__in'] ) ) {
		$active_templates = get_option( 'active_templates', array() );
		$slugs = $query['slug__in'];
		$output = array();
		foreach ( $slugs as $slug ) {
			if ( isset( $active_templates[ $slug ] ) ) {
				if ( $active_templates[ $slug ] !== false ) {	
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
	if ( $taxonomy === 'wp_theme' ) {
		$stylesheet = get_stylesheet();
		return array(
			new WP_Term(
				(object) array(
					'term_id' => 0,
					'name' => $stylesheet,
					'slug' => $stylesheet,
					'taxonomy' => 'wp_theme',
				),
			),
		);
	}
	return $terms;
}
add_filter( 'get_the_terms', 'gutenberg_get_the_terms', 10, 3 );
