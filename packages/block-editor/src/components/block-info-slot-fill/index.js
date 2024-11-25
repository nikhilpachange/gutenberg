/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	useBlockEditContext,
	mayDisplayControlsKey,
} from '../block-edit/context';

const { Fill, Slot } = createSlotFill( Symbol( 'BlockInformation' ) );

const BlockInfo = ( props ) => {
	const context = useBlockEditContext();
	if ( ! context[ mayDisplayControlsKey ] ) {
		return null;
	}
	return <Fill { ...props } />;
};
BlockInfo.Slot = ( props ) => <Slot { ...props } />;

export default BlockInfo;
