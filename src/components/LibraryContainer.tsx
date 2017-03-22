/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");

import * as React from "react";
import { LibraryView } from "../LibraryView";
import { LibraryItem } from "./LibraryItem";
import { buildLibraryItemsFromLayoutSpecs, ItemData } from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryView: LibraryView,
    loadedTypesJson: any,
    layoutSpecsJson: any
}

export interface LibraryContainerStates { }

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    generatedLibraryItems: any = null;

    constructor(props: LibraryContainerProps) {

        super(props);
        this.generatedLibraryItems = buildLibraryItemsFromLayoutSpecs(
            this.props.loadedTypesJson, this.props.layoutSpecsJson);
    }

    render() {

        try {
            let index = 0;
            const childItems = this.generatedLibraryItems;
            const listItems = childItems.map((item: ItemData) => (<LibraryItem key={index++} libraryView={this.props.libraryView} data={item} />));

            return (<div>{listItems}</div>);
        }
        catch (exception) {
            return (<div>Exception thrown: {exception.message}</div>);
        }
    }
}
