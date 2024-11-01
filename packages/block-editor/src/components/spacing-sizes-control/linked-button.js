/**
 * WordPress dependencies
 */
import { Button, Tooltip } from '@wordpress/components';
import { linkOffVertical, linkVertical } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

export default function LinkedButton( { isLinked, ...props } ) {
	const label = isLinked ? __( 'Unlink sides' ) : __( 'Link sides' );

	return (
		<Tooltip text={ label }>
			<Button
				{ ...props }
				size="small"
				icon={ isLinked ? linkVertical : linkOffVertical }
				iconSize={ 24 }
				aria-label={ label }
			/>
		</Tooltip>
	);
}
