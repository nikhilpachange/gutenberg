/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { Editor } from '../editor';
import SidebarNavigationScreenMain from '../sidebar-navigation-screen-main';
import { useSyncDeprecatedEntityIntoState } from '../editor/use-resolve-edited-entity';

function HomeEditor() {
	const homePage = useSelect( ( select ) => {
		return unlock( select( coreStore ) ).getHomePage();
	}, [] );
	useSyncDeprecatedEntityIntoState( {
		isReady: !! homePage,
		...homePage,
	} );

	return (
		<Editor postId={ homePage?.postId } postType={ homePage?.postType } />
	);
}

export const homeRoute = {
	name: 'home',
	match: () => {
		return true;
	},
	areas: {
		sidebar: <SidebarNavigationScreenMain />,
		preview: <HomeEditor />,
		mobile: <SidebarNavigationScreenMain />,
	},
};
