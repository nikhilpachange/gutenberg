/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { store as coreDataStore } from '@wordpress/core-data';

/**
 * Gets a list of site fields with their values and labels
 * to be consumed in the needed callbacks.
 *
 * @param {Object} select The select function from the data store.
 * @return {Object} List of post meta fields with their value and label.
 */
const supportedFields = { title: { label: __( 'Title' ), type: 'string' } };
function getSiteFields( select ) {
	const { getEditedEntityRecord } = select( coreDataStore );

	const entityValues = getEditedEntityRecord( 'root', 'site', undefined );
	const siteFields = {};
	Object.entries( supportedFields ).forEach( ( [ key, props ] ) => {
		// Don't include footnotes or private fields.
		siteFields[ key ] = {
			label: props.title || key,
			value: entityValues?.[ key ],
			type: props.type,
		};
	} );
	return siteFields;
}

export default {
	name: 'core/site',
	label: __( 'Site' ),
	getValues( { select, bindings } ) {
		const metaFields = getSiteFields( select );

		const newValues = {};
		for ( const [ attributeName, source ] of Object.entries( bindings ) ) {
			// Use the value, the field label, or the field key.
			const fieldKey = source.args.key;
			const { value: fieldValue, label: fieldLabel } =
				metaFields?.[ fieldKey ] || {};
			newValues[ attributeName ] = fieldValue ?? fieldLabel ?? fieldKey;
		}
		return newValues;
	},
	setValues( { dispatch, bindings } ) {
		const newValues = {};
		Object.values( bindings ).forEach( ( { args, newValue } ) => {
			newValues[ args.key ] = newValue;
		} );

		dispatch( coreDataStore ).editEntityRecord(
			'root',
			'site',
			undefined,
			newValues
		);
	},
	canUserEditValue( { select, args } ) {
		if ( ! supportedFields[ args.key ] ) {
			return false;
		}

		// Check that the user has the capability to edit post meta.
		return select( coreDataStore ).canUser( 'update', {
			kind: 'root',
			name: 'site',
		} );
	},
	getFieldsList( { select, context } ) {
		return getSiteFields( select, context );
	},
};
