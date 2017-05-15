/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");
require("../resources/fonts/font-awesome-4.7.0/css/font-awesome.min.css");

import * as React from "react";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { SearchBar } from "./SearchBar";
import { searchItemResursive, setItemStateRecursive, buildLibrarySectionsFromLayoutSpecs, ItemData } from "../LibraryUtilities";
import { Searcher } from "../Searcher";

type displayMode = "structure" | "list";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryController: LibraryController,
    loadedTypesJson: any,
    layoutSpecsJson: any,
    defaultSectionString: string,
    miscSectionString: string
}

export interface LibraryContainerStates {
    inSearchMode: boolean,
    searchText: string,
    displayMode: displayMode,
    selectedCategories: string[],
    structured: boolean,
    detailed: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    timeout: number;
    generatedSections: ItemData[] = null;
    renderedSections: JSX.Element[] = null;
    searchCategories: string[] = [];
    searcher: Searcher = null;

    constructor(props: LibraryContainerProps) {
        super(props);
        this.generatedSections = buildLibrarySectionsFromLayoutSpecs(this.props.loadedTypesJson, this.props.layoutSpecsJson,
            this.props.defaultSectionString, this.props.miscSectionString);

        // Obtain the categories from each section to be added into the filtering options for search
        for (let section of this.generatedSections) {
            for (let childItem of section.childItems)
                this.searchCategories.push(childItem.text);
        }

        // Render the default view of the library. This property is displayed whenever the user is not doing a search
        let index = 0;
        this.renderedSections = this.generatedSections.map(data => <LibraryItem key={index++} libraryContainer={this} data={data} />);

        // Initialize the search utilities
        this.searcher = new Searcher({
            onSearchModeChanged: this.onSearchModeChanged.bind(this),
            libraryContainer: this,
            sections: this.generatedSections,
            categories: this.searchCategories
        })

        this.state = {
            inSearchMode: false,
            searchText: '',
            displayMode: "list",
            selectedCategories: this.searchCategories,
            structured: false,
            detailed: false
        };
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });

        if (!inSearchMode) {
            // Reset ItemData when search text is cleared
            setItemStateRecursive(this.generatedSections, true, false);
        }
    }

    getSearchText(): string {
        return this.state.searchText;
    }

    onStructuredModeChanged(value: boolean) {
        this.setState({ structured: value });
    }

    onDetailedModeChanged(value: boolean) {
        this.setState({ detailed: value });
    }

    onCategoriesChanged(categories: string[]) {
        this.setState({ selectedCategories: categories })
    }

    onTextChanged(text: string) {
        clearTimeout(this.timeout);

        let hasText = text.length > 0;

        if (hasText) {
            // Starting searching immediately after user input, 
            // but only show change on ui after 300ms
            searchItemResursive(this.generatedSections, text);

            this.timeout = setTimeout(function () {
                this.updateSearchView(text);
            }.bind(this), 300);
        } else {
            // Show change on ui immediately if search text is cleared
            this.updateSearchView(text);
        }
    }

    updateSearchView(text: string) {
        if (this.state.displayMode === "list") {
            this.raiseEvent("searchTextUpdated", text);
        }

        this.setState({ searchText: text });

        // Update library container of current search
        this.onSearchModeChanged(text.length > 0);
    }

    render() {
        try {
            let sections: JSX.Element[] = null;

            const searchBar = <SearchBar onTextChanged={this.onTextChanged.bind(this)} onCategoriesChanged={this.onCategoriesChanged.bind(this)} onDetailedModeChanged={this.onDetailedModeChanged.bind(this)} onStructuredModeChanged={this.onStructuredModeChanged.bind(this)} categories={this.searchCategories} />

            if (!this.state.inSearchMode) {
                // If the user is not doing a search, obtain all the library items previously rendered
                sections = this.renderedSections;
            }
            else {
                if (this.state.structured) {
                    sections = this.searcher.generateStructuredItems(this.state.searchText, this.state.selectedCategories);
                }
                else {
                    sections = this.searcher.generateListItems(this.state.searchText, this.state.detailed, this.state.selectedCategories);
                }
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
