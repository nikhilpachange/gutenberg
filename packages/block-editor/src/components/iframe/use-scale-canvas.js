/**
 * WordPress dependencies
 */
import { useEffect, useRef, useCallback } from '@wordpress/element';
import { useReducedMotion, useResizeObserver } from '@wordpress/compose';

/**
 * Calculate the scale of the canvas.
 *
 * @param {Object} root0                     Object of options
 * @param {number} root0.frameSize           The size of the frame/offset around the canvas
 * @param {number} root0.containerWidth      Actual width of the canvas container
 * @param {number} root0.maxContainerWidth   Maximum width of the container to use for the scale calculation. This locks the canvas to a maximum width when zooming out.
 * @param {number} root0.scaleContainerWidth Width the of the container wrapping the canvas container
 * @return {number} scale value between 0 and/or equal to 1
 */
function calculateScale( {
	frameSize,
	containerWidth,
	maxContainerWidth,
	scaleContainerWidth,
} ) {
	return (
		( Math.min( containerWidth, maxContainerWidth ) - frameSize * 2 ) /
		scaleContainerWidth
	);
}

/**
 * Compute the next scrollTop position after scaling the iframe content.
 *
 * @param {Object} transitionFrom The starting point of the transition
 * @param {Object} transitionTo   The ending state of the transition
 * @return {number} The next scrollTop position after scaling the iframe content.
 */
function computeScrollTopNext( transitionFrom, transitionTo ) {
	const {
		clientHeight: prevClientHeight,
		frameSize: prevFrameSize,
		scaleValue: prevScale,
		scrollTop,
		scrollHeight,
	} = transitionFrom;
	const { clientHeight, frameSize, scaleValue } = transitionTo;
	// Step 0: Start with the current scrollTop.
	let scrollTopNext = scrollTop;
	// Step 1: Undo the effects of the previous scale and frame around the
	// midpoint of the visible area.
	scrollTopNext =
		( scrollTopNext + prevClientHeight / 2 - prevFrameSize ) / prevScale -
		prevClientHeight / 2;

	// Step 2: Apply the new scale and frame around the midpoint of the
	// visible area.
	scrollTopNext =
		( scrollTopNext + clientHeight / 2 ) * scaleValue +
		frameSize -
		clientHeight / 2;

	// Step 3: Handle an edge case so that you scroll to the top of the
	// iframe if the top of the iframe content is visible in the container.
	// The same edge case for the bottom is skipped because changing content
	// makes calculating it impossible.
	scrollTopNext = scrollTop <= prevFrameSize ? 0 : scrollTopNext;

	// This is the scrollTop value if you are scrolled to the bottom of the
	// iframe. We can't just let the browser handle it because we need to
	// animate the scaling.
	const maxScrollTop =
		scrollHeight * ( scaleValue / prevScale ) +
		frameSize * 2 -
		clientHeight;

	// Step 4: Clamp the scrollTopNext between the minimum and maximum
	// possible scrollTop positions. Round the value to avoid subpixel
	// truncation by the browser which sometimes causes a 1px error.
	return Math.round(
		Math.min( Math.max( 0, scrollTopNext ), Math.max( 0, maxScrollTop ) )
	);
}

/**
 * Generate the keyframes to use for the zoom out animation.
 *
 * @param {Object} transitionFrom Object of the starting transition state
 * @param {Object} transitionTo   Object of the ending transition state
 * @return {Object[]} An array of keyframes to use for the animation
 */
function getAnimationKeyframes( transitionFrom, transitionTo ) {
	const {
		scaleValue: prevScale,
		frameSize: prevFrameSize,
		scrollTop,
	} = transitionFrom;
	const { scaleValue, frameSize, scrollTop: scrollTopNext } = transitionTo;

	return [
		{
			translate: `0 0`,
			scale: prevScale,
			paddingTop: `${ prevFrameSize / prevScale }px`,
			paddingBottom: `${ prevFrameSize / prevScale }px`,
		},
		{
			translate: `0 ${ scrollTop - scrollTopNext }px`,
			scale: scaleValue,
			paddingTop: `${ frameSize / scaleValue }px`,
			paddingBottom: `${ frameSize / scaleValue }px`,
		},
	];
}

/**
 * Handles scaling the canvas for the zoom out mode and animating between
 * the states.
 *
 * @param {Object}        root0
 * @param {number}        root0.frameSize         The size of the frame around the content.
 * @param {Document}      root0.iframeDocument    The document of the iframe.
 * @param {number}        root0.maxContainerWidth The max width of the canvas to use as the starting scale point. Defaults to 750.
 * @param {number|string} root0.scale             The scale of the canvas. Can be an decimal between 0 and 1, 1, or 'auto-scaled'.
 * @return {Object} An object containing the following properties:
 *                  isZoomedOut: A boolean indicating if the canvas is zoomed out.
 *                  scaleContainerWidth: The width of the container used to calculate the scale.
 *                  contentResizeListener: A resize observer for the content.
 *                  containerResizeListener: A resize observer for the container.
 */
export function useScaleCanvas( {
	frameSize,
	iframeDocument,
	maxContainerWidth = 750,
	scale,
} ) {
	const [ contentResizeListener, { height: contentHeight } ] =
		useResizeObserver();
	const [ containerResizeListener, { width: containerWidth } ] =
		useResizeObserver();

	const initialContainerWidthRef = useRef( 0 );
	const isZoomedOut = scale !== 1;
	const prefersReducedMotion = useReducedMotion();
	const isAutoScaled = scale === 'auto-scaled';
	// Track if the animation should start when the useEffect runs.
	const startAnimationRef = useRef( false );
	// Track the animation so we know if we have an animation running,
	// and can cancel it, reverse it, call a finish event, etc.
	const animationRef = useRef( null );

	useEffect( () => {
		if ( ! isZoomedOut ) {
			initialContainerWidthRef.current = containerWidth;
		}
	}, [ containerWidth, isZoomedOut ] );

	const scaleContainerWidth = Math.max(
		initialContainerWidthRef.current,
		containerWidth
	);

	const scaleValue = isAutoScaled
		? calculateScale( {
				frameSize,
				containerWidth,
				maxContainerWidth,
				scaleContainerWidth,
		  } )
		: scale;

	/**
	 * The starting transition state for the zoom out animation.
	 */
	const transitionFrom = useRef( {
		scaleValue,
		frameSize,
		clientHeight: 0,
		scrollTop: 0,
		scrollHeight: 0,
	} );

	/**
	 * The ending transition state for the zoom out animation.
	 */
	const transitionTo = useRef( {
		scaleValue,
		frameSize,
		clientHeight: 0,
		scrollTop: 0,
		scrollHeight: 0,
	} );

	/**
	 * Start the zoom out animation. This sets the necessary CSS variables
	 * for animating the canvas and returns the Animation object.
	 *
	 * @return {Animation} The animation object for the zoom out animation.
	 */
	const startZoomOutAnimation = useCallback( () => {
		const { scrollTop } = transitionFrom.current;
		const { scrollTop: scrollTopNext } = transitionTo.current;

		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-scroll-top',
			`${ scrollTop }px`
		);

		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-scroll-top-next',
			`${ scrollTopNext }px`
		);

		iframeDocument.documentElement.classList.add( 'zoom-out-animation' );

		return iframeDocument.documentElement.animate(
			getAnimationKeyframes(
				transitionFrom.current,
				transitionTo.current
			),
			{
				easing: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
				duration: 400,
			}
		);
	}, [ iframeDocument ] );

	/**
	 * Callback when the zoom out animation is finished.
	 * - Cleans up animations refs
	 * - Adds final CSS vars for scale and frame size to preserve the state
	 * - Removes the 'zoom-out-animation' class (which has the fixed positioning)
	 * - Sets the final scroll position after the canvas is no longer in fixed position
	 * - Removes CSS vars related to the animation
	 * - Sets the transitionFrom to the transitionTo state to be ready for the next animation
	 */
	const finishZoomOutAnimation = useCallback( () => {
		startAnimationRef.current = false;
		animationRef.current = null;

		// Add our final scale and frame size now that the animation is done.
		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-scale',
			transitionTo.current.scaleValue
		);
		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-frame-size',
			`${ transitionTo.current.frameSize }px`
		);

		iframeDocument.documentElement.classList.remove( 'zoom-out-animation' );

		// Set the final scroll position that was just animated to.
		// Disable reason: Eslint isn't smart enough to know that this is a
		// DOM element. https://github.com/facebook/react/issues/31483
		// eslint-disable-next-line react-compiler/react-compiler
		iframeDocument.documentElement.scrollTop =
			transitionTo.current.scrollTop;

		iframeDocument.documentElement.style.removeProperty(
			'--wp-block-editor-iframe-zoom-out-scroll-top'
		);
		iframeDocument.documentElement.style.removeProperty(
			'--wp-block-editor-iframe-zoom-out-scroll-top-next'
		);

		// Update previous values.
		transitionFrom.current = transitionTo.current;
	}, [ iframeDocument ] );

	/**
	 * Runs when zoom out mode is toggled, and sets the startAnimation flag
	 * so the animation will start when the next useEffect runs. We _only_
	 * want to animate when the zoom out mode is toggled, not when the scale
	 * changes due to the container resizing.
	 */
	useEffect( () => {
		if ( ! iframeDocument ) {
			return;
		}

		if ( isZoomedOut ) {
			iframeDocument.documentElement.classList.add( 'is-zoomed-out' );
		}

		startAnimationRef.current = true;

		return () => {
			iframeDocument.documentElement.classList.remove( 'is-zoomed-out' );
		};
	}, [ iframeDocument, isZoomedOut ] );

	/**
	 * This handles:
	 * 1. Setting the correct scale and vars of the canvas when zoomed out
	 * 2. If zoom out mode has been toggled, runs the animation of zooming in/out
	 */
	useEffect( () => {
		if ( ! iframeDocument ) {
			return;
		}

		// We need to update the appropriate scale to exit from. If sidebars have been opened since setting the
		// original scale, we will snap to a much smaller scale due to the scale container immediately changing sizes when exiting.
		if ( isAutoScaled && transitionFrom.current.scaleValue !== 1 ) {
			// We use containerWidth as the divisor, as scaleContainerWidth will always match the containerWidth when
			// exiting.
			transitionFrom.current.scaleValue = calculateScale( {
				frameSize: transitionFrom.current.frameSize,
				containerWidth,
				maxContainerWidth,
				scaleContainerWidth: containerWidth,
			} );
		}

		// If we are not going to animate the transition, set the scale and frame size directly.
		// If we are animating, these values will be set when the animation is finished.
		// Example: Opening sidebars that reduce the scale of the canvas, but we don't want to
		// animate the transition.
		if ( ! startAnimationRef.current ) {
			iframeDocument.documentElement.style.setProperty(
				'--wp-block-editor-iframe-zoom-out-scale',
				scaleValue
			);
			iframeDocument.documentElement.style.setProperty(
				'--wp-block-editor-iframe-zoom-out-frame-size',
				`${ frameSize }px`
			);
		}

		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-content-height',
			`${ contentHeight }px`
		);

		const clientHeight = iframeDocument.documentElement.clientHeight;
		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-inner-height',
			`${ clientHeight }px`
		);

		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-container-width',
			`${ containerWidth }px`
		);
		iframeDocument.documentElement.style.setProperty(
			'--wp-block-editor-iframe-zoom-out-scale-container-width',
			`${ scaleContainerWidth }px`
		);

		/**
		 * Handle the zoom out animation:
		 *
		 * - Get the current scrollTop position
		 * - Calculate where the same scroll position is after scaling
		 * - Apply fixed positioning to the canvas with a transform offset
		 *   to keep the canvas centered
		 * - Animate the scale and padding to the new scale and frame size
		 * - After the animation is complete, remove the fixed positioning
		 *   and set the scroll position that keeps everything centered
		 */
		if ( startAnimationRef.current ) {
			// Don't allow a new transition to start again unless it was started by the zoom out mode changing.
			startAnimationRef.current = false;

			/**
			 * If we already have an animation running, reverse it.
			 */
			if ( animationRef.current ) {
				animationRef.current.reverse();
				// Swap the transition to/from refs so that we set the correct values when
				// finishZoomOutAnimation runs.
				const tempTransitionFrom = transitionFrom.current;
				const tempTransitionTo = transitionTo.current;
				transitionFrom.current = tempTransitionTo;
				transitionTo.current = tempTransitionFrom;
			} else {
				/**
				 * Start a new zoom animation.
				 */

				// We can't trust the set value from contentHeight, as it was measured
				// before the zoom out mode was changed. After zoom out mode is changed,
				// appenders may appear or disappear, so we need to get the height from
				// the iframe at this point when we're about to animate the zoom out.
				// The iframe scrollTop, scrollHeight, and clientHeight will all be
				// the most accurate.
				transitionFrom.current.clientHeight =
					transitionFrom.current.clientHeight ?? clientHeight;
				transitionFrom.current.scrollTop =
					iframeDocument.documentElement.scrollTop;
				transitionFrom.current.scrollHeight =
					iframeDocument.documentElement.scrollHeight;

				transitionTo.current = {
					scaleValue,
					frameSize,
					clientHeight,
				};
				transitionTo.current.scrollTop = computeScrollTopNext(
					transitionFrom.current,
					transitionTo.current
				);

				animationRef.current = startZoomOutAnimation();

				// If the user prefers reduced motion, finish the animation immediately and set the final state.
				if ( prefersReducedMotion ) {
					finishZoomOutAnimation();
				} else {
					animationRef.current.onfinish = finishZoomOutAnimation;
				}
			}
		}

		return () => {
			iframeDocument.documentElement.style.removeProperty(
				'--wp-block-editor-iframe-zoom-out-scale'
			);
			iframeDocument.documentElement.style.removeProperty(
				'--wp-block-editor-iframe-zoom-out-frame-size'
			);
			iframeDocument.documentElement.style.removeProperty(
				'--wp-block-editor-iframe-zoom-out-content-height'
			);
			iframeDocument.documentElement.style.removeProperty(
				'--wp-block-editor-iframe-zoom-out-inner-height'
			);
			iframeDocument.documentElement.style.removeProperty(
				'--wp-block-editor-iframe-zoom-out-container-width'
			);
			iframeDocument.documentElement.style.removeProperty(
				'--wp-block-editor-iframe-zoom-out-scale-container-width'
			);
		};
	}, [
		startZoomOutAnimation,
		finishZoomOutAnimation,
		prefersReducedMotion,
		isAutoScaled,
		scaleValue,
		frameSize,
		iframeDocument,
		contentHeight,
		containerWidth,
		maxContainerWidth,
		scaleContainerWidth,
	] );

	return {
		isZoomedOut,
		scaleContainerWidth,
		contentResizeListener,
		containerResizeListener,
	};
}
