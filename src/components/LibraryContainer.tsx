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
    searchText: string,
    selectedCategories: string[],
    structured: boolean,
    detailed: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;

    generatedSections: LibraryUtilities.ItemData[] = null;
    generatedSectionsOnSearch: LibraryUtilities.ItemData[] = null;
    renderedSections: JSX.Element[] = null;
    searchCategories: string[] = [];

    timeout: number;
    selectionIndex: number = -1;
    maxSelectionIndex: number = -1;
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
        this.onCategoriesChanged = this.onCategoriesChanged.bind(this);
        this.onTextChanged = this.onTextChanged.bind(this);
        this.clearSearch = this.clearSearch.bind(this);

        // Set handlers after methods are bound.
        this.props.libraryController.setLoadedTypesJsonHandler = this.setLoadedTypesJson;
        this.props.libraryController.setLayoutSpecsJsonHandler = this.setLayoutSpecsJson;
        this.props.libraryController.refreshLibraryViewHandler = this.refreshLibraryView;

        // Initialize the search utilities with empty data
        this.searcher = new Searcher(this.onSearchModeChanged, this.clearSearch, this, [], []);

        this.state = {
            inSearchMode: false,
            searchText: '',
            selectedCategories: [],
            structured: false,
            detailed: false
        };
    }

    componentWillMount() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    handleKeyDown(event: any) {
        switch (event.code) {
            case "ArrowUp":
                event.preventDefault(); // Prevent arrow key from navigating around search input
                this.updateSelectionIndex(false);
                break;
            case "ArrowDown":
                event.preventDefault();
                this.updateSelectionIndex(true);
                break;
            default:
                break;
        }
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

        // Render the default view of the library
        let index = 0;
        this.renderedSections = this.generatedSections.map(data => <LibraryItem key={index++} libraryContainer={this} data={data} />);

        this.updateSections(this.generatedSections);
    }

    updateSections(sections: any): void {
        // Obtain the categories from each section to be added into the filtering options for search
        for (let section of sections) {
            for (let childItem of section.childItems)
                this.searchCategories.push(childItem.text);
        }

        // Update the properties in searcher
        this.searcher.sections = sections;
        this.searcher.initializeCategories(this.searchCategories);

        // Just to force a refresh of UI.
        this.setState({ inSearchMode: this.state.inSearchMode });
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    // Update the selectionIndex. Current index will add by 1 if selectNextItem is true,
    // minus by 1 otherwise, but it should always be between 0 and maxSelectionIndex.
    updateSelectionIndex(selectNextItem: boolean) {
        if (!this.state.inSearchMode) {
            return;
        }

        let nextIndex = selectNextItem ? this.selectionIndex + 1 : this.selectionIndex - 1;

        if (nextIndex < 0 && this.maxSelectionIndex >= 0) {
            nextIndex = 0;
        }

        if (nextIndex >= this.maxSelectionIndex) {
            nextIndex = this.maxSelectionIndex;
        }

        this.selectionIndex = nextIndex;
    }

    // New selectionIndex will be set when user clicks on an item.
    setSelectionIndex(index: number) {
        this.selectionIndex = index;
        this.forceUpdate();
    }

    // Set the max selection index(number of items in the search result).
    setMaxSelectionIndex(max: number) {
        this.maxSelectionIndex = max;
    }

    getSelectionIndex(): number {
        return this.selectionIndex;
    }

    onSearchModeChanged(inSearchMode: boolean) {
        // Reset selectionIndex when quitting from search mode
        if (this.state.inSearchMode && !inSearchMode) {
            this.selectionIndex = -1;
            this.maxSelectionIndex = -1;
        }

        this.setState({ inSearchMode: inSearchMode });
    }

    onStructuredModeChanged(value: boolean) {
        this.setState({ structured: value });
    }

    onDetailedModeChanged(value: boolean) {
        this.setState({ detailed: value });
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
            // Starting searching immediately after user input, 
            // but only show change on ui after 300ms

            this.timeout = setTimeout(function () {
                if (this.props.libraryController.searchLibraryItemsHandler) {
                    this.props.libraryController.searchLibraryItemsHandler(text, function (loadedTypesJsonOnSearch: any) {
                        // Generate sections based on layout specification and loaded types filtered by search string
                        this.generatedSectionsOnSearch = LibraryUtilities.buildLibrarySectionsFromLayoutSpecs(
                            loadedTypesJsonOnSearch, this.layoutSpecsJson,
                            this.props.defaultSectionString, this.props.miscSectionString);

                        this.updateSections(this.generatedSectionsOnSearch);

                        // Set all categories and groups to be expanded
                        LibraryUtilities.setItemStateRecursive(this.generatedSectionsOnSearch, true, true);
                        this.updateSearchViewDelayed(text);
                    }.bind(this));
                } else {
                    LibraryUtilities.searchItemResursive(this.generatedSections, text);
                    this.updateSearchViewDelayed(text);
                }
            }.bind(this), 300);
        } else {
            // Show change on ui immediately if search text is cleared
            LibraryUtilities.setItemStateRecursive(this.generatedSections, true, false);
            this.updateSearchViewDelayed(text);
        }
    }

    updateSearchViewDelayed(text: string) {
        if (text.length > 0 && !this.state.structured) {
            this.raiseEvent(this.props.libraryController.SearchTextUpdatedEventName, text);
        }

        this.onSearchModeChanged(text.length > 0);
        this.setState({ searchText: text });
    }

    clearSearch(text: string) {
        this.onSearchModeChanged(false);
        this.setState({ searchText: text })
    }

    render() {
        if (!this.generatedSections) {
            return (<div>This is LibraryContainer</div>);
        }

        try {
            let sections: JSX.Element[] = null;

            if (!this.state.inSearchMode) {
                sections = this.renderedSections;
            } else if (this.state.structured) {
                sections = this.searcher.generateStructuredItems();
            } else {
                sections = this.searcher.generateListItems(
                    this.props.libraryController.searchLibraryItemsHandler ? this.generatedSectionsOnSearch : this.generatedSections,
                    this.state.searchText,
                    this.state.detailed
                );
            }

            const searchBar = <SearchBar onCategoriesChanged={this.onCategoriesChanged} onDetailedModeChanged={this.onDetailedModeChanged}
                onStructuredModeChanged={this.onStructuredModeChanged} onTextChanged={this.onTextChanged}
                categories={this.searcher.getDisplayedCategories()} setSearchInputField={this.searcher.setSearchInputField} />

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
