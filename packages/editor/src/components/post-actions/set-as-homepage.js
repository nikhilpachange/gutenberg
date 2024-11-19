/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch, useSelect, resolveSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { getItemTitle } from '../../utils/get-item-title';
import { unlock } from '../../lock-unlock';

const SetAsHomepageModal = ( { items, closeModal, onActionPerformed } ) => {
	const [ item ] = items;
	const pageTitle = getItemTitle( item );
	const { showOnFront, currentHomePage } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreStore );
		const { getHomePage } = unlock( select( coreStore ) );
		const siteSettings = getEntityRecord( 'root', 'site' );
		const homePage = getHomePage();
		return {
			showOnFront: siteSettings?.show_on_front,
			currentHomePage: homePage.postId,
		};
	} );
	const [ currentHomePageTitle, setCurrentHomePageTitle ] = useState( '' );
	const isPageDraft = item.status === 'draft';

	const { getEntityRecord } = resolveSelect( coreStore );
	const { saveEditedEntityRecord, saveEntityRecord } =
		useDispatch( coreStore );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	useEffect( () => {
		const handleGetCurrentHomepage = async () => {
			const currentHomePageItem = await getEntityRecord(
				'postType',
				'page',
				currentHomePage
			);
			setCurrentHomePageTitle( getItemTitle( currentHomePageItem ) );
		};
		handleGetCurrentHomepage();
	}, [ currentHomePage, getEntityRecord ] );

	async function onSetPageAsHomepage( event ) {
		event.preventDefault();

		try {
			// If selected page is set to draft, publish the page.
			if ( isPageDraft ) {
				await saveEntityRecord( 'postType', 'page', {
					...item,
					status: 'publish',
				} );
			}

			// Save new home page settings.
			await saveEntityRecord( 'root', 'site', {
				page_on_front: item.id,
				show_on_front: 'page',
			} );

			closeModal?.();

			await saveEditedEntityRecord( 'root', 'site', undefined, {
				page_on_front: item.id,
				show_on_front: 'page',
			} );

			createSuccessNotice( __( 'Homepage updated' ), {
				type: 'snackbar',
			} );

			onActionPerformed?.( items );
		} catch ( error ) {
			const typedError = error;
			const errorMessage =
				typedError.message && typedError.code !== 'unknown_error'
					? typedError.message
					: __( 'An error occurred while setting the homepage' );
			createErrorNotice( errorMessage, { type: 'snackbar' } );
		}
	}

	const renderModalBody = () => {
		if ( 'posts' === showOnFront ) {
			return (
				<>
					<Text>
						{ sprintf(
							// translators: %s: title of the page to be set as the homepage.
							__(
								'Set "%s" as the site homepage? This will replace the current homepage which is set to display latest posts.'
							),
							pageTitle
						) }
					</Text>
				</>
			);
		}

		if ( isPageDraft ) {
			return (
				<>
					<Text>
						{ sprintf(
							// translators: %s: title of the page to be set as the homepage.
							__(
								'"%s" is a draft and will be published automatically if set as the homepage. Publish page and set as the site homepage?'
							),
							pageTitle
						) }
					</Text>
				</>
			);
		}

		const modalTranslatedString =
			// translators: %1$s: title of page to be set as the home page. %2$s: title of the current home page.
			__(
				'Set "%1$s" as the site homepage? This will replace the current homepage: "%2$s"'
			);

		return (
			<Text>
				{ sprintf(
					modalTranslatedString,
					pageTitle,
					currentHomePageTitle
				) }{ ' ' }
			</Text>
		);
	};

	return (
		<form onSubmit={ onSetPageAsHomepage }>
			<VStack spacing="5">
				{ renderModalBody() }
				<HStack justify="right">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ () => {
							closeModal?.();
						} }
					>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
					>
						{
							// translators: Button to confirm setting the specified page as the homepage.
							isPageDraft
								? __( 'Publish and set homepage' )
								: __( 'Set homepage' )
						}
					</Button>
				</HStack>
			</VStack>
		</form>
	);
};

export const useSetAsHomepageAction = () => {
	const { pageOnFront, pageForPosts } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreStore );
		const siteSettings = getEntityRecord( 'root', 'site' );
		return {
			pageOnFront: siteSettings?.page_on_front,
			pageForPosts: siteSettings?.page_for_posts,
		};
	} );

	return useMemo(
		() => ( {
			id: 'set-as-homepage',
			label: __( 'Set as homepage' ),
			isEligible( post ) {
				if ( post.status === 'trash' ) {
					return false;
				}

				if ( post.type !== 'page' ) {
					return false;
				}

				// Don't show the action if the page is already set as the homepage.
				if ( pageOnFront === post.id ) {
					return false;
				}

				// Don't show the action if the page is already set as the page for posts.
				if ( pageForPosts === post.id ) {
					return false;
				}

				return true;
			},
			RenderModal: SetAsHomepageModal,
		} ),
		[ pageForPosts, pageOnFront ]
	);
};
