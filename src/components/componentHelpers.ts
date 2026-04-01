import * as React from 'react';
import { useRef, useEffect } from 'react';
import type { LibraryContainerHandle } from './LibraryContainer';
import type { ItemData } from '../LibraryUtilities';

/**
 * Registers a stable window event listener using the ref pattern.
 * The handler may close over changing state, but the listener itself
 * is registered only once and always calls the latest handler version.
 */
export function useStableWindowListener<E extends Event = Event>(
    type: string,
    handler: (event: E) => void
): void {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        const stable = (e: Event) => handlerRef.current(e as E);
        window.addEventListener(type, stable);
        return () => window.removeEventListener(type, stable);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Shared mouse-leave logic for library items. */
export function raiseItemMouseLeave(
    data: ItemData,
    libraryContainer: LibraryContainerHandle
): void {
    if (data.childItems.length === 0) {
        libraryContainer.raiseEvent(
            libraryContainer.props.libraryController.ItemMouseLeaveEventName,
            { data: data.contextData }
        );
    }
}

/** Shared mouse-enter logic for library items. */
export function raiseItemMouseEnter(
    data: ItemData,
    libraryContainer: LibraryContainerHandle,
    containerEl: HTMLElement | null
): void {
    if (data.childItems.length === 0 && containerEl) {
        const rec = containerEl.getBoundingClientRect();
        libraryContainer.raiseEvent(
            libraryContainer.props.libraryController.ItemMouseEnterEventName,
            { data: data.contextData, rect: rec, element: containerEl }
        );
    }
}

/** Fallback handler for failed image loads. */
export function handleImageLoadFail(event: React.SyntheticEvent<HTMLImageElement>): void {
    const target = event.target as HTMLImageElement & { orgSrc?: string };
    target.orgSrc = target.src;
    target.src = require('../resources/icons/default-icon.svg');
}
