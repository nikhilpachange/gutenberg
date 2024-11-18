/**
 * WordPress dependencies
 */
import { useRegistry, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { store as siteEditorStore } from '../../store';
import { homeRoute } from './home';
import { navigationViewRoute } from './navigation-view';
import { navigationEditRoute } from './navigation-edit';
import { navigationItemEditRoute } from './navigation-item-edit';
import { navigationItemViewRoute } from './navigation-item-view';
import { stylesViewRoute } from './styles-view';
import { patternsEditRoute } from './patterns-edit';
import { patternsViewRoute } from './patterns-view';
import { templatesEditRoute } from './templates-edit';
import { templatesListViewRoute } from './templates-list-view';
import { templatesViewRoute } from './templates-view';
import { pagesViewRoute } from './pages-view';
import { pagesEditRoute } from './pages-edit';
import { pagesListViewRoute } from './pages-list-view';
import { pagesListViewQuickEditRoute } from './pages-list-view-quick-edit';
import { pagesViewQuickEditRoute } from './pages-view-quick-edit';

const routes = [
	pagesListViewQuickEditRoute,
	pagesListViewRoute,
	pagesViewQuickEditRoute,
	pagesViewRoute,
	pagesEditRoute,
	templatesEditRoute,
	templatesListViewRoute,
	templatesViewRoute,
	patternsViewRoute,
	patternsEditRoute,
	stylesViewRoute,
	navigationItemViewRoute,
	navigationItemEditRoute,
	navigationViewRoute,
	navigationEditRoute,
	homeRoute,
];

export function useRegisterSiteEditorRoutes() {
	const registry = useRegistry();
	const { registerRoute } = unlock( useDispatch( siteEditorStore ) );
	useEffect( () => {
		registry.batch( () => {
			routes.forEach( registerRoute );
		} );
	}, [ registry, registerRoute ] );
}
