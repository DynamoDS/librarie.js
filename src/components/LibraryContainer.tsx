/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");
require("../resources/fonts/font-awesome-4.7.0/css/font-awesome.min.css");

import * as React from "react";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { SearchView } from "./SearchView";
import * as LibraryUtilities from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryController: LibraryController,
    defaultSectionString: string,
    miscSectionString: string
}

export interface LibraryContainerStates {
    inSearchMode: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;

    generatedSections: LibraryUtilities.ItemData[] = null;
    searchCategories: string[] = [];

    constructor(props: LibraryContainerProps) {
        super(props);

        // Bind function prototypes to the object instance.
        this.setLoadedTypesJson = this.setLoadedTypesJson.bind(this);
        this.setLayoutSpecsJson = this.setLayoutSpecsJson.bind(this);
        this.refreshLibraryView = this.refreshLibraryView.bind(this);
        this.onSearchModeChanged = this.onSearchModeChanged.bind(this);

        // Set handlers after methods are bound.
        this.props.libraryController.setLoadedTypesJsonHandler = this.setLoadedTypesJson;
        this.props.libraryController.setLayoutSpecsJsonHandler = this.setLayoutSpecsJson;
        this.props.libraryController.refreshLibraryViewHandler = this.refreshLibraryView;

        this.state = { inSearchMode: false };
    }

    setLoadedTypesJson(loadedTypesJson: any, append: boolean = true): void {

        if (!loadedTypesJson) {
            throw new Error("Parameter 'loadedTypesJson' must be supplied");
        }

        if (!loadedTypesJson.loadedTypes || (!Array.isArray(loadedTypesJson.loadedTypes))) {
            throw new Error("'loadedTypesJson.loadedTypes' must be a valid array");
        }

        // If there is no existing loadedTypesJson object, or the call
        // is meant to replace the existing one, then assign it and bail.
        if (!this.loadedTypesJson || (!append)) {
            this.loadedTypesJson = loadedTypesJson;
            return;
        }

        // To append to the existing 'loadedTypesJson.loadedTypes object' (merge both arrays).
        Array.prototype.push.apply(this.loadedTypesJson.loadedTypes, loadedTypesJson.loadedTypes);
    }

    setLayoutSpecsJson(layoutSpecsJson: any, append: boolean = true): void {

        if (!layoutSpecsJson) {
            throw new Error("Parameter 'layoutSpecsJson' must be supplied");
        }

        if (!layoutSpecsJson.sections || (!Array.isArray(layoutSpecsJson.sections))) {
            throw new Error("'layoutSpecsJson.sections' must be a valid array");
        }

        // If there is no existing layoutSpecsJson object, or the call
        // is meant to replace the existing one, then assign it and bail.
        if (!this.layoutSpecsJson || (!append)) {
            this.layoutSpecsJson = layoutSpecsJson;
            return;
        }

        // Otherwise, recursively replace/append each section.
        LibraryUtilities.updateSections(this.layoutSpecsJson, layoutSpecsJson);
    }

    refreshLibraryView(): void {

        this.generatedSections = LibraryUtilities.buildLibrarySectionsFromLayoutSpecs(
            this.loadedTypesJson, this.layoutSpecsJson,
            this.props.defaultSectionString, this.props.miscSectionString);

        // Obtain the categories from each section to be added into the filtering options for search
        for (let section of this.generatedSections) {
            for (let childItem of section.childItems)
                this.searchCategories.push(childItem.text);
        }

        // Just to force a refresh of UI.
        this.setState({ inSearchMode: this.state.inSearchMode });
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });
    }

    render() {
        if (!this.generatedSections) {
            return (<div>This is LibraryContainer</div>);
        }

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
