/**
 * External dependencies
 */
import type { ChangeEvent } from 'react';
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalDropdownContentWrapper as DropdownContentWrapper,
	Dropdown,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	SelectControl,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	privateApis as componentsPrivateApis,
	BaseControl,
} from '@wordpress/components';
import { __, _x, sprintf } from '@wordpress/i18n';
import { memo, useContext, useMemo, useState } from '@wordpress/element';
import {
	chevronDown,
	chevronUp,
	cog,
	seen,
	unseen,
	moreVertical,
} from '@wordpress/icons';
import warning from '@wordpress/warning';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import {
	SORTING_DIRECTIONS,
	LAYOUT_GRID,
	LAYOUT_TABLE,
	LAYOUT_LIST,
	sortIcons,
	sortLabels,
} from '../../constants';
import {
	VIEW_LAYOUTS,
	getNotHidableFieldIds,
	getVisibleFieldIds,
	getHiddenFieldIds,
} from '../../dataviews-layouts';
import type { SupportedLayouts, View, Field } from '../../types';
import DataViewsContext from '../dataviews-context';
import { unlock } from '../../lock-unlock';
import DensityPicker from '../../dataviews-layouts/grid/density-picker';

const { Menu } = unlock( componentsPrivateApis );

interface ViewTypeMenuProps {
	defaultLayouts?: SupportedLayouts;
}

const DATAVIEWS_CONFIG_POPOVER_PROPS = { placement: 'bottom-end', offset: 9 };

function ViewTypeMenu( {
	defaultLayouts = { list: {}, grid: {}, table: {} },
}: ViewTypeMenuProps ) {
	const { view, onChangeView } = useContext( DataViewsContext );
	const availableLayouts = Object.keys( defaultLayouts );
	if ( availableLayouts.length <= 1 ) {
		return null;
	}
	const activeView = VIEW_LAYOUTS.find( ( v ) => view.type === v.type );
	return (
		<Menu
			trigger={
				<Button
					size="compact"
					icon={ activeView?.icon }
					label={ __( 'Layout' ) }
				/>
			}
		>
			{ availableLayouts.map( ( layout ) => {
				const config = VIEW_LAYOUTS.find( ( v ) => v.type === layout );
				if ( ! config ) {
					return null;
				}
				return (
					<Menu.RadioItem
						key={ layout }
						value={ layout }
						name="view-actions-available-view"
						checked={ layout === view.type }
						hideOnClick
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => {
							switch ( e.target.value ) {
								case 'list':
								case 'grid':
								case 'table':
									return onChangeView( {
										...view,
										type: e.target.value,
										...defaultLayouts[ e.target.value ],
									} );
							}
							warning( 'Invalid dataview' );
						} }
					>
						<Menu.ItemLabel>{ config.label }</Menu.ItemLabel>
					</Menu.RadioItem>
				);
			} ) }
		</Menu>
	);
}

function SortFieldControl() {
	const { view, fields, onChangeView } = useContext( DataViewsContext );
	const orderOptions = useMemo( () => {
		const sortableFields = fields.filter(
			( field ) => field.enableSorting !== false
		);
		return sortableFields.map( ( field ) => {
			return {
				label: field.label,
				value: field.id,
			};
		} );
	}, [ fields ] );

	return (
		<SelectControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ __( 'Sort by' ) }
			value={ view.sort?.field }
			options={ orderOptions }
			onChange={ ( value: string ) => {
				onChangeView( {
					...view,
					sort: {
						direction: view?.sort?.direction || 'desc',
						field: value,
					},
				} );
			} }
		/>
	);
}

function SortDirectionControl() {
	const { view, fields, onChangeView } = useContext( DataViewsContext );

	const sortableFields = fields.filter(
		( field ) => field.enableSorting !== false
	);
	if ( sortableFields.length === 0 ) {
		return null;
	}

	let value = view.sort?.direction;
	if ( ! value && view.sort?.field ) {
		value = 'desc';
	}
	return (
		<ToggleGroupControl
			className="dataviews-view-config__sort-direction"
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			isBlock
			label={ __( 'Order' ) }
			value={ value }
			onChange={ ( newDirection ) => {
				if ( newDirection === 'asc' || newDirection === 'desc' ) {
					onChangeView( {
						...view,
						sort: {
							direction: newDirection,
							field:
								view.sort?.field ||
								// If there is no field assigned as the sorting field assign the first sortable field.
								fields.find(
									( field ) => field.enableSorting !== false
								)?.id ||
								'',
						},
					} );
					return;
				}
				warning( 'Invalid direction' );
			} }
		>
			{ SORTING_DIRECTIONS.map( ( direction ) => {
				return (
					<ToggleGroupControlOptionIcon
						key={ direction }
						value={ direction }
						icon={ sortIcons[ direction ] }
						label={ sortLabels[ direction ] }
					/>
				);
			} ) }
		</ToggleGroupControl>
	);
}

const PAGE_SIZE_VALUES = [ 10, 20, 50, 100 ];
function ItemsPerPageControl() {
	const { view, onChangeView } = useContext( DataViewsContext );
	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			isBlock
			label={ __( 'Items per page' ) }
			value={ view.perPage || 10 }
			disabled={ ! view?.sort?.field }
			onChange={ ( newItemsPerPage ) => {
				const newItemsPerPageNumber =
					typeof newItemsPerPage === 'number' ||
					newItemsPerPage === undefined
						? newItemsPerPage
						: parseInt( newItemsPerPage, 10 );
				onChangeView( {
					...view,
					perPage: newItemsPerPageNumber,
					page: 1,
				} );
			} }
		>
			{ PAGE_SIZE_VALUES.map( ( value ) => {
				return (
					<ToggleGroupControlOption
						key={ value }
						value={ value }
						label={ value.toString() }
					/>
				);
			} ) }
		</ToggleGroupControl>
	);
}

function BaseFieldItem( {
	label,
	subLabel,
	actions,
	isInteracting,
}: {
	label: string;
	subLabel?: string;
	actions: React.ReactNode;
	isInteracting?: boolean;
} ) {
	return (
		<Item>
			<HStack
				expanded
				className={ clsx( 'dataviews-field-control__field', {
					'is-interacting': isInteracting,
				} ) }
			>
				<div>
					<span className="dataviews-field-control__field-label">
						{ label }
					</span>
					{ subLabel && (
						<span className="dataviews-field-control__field-sub-label">
							{ subLabel }
						</span>
					) }
				</div>
				<HStack
					justify="flex-end"
					expanded={ false }
					className="dataviews-field-control__actions"
				>
					{ actions }
				</HStack>
			</HStack>
		</Item>
	);
}

interface FieldItemProps {
	id: any;
	label: string;
	index: number;
	isVisible: boolean;
	isHidable: boolean;
}

function FieldItem( {
	field: { id, label, index, isVisible, isHidable },
	fields,
	view,
	onChangeView,
}: {
	field: FieldItemProps;
	fields: Field< any >[];
	view: View;
	onChangeView: ( view: View ) => void;
} ) {
	const visibleFieldIds = getVisibleFieldIds( view, fields );

	return (
		<BaseFieldItem
			label={ label }
			actions={
				<>
					{ view.type === LAYOUT_TABLE && isVisible && (
						<>
							<Button
								disabled={ index < 1 }
								accessibleWhenDisabled
								size="compact"
								onClick={ () => {
									onChangeView( {
										...view,
										fields: [
											...( visibleFieldIds.slice(
												0,
												index - 1
											) ?? [] ),
											id,
											visibleFieldIds[ index - 1 ],
											...visibleFieldIds.slice(
												index + 1
											),
										],
									} );
								} }
								icon={ chevronUp }
								label={ sprintf(
									/* translators: %s: field label */
									__( 'Move %s up' ),
									label
								) }
							/>
							<Button
								disabled={ index >= visibleFieldIds.length - 1 }
								accessibleWhenDisabled
								size="compact"
								onClick={ () => {
									onChangeView( {
										...view,
										fields: [
											...( visibleFieldIds.slice(
												0,
												index
											) ?? [] ),
											visibleFieldIds[ index + 1 ],
											id,
											...visibleFieldIds.slice(
												index + 2
											),
										],
									} );
								} }
								icon={ chevronDown }
								label={ sprintf(
									/* translators: %s: field label */
									__( 'Move %s down' ),
									label
								) }
							/>{ ' ' }
						</>
					) }
					<Button
						className="dataviews-field-control__field-visibility-button"
						disabled={ ! isHidable }
						accessibleWhenDisabled
						size="compact"
						onClick={ () => {
							onChangeView( {
								...view,
								fields: isVisible
									? visibleFieldIds.filter(
											( fieldId ) => fieldId !== id
									  )
									: [ ...visibleFieldIds, id ],
							} );
							// Focus the visibility button to avoid focus loss.
							// Our code is safe against the component being unmounted, so we don't need to worry about cleaning the timeout.
							// eslint-disable-next-line @wordpress/react-no-unsafe-timeout
							setTimeout( () => {
								const element = document.querySelector(
									`.dataviews-field-control__field-${ id } .dataviews-field-control__field-visibility-button`
								);
								if ( element instanceof HTMLElement ) {
									element.focus();
								}
							}, 50 );
						} }
						icon={ isVisible ? unseen : seen }
						label={
							isVisible
								? sprintf(
										/* translators: %s: field label */
										_x( 'Hide %s', 'field' ),
										label
								  )
								: sprintf(
										/* translators: %s: field label */
										_x( 'Show %s', 'field' ),
										label
								  )
						}
					/>
				</>
			}
		/>
	);
}

function PreviewFieldItem( {
	fields,
	view,
	onChangeView,
}: {
	fields: Field< any >[];
	view: View;
	onChangeView: ( view: View ) => void;
} ) {
	const [ isChangingPreview, setIsChangingPreview ] =
		useState< boolean >( false );
	const mediaFields = useMemo( () => {
		return fields.filter( ( field ) => field.isMediaField );
	}, [ fields ] );
	if (
		mediaFields.length >= 2 &&
		( view.type === LAYOUT_GRID || view.type === LAYOUT_LIST )
	) {
		const mediaFieldId = view.layout?.mediaField;
		const mediaField = mediaFields.find(
			( field ) => field.id === mediaFieldId
		);
		return (
			<BaseFieldItem
				label={ __( 'Preview' ) }
				isInteracting={ isChangingPreview }
				subLabel={ mediaField?.label }
				actions={
					<Menu
						trigger={
							<Button
								size="compact"
								icon={ moreVertical }
								label={ __( 'Preview' ) }
							/>
						}
						onOpenChange={ setIsChangingPreview }
					>
						{ mediaFields.map( ( field ) => {
							return (
								<Menu.RadioItem
									key={ field.id }
									value={ field.id }
									checked={ field.id === mediaFieldId }
									onChange={ () => {
										onChangeView( {
											...view,
											layout: {
												...view.layout,
												mediaField: field.id,
											},
										} );
									} }
								>
									<Menu.ItemLabel>
										{ field.label }
									</Menu.ItemLabel>
								</Menu.RadioItem>
							);
						} ) }
					</Menu>
				}
			/>
		);
	}
	return null;
}

function FieldControl() {
	const { view, fields, onChangeView } = useContext( DataViewsContext );

	const visibleFieldIds = useMemo(
		() => getVisibleFieldIds( view, fields ),
		[ view, fields ]
	);
	const hiddenFieldIds = useMemo(
		() => getHiddenFieldIds( view, fields ),
		[ view, fields ]
	);
	const notHidableFieldIds = useMemo(
		() => getNotHidableFieldIds( view ),
		[ view ]
	);

	const visibleFields = fields
		.filter( ( { id } ) => visibleFieldIds.includes( id ) )
		.map( ( { id, label, enableHiding } ) => {
			return {
				id,
				label,
				index: visibleFieldIds.indexOf( id ),
				isVisible: true,
				isHidable: notHidableFieldIds.includes( id )
					? false
					: enableHiding,
			};
		} );
	if ( view.type === LAYOUT_TABLE && view.layout?.combinedFields ) {
		view.layout.combinedFields.forEach( ( { id, label } ) => {
			visibleFields.push( {
				id,
				label,
				index: visibleFieldIds.indexOf( id ),
				isVisible: true,
				isHidable: notHidableFieldIds.includes( id ),
			} );
		} );
	}
	visibleFields.sort( ( a, b ) => a.index - b.index );

	const hiddenFields = fields
		.filter( ( { id } ) => hiddenFieldIds.includes( id ) )
		.map( ( { id, label, enableHiding }, index ) => {
			return {
				id,
				label,
				index,
				isVisible: false,
				isHidable: enableHiding,
			};
		} );

	if ( ! visibleFields?.length && ! hiddenFields?.length ) {
		return null;
	}

	return (
		<VStack spacing={ 6 } className="dataviews-field-control">
			{ !! visibleFields?.length && (
				<ItemGroup isBordered isSeparated>
					<PreviewFieldItem
						fields={ fields }
						view={ view }
						onChangeView={ onChangeView }
					/>
					{ visibleFields.map( ( field ) => (
						<FieldItem
							key={ field.id }
							field={ field }
							fields={ fields }
							view={ view }
							onChangeView={ onChangeView }
						/>
					) ) }
				</ItemGroup>
			) }
			{ !! hiddenFields?.length && (
				<>
					<VStack spacing={ 4 }>
						<BaseControl.VisualLabel style={ { margin: 0 } }>
							{ __( 'Hidden' ) }
						</BaseControl.VisualLabel>
						<ItemGroup isBordered isSeparated>
							{ hiddenFields.map( ( field ) => (
								<FieldItem
									key={ field.id }
									field={ field }
									fields={ fields }
									view={ view }
									onChangeView={ onChangeView }
								/>
							) ) }
						</ItemGroup>
					</VStack>
				</>
			) }
		</VStack>
	);
}

function SettingsSection( {
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
} ) {
	return (
		<Grid columns={ 12 } className="dataviews-settings-section" gap={ 4 }>
			<div className="dataviews-settings-section__sidebar">
				<Heading
					level={ 2 }
					className="dataviews-settings-section__title"
				>
					{ title }
				</Heading>
				{ description && (
					<Text
						variant="muted"
						className="dataviews-settings-section__description"
					>
						{ description }
					</Text>
				) }
			</div>
			<Grid
				columns={ 8 }
				gap={ 4 }
				className="dataviews-settings-section__content"
			>
				{ children }
			</Grid>
		</Grid>
	);
}

function DataviewsViewConfigDropdown( {
	density,
	setDensity,
}: {
	density: number;
	setDensity: React.Dispatch< React.SetStateAction< number > >;
} ) {
	const { view } = useContext( DataViewsContext );
	const popoverId = useInstanceId(
		_DataViewsViewConfig,
		'dataviews-view-config-dropdown'
	);

	return (
		<Dropdown
			popoverProps={ {
				...DATAVIEWS_CONFIG_POPOVER_PROPS,
				id: popoverId,
			} }
			renderToggle={ ( { onToggle, isOpen } ) => {
				return (
					<Button
						size="compact"
						icon={ cog }
						label={ _x( 'View options', 'View is used as a noun' ) }
						onClick={ onToggle }
						aria-expanded={ isOpen ? 'true' : 'false' }
						aria-controls={ popoverId }
					/>
				);
			} }
			renderContent={ () => (
				<DropdownContentWrapper paddingSize="medium">
					<VStack className="dataviews-view-config" spacing={ 6 }>
						<SettingsSection title={ __( 'Appearance' ) }>
							<HStack expanded className="is-divided-in-two">
								<SortFieldControl />
								<SortDirectionControl />
							</HStack>
							{ view.type === LAYOUT_GRID && (
								<DensityPicker
									density={ density }
									setDensity={ setDensity }
								/>
							) }
							<ItemsPerPageControl />
						</SettingsSection>
						<SettingsSection title={ __( 'Properties' ) }>
							<FieldControl />
						</SettingsSection>
					</VStack>
				</DropdownContentWrapper>
			) }
		/>
	);
}

function _DataViewsViewConfig( {
	density,
	setDensity,
	defaultLayouts = { list: {}, grid: {}, table: {} },
}: {
	density: number;
	setDensity: React.Dispatch< React.SetStateAction< number > >;
	defaultLayouts?: SupportedLayouts;
} ) {
	return (
		<>
			<ViewTypeMenu defaultLayouts={ defaultLayouts } />
			<DataviewsViewConfigDropdown
				density={ density }
				setDensity={ setDensity }
			/>
		</>
	);
}

const DataViewsViewConfig = memo( _DataViewsViewConfig );

export default DataViewsViewConfig;
