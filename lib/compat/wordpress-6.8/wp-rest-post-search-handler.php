<?php

add_filter( 'wp_rest_search_handlers', 'gutenberg_rest_post_search_handler' );

class Gutenberg_REST_Post_Search_Handler extends WP_REST_Post_Search_Handler {
	public function prepare_item( $id, $fields ) {
		$data = parent::prepare_item( $id, $fields );
		if ($id === (int) get_option( 'page_on_front' )) {
			$data[ 'is_front_page' ] = true;
		}
		if ($id === (int) get_option( 'page_for_posts' )) {
			$data[ 'is_blog_home' ] = true;
		}
		return $data;
	}
}

function gutenberg_rest_post_search_handler( $handlers ) {
	$handlers[] = new Gutenberg_REST_Post_Search_Handler();
	return $handlers;
}
