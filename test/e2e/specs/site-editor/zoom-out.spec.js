/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const EDITOR_ZOOM_OUT_CONTENT = `
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"dimensions":{"minHeight":"100vh"}},"backgroundColor":"base-2","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-base-2-background-color has-background" style="min-height:100vh;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:paragraph -->
<p>First Section Start</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"layout":{"selfStretch":"fit","flexSize":null}}} -->
<p>First Section Center</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>First Section End</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"dimensions":{"minHeight":"100vh"}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-base-background-color has-background" style="min-height:100vh;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:paragraph -->
<p>Second Section Start</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"layout":{"selfStretch":"fit","flexSize":null}}} -->
<p>Second Section Center</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Second Section End</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"dimensions":{"minHeight":"100vh"}},"backgroundColor":"base-2","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-base-2-background-color has-background" style="min-height:100vh;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:paragraph -->
<p>Third Section Start</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"layout":{"selfStretch":"fit","flexSize":null}}} -->
<p>Third Section Center</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Third Section End</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"dimensions":{"minHeight":"100vh"}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-base-background-color has-background" style="min-height:100vh;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:paragraph -->
<p>Fourth Section Start</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"layout":{"selfStretch":"fit","flexSize":null}}} -->
<p>Fourth Section Center</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Fourth Section End</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;

// The test is flaky and fails almost consistently.
// See: https://github.com/WordPress/gutenberg/issues/61806.
// eslint-disable-next-line playwright/no-skipped-test
test.describe( 'Zoom Out', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'emptytheme' );
	} );

	test.beforeEach( async ( { admin, editor } ) => {
		await admin.visitSiteEditor();
		await editor.canvas.locator( 'body' ).click();
		// Add some patterns into the page.
		await editor.setContent( EDITOR_ZOOM_OUT_CONTENT );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
	} );

	test.skip( 'Clicking on inserter while on zoom-out should open the patterns tab on the inserter', async ( {
		page,
	} ) => {
		// Trigger zoom out on Global Styles because there the inserter is not open.
		await page.getByRole( 'button', { name: 'Styles' } ).click();
		await page.getByRole( 'button', { name: 'Browse styles' } ).click();

		// select the 1st pattern
		await page
			.frameLocator( 'iframe[name="editor-canvas"]' )
			.locator( 'header' )
			.click();

		await expect( page.getByLabel( 'Add pattern' ) ).toHaveCount( 3 );
		await page.getByLabel( 'Add pattern' ).first().click();
		await expect( page.getByLabel( 'Add pattern' ) ).toHaveCount( 2 );

		await expect(
			page
				.locator( '#tabs-2-allPatterns-view div' )
				.filter( { hasText: 'All' } )
				.nth( 1 )
		).toBeVisible();
	} );

	test( 'Toggling zoom state should keep content centered', async ( {
		page,
		editor,
	} ) => {
		// Find the scroll container element
		await page.evaluate( () => {
			const { activeElement } =
				document.activeElement?.contentDocument ?? document;
			window.scrollContainer =
				window.wp.dom.getScrollContainer( activeElement );
			return window.scrollContainer;
		} );

		// Test: Test from top of page (scrollTop 0)
		// Enter Zoom Out
		await page.getByRole( 'button', { name: 'Zoom Out' } ).click();

		const scrollTopZoomed = await page.evaluate( () => {
			return window.scrollContainer.scrollTop;
		} );

		expect( scrollTopZoomed ).toBe( 0 );

		// Exit Zoom Out
		await page.getByRole( 'button', { name: 'Zoom Out' } ).click();

		const scrollTopNoZoom = await page.evaluate( () => {
			return window.scrollContainer.scrollTop;
		} );

		expect( scrollTopNoZoom ).toBe( 0 );

		// Test: Should center the scroll position when zooming out/in
		const firstSectionEnd = editor.canvas.locator(
			'text=First Section End'
		);
		const secondSectionStart = editor.canvas.locator(
			'text=Second Section Start'
		);
		const secondSectionCenter = editor.canvas.locator(
			'text=Second Section Center'
		);
		const secondSectionEnd = editor.canvas.locator(
			'text=Second Section End'
		);
		const thirdSectionStart = editor.canvas.locator(
			'text=Third Section Start'
		);
		const thirdSectionCenter = editor.canvas.locator(
			'text=Third Section Center'
		);
		const thirdSectionEnd = editor.canvas.locator(
			'text=Third Section End'
		);
		const fourthSectionStart = editor.canvas.locator(
			'text=Fourth Section Start'
		);

		// Test for second section
		// Playwright scrolls it to the center of the viewport, so this is what we scroll to.
		await secondSectionCenter.scrollIntoViewIfNeeded();

		// Because the text is spread with a group height of 100vh, they should both be visible.
		await expect( firstSectionEnd ).not.toBeInViewport();
		await expect( secondSectionStart ).toBeInViewport();
		await expect( secondSectionEnd ).toBeInViewport();
		await expect( thirdSectionStart ).not.toBeInViewport();

		// After zooming, if we zoomed out with the correct central point, they should both still be visible when toggling zoom out state
		// Enter Zoom Out
		await page.getByRole( 'button', { name: 'Zoom Out' } ).click();
		await expect( firstSectionEnd ).toBeInViewport();
		await expect( secondSectionStart ).toBeInViewport();
		await expect( secondSectionEnd ).toBeInViewport();
		await expect( thirdSectionStart ).toBeInViewport();

		// Exit Zoom Out
		await page.getByRole( 'button', { name: 'Zoom Out' } ).click();
		await expect( firstSectionEnd ).not.toBeInViewport();
		await expect( secondSectionStart ).toBeInViewport();
		await expect( secondSectionEnd ).toBeInViewport();
		await expect( thirdSectionStart ).not.toBeInViewport();

		// Test for third section
		// Playwright scrolls it to the center of the viewport, so this is what we scroll to.
		await thirdSectionCenter.scrollIntoViewIfNeeded();

		// Because the text is spread with a group height of 100vh, they should both be visible.
		await expect( secondSectionEnd ).not.toBeInViewport();
		await expect( thirdSectionStart ).toBeInViewport();
		await expect( thirdSectionEnd ).toBeInViewport();
		await expect( fourthSectionStart ).not.toBeInViewport();

		// After zooming, if we zoomed out with the correct central point, they should both still be visible when toggling zoom out state
		// Enter Zoom Out
		await page.getByRole( 'button', { name: 'Zoom Out' } ).click();
		await expect( secondSectionEnd ).toBeInViewport();
		await expect( thirdSectionStart ).toBeInViewport();
		await expect( thirdSectionEnd ).toBeInViewport();
		await expect( fourthSectionStart ).toBeInViewport();

		// Exit Zoom Out
		await page.getByRole( 'button', { name: 'Zoom Out' } ).click();
		await expect( secondSectionEnd ).not.toBeInViewport();
		await expect( thirdSectionStart ).toBeInViewport();
		await expect( thirdSectionEnd ).toBeInViewport();
		await expect( fourthSectionStart ).not.toBeInViewport();
	} );
} );
