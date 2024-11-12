/**
 * WordPress dependencies
 */
import { select, useDispatch, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { Settings, Page } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import type { Action, ActionModal } from '@wordpress/dataviews';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { getItemTitle } from './utils';
import type { CoreDataError, PostWithPermissions } from '../types';

const PAGE_POST_TYPE = 'page';

const SetAsHomepageModal: ActionModal< PostWithPermissions >[ 'RenderModal' ] =
	( { items, closeModal, onActionPerformed } ) => {
		const [ item ] = items;
		const pageTitle = getItemTitle( item );
		const { currentHomePage, showOnFront } = useSelect( ( _select ) => {
			const { getEntityRecord } = _select( coreStore );
			const siteSettings: Settings | undefined = getEntityRecord(
				'root',
				'site'
			);
			const pageOnFront = siteSettings?.page_on_front;
			return {
				currentHomePage: getEntityRecord(
					'postType',
					'page',
					pageOnFront
				),
				showOnFront: siteSettings?.show_on_front,
			};
		} );
		const currentHomePageTitle = getItemTitle( currentHomePage as Page );

		const { saveEditedEntityRecord, saveEntityRecord } =
			useDispatch( coreStore );
		const { createSuccessNotice, createErrorNotice } =
			useDispatch( noticesStore );

		async function onSetPageAsHomepage( event: React.FormEvent ) {
			event.preventDefault();

			try {
				// If selected page is set to draft, publish the page.
				if ( item.status === 'draft' ) {
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
				const typedError = error as CoreDataError;
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
								__( 'Set homepage' )
							}
						</Button>
					</HStack>
				</VStack>
			</form>
		);
	};

const setAsHomepage: Action< PostWithPermissions > = {
	id: 'set-as-homepage',
	label: __( 'Set as homepage' ),
	isEligible( post ) {
		if ( post.status === 'trash' ) {
			return false;
		}

		if ( post.type !== PAGE_POST_TYPE ) {
			return false;
		}

		// A front-page template overrides homepage settings, so don't show the action if it's present.
		const templates = select( coreStore ).getEntityRecords(
			'postType',
			'wp_template',
			{
				per_page: -1,
			}
		);
		if (
			templates?.some(
				( template ) =>
					'slug' in template && template.slug === 'front-page'
			)
		) {
			return false;
		}

		const siteSettings = select( coreStore ).getEntityRecord< Settings >(
			'root',
			'site'
		);
		const pageOnFront = siteSettings?.page_on_front;
		const pageForPosts = siteSettings?.page_for_posts;

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
};

export default setAsHomepage;
