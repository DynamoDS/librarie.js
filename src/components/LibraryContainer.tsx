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

    generatedSections: ItemData[] = null;

    constructor(props: LibraryContainerProps) {
        super(props);
        this.state = { inSearchMode: false };
        this.generatedSections = buildLibraryItemsFromLayoutSpecs(this.props.loadedTypesJson, this.props.layoutSpecsJson);
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });
    }

    render() {
        try {
            let sections: JSX.Element[] = null;
            let searchItems: ItemData[] = [];

            for (let section of this.generatedSections) {
                searchItems = searchItems.concat(section.childItems);
            }

            const searchView = <SearchView onSearchModeChanged={this.onSearchModeChanged.bind(this)}
                libraryContainer={this} items={searchItems} />;

            if (!this.state.inSearchMode) {
                let index = 0;
                sections = this.generatedSections.map(data => <LibraryItem key={index++} libraryContainer={this} data={data} />)
            }

            return (
                <div>
                    {searchView}
                    {sections}
                </div>
            );
        } catch (exception) {
            return (<div>Exception thrown: {exception.message}</div>);
        }
    }
}
