/**
 * WordPress dependencies
 */
import {
	UnsavedChangesWarning,
	privateApis as editorPrivateApis,
} from '@wordpress/editor';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Layout from '../layout';
import { useRegisterPostsAppRoutes } from '../posts-app-routes';
import { unlock } from '../../lock-unlock';
import { store as editSiteStore } from '../../store';

const { RouterProvider } = unlock( routerPrivateApis );
const { GlobalStylesProvider } = unlock( editorPrivateApis );

export default function PostsApp() {
	useRegisterPostsAppRoutes();
	const routes = useSelect( ( select ) => {
		return unlock( select( editSiteStore ) ).getRoutes();
	}, [] );
	return (
		<GlobalStylesProvider>
			<UnsavedChangesWarning />
			<RouterProvider routes={ routes } basePath="/wp-admin/post">
				<Layout />
			</RouterProvider>
		</GlobalStylesProvider>
	);
}
