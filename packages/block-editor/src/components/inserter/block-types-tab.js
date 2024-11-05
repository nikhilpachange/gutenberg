/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { useMemo, useEffect, forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockTypesList from '../block-types-list';
import InserterPanel from './panel';
import useBlockTypesState from './hooks/use-block-types-state';
import InserterListbox from '../inserter-listbox';
import { orderBy } from '../../utils/sorting';
import InserterNoResults from './no-results';

const getBlockNamespace = ( item ) => item.name.split( '/' )[ 0 ];

const MAX_SUGGESTED_ITEMS = 6;

export function BlockTypesTabPanel( {
	items,
	collections,
	categories,
	onSelectItem,
	onHover,
	showMostUsedBlocks,
	className,
} ) {
	const suggestedItems = useMemo( () => {
		return orderBy( items, 'frecency', 'desc' ).slice(
			0,
			MAX_SUGGESTED_ITEMS
		);
	}, [ items ] );

	const uncategorizedItems = useMemo( () => {
		return items.filter( ( item ) => ! item.category );
	}, [ items ] );

	const itemsPerCollection = useMemo( () => {
		// Create a new Object to avoid mutating collection.
		const result = { ...collections };
		Object.keys( collections ).forEach( ( namespace ) => {
			result[ namespace ] = items.filter(
				( item ) => getBlockNamespace( item ) === namespace
			);
			if ( result[ namespace ].length === 0 ) {
				delete result[ namespace ];
			}
		} );

		return result;
	}, [ items, collections ] );

	// Hide block preview on unmount.
	useEffect( () => () => onHover( null ), [] );

	return (
		<div className={ className }>
			{ showMostUsedBlocks &&
				// Only show the most used blocks if the total amount of block
				// is larger than 1 row, otherwise it is not so useful.
				items.length > 3 &&
				!! suggestedItems.length && (
					<InserterPanel title={ _x( 'Most used', 'blocks' ) }>
						<BlockTypesList
							items={ suggestedItems }
							onSelect={ onSelectItem }
							onHover={ onHover }
							label={ _x( 'Most used', 'blocks' ) }
						/>
					</InserterPanel>
				) }

			{ categories.map( ( category ) => {
				const categoryItems = items.filter(
					( item ) => item.category === category.slug
				);
				if ( ! categoryItems || ! categoryItems.length ) {
					return null;
				}
				return (
					<InserterPanel
						key={ category.slug }
						title={ category.title }
						icon={ category.icon }
					>
						<BlockTypesList
							items={ categoryItems }
							onSelect={ onSelectItem }
							onHover={ onHover }
							label={ category.title }
						/>
					</InserterPanel>
				);
			} ) }

			{ uncategorizedItems.length > 0 && (
				<InserterPanel
					className="block-editor-inserter__uncategorized-blocks-panel"
					title={ __( 'Uncategorized' ) }
				>
					<BlockTypesList
						items={ uncategorizedItems }
						onSelect={ onSelectItem }
						onHover={ onHover }
						label={ __( 'Uncategorized' ) }
					/>
				</InserterPanel>
			) }

			{ Object.entries( collections ).map(
				( [ namespace, collection ] ) => {
					const collectionItems = itemsPerCollection[ namespace ];
					if ( ! collectionItems || ! collectionItems.length ) {
						return null;
					}

					return (
						<InserterPanel
							key={ namespace }
							title={ collection.title }
							icon={ collection.icon }
						>
							<BlockTypesList
								items={ collectionItems }
								onSelect={ onSelectItem }
								onHover={ onHover }
								label={ collection.title }
							/>
						</InserterPanel>
					);
				}
			) }
		</div>
	);
}

export function BlockTypesTab(
	{ rootClientId, onInsert, onHover, showMostUsedBlocks },
	ref
) {
	const [ items, categories, collections, onSelectItem ] = useBlockTypesState(
		rootClientId,
		onInsert
	);

	if ( ! items.length ) {
		return <InserterNoResults />;
	}

	const itemsForCurrentRoot = [];
	const itemsRemaining = [];

	for ( const item of items ) {
		// Skip reusable blocks, they moved to the patterns tab.
		if ( item.category === 'reusable' ) {
			continue;
		}

		if ( rootClientId && item.isAllowedInCurrentRoot ) {
			itemsForCurrentRoot.push( item );
		} else {
			itemsRemaining.push( item );
		}
	}

	return (
		<InserterListbox>
			<div ref={ ref }>
				{ !! itemsForCurrentRoot.length && (
					<>
						<BlockTypesTabPanel
							items={ itemsForCurrentRoot }
							categories={ categories }
							collections={ collections }
							onSelectItem={ onSelectItem }
							onHover={ onHover }
							showMostUsedBlocks={ showMostUsedBlocks }
							className="block-editor-inserter__insertable-blocks-at-selection"
						/>
					</>
				) }
				<BlockTypesTabPanel
					items={ itemsRemaining }
					categories={ categories }
					collections={ collections }
					onSelectItem={ onSelectItem }
					onHover={ onHover }
					showMostUsedBlocks={ showMostUsedBlocks }
					className="block-editor-inserter__all-blocks"
				/>
			</div>
		</InserterListbox>
	);
}

export default forwardRef( BlockTypesTab );
