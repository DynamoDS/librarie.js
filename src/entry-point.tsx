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

interface SetLoadedTypesJsonFunc {
    (loadedTypesJson: any, append: boolean): void;
}

interface SetLayoutSpecsJsonFunc {
    (layoutSpecsJson: any, append: boolean): void;
}

interface RefreshLibraryViewFunc {
    (): void;
}

export class LibraryController {

    ItemClickedEventName = "itemClicked";
    ItemMouseEnterEventName = "itemMouseEnter";
    ItemMouseLeaveEventName = "itemMouseLeave";
    SearchTextUpdatedEventName = "searchTextUpdated";
    DefaultSectionName = "default";
    MiscSectionName = "Miscellaneous";

    reactor: Reactor = null;
    setLoadedTypesJsonHandler: SetLoadedTypesJsonFunc = null;
    setLayoutSpecsJsonHandler: SetLayoutSpecsJsonFunc = null;
    refreshLibraryViewHandler: RefreshLibraryViewFunc = null;

    constructor() {
        this.on = this.on.bind(this);
        this.raiseEvent = this.raiseEvent.bind(this);
        this.createLibraryByElementId = this.createLibraryByElementId.bind(this);
        this.createLibraryContainer = this.createLibraryContainer.bind(this);
        this.setLoadedTypesJson = this.setLoadedTypesJson.bind(this);
        this.setLayoutSpecsJson = this.setLayoutSpecsJson.bind(this);
        this.refreshLibraryView = this.refreshLibraryView.bind(this);

        this.reactor = new Reactor();
    }

    on(eventName: string, callback: Function) {
        this.reactor.registerEvent(eventName, callback);
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.reactor.raiseEvent(name, params);
    }

    createLibraryByElementId(htmlElementId: string, layoutSpecsJson: any = null, loadedTypesJson: any = null) {
        let htmlElement: any;
        htmlElement = document.querySelector(htmlElementId) || document.getElementById(htmlElementId);
        if (!htmlElement) {
            throw new Error("Element " + htmlElementId + " is not defined");
        }

        let libraryContainer = ReactDOM.render(this.createLibraryContainer(), htmlElement);

        if (loadedTypesJson && (layoutSpecsJson)) {
            let append = false; // Replace existing contents instead of appending.
            this.setLoadedTypesJson(loadedTypesJson, append);
            this.setLayoutSpecsJson(layoutSpecsJson, append);
            this.refreshLibraryView();
        }

        return libraryContainer;
    }

    createLibraryContainer() {
        return (<LibraryContainer
            libraryController={this}
            defaultSectionString={this.DefaultSectionName}
            miscSectionString={this.MiscSectionName} />);
    }

    setLoadedTypesJson(loadedTypesJson: any, append: boolean): void {
        if (this.setLoadedTypesJsonHandler) {
            this.setLoadedTypesJsonHandler(loadedTypesJson, append);
        }
    }

    setLayoutSpecsJson(layoutSpecsJson: any, append: boolean): void {
        if (this.setLayoutSpecsJsonHandler) {
            this.setLayoutSpecsJsonHandler(layoutSpecsJson, append);
        }
    }

    refreshLibraryView(): void {
        if (this.refreshLibraryViewHandler) {
            this.refreshLibraryViewHandler();
        }
    }
}
