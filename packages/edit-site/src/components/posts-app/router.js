/**
 * WordPress dependencies
 */
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import Editor from '../editor';
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import SidebarNavigationScreenMain from '../sidebar-navigation-screen-main';
import DataViewsSidebarContent from '../sidebar-dataviews';
import PostList from '../post-list';
import { PostEdit } from '../post-edit';

const { useLocation } = unlock( routerPrivateApis );

function PostQuickEdit() {
	const { params } = useLocation();
	return <PostEdit postType={ params.postType } postId={ params.postId } />;
}

export default function useActiveRoute() {
	const { params = {} } = useLocation();
	const { postType, layout, canvas, quickEdit } = params;
	const labels = useSelect(
		( select ) => {
			return select( coreStore ).getPostType( postType )?.labels;
		},
		[ postType ]
	);

	// Posts list.
	if ( postType ) {
		const isListLayout = layout === 'list' || ! layout;
		return {
			name: 'posts-list',
			areas: {
				sidebar: (
					<SidebarNavigationScreen
						title={ labels?.name }
						isRoot
						content={ <DataViewsSidebarContent /> }
					/>
				),
				content: <PostList postType={ postType } />,
				preview: ( isListLayout || canvas === 'edit' ) && (
					<Editor isPostsList />
				),
				mobile:
					canvas === 'edit' ? (
						<Editor isPostsList />
					) : (
						<PostList postType={ postType } />
					),
				edit: quickEdit && <PostQuickEdit />,
			},
			widths: {
				content: isListLayout ? 380 : undefined,
			},
		};
	}

	// Fallback shows the home page preview
	return {
		name: 'default',
		areas: {
			sidebar: <SidebarNavigationScreenMain />,
			preview: <Editor isPostsList />,
			mobile: canvas === 'edit' && <Editor isPostsList />,
		},
	};
}
