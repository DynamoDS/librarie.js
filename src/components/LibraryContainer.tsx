/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");
require("../resources/fonts/font-awesome-4.7.0/css/font-awesome.min.css");

import * as React from "react";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import * as LibraryUtilities from "../LibraryUtilities";
import { Searcher } from "../Searcher";
import { SearchBar } from "./SearchBar";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryController: LibraryController,
    defaultSectionString: string,
    miscSectionString: string
}

export interface LibraryContainerStates {
    inSearchMode: boolean,
    structured: boolean,
    detailed: boolean,
    showExpandableToolTip: boolean,
    searchText: string,
    selectedCategories: string[],
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;

    generatedSections: LibraryUtilities.ItemData[] = null;
    searchCategories: string[] = [];

    timeout: number;
    searcher: Searcher = null;

    constructor(props: LibraryContainerProps) {
        super(props);

        // Bind function prototypes to the object instance.
        this.setLoadedTypesJson = this.setLoadedTypesJson.bind(this);
        this.setLayoutSpecsJson = this.setLayoutSpecsJson.bind(this);
        this.refreshLibraryView = this.refreshLibraryView.bind(this);
        this.onSearchModeChanged = this.onSearchModeChanged.bind(this);
        this.onStructuredModeChanged = this.onStructuredModeChanged.bind(this);
        this.onDetailedModeChanged = this.onDetailedModeChanged.bind(this);
        this.onShowExpandableToolTipChanged = this.onShowExpandableToolTipChanged.bind(this);
        this.onTextChanged = this.onTextChanged.bind(this);
        this.onCategoriesChanged = this.onCategoriesChanged.bind(this);
        this.clearSearch = this.clearSearch.bind(this);

        // Set handlers after methods are bound.
        this.props.libraryController.setLoadedTypesJsonHandler = this.setLoadedTypesJson;
        this.props.libraryController.setLayoutSpecsJsonHandler = this.setLayoutSpecsJson;
        this.props.libraryController.refreshLibraryViewHandler = this.refreshLibraryView;

        // Initialize the search utilities with empty data
        this.searcher = new Searcher(this, this.clearSearch);

        this.state = {
            inSearchMode: false,
            structured: false,
            detailed: false,
            showExpandableToolTip: false,
            searchText: '',
            selectedCategories: []
        };
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

        // Update the properties in searcher
        this.searcher.sections = this.generatedSections;
        this.searcher.categories = this.searchCategories;

        // Just to force a refresh of UI.
        this.setState({ inSearchMode: this.state.inSearchMode });
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });
    }

    onStructuredModeChanged(value: boolean) {
        this.setState({ structured: value });
    }

    onDetailedModeChanged(value: boolean) {
        this.setState({ detailed: value });
    }

    onShowExpandableToolTipChanged(showExpandableToolTip: boolean) {
        this.setState({ showExpandableToolTip: showExpandableToolTip });
    }

    onCategoriesChanged(categories: string[]) {
        this.setState({ selectedCategories: categories });
        this.searcher.categories = categories;
    }

    onTextChanged(text: string) {
        if (!this.generatedSections) return;

        clearTimeout(this.timeout);

        let hasText = text.length > 0;

        if (hasText) {
            // Starting searching after user stops typing for 300ms
            this.timeout = setTimeout(function () {
                LibraryUtilities.searchItemResursive(this.generatedSections, text);
                this.updateSearchViewDelayed(text);
            }.bind(this), 300);
        } else {
            // Show change on ui immediately if search text is cleared
            LibraryUtilities.setItemStateRecursive(this.generatedSections, true, false);
            this.updateSearchViewDelayed(text);
        }
    }

    updateSearchViewDelayed(text: string) {
        if (text.length > 0 && !this.state.structured) {
            this.raiseEvent("searchTextUpdated", text);
        }

        this.setState({ searchText: text });
        this.onSearchModeChanged(text.length > 0);
    }

    clearSearch(text: string) {
        this.setState({ searchText: text })
        this.onSearchModeChanged(false);
    }

    render() {
        if (!this.generatedSections) {
            return (<div>This is LibraryContainer</div>);
        }

        try {
            let sections: JSX.Element[] = null;

            const searchBar = <SearchBar
                onCategoriesChanged={this.onCategoriesChanged}
                onDetailedModeChanged={this.onDetailedModeChanged}
                onStructuredModeChanged={this.onStructuredModeChanged}
                onTextChanged={this.onTextChanged}
                onShowExpandableToolTipModeChanged={this.onShowExpandableToolTipChanged}
                categories={this.searchCategories}
            />;

            if (!this.state.inSearchMode) {
                let index = 0;
                sections = this.generatedSections.map(data =>
                    <LibraryItem
                        key={index++}
                        libraryContainer={this}
                        data={data}
                        showExpandableToolTip={this.state.showExpandableToolTip}
                    />
                );
            } else if (this.state.structured) {
                sections = this.searcher.generateStructuredItems(this.state.showExpandableToolTip);
            } else {
                sections = this.searcher.generateListItems(
                    this.generatedSections,
                    this.state.searchText,
                    this.state.detailed,
                    this.state.showExpandableToolTip
                );
            }

            return (
                <div className="LibraryContainer">
                    {searchBar}
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
