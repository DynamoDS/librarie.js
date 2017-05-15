/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");
require("../resources/fonts/font-awesome-4.7.0/css/font-awesome.min.css");

import * as React from "react";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { SearchView } from "./SearchView";
import { buildLibrarySectionsFromLayoutSpecs, ItemData } from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryController: LibraryController,
    loadedTypesJson: any,
    layoutSpecsJson: any,
    defaultSectionString: string,
    miscSectionString: string
}

export interface LibraryContainerStates {
    inSearchMode: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    generatedSections: ItemData[] = null;
    searchCategories: string[] = [];

    constructor(props: LibraryContainerProps) {
        super(props);
        this.state = { inSearchMode: false };
        this.generatedSections = buildLibrarySectionsFromLayoutSpecs(this.props.loadedTypesJson, this.props.layoutSpecsJson, 
        this.props.defaultSectionString, this.props.miscSectionString);

        // Obtain the categories from each section to be added into the filtering options for search
        for (let section of this.generatedSections) {
            for (let childItem of section.childItems)
                this.searchCategories.push(childItem.text);
        }
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
            const searchView = <SearchView onSearchModeChanged={this.onSearchModeChanged.bind(this)}
                libraryContainer={this} sections={this.generatedSections} categories={this.searchCategories}/>;

            if (!this.state.inSearchMode) {
                let index = 0;
                sections = this.generatedSections.map(data => <LibraryItem key={index++} libraryContainer={this} data={data} />)
            }

            return (
                <div className="LibraryContainer">
                    {searchView}
                    <div className="LibraryItemContainer">
                        {sections}
                    </div>
                </div>
            );
        } catch (exception) {
            return (<div>Exception thrown: {exception.message}</div>);
        }
    }
}
