import * as React from "react";
import * as ReactDOM from "react-dom";

import { LibraryContainer } from "./components/LibraryContainer";
import { JsonDownloader } from "./LibraryUtilities";
import { Reactor, Event } from "./EventHandler";

export function CreateJsonDownloader(jsonUrls: string[], callback: Function) {
    return new JsonDownloader(jsonUrls, callback);
}

export function CreateLibraryController() {
    return new LibraryController();
}

export class LibraryController {

    ItemClickedEventName = "itemClicked";
    ItemMouseEnterEventName = "itemMouseEnter";
    ItemMouseLeaveEventName = "itemMouseLeave";
    DefaultSectionName = "default";
    MiscSectionName = "Miscellaneous";


    reactor: Reactor = null;

    constructor() {
        this.on = this.on.bind(this);
        this.raiseEvent = this.raiseEvent.bind(this);
        this.createLibraryByElementId = this.createLibraryByElementId.bind(this);
        this.createLibraryContainer = this.createLibraryContainer.bind(this);

        this.reactor = new Reactor();
    }

    on(eventName: string, callback: Function) {
        this.reactor.registerEvent(eventName, callback);
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.reactor.raiseEvent(name, params);
    }

    createLibraryByElementId(htmlElementId: string, layoutSpecsJson: any, loadedTypesJson: any) {
        let htmlElement: any;
        htmlElement = document.querySelector(htmlElementId);
        if (!htmlElement) {
            htmlElement = document.getElementById(htmlElementId);
        }
        return ReactDOM.render(<LibraryContainer
            libraryController={this}
            loadedTypesJson={loadedTypesJson}
            layoutSpecsJson={layoutSpecsJson}
            defaultSectionString={this.DefaultSectionName}
            miscSectionString={this.MiscSectionName} />, htmlElement);
    }

    createLibraryContainer(layoutSpecsJson: any, loadedTypesJson: any) {
        return (<LibraryContainer
            libraryController={this}
            layoutSpecsJson={layoutSpecsJson}
            loadedTypesJson={loadedTypesJson}
            defaultSectionString={this.DefaultSectionName}
            miscSectionString={this.MiscSectionName} />);
    }
}
