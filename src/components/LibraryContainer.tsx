/// <reference path="../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../node_modules/@types/whatwg-fetch/index.d.ts" />

import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { SearchView } from "./SearchView";
import { buildLibraryItemsFromLayoutSpecs, ItemData } from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    loadedTypesJson: any,
    layoutSpecsJson: any
}

export interface LibraryContainerStates {
    inSearch: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    generatedLibraryItems: any = null;

    constructor(props: LibraryContainerProps) {

        super(props);
        this.state = { inSearch: false };
        this.generatedLibraryItems = buildLibraryItemsFromLayoutSpecs(
            this.props.loadedTypesJson, this.props.layoutSpecsJson);
    }

    onSearchChanged(inSearch: boolean) {
        this.setState({ inSearch: inSearch });
    }


    render() {

        try {
            let index = 0;
            const childItems = this.generatedLibraryItems;
            const listItems = childItems.map((item: ItemData) => (<LibraryItem key={index++} data={item} />));
            const searchView = <SearchView onSearchChanged={this.onSearchChanged.bind(this)} items={childItems} />;

            if (this.state.inSearch) {
                return (
                    <div>
                        <div>{searchView}</div>
                    </div>
                );
            } else {
                return (
                    <div>
                        <div>{searchView}</div>
                        <div>{listItems}</div>
                    </div>
                );
            }
        }
        catch (exception) {
            return (<div>Exception thrown: {exception.message}</div>);
        }
    }
}
