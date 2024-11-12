/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Homepage Settings via Editor', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await Promise.all( [ requestUtils.activateTheme( 'emptytheme' ) ] );
		await requestUtils.createPage( {
			title: 'Homepage',
			status: 'publish',
		} );
		await requestUtils.createPage( {
			title: 'Draft page',
			status: 'draft',
		} );
	} );

	test.beforeEach( async ( { admin, page } ) => {
		await admin.visitSiteEditor();
		await page.getByRole( 'button', { name: 'Pages' } ).click();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await Promise.all( [
			requestUtils.deleteAllPages(),
			requestUtils.updateSiteSettings( {
				show_on_front: 'posts',
				page_on_front: 0,
				page_for_posts: 0,
			} ),
		] );
	} );

	test( 'should show "Set as homepage" action on published pages', async ( {
		page,
	} ) => {
		const samplePage = page
			.getByRole( 'gridcell' )
			.getByLabel( 'Homepage' );
		const samplePageRow = page
			.getByRole( 'row' )
			.filter( { has: samplePage } );
		await samplePageRow.click();
		await samplePageRow
			.getByRole( 'button', {
				name: 'Actions',
			} )
			.click();
		await expect(
			page.getByRole( 'menuitem', { name: 'Set as homepage' } )
		).toBeVisible();
	} );

	test( 'should show "Set as homepage" action on draft pages', async ( {
		page,
	} ) => {
		const draftPage = page
			.getByRole( 'gridcell' )
			.getByLabel( 'Draft page' );
		const draftPageRow = page
			.getByRole( 'row' )
			.filter( { has: draftPage } );
		await draftPageRow.click();
		await draftPageRow
			.getByRole( 'button', {
				name: 'Actions',
			} )
			.click();
		await expect(
			page.getByRole( 'menuitem', { name: 'Set as homepage' } )
		).toBeVisible();
	} );

	test.skip( 'should not show "Set as homepage" action on current homepage', async ( {
		page,
	} ) => {
		const samplePage = page
			.getByRole( 'gridcell' )
			.getByLabel( 'Homepage' );
		const samplePageRow = page
			.getByRole( 'row' )
			.filter( { has: samplePage } );
		await samplePageRow.click();
		await samplePageRow
			.getByRole( 'button', {
				name: 'Actions',
			} )
			.click();
		await page.getByRole( 'menuitem', { name: 'Set as homepage' } ).click();
		await expect(
			page.getByRole( 'button', { name: 'Homepage updated' } )
		).toBeVisible( { timeout: 10000 } );
	} );
} );
