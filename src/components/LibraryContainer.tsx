/// <reference path="../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../node_modules/@types/whatwg-fetch/index.d.ts" />

import * as React from "react";
import { LibraryItem, ItemData } from "./LibraryItem";
import convertNow from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps { }
export interface LibraryContainerStates {
    libraryContentsLoaded: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;
    generatedLibraryItems: any = null;

    constructor(props: LibraryContainerProps) {

        super(props);
        this.state = { libraryContentsLoaded: false };

        this.downloadAndProcessTypeData();
    }

    render() {

        if (!this.state.libraryContentsLoaded) {
            return (<div>Downloading contents...</div>);
        }

        try {

            if (!this.generatedLibraryItems) {
                return (<div>No generated library items</div>);
            }
            
            let index = 0;
            const childItems = this.generatedLibraryItems;
            const listItems = childItems.map((item : ItemData) => (<LibraryItem key={ index++ } data={ item } />));

            return (<div>{ listItems }</div>);
        }
        catch(exception) {
            return (<div>Exception thrown: { exception.message }</div>);
        }
    }

    downloadAndProcessTypeData() {

        let thisObject = this;

        // Download the locally hosted data type json file.
        fetch("loadedTypes")
        .then(function(response: Response) {
            return response.text();
        }).then(function(jsonString) {
            thisObject.loadedTypesJson = JSON.parse(jsonString);
            thisObject.generateLibraryItems();
        });

        fetch("layoutSpecs")
        .then(function(response: Response) {
            return response.text();
        }).then(function(jsonString) {
            thisObject.layoutSpecsJson = JSON.parse(jsonString);
            thisObject.generateLibraryItems();
        });
    }

    generateLibraryItems() {

        if (!this.loadedTypesJson || (!this.layoutSpecsJson)) {
            return; // Not ready to generate library items yet.
        }

        this.generatedLibraryItems = convertNow(
            this.loadedTypesJson, this.layoutSpecsJson);

        this.setState({ libraryContentsLoaded: true });
    }
}
