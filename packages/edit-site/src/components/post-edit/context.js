/**
 * WordPress dependencies
 */
import { createContext, useContext, useState } from '@wordpress/element';

export const PostEditContext = createContext( {
	isValidForm: false,
	setIsValidForm: () => {},
} );

export const PostEditProvider = ( { children } ) => {
	const [ isValidForm, setIsValidForm ] = useState( false );

	return (
		<PostEditContext.Provider value={ { isValidForm, setIsValidForm } }>
			{ children }
		</PostEditContext.Provider>
	);
};

export const usePostEditContext = () => {
	return useContext( PostEditContext );
};
