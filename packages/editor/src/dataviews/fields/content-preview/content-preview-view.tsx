/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
// @ts-ignore
import { parse } from '@wordpress/blocks';
import {
	BlockPreview,
	privateApis as blockEditorPrivateApis,
	// @ts-ignore
} from '@wordpress/block-editor';
import type { BasePost } from '@wordpress/fields';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { EditorProvider } from '../../../components/provider';
import { unlock } from '../../../lock-unlock';
// @ts-ignore
import { store as editorStore } from '../../../store';

const { useGlobalStyle } = unlock( blockEditorPrivateApis );

function ContentPreviewContainer( {
	children,
}: {
	children: React.ReactNode;
} ) {
	const [ backgroundColor = 'white' ] = useGlobalStyle( 'color.background' );
	return (
		<div
			className="editor-fields-content-preview"
			style={ {
				backgroundColor,
			} }
		>
			{ children }
		</div>
	);
}

export default function ContentPreviewView( { item }: { item: BasePost } ) {
	const settings = useSelect( ( select ) => {
		return select( editorStore ).getEditorSettings();
	}, [] );

	const content =
		typeof item.content === 'string' ? item.content : item.content.raw;
	const blocks = useMemo( () => {
		return parse( content );
	}, [ content ] );
	const isEmpty = ! blocks?.length;
	// Wrap everything in a block editor provider to ensure 'styles' that are needed
	// for the previews are synced between the site editor store and the block editor store.
	// Additionally we need to have the `__experimentalBlockPatterns` setting in order to
	// render patterns inside the previews.
	// TODO: Same approach is used in the patterns list and it becomes obvious that some of
	// the block editor settings are needed in context where we don't have the block editor.
	// Explore how we can solve this in a better way.
	return (
		<EditorProvider post={ item } settings={ settings }>
			<ContentPreviewContainer>
				{ isEmpty && (
					<span className="editor-fields-content-preview__empty">
						{ __( 'Empty content' ) }
					</span>
				) }
				{ ! isEmpty && (
					<BlockPreview.Async>
						<BlockPreview blocks={ blocks } />
					</BlockPreview.Async>
				) }
			</ContentPreviewContainer>
		</EditorProvider>
	);
}
