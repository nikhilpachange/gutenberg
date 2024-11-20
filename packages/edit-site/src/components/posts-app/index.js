/**
 * WordPress dependencies
 */
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import Layout from '../layout';
import useActiveRoute from './router';
import { unlock } from '../../lock-unlock';

const { RouterProvider } = unlock( routerPrivateApis );

function PostsLayout() {
	const route = useActiveRoute();
	return <Layout route={ route } />;
}

export default function PostsApp() {
	return (
		<RouterProvider>
			<PostsLayout />
		</RouterProvider>
	);
}
