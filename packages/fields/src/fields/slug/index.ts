/**
 * WordPress dependencies
 */
import type { Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import type { BasePost } from '../../types';
import { __ } from '@wordpress/i18n';
import SlugEdit from './slug-edit';
import SlugView from './slug-view';
import { getSlug } from './utils';

const slugField: Field< BasePost > = {
	id: 'slug',
	type: 'text',
	label: __( 'Slug' ),
	getValue: ( { item } ) => getSlug( item ),
	isValid: ( value ) => {
		return ( value && value.length > 0 ) || false;
	},
	Edit: SlugEdit,
	render: SlugView,
};

export default slugField;
