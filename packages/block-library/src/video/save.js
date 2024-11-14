/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps,
	__experimentalGetElementClassName,
	__experimentalGetDimensionsClassesAndStyles as getDimensionsClassesAndStyles,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import Tracks from './tracks';

export default function save( { attributes } ) {
	const {
		autoplay,
		caption,
		controls,
		loop,
		muted,
		poster,
		preload,
		src,
		playsInline,
		tracks,
	} = attributes;

	const dimensionsProps = getDimensionsClassesAndStyles( attributes );

	return (
		<figure { ...useBlockProps.save() }>
			{ src && (
				<video
					autoPlay={ autoplay }
					controls={ controls }
					loop={ loop }
					muted={ muted }
					poster={ poster }
					preload={ preload !== 'metadata' ? preload : undefined }
					src={ src }
					playsInline={ playsInline }
					className={ dimensionsProps.className }
					style={ dimensionsProps.style }
				>
					<Tracks tracks={ tracks } />
				</video>
			) }
			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content
					className={ __experimentalGetElementClassName( 'caption' ) }
					tagName="figcaption"
					value={ caption }
				/>
			) }
		</figure>
	);
}
