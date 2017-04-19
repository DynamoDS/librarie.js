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

    constructor(props: LibraryContainerProps) {

        super(props);
        this.state = { inSearchMode: false };
        this.generatedLibraryItems = buildLibraryItemsFromLayoutSpecs(
            this.props.loadedTypesJson, this.props.layoutSpecsJson);
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });
    }

    render() {

        try {
            const childItems = this.generatedLibraryItems;
            const searchView = <SearchView onSearchModeChanged={this.onSearchModeChanged.bind(this)} libraryContainer={this} items={childItems} />;

            if (this.state.inSearchMode) {
                return (
                    <div>
                        <div>{searchView}</div>
                    </div>
                );
            } else {
                let index = 0;
                const listItems = childItems.map((item: ItemData) => (<LibraryItem key={index++} libraryContainer={this} data={item} />));
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
