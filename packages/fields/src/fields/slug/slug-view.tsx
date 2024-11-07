/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { BasePost } from '../../types';
import { getSlug } from './utils';

const getSlugOrFallback = ( item: BasePost ): string => {
	if ( typeof item === 'object' ) {
		const slug = getSlug( item );
		return slug.length > 0 ? slug : item.id.toString();
	}

	return '';
};

const SlugView = ( { item }: { item: BasePost } ) => {
	const slug = getSlugOrFallback( item );
	const originalSlugRef = useRef( slug );

	useEffect( () => {
		if ( slug && originalSlugRef.current === undefined ) {
			originalSlugRef.current = slug;
		}
	}, [ slug ] );

	const slugToDisplay = slug || originalSlugRef.current;

	return `${ slugToDisplay }`;
};

export default SlugView;
