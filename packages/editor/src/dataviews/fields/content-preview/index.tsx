/**
 * WordPress dependencies
 */
import type { Field } from '@wordpress/dataviews';
import type { BasePost } from '@wordpress/fields';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ContentPreviewView from './content-preview-view';

const contentPreviewField: Field< BasePost > = {
	type: 'text',
	id: 'content-preview',
	label: __( 'Content preview' ),
	render: ContentPreviewView,
	enableSorting: false,
	isMediaField: true,
};

export default contentPreviewField;
