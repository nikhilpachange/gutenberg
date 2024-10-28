/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

export default function TermTitleEdit( { context } ) {
	const blockProps = useBlockProps();
	const { taxonomyId, taxonomyType } = context;
	const termTitle = useSelect(
		( select ) => {
			return select( coreStore ).getEntityRecord(
				'taxonomy',
				taxonomyType,
				taxonomyId
			)?.name;
		},
		[ taxonomyId, taxonomyType ]
	);

	return <span { ...blockProps }>{ termTitle || __( 'Term Title' ) }</span>;
}
