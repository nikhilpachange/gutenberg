/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';

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

	const isZoomedOut = isZoomOut();
	// If starting from zoom out engaged, do not control zoom level for the user.
	const controlZoomLevel = useRef( ! isZoomedOut );

	useEffect( () => {
		if ( ! enabled || ! controlZoomLevel.current ) {
			return;
		}
		const isAlreadyInZoomOut = isZoomOut();
		if ( ! isAlreadyInZoomOut ) {
			setZoomLevel( 'auto-scaled' );
		}

		return () => {
			return (
				controlZoomLevel.current &&
				! isAlreadyInZoomOut &&
				resetZoomLevel()
			);
		};
	}, [ enabled, isZoomOut, resetZoomLevel, setZoomLevel ] );

	/**
	 * This hook tracks if the zoom state was changed manually by the user via clicking
	 * the zoom out button.
	 */
	useEffect( () => {
		// If the zoom state changed (isZoomOut) and it does not match the requested zoom
		// state (zoomOut), then it means the user manually changed the zoom state while
		// this hook was mounted, and we should no longer control the zoom state.
		if ( isZoomedOut !== enabled ) {
			// Turn off all automatic zooming control.
			controlZoomLevel.current = false;
		}

		// Intentionally excluding `enabled` from the dependency array. We want to catch instances where
		// the zoom out state changes due to user interaction and not due to the hook.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isZoomedOut ] );
}
