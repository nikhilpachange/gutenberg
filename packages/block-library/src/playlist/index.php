<?php
/**
 * Server-side rendering of the `core/playlist` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/playlist` block on server.
 *
 * @since 6.8.0
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the Playlist.
 */
function render_block_core_playlist( $attributes, $content ) {
	if ( empty( $attributes['tracks'] ) ) {
		return '';
	}

	/**
	 * Assign the current track information to variables.
	 */
	$current_id         = '';
	$tracklist_position = null;

	foreach ( $attributes['tracks'] as $index => $track ) {
		if ( isset( $track['id'] ) && ! empty( $track['id'] ) ) {
			$current_id         = $track['id'];
			$tracklist_position = $index;
			break;
		}
	}

	/**
	 * Return early if no valid track ID is found.
	 * This can happen if the user deleted all tracks but kept an empty inner block, such as the media upload placeholder.
	 */
	if ( empty( $current_id ) ) {
		return '';
	}

	wp_enqueue_script_module( '@wordpress/block-library/playlist/view' );

	$current_title  = isset( $attributes['tracks'][ $tracklist_position ]['title'] ) ? $attributes['tracks'][ $tracklist_position ]['title'] : '';
	$current_album  = isset( $attributes['tracks'][ $tracklist_position ]['album'] ) ? $attributes['tracks'][ $tracklist_position ]['album'] : '';
	$current_artist = isset( $attributes['tracks'][ $tracklist_position ]['artist'] ) ? $attributes['tracks'][ $tracklist_position ]['artist'] : '';
	$current_url    = isset( $attributes['tracks'][ $tracklist_position ]['url'] ) ? $attributes['tracks'][ $tracklist_position ]['url'] : '';
	$current_image  = isset( $attributes['tracks'][ $tracklist_position ]['image'] ) ? $attributes['tracks'][ $tracklist_position ]['image'] : '';
	$aria_label     = $current_title;

	if ( $current_title && $current_artist && $current_album ) {
		$aria_label = sprintf(
			/* translators: %1$s: track title, %2$s artist name, %3$s: album name. */
			_x( '%1$s by %2$s from the album %3$s', 'track title, artist name, album name' ),
			$current_title,
			$current_artist,
			$current_album
		);
	}

	wp_interactivity_state(
		'core/playlist',
		array(
			'currentID'     => $current_id,
			'currentURL'    => $current_url,
			'currentTitle'  => $current_title,
			'currentAlbum'  => $current_album,
			'currentArtist' => $current_artist,
			'currentImage'  => $current_image,
			'ariaLabel'     => $aria_label,
		)
	);

	// Bind the image source
	$bind_image = new WP_HTML_Tag_Processor( $content );
	$bind_image->next_tag( 'img' );
	$bind_image->set_attribute( 'data-wp-bind--src', 'state.currentImage' );
	$content = $bind_image->get_updated_html();

	$processor = new WP_HTML_Tag_Processor( $content );
	$processor->next_tag( 'figure' );
	$processor->set_attribute( 'data-wp-interactive', 'core/playlist' );

	$processor->next_tag( 'span', 'wp-block-playlist__item-title' );
	$processor->set_attribute( 'data-wp-text', 'state.currentTitle' );
	$processor->next_tag( 'span', 'wp-block-playlist__item-artist' );
	$processor->set_attribute( 'data-wp-text', 'state.currentArtist' );
	$processor->next_tag( 'span', 'wp-block-playlist__item-album' );
	$processor->set_attribute( 'data-wp-text', 'state.currentAlbum' );

	$processor->next_tag( 'audio' );
	$processor->set_attribute( 'data-wp-bind--src', 'state.currentURL' );
	$processor->set_attribute( 'data-wp-bind--aria-label', 'state.ariaLabel' );
	$processor->set_attribute( 'data-wp-watch', 'callbacks.init' );

	while ( $processor->next_tag( 'button' ) ) {
		$context = $processor->get_attribute( 'data-wp-context' );
		$context = json_decode( $context, true ) ? json_decode( $context, true ) : array();
		if ( isset( $context['trackID'] ) && $context['trackID'] === $current_id ) {
			$processor->set_attribute( 'aria-current', 'true' );
		}
	}

	return $processor->get_updated_html();
}

/**
 * Registers the `core/playlist` block on server.
 *
 * @since 6.8.0
 */
function register_block_core_playlist() {
	register_block_type_from_metadata(
		__DIR__ . '/playlist',
		array(
			'render_callback' => 'render_block_core_playlist',
		)
	);
}
add_action( 'init', 'register_block_core_playlist' );
