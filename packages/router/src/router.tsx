/**
 * External dependencies
 */
import RouteRecognizer from 'route-recognizer';
import { createBrowserHistory } from 'history';

/**
 * WordPress dependencies
 */
import {
	createContext,
	useContext,
	useSyncExternalStore,
	useMemo,
} from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import type { ReactNode } from 'react';

const history = createBrowserHistory();
interface Route {
	name: string;
	path: string;
	areas: Record< string, ReactNode >;
	widths: Record< string, number >;
}

type LocationWithQuery = Location & {
	query?: Record< string, any >;
};

interface Match {
	name: string;
	path: string;
	areas: Record< string, ReactNode >;
	widths: Record< string, number >;
	query?: Record< string, any >;
	params?: Record< string, any >;
}

interface Config {
	basePath: string;
}

export interface NavigationOptions {
	transition?: string;
	state?: Record< string, any >;
}

const RoutesContext = createContext< Match | null >( null );
export const ConfigContext = createContext< Config >( { basePath: '/' } );

const locationMemo = new WeakMap();
function getLocationWithQuery() {
	const location = history.location;
	let locationWithQuery = locationMemo.get( location );
	if ( ! locationWithQuery ) {
		locationWithQuery = {
			...location,
			query: Object.fromEntries( new URLSearchParams( location.search ) ),
		};
		locationMemo.set( location, locationWithQuery );
	}
	return locationWithQuery;
}

export function useLocation() {
	return useContext( RoutesContext );
}

export function useHistory() {
	const { basePath } = useContext( ConfigContext );
	return useMemo(
		() => ( {
			navigate( path: string, options: NavigationOptions = {} ) {
				const performPush = () => {
					return history.push(
						`${ basePath }${ path }`,
						options.state
					);
				};

				/*
				 * Skip transition in mobile, otherwise it crashes the browser.
				 * See: https://github.com/WordPress/gutenberg/pull/63002.
				 */
				const isMediumOrBigger =
					window.matchMedia( '(min-width: 782px)' ).matches;
				if (
					! isMediumOrBigger ||
					// @ts-expect-error
					! document.startViewTransition ||
					! options.transition
				) {
					return performPush();
				}
				document.documentElement.classList.add( options.transition );
				// @ts-expect-error
				const transition = document.startViewTransition( () =>
					performPush()
				);
				transition.finished.finally( () => {
					document.documentElement.classList.remove(
						options.transition ?? ''
					);
				} );
			},
		} ),
		[ basePath ]
	);
}

export default function useMatch(
	location: LocationWithQuery,
	routes: Route[],
	basePath: string
): Match {
	const { query = {}, pathname } = location;

	return useMemo( () => {
		const matcher = new RouteRecognizer();
		routes.forEach( ( route ) => {
			matcher.add( [ { path: route.path, handler: route } ], {
				as: route.name,
			} );
		} );
		const [ , path ] = basePath
			? pathname.split( basePath )
			: [ , pathname ];
		const result = matcher.recognize( path )?.[ 0 ];
		if ( ! result ) {
			return {
				name: '404',
				path: addQueryArgs( path, query ),
				areas: {},
				widths: {},
				query,
				params: {},
			};
		}

		const matchedRoute = result.handler as Route;
		const resolveFunctions = ( record: Record< string, any > = {} ) => {
			return Object.fromEntries(
				Object.entries( record ).map( ( [ key, value ] ) => {
					if ( typeof value === 'function' ) {
						return [
							key,
							value( { query, params: result.params } ),
						];
					}
					return [ key, value ];
				} )
			);
		};
		return {
			name: matchedRoute.name,
			areas: resolveFunctions( matchedRoute.areas ),
			widths: resolveFunctions( matchedRoute.widths ),
			params: result.params,
			query,
			path: addQueryArgs( path, query ),
		};
	}, [ routes, query, basePath, pathname ] );
}

export function RouterProvider( {
	routes,
	basePath,
	children,
}: {
	routes: Route[];
	basePath: string;
	children: React.ReactNode;
} ) {
	const location = useSyncExternalStore(
		history.listen,
		getLocationWithQuery,
		getLocationWithQuery
	);
	const match = useMatch( location, routes, basePath );
	const config = useMemo( () => ( { basePath } ), [ basePath ] );

	return (
		<ConfigContext.Provider value={ config }>
			<RoutesContext.Provider value={ match }>
				{ children }
			</RoutesContext.Provider>
		</ConfigContext.Provider>
	);
}
