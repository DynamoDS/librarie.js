
import * as React from "react";
import * as _ from "underscore";
import { LibraryItem } from "./components/LibraryItem";

/**
 * The Event class stores the callback function together with a name
 * that identifies it.
 */
export class Event {
    name: string;
    callbacks: Function[];

    constructor(name: string) {
        this.name = name;
        this.callbacks = [];
    }

    registerCallback(callback: Function) {
        this.callbacks.push(callback);
    }

    executeCallback(params?: any | any[]) {
        this.callbacks.forEach(callback => {
            try {
                if (callback.length == 0) callback();
                else callback(params);
            }
            catch (e) {
                console.log(e);
            }
        })
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

    getEvent(eventName: string): number {
        let index = _.findIndex(this.events, {name: eventName});
        return index;
    }

    registerEvent(eventName: string, callback: Function) {
        let index = this.getEvent(eventName);
        if (index == -1) {
            let event = new Event(eventName);
            event.registerCallback(callback);
            this.events.push(event);
        }
        else {
            this.events[index].registerCallback(callback);
        }
    }

    raiseEvent(name: string, params?: any | any[]) {
        let index = this.getEvent(name);
        if (index != -1) {
            this.events[index].executeCallback(params);
        }
    }
}