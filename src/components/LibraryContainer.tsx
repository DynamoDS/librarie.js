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

    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;

    generatedSections: ItemData[] = null;
    searchCategories: string[] = [];

    constructor(props: LibraryContainerProps) {
        super(props);

        // Bind function prototypes to the object instance.
        this.setLoadedTypesJson = this.setLoadedTypesJson.bind(this);
        this.setLayoutSpecsJson = this.setLayoutSpecsJson.bind(this);
        this.onSearchModeChanged = this.onSearchModeChanged.bind(this);

        this.state = { inSearchMode: false };
        this.generatedSections = buildLibrarySectionsFromLayoutSpecs(
            this.props.loadedTypesJson, this.props.layoutSpecsJson,
            this.props.defaultSectionString, this.props.miscSectionString);

        // Obtain the categories from each section to be added into the filtering options for search
        for (let section of this.generatedSections) {
            for (let childItem of section.childItems)
                this.searchCategories.push(childItem.text);
        }
    }

    setLoadedTypesJson(loadedTypesJson: any, append: boolean = true): void {

        if (!loadedTypesJson) {
            throw new Error("Parameter 'loadedTypesJson' must be supplied");
        }

        if (!loadedTypesJson.loadedTypes || (!Array.isArray(loadedTypesJson.loadedTypes))) {
            throw new Error("'loadedTypesJson.loadedTypes' must be a valid array");
        }

        // To replace the current loadedTypesJson entirely. The same happens 
        // when there is not already an existing loadedTypesJson object.
        if (!append || (!this.loadedTypesJson)) {
            this.loadedTypesJson = loadedTypesJson;
            return;
        }

        // To append to the existing 'loadedTypesJson.loadedTypes object' (merge both arrays).
        Array.prototype.push.apply(this.loadedTypesJson.loadedTypes, loadedTypesJson.loadedTypes);
    }

    setLayoutSpecsJson(layoutSpecsJson: any, append: boolean = true): void {
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
            const searchView = <SearchView onSearchModeChanged={this.onSearchModeChanged}
                libraryContainer={this} sections={this.generatedSections} categories={this.searchCategories} />;

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
