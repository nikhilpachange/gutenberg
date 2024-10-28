/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	PanelBody,
	Placeholder,
	SelectControl,
	Spinner,
	ToggleControl,
	VisuallyHidden,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import {
	BlockContextProvider,
	__experimentalUseBlockPreview as useBlockPreview,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
	RichText,
} from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import { pin } from '@wordpress/icons';
import { useEntityRecords } from '@wordpress/core-data';
import { memo, useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

const TEMPLATE = [ [ 'core/term-title' ] ];

function CategoriesItemBlock() {
	const innerBlocksProps = useInnerBlocksProps(
		{ className: clsx( 'wp-block-taxonomy' ) },
		{ template: TEMPLATE }
	);
	return <li { ...innerBlocksProps } />;
}

function CategoriesItemBlockPreview( {
	blocks,
	blockContextId,
	setActiveBlockContextId,
	isHidden,
} ) {
	const blockPreviewProps = useBlockPreview( {
		blocks,
		props: {
			className: clsx( 'wp-block-taxonomy' ),
		},
	} );

	const handleOnClick = () => {
		setActiveBlockContextId( blockContextId );
	};

	const style = {
		display: isHidden ? 'none' : undefined,
	};

	return (
		<li
			{ ...blockPreviewProps }
			tabIndex={ 0 }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
			role="button"
			onClick={ handleOnClick }
			onKeyPress={ handleOnClick }
			style={ style }
		/>
	);
}

const MemoizedCategoriesItemBlockPreview = memo( CategoriesItemBlockPreview );

export default function CategoriesEdit( {
	clientId,
	attributes: {
		displayAsDropdown,
		showHierarchy,
		showPostCounts,
		showOnlyTopLevel,
		showEmpty,
		label,
		showLabel,
		taxonomy: taxonomySlug,
		order,
		orderBy,
	},
	setAttributes,
	className,
} ) {
	const selectId = useInstanceId( CategoriesEdit, 'blocks-category-select' );

	const { records: allTaxonomies, isResolvingTaxonomies } = useEntityRecords(
		'root',
		'taxonomy'
	);

	const taxonomies = allTaxonomies?.filter( ( t ) => t.visibility.public );

	const taxonomy = taxonomies?.find( ( t ) => t.slug === taxonomySlug );

	const isHierarchicalTaxonomy =
		! isResolvingTaxonomies && taxonomy?.hierarchical;

	const query = {
		per_page: -1,
		hide_empty: ! showEmpty,
		context: 'view',
		order,
		orderby: orderBy,
	};
	if ( isHierarchicalTaxonomy && showOnlyTopLevel ) {
		query.parent = 0;
	}

	const [ activeBlockContextId, setActiveBlockContextId ] = useState();
	const { records: categories, isResolving } = useEntityRecords(
		'taxonomy',
		taxonomySlug,
		query
	);

	const blocks = useSelect(
		( select ) => {
			const { getBlocks } = select( blockEditorStore );
			return getBlocks( clientId );
		},
		[ clientId ]
	);

	const blockContexts = useMemo(
		() =>
			categories?.map( ( term ) => ( {
				taxonomyType: term.taxonomy,
				taxonomyId: term.id,
			} ) ),
		[ categories ]
	);

	const getCategoriesList = ( parentId ) => {
		if ( ! categories?.length ) {
			return [];
		}
		if ( parentId === null ) {
			return categories;
		}
		return categories.filter( ( { parent } ) => parent === parentId );
	};

	const toggleAttribute = ( attributeName ) => ( newValue ) =>
		setAttributes( { [ attributeName ]: newValue } );

	const renderCategoryName = ( name ) =>
		! name ? __( '(Untitled)' ) : decodeEntities( name ).trim();

	const renderCategoryList = () => {
		return (
			<>
				{ blockContexts &&
					blockContexts.map( ( blockContext ) => (
						<BlockContextProvider
							key={ blockContext.taxonomyId }
							value={ blockContext }
						>
							{ blockContext.taxonomyId ===
							( activeBlockContextId ||
								blockContexts[ 0 ]?.taxonomyId ) ? (
								<CategoriesItemBlock />
							) : null }
							<MemoizedCategoriesItemBlockPreview
								blocks={ blocks }
								blockContextId={ blockContext.taxonomyId }
								setActiveBlockContextId={
									setActiveBlockContextId
								}
								isHidden={
									blockContext.taxonomyId ===
									( activeBlockContextId ||
										blockContexts[ 0 ]?.taxonomyId )
								}
							/>
						</BlockContextProvider>
					) ) }
			</>
		);
	};

	// const renderCategoryListItem = ( category ) => {
	// 	const childCategories = getCategoriesList( category.id );
	// 	const { id, link, count, name } = category;
	// 	return (
	// 		<li key={ id } className={ `cat-item cat-item-${ id }` }>
	// 			<a href={ link } target="_blank" rel="noreferrer noopener">
	// 				{ renderCategoryName( name ) }
	// 			</a>
	// 			{ showPostCounts && ` (${ count })` }
	// 			{ isHierarchicalTaxonomy &&
	// 				showHierarchy &&
	// 				!! childCategories.length && (
	// 					<ul className="children">
	// 						{ childCategories.map( ( childCategory ) =>
	// 							renderCategoryListItem( childCategory )
	// 						) }
	// 					</ul>
	// 				) }
	// 		</li>
	// 	);
	// };

	const renderCategoryDropdown = () => {
		const parentId = isHierarchicalTaxonomy && showHierarchy ? 0 : null;
		const categoriesList = getCategoriesList( parentId );
		return (
			<>
				{ showLabel ? (
					<RichText
						className="wp-block-categories__label"
						aria-label={ __( 'Label text' ) }
						placeholder={ taxonomy.name }
						withoutInteractiveFormatting
						value={ label }
						onChange={ ( html ) =>
							setAttributes( { label: html } )
						}
					/>
				) : (
					<VisuallyHidden as="label" htmlFor={ selectId }>
						{ label ? label : taxonomy.name }
					</VisuallyHidden>
				) }
				<select id={ selectId }>
					<option>
						{ sprintf(
							/* translators: %s: taxonomy's singular name */
							__( 'Select %s' ),
							taxonomy.labels.singular_name
						) }
					</option>
					{ categoriesList.map( ( category ) =>
						renderCategoryDropdownItem( category, 0 )
					) }
				</select>
			</>
		);
	};

	const renderCategoryDropdownItem = ( category, level ) => {
		const { id, count, name } = category;
		const childCategories = getCategoriesList( id );
		return [
			<option key={ id } className={ `level-${ level }` }>
				{ Array.from( { length: level * 3 } ).map( () => '\xa0' ) }
				{ renderCategoryName( name ) }
				{ showPostCounts && ` (${ count })` }
			</option>,
			isHierarchicalTaxonomy &&
				showHierarchy &&
				!! childCategories.length &&
				childCategories.map( ( childCategory ) =>
					renderCategoryDropdownItem( childCategory, level + 1 )
				),
		];
	};

	const TagName =
		!! categories?.length && ! displayAsDropdown && ! isResolving
			? 'ul'
			: 'div';

	const classes = clsx( className, {
		'wp-block-categories-list':
			!! categories?.length && ! displayAsDropdown && ! isResolving,
		'wp-block-categories-dropdown':
			!! categories?.length && displayAsDropdown && ! isResolving,
	} );

	const blockProps = useBlockProps( {
		className: classes,
	} );

	const orderOptions = [
		{
			/* translators: label for ordering taxonomies by number of posts in descending order */
			label: __( 'Highest #' ),
			value: 'count/desc',
		},
		{
			/* translators: label for ordering taxonomies by number of posts in ascending order */
			label: __( 'Lowest #' ),
			value: 'count/asc',
		},
		{
			/* translators: label for ordering taxonomies by name in ascending order */
			label: __( 'A → Z' ),
			value: 'name/asc',
		},
		{
			/* translators: label for ordering taxonomies by name in descending order */
			label: __( 'Z → A' ),
			value: 'name/desc',
		},
	];

	return (
		<TagName { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					{ Array.isArray( taxonomies ) && (
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Taxonomy' ) }
							options={ taxonomies.map( ( t ) => ( {
								label: t.name,
								value: t.slug,
							} ) ) }
							value={ taxonomySlug }
							onChange={ ( selectedTaxonomy ) =>
								setAttributes( {
									taxonomy: selectedTaxonomy,
								} )
							}
						/>
					) }
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Order by' ) }
						options={ orderOptions }
						value={ `${ orderBy }/${ order }` }
						onChange={ ( value ) => {
							const [ newOrderBy, newOrder ] = value.split( '/' );
							setAttributes( {
								orderBy: newOrderBy,
								order: newOrder,
							} );
						} }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Display as dropdown' ) }
						checked={ displayAsDropdown }
						onChange={ toggleAttribute( 'displayAsDropdown' ) }
					/>
					{ displayAsDropdown && (
						<ToggleControl
							__nextHasNoMarginBottom
							className="wp-block-categories__indentation"
							label={ __( 'Show label' ) }
							checked={ showLabel }
							onChange={ toggleAttribute( 'showLabel' ) }
						/>
					) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show post counts' ) }
						checked={ showPostCounts }
						onChange={ toggleAttribute( 'showPostCounts' ) }
					/>
					{ isHierarchicalTaxonomy && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Show only top level terms' ) }
							checked={ showOnlyTopLevel }
							onChange={ toggleAttribute( 'showOnlyTopLevel' ) }
						/>
					) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show empty terms' ) }
						checked={ showEmpty }
						onChange={ toggleAttribute( 'showEmpty' ) }
					/>
					{ isHierarchicalTaxonomy && ! showOnlyTopLevel && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Show hierarchy' ) }
							checked={ showHierarchy }
							onChange={ toggleAttribute( 'showHierarchy' ) }
						/>
					) }
				</PanelBody>
			</InspectorControls>
			{ isResolving && (
				<Placeholder icon={ pin } label={ __( 'Terms' ) }>
					<Spinner />
				</Placeholder>
			) }
			{ ! isResolving && categories?.length === 0 && (
				<p>{ taxonomy.labels.no_terms }</p>
			) }
			{ ! isResolving &&
				categories?.length > 0 &&
				( displayAsDropdown
					? renderCategoryDropdown()
					: renderCategoryList() ) }
		</TagName>
	);
}
