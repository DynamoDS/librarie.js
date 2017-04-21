/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");

import * as React from "react";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { SearchView } from "./SearchView";
import { buildLibraryItemsFromLayoutSpecs, ItemData } from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryController: LibraryController,
    loadedTypesJson: any,
    layoutSpecsJson: any
}

export interface LibraryContainerStates {
    inSearchMode: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    generatedLibraryItems: any = null;
    miscItems: any = null;

    constructor(props: LibraryContainerProps) {

        super(props);
        this.state = { inSearchMode: false };
        this.generatedLibraryItems = buildLibraryItemsFromLayoutSpecs(
            this.props.loadedTypesJson, this.props.layoutSpecsJson);
        this.miscItems = this.generatedLibraryItems.pop().childItems; // Get the unprocessed nodes
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });
    }

    render() {

        try {
            let listItems: JSX.Element[] = null;
            let miscListItems: JSX.Element[] = null;
            const childItems = this.generatedLibraryItems;
            const miscItems = this.miscItems;
            const searchView = <SearchView onSearchModeChanged={this.onSearchModeChanged.bind(this)} libraryContainer={this} items={childItems.concat(miscItems)} />;

            let miscHeader = null;

            if (!this.state.inSearchMode) {
                let index = 0;
                listItems = childItems.map((item: ItemData) => (<LibraryItem key={index++} libraryContainer={this} data={item} />));
                miscListItems = miscItems.map((item: ItemData) => (<LibraryItem key={index++} libraryContainer={this} data={item} />));
                if (miscListItems.length > 0) {
                    miscHeader =
                        <div className="LibraryItemMiscHeader">
                            <div className="LibraryItemMiscText">Miscellaneous</div>
                        </div>;
                }
            }

            return (
                <div>
                    <div>{searchView}</div>
                    <div>{listItems}</div>
                    <div>{miscHeader}{miscListItems}</div>
                </div>
            );
        } catch (exception) {
            return (<div>Exception thrown: {exception.message}</div>);
        }
    }
}
