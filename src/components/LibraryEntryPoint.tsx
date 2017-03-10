
import * as React from "react";
import { Event } from "./EventHandler";
import { LibraryView } from "../LibraryView";

export function registerEvent(name:string, func:Function) {
    let e = new Event(name);
    e.registerCallback(func);
    LibraryView.prototype.reactor.registerEvent(e);
}

export function dispatchEvent(name:string, params?:any | any[]) {
    LibraryView.prototype.reactor.dispatchEvent(name, params);
}