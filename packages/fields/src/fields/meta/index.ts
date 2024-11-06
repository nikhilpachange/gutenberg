/**
 * WordPress dependencies
 */
import type { Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import type { BasePost } from '../../types';
import { __ } from '@wordpress/i18n';
import CustomFieldsEdit from './custom-fields-edit';

const customFields: Field< BasePost > = {
	id: 'custom_fields',
	label: __( 'Custom Fields' ),
	getValue: () => 'Edit Fields',
	Edit: CustomFieldsEdit,
};

export default customFields;
