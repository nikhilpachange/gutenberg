/**
 * WordPress dependencies
 */
import { test as base } from '@wordpress/e2e-test-utils-playwright';
export { expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import InteractivityUtils from './interactivity-utils';

type Fixtures = {
	interactivityUtils: InteractivityUtils;
};

export const test = base.extend< Fixtures >( {
	interactivityUtils: [
		async ( { requestUtils, page }, use ) => {
			await use( new InteractivityUtils( { requestUtils, page } ) );
		},
		{ scope: 'test' },
	],
} );
