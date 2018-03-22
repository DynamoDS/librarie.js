/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");
require("../resources/fonts/font-awesome-4.7.0/css/font-awesome.min.css");

import * as React from "react";
import * as LibraryUtilities from "../LibraryUtilities";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { Searcher } from "../Searcher";
import { SearchBar } from "./SearchBar";
import { CategoryData } from "./SearchBar";
import { SearchResultItem } from "./SearchResultItem";
import * as ReactDOM from "react-dom";

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
    showItemSummary: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;

    generatedSections: LibraryUtilities.ItemData[] = null;
    generatedSectionsOnSearch: LibraryUtilities.ItemData[] = null;
    searchResultItemRefs: SearchResultItem[] = [];
    searchResultItems: LibraryUtilities.ItemData[] = [];

    searcher: Searcher = null;
    searchCategories: string[] = [];
    timeout: number;
    selectionIndex: number = 0;

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
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.scrollToExpandedItem = this.scrollToExpandedItem.bind(this)

        // Set handlers after methods are bound.
        this.props.libraryController.setLoadedTypesJsonHandler = this.setLoadedTypesJson;
        this.props.libraryController.setLayoutSpecsJsonHandler = this.setLayoutSpecsJson;
        this.props.libraryController.refreshLibraryViewHandler = this.refreshLibraryView;


        // Initialize the search utilities with empty data
        this.searcher = new Searcher();

        this.state = {
            inSearchMode: false,
            searchText: '',
            selectedCategories: [],
            structured: false,
            detailed: false,
            showItemSummary: false // disable expandable tool tip by default
        };
    }

    componentWillMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(event: any) {
        switch (event.key) {
            case "ArrowUp":
                this.updateSelectionIndex(false);
                break;
            case "ArrowDown":
                this.updateSelectionIndex(true);
                break;
            default:
                break;
        }
    }

    private offset(el: any) {
        var rect = el.getBoundingClientRect(),
            scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    }

    /**
     * This method attempts to scroll the outer libraryItemContainer so that the position
     * on screen of the passed element does not change, even though the scroll position does.
     * @param element 
     */
    scrollToExpandedItem(element: HTMLElement) {
        if (element) {
            
            var currentElement = ReactDOM.findDOMNode(this).querySelector(".LibraryItemContainer");
            //get the offset for the element we care about scrolling to.
            var offsetOldElement = this.offset(element);
            //now we wait until the expansion and re-render occurs,
            setTimeout(() => {
                //measure the distance between the old element and the new position post expansion
                var distance = offsetOldElement.top - this.offset(element).top;
                //scroll back up by that distance.
                currentElement.scrollTop = currentElement.scrollTop - distance;

            }, 0);
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

    onSearchModeChanged(inSearchMode: boolean, searchText?: string) {
        // Reset selectionIndex when serach mode changed
        this.selectionIndex = 0;
        this.updateSearchResultItems(inSearchMode, this.state.structured);
        if (searchText) {
            this.setState({
                inSearchMode: inSearchMode,
                searchText: searchText
            });
        } else {
            this.setState({ inSearchMode: inSearchMode });
        }
    }

    onStructuredModeChanged(value: boolean) {
        this.updateSearchResultItems(true, value); // generate structured items 
        this.setState({ structured: value });
    }

    onDetailedModeChanged(value: boolean) {
        this.setState({ detailed: value });
    }

    onCategoriesChanged(categories: string[], categoryData:CategoryData[]) {
        this.searcher.categories = categories;
        this.updateSearchResultItems(true, this.state.structured);
        this.setState({ selectedCategories: categories });
        //This is used in Dynamo instrumenation. categoryData contains the list of all 
        //categories in the filter with their state {checked or unchecked}
        this.raiseEvent(this.props.libraryController.FilterCategoryEventName, categoryData);
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
        if (text.length == 0) {
            this.onSearchModeChanged(false);
        } else if (!this.state.structured) {
            this.raiseEvent(this.props.libraryController.SearchTextUpdatedEventName, text);
            this.onSearchModeChanged(true, text);
        }
    }

    updateSearchResultItems(inSearchMode: boolean, structured: boolean) {
        if (!inSearchMode) {
            this.searchResultItemRefs = [];
            return;
        }

        let index = 0;
        let data: LibraryUtilities.ItemData[] = null;
        if (structured) {
            this.searchResultItems = this.searcher.generateStructuredItems();
        } else {
            this.searchResultItems = this.searcher.generateListItems(
                this.props.libraryController.searchLibraryItemsHandler ? this.generatedSectionsOnSearch : this.generatedSections
            );
        }
    }

    // Update the selectionIndex. Current index will add by 1 if selectNextItem is true,
    // minus by 1 otherwise, but it should always be between 0 and maxSelectionIndex.
    updateSelectionIndex(selectNextItem: boolean) {
        if (!this.state.inSearchMode || this.state.structured) {
            return;
        }

        let nextIndex = selectNextItem ? this.selectionIndex + 1 : this.selectionIndex - 1;
        let maxSelectionIndex = this.searchResultItems.length - 1;

        if (nextIndex < 0 && maxSelectionIndex >= 0) {
            nextIndex = 0;
        }

        if (nextIndex >= maxSelectionIndex) {
            nextIndex = maxSelectionIndex;
        }

        this.setSelection(nextIndex);
    }

    // Set item at index to be selected, and the previous selected item will be unselected.
    setSelection(index: number) {
        this.searchResultItemRefs[this.selectionIndex].setSelected(false);
        this.searchResultItemRefs[index].setSelected(true);
        this.selectionIndex = index;
    }

    // Direct back to library and expand items based on pathToItem. 
    directToLibrary(pathToItem: LibraryUtilities.ItemData[]) {
        LibraryUtilities.setItemStateRecursive(this.generatedSections, true, false);
        if (LibraryUtilities.findAndExpandItemByPath(pathToItem.slice(0), this.generatedSections)) {
            this.onSearchModeChanged(false);
        }
    }

    render() {
        if (!this.generatedSections) {
            let eventName = this.props.libraryController.RefreshLibraryViewRequestName;
            this.props.libraryController.request(eventName, null);
            return (<div>This is LibraryContainer</div>);
        }

        try {
            let sections: JSX.Element[] = null;
            let index = 0;
            if (!this.state.inSearchMode) {
                sections = this.generatedSections.map(data => {
                    return <LibraryItem
                        key={index++}
                        libraryContainer={this}
                        data={data}
                        showItemSummary={this.state.showItemSummary}
                    />
                }
                );
            } else if (this.state.structured) {
                sections = this.searchResultItems.map(item =>
                    <LibraryItem key={index++} data={item} libraryContainer={this} showItemSummary={this.state.showItemSummary} />
                );
            } else {
                sections = this.searchResultItems.map(item =>
                    <SearchResultItem
                        ref={item => { if (item) this.searchResultItemRefs.push(item); }}
                        index={index}
                        key={index++}
                        data={item}
                        libraryContainer={this}
                        highlightedText={this.state.searchText}
                        detailed={this.state.detailed}
                        showItemSummary={this.state.showItemSummary}
                        onParentTextClicked={this.directToLibrary.bind(this)}
                    />
                );
            }

            const searchBar = <SearchBar
                onCategoriesChanged={this.onCategoriesChanged}
                onDetailedModeChanged={this.onDetailedModeChanged}
                onStructuredModeChanged={this.onStructuredModeChanged}
                onTextChanged={this.onTextChanged}
                categories={this.searcher.getDisplayedCategories()}
            />;

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
