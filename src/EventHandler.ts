
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

    getEvent(eventName: string): Event {
        return _.find(this.events, function (event) { return event.name == eventName });
    }

    registerEvent(eventName: string, callback: Function) {
        let event = this.getEvent(eventName);
        if (!event) {
            event = new Event(eventName);
            this.events.push(event);
        }
        event.registerCallback(callback);
    }

    raiseEvent(name: string, params?: any | any[]) {
        let event = this.getEvent(name);
        if (event != null) {
            event.executeCallback(params);
        }
    }
}