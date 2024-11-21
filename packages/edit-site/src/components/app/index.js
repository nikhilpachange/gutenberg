/**
 * WordPress dependencies
 */
import { SlotFillProvider } from '@wordpress/components';
import {
	UnsavedChangesWarning,
	privateApis as editorPrivateApis,
} from '@wordpress/editor';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { PluginArea } from '@wordpress/plugins';
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import Layout from '../layout';
import { unlock } from '../../lock-unlock';
import { store as editSiteStore } from '../../store';
import { useCommonCommands } from '../../hooks/commands/use-common-commands';
import useSetCommandContext from '../../hooks/commands/use-set-command-context';
import { useRegisterSiteEditorRoutes } from '../site-editor-routes';

const { RouterProvider } = unlock( routerPrivateApis );
const { GlobalStylesProvider } = unlock( editorPrivateApis );

function AppLayout() {
	useCommonCommands();
	useSetCommandContext();

	return <Layout />;
}

export default function App() {
	useRegisterSiteEditorRoutes();
	const { createErrorNotice } = useDispatch( noticesStore );
	const routes = useSelect( ( select ) => {
		return unlock( select( editSiteStore ) ).getRoutes();
	}, [] );
	function onPluginAreaError( name ) {
		createErrorNotice(
			sprintf(
				/* translators: %s: plugin name */
				__(
					'The "%s" plugin has encountered an error and cannot be rendered.'
				),
				name
			)
		);
	}

	return (
		<SlotFillProvider>
			<GlobalStylesProvider>
				<UnsavedChangesWarning />
				<RouterProvider routes={ routes } pathArg="p">
					<AppLayout />
					<PluginArea onError={ onPluginAreaError } />
				</RouterProvider>
			</GlobalStylesProvider>
		</SlotFillProvider>
	);
}
