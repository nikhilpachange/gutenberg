<?php
/**
 * Temporary compatibility shims for block APIs present in Gutenberg.
 *
 * @package gutenberg
 */

/**
 * Replace the `__default` block bindings attribute with the full list of supported
 * attribute names for pattern overrides.
 *
 * @param array $parsed_block The full block, including name and attributes.
 *
 * @return string The parsed block with default binding replace.
 */
function gutenberg_replace_pattern_override_default_binding( $parsed_block ) {
	$supported_block_attrs = array(
		'core/paragraph' => array( 'content' ),
		'core/heading'   => array( 'content' ),
		'core/image'     => array( 'id', 'url', 'title', 'alt' ),
		'core/button'    => array( 'url', 'text', 'linkTarget', 'rel' ),
	);

	$bindings = $parsed_block['attrs']['metadata']['bindings'] ?? array();
	if (
		isset( $bindings['__default']['source'] ) &&
		'core/pattern-overrides' === $bindings['__default']['source']
	) {
		$updated_bindings = array();

		// Build an binding array of all supported attributes.
		// Note that this also omits the `__default` attribute from the
		// resulting array.
		if ( ! isset( $supported_block_attrs[ $parsed_block['blockName'] ] ) ) {
			// get block type
			$block_registry        = WP_Block_Type_Registry::get_instance();
			$block_type            = $block_registry->get_registered( $parsed_block['blockName'] );
			$attribute_definitions = $block_type->attributes;

			foreach ( $attribute_definitions as $attribute_name => $attribute_definition ) {
				// Include the attribute in the updated bindings if the role is set to 'content'.
				if ( isset( $attribute_definition['role'] ) && 'content' === $attribute_definition['role'] ) {
					$updated_bindings[ $attribute_name ] = isset( $bindings[ $attribute_name ] )
						? $bindings[ $attribute_name ]
						: array( 'source' => 'core/pattern-overrides' );
				}
			}
		} else {
			foreach ( $supported_block_attrs[ $parsed_block['blockName'] ] as $attribute_name ) {
				// Retain any non-pattern override bindings that might be present.
				$updated_bindings[ $attribute_name ] = isset( $bindings[ $attribute_name ] )
					? $bindings[ $attribute_name ]
					: array( 'source' => 'core/pattern-overrides' );
			}
		}
		$parsed_block['attrs']['metadata']['bindings'] = $updated_bindings;
	}

	return $parsed_block;
}

add_filter( 'render_block_data', 'gutenberg_replace_pattern_override_default_binding', 10, 1 );
