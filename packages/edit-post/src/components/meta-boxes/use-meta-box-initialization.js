/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../store';

/**
 * Initializes postboxes (wp core script) and meta box saving for all meta box locations.
 *
 * @param { boolean } enabled
 */
export default ( enabled ) => {
	const { areInitialized, isEditorReady, hasAny } = useSelect(
		( select ) => {
			if ( ! enabled ) {
				return {};
			}
			const { __unstableIsEditorReady } = select( editorStore );
			const { areMetaBoxesInitialized, getMetaBoxesPerLocation } =
				select( editPostStore );
			return {
				areInitialized: areMetaBoxesInitialized(),
				isEditorReady: __unstableIsEditorReady(),
				hasAny:
					getMetaBoxesPerLocation( 'normal' ).length > 0 ||
					getMetaBoxesPerLocation( 'advanced' ).length > 0 ||
					getMetaBoxesPerLocation( 'side' ).length > 0,
			};
		},
		[ enabled ]
	);
	const { initializeMetaBoxes } = useDispatch( editPostStore );
	useEffect( () => {
		if ( isEditorReady && hasAny && ! areInitialized ) {
			initializeMetaBoxes();
		}
	}, [ isEditorReady, hasAny, areInitialized, initializeMetaBoxes ] );
};
