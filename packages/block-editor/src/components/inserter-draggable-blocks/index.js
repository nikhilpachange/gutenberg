/**
 * WordPress dependencies
 */
import { Draggable } from '@wordpress/components';
import { createBlock, store as blocksStore } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockDraggableChip from '../block-draggable/draggable-chip';
import { INSERTER_PATTERN_TYPES } from '../inserter/block-patterns-tab/utils';
import { store as blockEditorStore } from '../../store';
import { unlock } from '../../lock-unlock';

const InserterDraggableBlocks = ( {
	isEnabled,
	blocks,
	icon,
	children,
	pattern,
} ) => {
	const blockTypeIcon = useSelect(
		( select ) => {
			const { getBlockType } = select( blocksStore );
			return (
				blocks.length === 1 && getBlockType( blocks[ 0 ].name )?.icon
			);
		},
		[ blocks ]
	);

	const { startDragging, stopDragging } = unlock(
		useDispatch( blockEditorStore )
	);

	if ( ! isEnabled ) {
		return children( {
			draggable: false,
			onDragStart: undefined,
			onDragEnd: undefined,
		} );
	}

	const parsedBlocks =
		pattern?.type === INSERTER_PATTERN_TYPES.user &&
		pattern?.syncStatus !== 'unsynced'
			? [ createBlock( 'core/block', { ref: pattern.id } ) ]
			: blocks;

	return (
		<Draggable
			// To do: remove in favour of `wp-block:*` items.
			__experimentalTransferDataType="wp-blocks"
			transferData={ { type: 'inserter', blocks: parsedBlocks } }
			onDragStart={ ( event ) => {
				if ( ! event.dataTransfer ) {
					return;
				}
				startDragging();

				for ( const block of parsedBlocks ) {
					event.dataTransfer.items.add(
						JSON.stringify( block ),
						`wp-block:${ block.name }`
					);
				}
			} }
			onDragEnd={ () => {
				stopDragging();
			} }
			__experimentalDragComponent={
				<BlockDraggableChip
					count={ blocks.length }
					icon={ icon || ( ! pattern && blockTypeIcon ) }
					isPattern={ !! pattern }
				/>
			}
		>
			{ ( { onDraggableStart, onDraggableEnd } ) => {
				return children( {
					draggable: true,
					onDragStart: onDraggableStart,
					onDragEnd: onDraggableEnd,
				} );
			} }
		</Draggable>
	);
};

export default InserterDraggableBlocks;
