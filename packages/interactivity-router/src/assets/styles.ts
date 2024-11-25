const styleSheetCache = new Map< string, Promise< CSSStyleSheet > >();

const getCachedSheet = async (
	sheetId: string,
	constructor: () => Promise< CSSStyleSheet >
) => {
	if ( ! styleSheetCache.has( sheetId ) ) {
		styleSheetCache.set( sheetId, constructor() );
	}
	return styleSheetCache.get( sheetId );
};

const sheetFromLink = async ( { id, href }: HTMLLinkElement ) => {
	const sheetId = id || href;
	return getCachedSheet( sheetId, async () => {
		const response = await fetch( href );
		const text = await response.text();
		const sheet = new CSSStyleSheet( { baseURL: href } );
		await sheet.replace( text );
		return sheet;
	} );
};

const sheetFromStyle = async ( { id, textContent }: HTMLStyleElement ) => {
	const sheetId = id || textContent;
	return getCachedSheet( sheetId, async () => {
		const sheet = new CSSStyleSheet();
		await sheet.replace( textContent );
		return sheet;
	} );
};

export const generateCSSStyleSheets = (
	doc: Document
): Promise< CSSStyleSheet >[] =>
	[ ...doc.querySelectorAll( 'style,link[rel=stylesheet]' ) ].map(
		( element ) => {
			if ( 'LINK' === element.nodeName ) {
				return sheetFromLink( element as HTMLLinkElement );
			}
			return sheetFromStyle( element as HTMLStyleElement );
		}
	);
