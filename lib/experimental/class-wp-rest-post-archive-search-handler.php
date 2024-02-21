<?php
/**
 * REST API: WP_REST_Post_Archive_Search_Handler class
 *
 * @package WordPress
 * @subpackage REST_API
 * @since 6.6.0
 */

/**
 * Core class representing a search handler for Post Archives in the REST API.
 *
 * @since 5.6.0
 *
 * @see WP_REST_Search_Handler
 */
class WP_REST_Post_Archive_Search_Handler extends WP_REST_Search_Handler {

	/**
	 * Constructor.
	 *
	 * @since 5.6.0
	 */
	public function __construct() {
		$this->type = 'post-type-archive';

		$this->subtypes = array( 'post', 'page', 'book', 'product' );
	}

	/**
	 * Searches terms for a given search request.
	 *
	 * @since 5.6.0
	 *
	 * @param WP_REST_Request $request Full REST request.
	 * @return array {
	 *     Associative array containing found IDs and total count for the matching search results.
	 *
	 *     @type int[]               $ids   Found term IDs.
	 *     @type string|int|WP_Error $total Numeric string containing the number of terms in that
	 *                                      taxonomy, 0 if there are no results, or WP_Error if
	 *                                      the requested taxonomy does not exist.
	 * }
	 */
	public function search_items( WP_REST_Request $request ) {
		// $taxonomies = $request[ WP_REST_Search_Controller::PROP_SUBTYPE ];
		// if ( in_array( WP_REST_Search_Controller::TYPE_ANY, $taxonomies, true ) ) {
		// $taxonomies = $this->subtypes;

		$args = array(
			'public'       => true,
			'has_archive'  => true,
			'show_in_rest' => true,
			'_builtin'     => false,
		);

		$post_types = get_post_types( $args, 'objects' );

		$search_results = array();


		foreach ( $post_types as $post_type ) {
			// Check if the search term matches the post type name.
			if ( stripos( $post_type->name, $search_term ) !== false ) {
				$search_results[] = array(
					'post_type'   => $post_type->name,
					'label'       => $post_type->label,
					'description' => $post_type->description,
					'has_archive' => $post_type->has_archive,
					// Add more information as needed.
				);
			}
		}

		unset( $query_args['paged'], $query_args['posts_per_page'] );

		$total = count( $search_results );

		return array(
			self::RESULT_IDS   => $found_ids,
			self::RESULT_TOTAL => $total,
		);
	}

	/**
	 * Prepares the search result for a given term ID.
	 *
	 * @since 5.6.0
	 *
	 * @param int   $id     Term ID.
	 * @param array $fields Fields to include for the term.
	 * @return array {
	 *     Associative array containing fields for the term based on the `$fields` parameter.
	 *
	 *     @type int    $id    Optional. Term ID.
	 *     @type string $title Optional. Term name.
	 *     @type string $url   Optional. Term permalink URL.
	 *     @type string $type  Optional. Term taxonomy name.
	 * }
	 */
	public function prepare_item( $id, array $fields ) {
		$post_type = get_post_type_object( $id );

		$data = array();

		if ( in_array( WP_REST_Search_Controller::PROP_ID, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_ID ] = (int) $id;
		}
		if ( in_array( WP_REST_Search_Controller::PROP_TITLE, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_TITLE ] = $post_type->name;
		}
		if ( in_array( WP_REST_Search_Controller::PROP_URL, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_URL ] = get_post_type_archive_link( $id );
		}
		if ( in_array( WP_REST_Search_Controller::PROP_TYPE, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_TYPE ] = $post_type->slug;
		}

		return $data;
	}

	/**
	 * Prepares links for the search result of a given ID.
	 *
	 * @since 5.6.0
	 *
	 * @param int $id Item ID.
	 * @return array[] Array of link arrays for the given item.
	 */
	public function prepare_item_links( $id ) {
		// $term = get_term( $id );

		$links = array();

		// $item_route = rest_get_route_for_term( $term );
		// if ( $item_route ) {
		// $links['self'] = array(
		// 'href'       => rest_url( $item_route ),
		// 'embeddable' => true,
		// );
		// }

		// $links['about'] = array(
		// 'href' => rest_url( sprintf( 'wp/v2/taxonomies/%s', $term->taxonomy ) ),
		// );

		return $links;
	}
}
