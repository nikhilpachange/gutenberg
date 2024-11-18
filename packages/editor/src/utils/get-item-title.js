/**
 * WordPress dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';

// This function is copied from packages/editor/src/dataviews/actions/utils.ts.

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
