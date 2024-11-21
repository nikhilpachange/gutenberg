/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ConfigContext, type NavigationOptions, useHistory } from './router';

export function useLink( to: string, options: NavigationOptions = {} ) {
	const history = useHistory();
	const { basePath } = useContext( ConfigContext );
	function onClick( event: React.SyntheticEvent< HTMLAnchorElement > ) {
		event?.preventDefault();
		history.navigate( to, options );
	}

	const [ before ] = window.location.href.split( basePath );

	return {
		href: `${ before }${ basePath }${ to }`,
		onClick,
	};
}

export function Link( {
	to,
	options,
	children,
	...props
}: {
	to: string;
	options?: NavigationOptions;
	children: React.ReactNode;
} ) {
	const { href, onClick } = useLink( to, options );

	return (
		<a href={ href } onClick={ onClick } { ...props }>
			{ children }
		</a>
	);
}
