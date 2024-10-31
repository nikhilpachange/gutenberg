/**
 * WordPress dependencies
 */
import {
	AlignmentControl,
	__experimentalLinkControl as LinkControl,
	useBlockEditingMode,
} from '@wordpress/block-editor';
import {
	Button,
	ButtonGroup,
	PanelBody,
	TextControl,
	ToolbarButton,
	Popover,
} from '@wordpress/components';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { button as icon, link, linkOff } from '@wordpress/icons';
import { displayShortcut } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { NEW_TAB_TARGET, NOFOLLOW_REL } from './constants';
import { getUpdatedLinkAttributes } from './get-updated-link-attributes';
import initBlock from '../utils/init-block';
import deprecated from './deprecated';
import edit from './edit';
import metadata from './block.json';
import save from './save';

const LINK_SETTINGS = [
	...LinkControl.DEFAULT_LINK_SETTINGS,
	{
		id: 'nofollow',
		title: __( 'Mark as nofollow' ),
	},
];

const { name } = metadata;

export { metadata, name };

export const settings = {
	icon,
	example: {
		attributes: {
			className: 'is-style-fill',
			text: __( 'Call to Action' ),
		},
	},
	edit,
	save,
	deprecated,
	merge: ( a, { text = '' } ) => ( {
		...a,
		text: ( a.text || '' ) + text,
	} ),
	attributeControls: [
		{
			key: 'url',
			type: 'toolbar',
			group: 'block',
			Control( { isSelected, isDisabled, attributes, setAttributes } ) {
				const blockEditingMode = useBlockEditingMode();
				const { linkTarget, rel, tagName, textAlign, url } = attributes;
				const [ isEditingURL, setIsEditingURL ] = useState( false );
				const isURLSet = !! url;
				const opensInNewTab = linkTarget === NEW_TAB_TARGET;
				const nofollow = !! rel?.includes( NOFOLLOW_REL );
				const TagName = tagName || 'a';
				const isLinkTag = 'a' === TagName;

				function startEditing( event ) {
					event.preventDefault();
					setIsEditingURL( true );
				}

				function unlink() {
					setAttributes( {
						url: undefined,
						linkTarget: undefined,
						rel: undefined,
					} );
					setIsEditingURL( false );
				}

				useEffect( () => {
					if ( ! isSelected ) {
						setIsEditingURL( false );
					}
				}, [ isSelected ] );

				// Memoize link value to avoid overriding the LinkControl's internal state.
				// This is a temporary fix. See https://github.com/WordPress/gutenberg/issues/51256.
				const linkValue = useMemo(
					() => ( { url, opensInNewTab, nofollow } ),
					[ url, opensInNewTab, nofollow ]
				);

				// Use internal state instead of a ref to make sure that the component
				// re-renders when the popover's anchor updates.
				const [ popoverAnchor, setPopoverAnchor ] = useState( null );

				return (
					<>
						{ blockEditingMode === 'default' && (
							<AlignmentControl
								value={ textAlign }
								onChange={ ( nextAlign ) => {
									setAttributes( { textAlign: nextAlign } );
								} }
							/>
						) }
						{ ! isURLSet && isLinkTag && ! isDisabled && (
							<ToolbarButton
								name="link"
								icon={ link }
								title={ __( 'Link' ) }
								shortcut={ displayShortcut.primary( 'k' ) }
								onClick={ startEditing }
							/>
						) }
						{ isURLSet && isLinkTag && ! isDisabled && (
							<ToolbarButton
								name="link"
								icon={ linkOff }
								title={ __( 'Unlink' ) }
								shortcut={ displayShortcut.primaryShift( 'k' ) }
								onClick={ unlink }
								isActive
							/>
						) }
						{ isLinkTag &&
							isSelected &&
							( isEditingURL || isURLSet ) &&
							! isDisabled && (
								<Popover
									placement="bottom"
									onClose={ () => {
										setIsEditingURL( false );
										// TODO: Check how to access the richTextRef that is not defined here.
										richTextRef.current?.focus();
									} }
									anchor={ popoverAnchor }
									focusOnMount={
										isEditingURL ? 'firstElement' : false
									}
									__unstableSlotName="__unstable-block-tools-after"
									shift
								>
									<LinkControl
										value={ linkValue }
										onChange={ ( {
											url: newURL,
											opensInNewTab: newOpensInNewTab,
											nofollow: newNofollow,
										} ) =>
											setAttributes(
												getUpdatedLinkAttributes( {
													rel,
													url: newURL,
													opensInNewTab:
														newOpensInNewTab,
													nofollow: newNofollow,
												} )
											)
										}
										onRemove={ () => {
											unlink();
											richTextRef.current?.focus();
										} }
										forceIsEditingLink={ isEditingURL }
										settings={ LINK_SETTINGS }
									/>
								</Popover>
							) }
					</>
				);
			},
		},
		{
			key: 'width',
			Control( { attributes, setAttributes } ) {
				const { width: selectedWidth } = attributes;
				function handleChange( newWidth ) {
					// Check if we are toggling the width off
					const width =
						selectedWidth === newWidth ? undefined : newWidth;

					// Update attributes.
					setAttributes( { width } );
				}

				return (
					<PanelBody title={ __( 'Settings' ) }>
						<ButtonGroup aria-label={ __( 'Button width' ) }>
							{ [ 25, 50, 75, 100 ].map( ( widthValue ) => {
								return (
									<Button
										key={ widthValue }
										size="small"
										variant={
											widthValue === selectedWidth
												? 'primary'
												: undefined
										}
										onClick={ () =>
											handleChange( widthValue )
										}
									>
										{ widthValue }%
									</Button>
								);
							} ) }
						</ButtonGroup>
					</PanelBody>
				);
			},
		},
		{
			key: 'rel',
			group: 'advanced',
			Control( { attributes, setAttributes } ) {
				const { rel, tagName } = attributes;
				const TagName = tagName || 'a';
				const isLinkTag = 'a' === TagName;

				return (
					<>
						{ isLinkTag && (
							<TextControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Link rel' ) }
								value={ rel || '' }
								onChange={ ( newRel ) =>
									setAttributes( { rel: newRel } )
								}
							/>
						) }
					</>
				);
			},
		},
	],
};

export const init = () => initBlock( { name, metadata, settings } );
