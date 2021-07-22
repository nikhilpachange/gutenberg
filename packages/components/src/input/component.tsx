/**
 * External dependencies
 */
import { noop } from 'lodash';
import { useDrag } from 'react-use-gesture';
// eslint-disable-next-line no-restricted-imports
import type { Ref, SyntheticEvent, PointerEvent, MouseEvent } from 'react';

/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { UP, DOWN, ENTER } from '@wordpress/keycodes';
/**
 * Internal dependencies
 */
import { useDragCursor } from './utils';
import { Input as InputView, Container, Prefix, Suffix } from './styles';
import Backdrop from './backdrop';
import { useInputControlStateReducer } from './reducer/reducer';
import { isValueEmpty } from '../utils/values';
import { useUpdateEffect } from '../utils';
import {
	contextConnect,
	useContextSystem,
	PolymorphicComponentProps,
} from '../ui/context';
import type { Props } from './types';

function Input(
	props: PolymorphicComponentProps< Props, 'input' >,
	forwardedRef: Ref< any >
) {
	const {
		disabled = false,
		dragDirection = 'n',
		dragThreshold = 10,
		id,
		isDragEnabled = false,
		isFocused,
		isPressEnterToChange = false,
		onBlur = noop,
		onChange = noop,
		onDrag = noop,
		onDragEnd = noop,
		onDragStart = noop,
		onFocus = noop,
		onKeyDown = noop,
		onValidate = noop,
		size = 'default',
		setIsFocused,
		stateReducer = ( state ) => state,
		value: valueProp,
		type,
		hideLabelFromVision = false,
		__unstableInputWidth,
		labelPosition,
		prefix,
		suffix,
		...otherProps
	} = useContextSystem( props, 'Input' );

	const {
		// State
		state,
		// Actions
		change,
		commit,
		drag,
		dragEnd,
		dragStart,
		invalidate,
		pressDown,
		pressEnter,
		pressUp,
		reset,
		update,
	} = useInputControlStateReducer( stateReducer, {
		isDragEnabled,
		value: valueProp,
		isPressEnterToChange,
	} );

	const { _event, value, isDragging, isDirty } = state;
	const wasDirtyOnBlur = useRef( false );

	const dragCursor = useDragCursor( isDragging, dragDirection );

	/*
	 * Handles synchronization of external and internal value state.
	 * If not focused and did not hold a dirty value[1] on blur
	 * updates the value from the props. Otherwise if not holding
	 * a dirty value[1] propagates the value and event through onChange.
	 * [1] value is only made dirty if isPressEnterToChange is true
	 */
	useUpdateEffect( () => {
		if ( valueProp === value ) {
			return;
		}
		if ( ! isFocused && ! wasDirtyOnBlur.current ) {
			update( valueProp, _event as SyntheticEvent );
		} else if ( ! isDirty ) {
			onChange( value, { event: _event } );
			wasDirtyOnBlur.current = false;
		}
	}, [ value, isDirty, isFocused, valueProp ] );

	const handleOnBlur = ( event ) => {
		onBlur( event );
		setIsFocused( false );

		/**
		 * If isPressEnterToChange is set, this commits the value to
		 * the onChange callback.
		 */
		if ( isPressEnterToChange && isDirty ) {
			wasDirtyOnBlur.current = true;
			if ( ! isValueEmpty( value ) ) {
				handleOnCommit( event );
			} else {
				reset( valueProp, event );
			}
		}
	};

	const handleOnFocus = ( event ) => {
		onFocus( event );
		setIsFocused( true );
	};

	const handleOnChange = ( event ) => {
		const nextValue = event.target.value;
		change( nextValue, event );
	};

	const handleOnCommit = ( event ) => {
		const nextValue = event.target.value;

		try {
			onValidate( nextValue );
			commit( nextValue, event );
		} catch ( err ) {
			invalidate( err, event );
		}
	};

	const handleOnKeyDown = ( event ) => {
		const { keyCode } = event;
		onKeyDown( event );

		switch ( keyCode ) {
			case UP:
				pressUp( event );
				break;

			case DOWN:
				pressDown( event );
				break;

			case ENTER:
				pressEnter( event );

				if ( isPressEnterToChange ) {
					event.preventDefault();
					handleOnCommit( event );
				}
				break;
		}
	};

	const dragGestureProps = useDrag< PointerEvent< HTMLElement > >(
		( dragProps ) => {
			const { distance, dragging, event } = dragProps;
			// The event is persisted to prevent errors in components using this
			// to check if a modifier key was held while dragging.
			( event as SyntheticEvent ).persist();

			if ( ! distance ) return;
			event.stopPropagation();

			/**
			 * Quick return if no longer dragging.
			 * This prevents unnecessary value calculations.
			 */
			if ( ! dragging ) {
				onDragEnd( dragProps );
				dragEnd( dragProps );
				return;
			}

			onDrag( dragProps );
			drag( dragProps );

			if ( ! isDragging ) {
				onDragStart( dragProps );
				dragStart( dragProps );
			}
		},
		{
			threshold: dragThreshold,
			enabled: isDragEnabled,
		}
	);

	const dragProps = isDragEnabled ? dragGestureProps() : {};
	/*
	 * Works around the odd UA (e.g. Firefox) that does not focus inputs of
	 * type=number when their spinner arrows are pressed.
	 */
	let handleOnMouseDown:
		| undefined
		| ( ( event: MouseEvent< HTMLInputElement > ) => void );
	if ( type === 'number' ) {
		handleOnMouseDown = ( event ) => {
			props.onMouseDown?.( event );
			if (
				event.target !==
				( event.target as HTMLInputElement ).ownerDocument.activeElement
			) {
				( event.target as HTMLInputElement ).focus();
			}
		};
	}

	return (
		<Container
			__unstableInputWidth={ __unstableInputWidth }
			className="components-input-control__container"
			disabled={ disabled }
			hideLabel={ hideLabelFromVision }
			labelPosition={ labelPosition }
		>
			{ prefix && (
				<Prefix className="components-input-control__prefix">
					{ prefix }
				</Prefix>
			) }
			<InputView
				{ ...otherProps }
				{ ...dragProps }
				className="components-input-control__input"
				disabled={ disabled }
				dragCursor={ dragCursor }
				isDragging={ isDragging }
				id={ id }
				onBlur={ handleOnBlur }
				onChange={ handleOnChange }
				onFocus={ handleOnFocus }
				onKeyDown={ handleOnKeyDown }
				onMouseDown={ handleOnMouseDown }
				ref={ forwardedRef }
				inputSize={ size }
				value={ value }
				type={ type }
			/>
			{ suffix && (
				<Suffix className="components-input-control__suffix">
					{ suffix }
				</Suffix>
			) }
			<Backdrop disabled={ disabled } isFocused={ isFocused } />
		</Container>
	);
}

const ConnectedInput = contextConnect( Input, 'Input' );

export default ConnectedInput;
