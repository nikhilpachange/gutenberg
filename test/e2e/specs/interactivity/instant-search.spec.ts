/**
 * Internal dependencies
 */
import { test, expect } from './fixtures';

test.describe( 'Instant Search', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'emptytheme' );
		await requestUtils.setGutenbergExperiments( [
			'gutenberg-search-query-block',
		] );
		await requestUtils.deleteAllPosts();

		// Create test posts
		// Make sure to create them last-to-first to avoid flakiness
		await requestUtils.createPost( {
			title: 'Unique Post',
			content: 'This post has unique content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 5
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'Fourth Test Post',
			content: 'This is the fourth test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 4
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'Third Test Post',
			content: 'This is the third test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 3
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'Second Test Post',
			content: 'This is the second test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 2
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'First Test Post',
			content: 'This is the first test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 1
			).toISOString(),
		} );

		// Set the Blog pages show at most 2 posts
		await requestUtils.updateSiteSettings( {
			posts_per_page: 2,
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.deleteAllPages();
		await requestUtils.deleteAllTemplates( 'wp_template' );

		// Reset the Blog pages show at most 10 posts
		await requestUtils.updateSiteSettings( {
			posts_per_page: 10,
		} );
	} );

	test.describe( 'Inherited (Default) Query', () => {
		test.beforeEach( async ( { page } ) => {
			// Navigate to the home page
			await page.goto( '/' );
		} );

		test.beforeAll( async ( { requestUtils } ) => {
			// Edit the Home template instead of creating a new page
			await requestUtils.createTemplate( 'wp_template', {
				slug: 'home',
				title: 'Home',
				content: `
<!-- wp:query {"enhancedPagination":true,"queryId":1,"query":{"inherit":true,"offset":0,"perPage":2,"order":"desc","orderBy":"date"}} -->
	<div class="wp-block-query">
		<!-- wp:search {"label":"","buttonText":"Search"} /-->
			<!-- wp:post-template -->
				<!-- wp:post-title /-->
				<!-- wp:post-excerpt /-->
			<!-- /wp:post-template -->
			<!-- wp:query-pagination -->
				<!-- wp:query-pagination-previous /-->
				<!-- wp:query-pagination-numbers /-->
				<!-- wp:query-pagination-next /-->
			<!-- /wp:query-pagination -->
			<!-- wp:query-no-results -->
				<!-- wp:paragraph -->
				<p>No results found.</p>
				<!-- /wp:paragraph -->
			<!-- /wp:query-no-results -->
		</div>
<!-- /wp:query -->`,
			} );
		} );

		test( 'should update search results without page reload', async ( {
			page,
		} ) => {
			// Check that the first post is shown initially
			await expect(
				page.getByText( 'First Test Post', { exact: true } )
			).toBeVisible();

			// Type in search input and verify results update
			await page.locator( 'input[type="search"]' ).fill( 'Unique' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( 'instant-search=Unique' )
			);

			// Verify only the unique post is shown
			await expect(
				page.getByText( 'Unique Post', { exact: true } )
			).toBeVisible();
			await expect(
				page.getByText( 'First Test Post', { exact: true } )
			).toBeHidden();
		} );

		test( 'should update URL with search parameter', async ( { page } ) => {
			// Test global query search parameter
			await page.locator( 'input[type="search"]' ).fill( 'Test' );
			await expect( page ).toHaveURL( /instant-search=Test/ );

			// Clear search and verify parameter is removed
			await page.locator( 'input[type="search"]' ).fill( '' );
			await expect( page ).not.toHaveURL( /instant-search=/ );
		} );

		test( 'should handle search debouncing', async ( { page } ) => {
			let responseCount = 0;

			// Monitor the number of requests
			page.on( 'response', ( response ) => {
				if ( response.url().includes( 'instant-search=' ) ) {
					responseCount++;
				}
			} );

			// Type quickly and wait for the response
			let responsePromise = page.waitForResponse( ( response ) => {
				return (
					response.url().includes( 'instant-search=Test' ) &&
					response.status() === 200
				);
			} );
			await page
				.locator( 'input[type="search"]' )
				.pressSequentially( 'Test', { delay: 100 } );
			await responsePromise;

			// Check that only one request was made
			expect( responseCount ).toBe( 1 );

			// Verify URL is updated after debounce
			await expect( page ).toHaveURL( /instant-search=Test/ );

			responsePromise = page.waitForResponse( ( response ) => {
				return response.url().includes( 'instant-search=Test1234' );
			} );
			// Type again with a large delay and verify that a request is made
			// for each character
			await page
				.locator( 'input[type="search"]' )
				.pressSequentially( '1234', { delay: 500 } );
			await responsePromise;

			// Check that five requests were made (Test, Test1, Test12, Test123, Test1234)
			expect( responseCount ).toBe( 5 );
		} );

		test( 'should reset pagination when searching', async ( { page } ) => {
			// Navigate to second page
			await page.click( 'a.wp-block-query-pagination-next' );

			// Check that the url contains either `?paged=2` or `/page/2/`. If the
			// site has the `pretty` permalink structure, the url will contain
			// `/page/2/` instead of `?paged=2`.
			await expect( page ).toHaveURL( /(?:paged=2|\/page\/2\/)/ );

			// Search and verify we're back to first page
			await page.locator( 'input[type="search"]' ).fill( 'Test' );
			await expect( page ).not.toHaveURL( /paged=2/ );

			// The url should now contain `?paged=1` because we're on the first page
			// We cannot remove the `paged` param completely because the pathname
			// might contain the `/page/2` suffix so we need to set `paged` to `1` to
			// override it.
			await expect( page ).toHaveURL( /paged=1/ );
		} );

		test( 'should show no-results block when search has no matches', async ( {
			page,
		} ) => {
			await page
				.locator( 'input[type="search"]' )
				.fill( 'NonexistentContent' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( 'instant-search=NonexistentContent' )
			);

			// Verify no-results block is shown
			await expect( page.getByText( 'No results found.' ) ).toBeVisible();
		} );

		test( 'should update pagination numbers based on search results', async ( {
			page,
		} ) => {
			// Initially should show pagination numbers for 3 pages
			await expect(
				page.locator( '.wp-block-query-pagination-numbers' )
			).toBeVisible();
			await expect(
				page.getByRole( 'link', { name: '2' } )
			).toBeVisible();
			await expect(
				page.getByRole( 'link', { name: '3' } )
			).toBeVisible();

			// Search for unique post
			await page.locator( 'input[type="search"]' ).fill( 'Unique' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( 'instant-search=Unique' )
			);

			// Pagination numbers should not be visible with single result
			await expect(
				page.locator( '.wp-block-query-pagination-numbers' )
			).toBeHidden();
		} );
	} );

	test.describe( 'Custom Query', () => {
		let pageId: number;

		const queryId = 123;

		test.beforeAll( async ( { requestUtils } ) => {
			// Create page with custom query
			const { id } = await requestUtils.createPage( {
				status: 'publish',
				date_gmt: new Date().toISOString(),
				title: 'Custom Query',
				content: `
<!-- wp:query {"enhancedPagination":true,"queryId":${ queryId },"query":{"inherit":false,"perPage":2,"order":"desc","orderBy":"date","offset":0}} -->
  <div class="wp-block-query">
		<!-- wp:search {"label":"","buttonText":"Search"} /-->
		<!-- wp:post-template -->
			<!-- wp:post-title /-->
			<!-- wp:post-excerpt /-->
		<!-- /wp:post-template -->
		<!-- wp:query-pagination -->
			<!-- wp:query-pagination-previous /-->
			<!-- wp:query-pagination-numbers /-->
			<!-- wp:query-pagination-next /-->
		<!-- /wp:query-pagination -->
		<!-- wp:query-no-results -->
			<!-- wp:paragraph -->
			<p>No results found.</p>
			<!-- /wp:paragraph -->
		<!-- /wp:query-no-results -->
	</div>
<!-- /wp:query -->`,
			} );

			pageId = id;
		} );

		test.beforeEach( async ( { page } ) => {
			await page.goto( `/?p=${ pageId }` );
		} );

		test( 'should update search results without page reload', async ( {
			page,
		} ) => {
			// Check that the first post is shown initially
			await expect(
				page.getByText( 'First Test Post', { exact: true } )
			).toBeVisible();

			// Type in search input and verify results update
			await page.locator( 'input[type="search"]' ).fill( 'Unique' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( `instant-search-${ queryId }=Unique` )
			);

			// Verify only the unique post is shown
			await expect(
				page.getByText( 'Unique Post', { exact: true } )
			).toBeVisible();
			await expect(
				page.getByText( 'First Test Post', { exact: true } )
			).toBeHidden();
		} );

		test( 'should update URL with search parameter', async ( { page } ) => {
			// Test global query search parameter
			await page.locator( 'input[type="search"]' ).fill( 'Test' );
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ queryId }=Test` )
			);

			// Clear search and verify parameter is removed
			await page.locator( 'input[type="search"]' ).fill( '' );
			await expect( page ).not.toHaveURL(
				new RegExp( `instant-search-${ queryId }=` )
			);
		} );

		test( 'should handle search debouncing', async ( { page } ) => {
			let responseCount = 0;

			// Monitor the number of requests
			page.on( 'response', ( res ) => {
				if ( res.url().includes( `instant-search-${ queryId }=` ) ) {
					responseCount++;
				}
			} );

			// Type quickly and wait for the response
			let responsePromise = page.waitForResponse( ( response ) => {
				return (
					response
						.url()
						.includes( `instant-search-${ queryId }=Test` ) &&
					response.status() === 200
				);
			} );
			await page
				.locator( 'input[type="search"]' )
				.pressSequentially( 'Test', { delay: 100 } );
			await responsePromise;

			// Check that only one request was made
			expect( responseCount ).toBe( 1 );

			// Verify URL is updated after debounce
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ queryId }=Test` )
			);

			responsePromise = page.waitForResponse( ( response ) => {
				return response
					.url()
					.includes( `instant-search-${ queryId }=Test1234` );
			} );
			// Type again with a large delay and verify that a request is made
			// for each character
			await page
				.locator( 'input[type="search"]' )
				.pressSequentially( '1234', { delay: 500 } );
			await responsePromise;

			// Check that five requests were made (Test, Test1, Test12, Test123, Test1234)
			expect( responseCount ).toBe( 5 );
		} );

		test( 'should reset pagination when searching', async ( { page } ) => {
			// Navigate to second page
			await page.click( 'a.wp-block-query-pagination-next' );

			await expect( page ).toHaveURL(
				new RegExp( `query-${ queryId }-page=2` )
			);

			// Search and verify we're back to first page
			await page.locator( 'input[type="search"]' ).fill( 'Test' );
			await expect( page ).not.toHaveURL(
				new RegExp( `query-${ queryId }-page=2` )
			);

			// The url should now contain `?paged=1` because we're on the first page
			// We cannot remove the `paged` param completely because the pathname
			// might contain the `/page/2` suffix so we need to set `paged` to `1` to
			// override it.
			await expect( page ).toHaveURL(
				new RegExp( `query-${ queryId }-page=1` )
			);
		} );

		test( 'should show no-results block when search has no matches', async ( {
			page,
		} ) => {
			await page
				.locator( 'input[type="search"]' )
				.fill( 'NonexistentContent' );
			await page.waitForResponse( ( response ) =>
				response
					.url()
					.includes(
						`instant-search-${ queryId }=NonexistentContent`
					)
			);

			// Verify no-results block is shown
			await expect( page.getByText( 'No results found.' ) ).toBeVisible();
		} );

		test( 'should update pagination numbers based on search results', async ( {
			page,
		} ) => {
			// Initially should show pagination numbers for 3 pages
			await expect(
				page.locator( '.wp-block-query-pagination-numbers' )
			).toBeVisible();
			await expect(
				page.getByRole( 'link', { name: '2' } )
			).toBeVisible();
			await expect(
				page.getByRole( 'link', { name: '3' } )
			).toBeVisible();

			// Search for unique post
			await page.locator( 'input[type="search"]' ).fill( 'Unique' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( `instant-search-${ queryId }=Unique` )
			);

			// Pagination numbers should not be visible with single result
			await expect(
				page.locator( '.wp-block-query-pagination-numbers' )
			).toBeHidden();
		} );
	} );
} );
