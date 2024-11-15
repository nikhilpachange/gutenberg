/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../store';
import { unlock } from '../lock-unlock';

/**
 * A hook used to set the editor mode to zoomed out mode, invoking the hook sets the mode.
 *
 * @param {boolean} enabled If we should enter into zoomOut mode or not
 */
export function useZoomOut( enabled = true ) {
	const { setZoomLevel, resetZoomLevel } = unlock(
		useDispatch( blockEditorStore )
	);
	const { isZoomOut } = unlock( useSelect( blockEditorStore ) );

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		const isAlreadyInZoomOut = isZoomOut();
		if ( ! isAlreadyInZoomOut ) {
			setZoomLevel( 'auto-scaled' );
		}

		return () => ! isAlreadyInZoomOut && resetZoomLevel();
	}, [ enabled, isZoomOut, resetZoomLevel, setZoomLevel ] );
}
