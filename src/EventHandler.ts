
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
                if (params !== undefined && params !== null &&
                    !(Array.isArray(params) && params.length === 0) &&
                    !(typeof params === "object" && !Array.isArray(params) && Object.keys(params).length === 0) &&
                    params !== "") {
                    callback(params);
                } else if (Array.isArray(params) && params.length === 0) {
                    callback();
                }
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

    getEvent(eventName: string): Event | undefined {
        return this.events.find(function (event) { return event.name == eventName });
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