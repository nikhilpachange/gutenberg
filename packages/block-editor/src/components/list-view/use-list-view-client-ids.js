/**
 * WordPress dependencies
 */

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { unlock } from '../../lock-unlock';

export default function useListViewClientIds( {
	blocks,
	rootClientId,
	ignoreRenderingMode,
} ) {
	return useSelect(
		( select ) => {
			const {
				getDraggedBlockClientIds,
				getSelectedBlockClientIds,
				getEnabledClientIdsTree,
				__unstableGetClientIdsTree: getClientIdsTree,
			} = unlock( select( blockEditorStore ) );

			return {
				selectedClientIds: getSelectedBlockClientIds(),
				draggedClientIds: getDraggedBlockClientIds(),
				clientIdsTree:
					blocks ?? ignoreRenderingMode
						? getClientIdsTree( rootClientId )
						: getEnabledClientIdsTree( rootClientId ),
			};
		},
		[ blocks, rootClientId, ignoreRenderingMode ]
	);
}
