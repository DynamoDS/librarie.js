
import * as React from "react";
import * as LibraryEntryPoint from "./LibraryEntryPoint";
import { LibraryItem } from "./LibraryItem";

/**
 * The Event class stores the callback function together with a name
 * that identifies it.
 */
export class Event {
    name: string;
    callback: Function;

    constructor(name: string) {
        this.name = name;
        this.callback = null;
    }

    registerCallback(callback: Function) {
        this.callback = callback;
    }
}

/**
 * The Reactor class stores an array of events registered to it.
 */
export class Reactor {
    events: Event[];

    constructor() {
        this.events = [];
    }

    registerEvent(event: Event) {
        this.events.push(event);
    }

    dispatchEvent(name: string, params?: any | any[]) {
        if (this.events.length > 0) {
            this.events.forEach((ev, index) => {
                // Search for the event with the specified name
                if (ev.name == name && ev.callback != null) {
                    try {
                        params == null ? ev.callback() : ev.callback(params);
                        return;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            })
        }
    }
}

// This function is called in LibraryView when the Reactor is initialized.
export function registerLibraryEvents(): void {

    // Register the click event for LibraryItem.
    LibraryEntryPoint.registerEvent("libraryItemClick", function (item: LibraryItem) {
        let currentlyExpanded = item.state.expanded;
        item.setState({ expanded: !currentlyExpanded });
    })

}