/// <reference path="../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../node_modules/@types/whatwg-fetch/index.d.ts" />

import * as React from "react";
import { LibraryItem, ItemData } from "./LibraryItem";
import convertNow from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    loadedTypesJson: any,
    layoutSpecsJson: any
}

export interface LibraryContainerStates { }

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    generatedLibraryItems: any = null;

    constructor(props: LibraryContainerProps) {

        super(props);
        this.generatedLibraryItems = convertNow(
            this.props.loadedTypesJson, this.props.layoutSpecsJson);
    }

    render() {

        try {
            let index = 0;
            const childItems = this.generatedLibraryItems;
            const listItems = childItems.map((item : ItemData) => (<LibraryItem key={ index++ } data={ item } />));

            return (<div>{ listItems }</div>);
        }
        catch(exception) {
            return (<div>Exception thrown: { exception.message }</div>);
        }
    }
}
