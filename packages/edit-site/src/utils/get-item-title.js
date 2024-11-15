/**
 * WordPress dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';

// TODO: This function is duplicated in packages/editor/src/dataviews/actions/utils.ts,
// so they should be consolidated.

export function getItemTitle( item ) {
	if ( typeof item.title === 'string' ) {
		return decodeEntities( item.title );
	}
	if ( item.title && 'rendered' in item.title ) {
		return decodeEntities( item.title.rendered );
	}
	if ( item.title && 'raw' in item.title ) {
		return decodeEntities( item.title.raw );
	}
	return '';
}
