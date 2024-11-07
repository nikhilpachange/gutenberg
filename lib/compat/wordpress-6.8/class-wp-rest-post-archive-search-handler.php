<?php
/**
 * REST API: WP_REST_Post_Archive_Search_Handler class
 *
 * @package WordPress
 * @subpackage REST_API
 * @since 6.8.0
 */

/**
 * Core class representing a search handler for Post Archives in the REST API.
 *
 * @since 6.8.0
 *
 * @see WP_REST_Search_Handler
 */
class WP_REST_Post_Archive_Search_Handler extends WP_REST_Search_Handler {

	/**
	 * Constructor.
	 *
	 * @since 6.8.0
	 */
	public function __construct() {
		$this->type = 'post-type-archive';
	}

	/**
	 * Searches post-type archives for a given search request.
	 *
	 * @since 6.8.0
	 *
	 * @param WP_REST_Request $request Full REST request.
	 * @return array {
	 *     Associative array containing found IDs and total count for the matching search results.
	 *
	 *     @type int[]               $ids   Found post archive IDs.
	 *     @type string|int|WP_Error $total Numeric string containing the number of post-type archives found, or WP_Error object.
	 * }
	 */
	public function search_items( WP_REST_Request $request ) {

		$search_term = $request['search'];

		$args = array(
			'public'       => true,
			'has_archive'  => true, // ensure only posts with archive are considered.
			'show_in_rest' => true,
			'_builtin'     => false,
		);

		$post_types = get_post_types( $args, 'objects' );
		$found_ids  = array();

		if ( ! empty( $post_types ) ) {

			foreach ( $post_types as $post_type ) {
				// Check if the search term matches the post type name.
				if ( empty( $search_term ) || stripos( $post_type->name, $search_term ) !== false ) {
					$found_ids[] = $post_type->name;
				}
			}
		}

		$page     = (int) $request['page'];
		$per_page = (int) $request['per_page'];

		return array(
			self::RESULT_IDS   => array_slice( $found_ids, ( $page - 1 ) * $per_page, $per_page ),
			self::RESULT_TOTAL => count( $found_ids ),
		);
	}

	/**
	 * Prepares the search result for a given post archive ID.
	 *
	 * @since 6.8.0
	 *
	 * @param int   $id     Term ID.
	 * @param array $fields Fields to include for the post archive.
	 * @return array {
	 *     Associative array containing fields for the post-archive based on the `$fields` parameter.
	 *
	 *     @type string    $id    Optional. Post Archive Slug.
	 *     @type string $title Optional. Post Archive name.
	 *     @type string $url   Optional. Post Archive permalink URL.
	 * }
	 */
	public function prepare_item( $id, array $fields ) {

		$post_type = get_post_type_object( $id );

		$data = array();

		if ( in_array( WP_REST_Search_Controller::PROP_ID, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_ID ] = $id;
		}
		if ( in_array( WP_REST_Search_Controller::PROP_TITLE, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_TITLE ] = $post_type->labels->archives;
		}
		if ( in_array( WP_REST_Search_Controller::PROP_URL, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_URL ] = get_post_type_archive_link( $id );
		}

		if ( in_array( WP_REST_Search_Controller::PROP_TYPE, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_TYPE ] = $post_type->name;
		}

		return $data;
	}

	/**
	 * Prepares links for the search result of a given ID.
	 *
	 * @since 6.8.0
	 *
	 * @param int $id Item ID.
	 * @return array[] Array of link arrays for the given item.
	 */
	public function prepare_item_links( $id ) {

		$links = array();

		return $links;
	}
}

