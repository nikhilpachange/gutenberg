export const asyncBlockBindingsGetValues =
	( source, args ) =>
	async ( { dispatch } ) => {
		let values;
		try {
			values = await source.getValues( args );
		} catch ( error ) {
			// Do nothing.
			return;
		}
		dispatch( {
			type: 'RECEIVE_BLOCK_BINDINGS_ASYNC_VALUES',
			sourceName: source.name,
			values,
		} );
	};
