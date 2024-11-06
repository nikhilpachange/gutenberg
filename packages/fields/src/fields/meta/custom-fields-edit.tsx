/**
 * WordPress dependencies
 */
import { __experimentalInputControl as InputControl } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import type { DataFormControlProps } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import type { BasePost } from '../../types';
import { unlock } from '../../lock-unlock';

const CustomFieldsEdit = ( { data }: DataFormControlProps< BasePost > ) => {
	const { editEntityRecord } = useDispatch( coreStore );
	const registeredFields = useSelect(
		( select ) => {
			const { getRegisteredPostMeta } = unlock( select( coreStore ) );
			return getRegisteredPostMeta( data.type );
		},
		[ data.type ]
	);

	const fields = Object.fromEntries(
		Object.entries( data.meta as Record< string, any > ).filter(
			( [ key ] ) =>
				!! registeredFields[ key ] &&
				! key.startsWith( '_' ) &&
				key !== 'footnotes'
		)
	);

	return (
		<fieldset className="fields-controls__custom-fields">
			{ Object.entries( fields ).map( ( [ key, value ] ) => (
				<InputControl
					key={ key }
					__next40pxDefaultSize
					label={ registeredFields[ key ]?.title || key }
					value={ value }
					autoComplete="off"
					spellCheck="false"
					type="text"
					onChange={ ( newValue?: string ) => {
						// TODO: Check how to use `onChange` here.
						editEntityRecord( 'postType', data.type, data.id, {
							meta: {
								...data.meta,
								[ key ]: newValue,
							},
						} );
					} }
					size="compact"
					style={ { marginBottom: '20px' } }
				/>
			) ) }
		</fieldset>
	);
};

export default CustomFieldsEdit;
