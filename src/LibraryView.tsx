/// <reference path="../node_modules/@types/node/index.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";

import { LibraryContainer } from "./components/LibraryContainer";
import { Reactor, Event } from "./EventHandler";

export interface LibraryViewConfig {
    htmlElementId: string,
    loadedTypesUrl: string,
    layoutSpecsUrl: string
}

export class LibraryView {

    htmlElementId: string = "";
    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;
    reactor: Reactor = null;

    constructor(config: LibraryViewConfig) {

        this.setLoadedTypesJson = this.setLoadedTypesJson.bind(this);
        this.setLayoutSpecsJson = this.setLayoutSpecsJson.bind(this);
        this.prefetchContents = this.prefetchContents.bind(this);
        this.updateContentsInternal = this.updateContentsInternal.bind(this);
        this.reactor = new Reactor();

        this.htmlElementId = config.htmlElementId;
        this.prefetchContents(config.loadedTypesUrl, config.layoutSpecsUrl);
    }

    setLoadedTypesJson(loadedTypesJson: any): void {
        this.loadedTypesJson = loadedTypesJson;
        this.updateContentsInternal();
    }

    setLayoutSpecsJson(layoutSpecsJson: any): void {
        this.layoutSpecsJson = layoutSpecsJson;
        this.updateContentsInternal();
    }

    prefetchContents(loadedTypesUrl: string, layoutSpecsUrl: string): void {

        let thisObject = this;

        // Download the locally hosted data type json file.
        fetch(loadedTypesUrl)
            .then(function (response: Response) {
                return response.text();
            }).then(function (jsonString) {
                thisObject.loadedTypesJson = JSON.parse(jsonString);
                thisObject.updateContentsInternal();
            });

        fetch(layoutSpecsUrl)
            .then(function (response: Response) {
                return response.text();
            }).then(function (jsonString) {
                thisObject.layoutSpecsJson = JSON.parse(jsonString);
                thisObject.updateContentsInternal();
            });
    }

    updateContentsInternal(): void {

        if (!this.loadedTypesJson || (!this.layoutSpecsJson)) {
            return; // Not all required data is available yet.
        }

        let htmlElement = document.getElementById(this.htmlElementId);

        ReactDOM.render(<LibraryContainer
            libraryView={this}
            loadedTypesJson={this.loadedTypesJson}
            layoutSpecsJson={this.layoutSpecsJson} />, htmlElement);


    }

    on(eventName: string, callback: Function) {
        this.reactor.registerEvent(eventName, callback);
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.reactor.raiseEvent(name, params);
    }
}
