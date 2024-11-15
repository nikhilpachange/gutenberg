/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ContrastChecker from '../components/contrast-checker';
import { useBlockElement } from '../components/block-list/use-block-props/use-block-refs';

function getComputedStyle( node ) {
	return node.ownerDocument.defaultView.getComputedStyle( node );
}

function detectColors( blockEl ) {
	if ( ! blockEl ) {
		return;
	}

	const firstLinkElement = blockEl.querySelector( 'a' );
	const linkColor =
		firstLinkElement && !! firstLinkElement.innerText
			? getComputedStyle( firstLinkElement ).color
			: null;

	const textColor = getComputedStyle( blockEl ).color;

	let backgroundColorNode = blockEl;
	let backgroundColor =
		getComputedStyle( backgroundColorNode ).backgroundColor;
	while (
		backgroundColor === 'rgba(0, 0, 0, 0)' &&
		backgroundColorNode.parentNode &&
		backgroundColorNode.parentNode.nodeType ===
			backgroundColorNode.parentNode.ELEMENT_NODE
	) {
		backgroundColorNode = backgroundColorNode.parentNode;
		backgroundColor =
			getComputedStyle( backgroundColorNode ).backgroundColor;
	}

	return {
		textColor,
		backgroundColor,
		linkColor,
	};
}

function createStyleObserver( node, callback ) {
	// Watch for changes to style-related attributes
	const observer = new MutationObserver( ( mutations ) => {
		const hasStyleChanges = mutations.some(
			( mutation ) => mutation.attributeName === 'style'
		);

		if ( hasStyleChanges ) {
			const computedStyle =
				node.ownerDocument.defaultView.getComputedStyle( node );
			callback( computedStyle );
		}
	} );

	// Observe style-related changes
	observer.observe( node, {
		attributeFilter: [ 'style' ],
	} );

	return observer;
}

export default function BlockColorContrastChecker( { clientId } ) {
	const [ detectedBackgroundColor, setDetectedBackgroundColor ] = useState();
	const [ detectedColor, setDetectedColor ] = useState();
	const [ detectedLinkColor, setDetectedLinkColor ] = useState();
	const blockEl = useBlockElement( clientId );

	useEffect( () => {
		if ( ! blockEl ) {
			return;
		}

		let colors = detectColors( blockEl );
		setDetectedColor( colors.textColor );
		setDetectedBackgroundColor( colors.backgroundColor );
		if ( colors.linkColor ) {
			setDetectedLinkColor( colors.linkColor );
		}

		const observer = createStyleObserver( blockEl, () => {
			colors = detectColors( blockEl );
			setDetectedColor( colors.textColor );
			setDetectedBackgroundColor( colors.backgroundColor );
			if ( colors.linkColor ) {
				setDetectedLinkColor( colors.linkColor );
			}
		} );
		// Cleanup
		return () => observer.disconnect();
	}, [ blockEl ] );

	return (
		<ContrastChecker
			backgroundColor={ detectedBackgroundColor }
			textColor={ detectedColor }
			enableAlphaChecker
			linkColor={ detectedLinkColor }
		/>
	);
}
