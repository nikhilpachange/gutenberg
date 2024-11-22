/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';


/**
 * WordPress dependencies
 */
import { SVG, Path } from '@wordpress/primitives';
import * as icons from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Icon from '..';
import { VStack } from '../../v-stack';

const meta: Meta< typeof Icon > = {
	title: 'Components/Icon',
	component: Icon,
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
	args: {
		additionalProps: {},
		size: 24,
	},
	argTypes: {
		size: {
			control: {
				type: 'range',
				min: 1,
				max: 200,
			},
		},
		additionalProps: {
			defaultValue: {},
			table: {
				type: { summary: 'object' },
			},
		},
	},
};
export default meta;

const Template: StoryFn< typeof Icon > = function (args) {
	const { additionalProps, ...rest } = args;
	const props = {
		...rest,
		...additionalProps,
	};
	return <Icon { ...props } />;
};


export const Default = Template.bind( {} );
Default.args = {
	icon: icons.wordpress,
};

export const FillColor = Template.bind( {} );

FillColor.args = {
	...Default.args,
	additionalProps: {
		fill: 'blue',
	},
};

export const WithAFunction = Template.bind( {} );
WithAFunction.args = {
	...Default.args,
	icon: () => (
		<SVG>
			<Path d="M5 4v3h5.5v12h3V7H19V4z" />
		</SVG>
	),
};

const MyIconComponent = () => (
	<SVG>
		<Path d="M5 4v3h5.5v12h3V7H19V4z" />
	</SVG>
);

export const WithAComponent = Template.bind( {} );
WithAComponent.args = {
	...Default.args,
	icon: MyIconComponent,
};

export const WithAnSVG = Template.bind( {} );
WithAnSVG.args = {
	...Default.args,
	icon: (
		<SVG>
			<Path d="M5 4v3h5.5v12h3V7H19V4z" />
		</SVG>
	),
};

/**
 * Although it's preferred to use icons from the `@wordpress/icons` package, Dashicons are still supported,
 * as long as you are in a context where the Dashicons stylesheet is loaded. To simulate that here,
 * use the Global CSS Injector in the Storybook toolbar at the top and select the "WordPress" preset.
 */
export const WithADashicon: StoryFn< typeof Icon > = ( args ) => {
	return (
		<VStack>
			<Icon { ...args } />
			<small>
				This won’t show an icon if the Dashicons stylesheet isn’t
				loaded.
			</small>
		</VStack>
	);
};
WithADashicon.args = {
	...Default.args,
	icon: 'wordpress',
};

export const WithAnIconFromTheLibrary: StoryFn< typeof Icon > = ( args ) => {
	const { additionalProps, ...rest } = args;

	const props = {
		...rest,
		...additionalProps,
		icon: icons[ args.icon as keyof typeof icons ],
	};
	
	return <Icon { ...props } />;
};

WithAnIconFromTheLibrary.args = {
	...Default.args,
	icon: 'wordpress',
	size: 24,
};

WithAnIconFromTheLibrary.argTypes = {
	icon: {
		options: Object.keys( icons ),
		control: 'select',
	},
};
