export const importJavaScriptModules = async ( doc: Document ) => {
	const modules = doc.querySelectorAll< HTMLScriptElement >(
		'script[type=module][src]'
	);
	return [ ...modules ].map( ( { src } ) => import( src ) );
};
