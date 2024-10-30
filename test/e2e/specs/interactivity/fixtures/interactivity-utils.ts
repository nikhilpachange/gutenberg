/**
 * WordPress dependencies
 */
import type { RequestUtils } from '@wordpress/e2e-test-utils-playwright';
/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

type AddPostWithBlockOptions = {
	alias?: string;
	attributes?: Record< string, any >;
};

export default class InteractivityUtils {
	links: Map< string, string >;
	requestUtils: RequestUtils;
	page: Page;

	constructor( {
		requestUtils,
		page,
	}: {
		requestUtils: RequestUtils;
		page: Page;
	} ) {
		this.links = new Map();
		this.requestUtils = requestUtils;
		this.page = page;
	}

	getLink( blockName: string ) {
		const link = this.links.get( blockName );
		if ( ! link ) {
			throw new Error(
				`No link found for post with block '${ blockName }'`
			);
		}

		/*
		 * Add an extra param to disable directives SSR. This is required at
		 * this moment, as SSR for directives is not stabilized yet and we need
		 * to ensure hydration works, even when the SSR'ed HTML is not correct.
		 */
		const url = new URL( link );
		url.searchParams.append(
			'disable_server_directive_processing',
			'true'
		);
		return url.href;
	}

	async addPostWithBlock(
		name: string,
		{ attributes, alias }: AddPostWithBlockOptions = {}
	) {
		const block = attributes
			? `${ name } ${ JSON.stringify( attributes ) }`
			: name;

		if ( ! alias ) {
			alias = block;
		}

		const payload = {
			content: `<!-- wp:${ block } /-->`,
			status: 'publish' as 'publish',
			date_gmt: '2023-01-01T00:00:00',
			title: alias,
		};

		const { link } = await this.requestUtils.createPost( payload );
		this.links.set( alias, link );
		return this.getLink( alias );
	}

	async deleteAllPosts() {
		await this.requestUtils.deleteAllPosts();
		this.links.clear();
	}

	async goToNextPage(
		pageNumber: number,
		...args: [ 'default' ] | [ 'custom', number ]
	) {
		const [ queryType, queryId ] = args;
		await this.page
			.getByTestId( `${ queryType }-query` )
			.getByRole( 'link', { name: 'Next Page' } )
			.click();

		// Wait for the response
		return this.page.waitForResponse( ( response ) =>
			// if the query type is default, the url should include `paged=2` or `/page/2/`
			// if the query type is custom, the url should include `query-${ queryId }-page=2`
			queryType === 'default'
				? response.url().includes( `paged=${ pageNumber }` ) ||
				  response.url().includes( `/page/${ pageNumber }/` )
				: response
						.url()
						.includes( `query-${ queryId }-page=${ pageNumber }` )
		);
	}

	async activatePlugins() {
		await this.requestUtils.activateTheme( 'emptytheme' );
		await this.requestUtils.activatePlugin(
			'gutenberg-test-interactive-blocks'
		);
	}

	async deactivatePlugins() {
		await this.requestUtils.activateTheme( 'twentytwentyone' );
		await this.requestUtils.deactivatePlugin(
			'gutenberg-test-interactive-blocks'
		);
	}
}
