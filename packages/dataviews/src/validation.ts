/**
 * Internal dependencies
 */
import { normalizeFields } from './normalize-fields';
import type { Field, Form } from './types';

export function isItemValid< Item >(
	item: Item,
	fields: Field< Item >[],
	form: Form< Item >
): boolean {
	const _fields = normalizeFields(
		fields.filter( ( { id } ) => !! form.fields?.includes( id ) )
	);
	return _fields.every( ( field ) => {
		const value = field.getValue( { item } );
		return field.isValid( value, item, { elements: field.elements } );
	} );
}
