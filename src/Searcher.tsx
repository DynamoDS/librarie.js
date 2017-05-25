import * as React from "react";
import * as _ from "underscore";
import { LibraryItem } from "./components/LibraryItem";
import { SearchResultItem } from "./components/SearchResultItem";
import { LibraryContainer } from "./components/LibraryContainer";
import * as LibraryUtilities from "./LibraryUtilities";
import { SearchBar } from "./components/SearchBar";

interface ClearSearchFunc {
    (searchText: string): void;
}

export class Searcher {
    clearSearchFunc: ClearSearchFunc = null;
    libraryContainer: LibraryContainer = null;
    sections: LibraryUtilities.ItemData[] = [];
    categories: string[] = [];

    // This list represents the actual categories beind displayed on the search bar 
    // at the time search is performed. It will be a subset of 'props.categories', 
    // that are most relevant to the current search results.
    displayedCategories: string[];

    constructor(
        clearSearchFunc: ClearSearchFunc,
        libraryContainer: LibraryContainer,
        sections: LibraryUtilities.ItemData[] = [],
        categories: string[] = []) {
        this.clearSearchFunc = clearSearchFunc;
        this.libraryContainer = libraryContainer;
        this.sections = sections;
        this.initializeCategories(categories);
    }

    // To set the categories and displayedCategories
    initializeCategories(categories: string[]) {
        this.categories = categories;
        this.displayedCategories = categories;
    }

    generateStructuredItems(showExpandableToolTip: boolean): JSX.Element[] {
        let structuredItems: JSX.Element[] = [];
        let categoryItems: LibraryUtilities.ItemData[] = [];

        this.sections.forEach(section =>
            categoryItems = categoryItems.concat(section.childItems)
        );

        let index = 0;
        this.displayedCategories = [];
        for (let item of categoryItems) {
            if (!item.visible) {
                continue;
            }

            this.displayedCategories.push(item.text);

            if (!_.contains(this.categories, item.text)) {
                continue;
            }

            structuredItems.push(<LibraryItem
                key={index++}
                libraryContainer={this.libraryContainer}
                data={item}
                showExpandableToolTip={showExpandableToolTip}
            />);
        }
        return structuredItems;
    }

    generateListItems(
        items: LibraryUtilities.ItemData[] = this.sections,
        searchText: string,
        detailed: boolean,
        showExpandableToolTip: boolean,
        pathToItem: LibraryUtilities.ItemData[] = [],
        leafItems: JSX.Element[] = [],
        top: boolean = true): JSX.Element[] {

        if (top) {
            this.displayedCategories = [];
        }

        for (let item of items) {
            if (!item.visible) {
                continue;
            }

            if (item.itemType === "category") {

                this.displayedCategories.push(item.text);

                if (!_.contains(this.categories, item.text)) {
                    continue;
                }
            }

            let pathToThisItem = pathToItem.slice(0);
            pathToThisItem.push(item);

            if (item.childItems.length == 0) {
                leafItems.push(<SearchResultItem
                    data={item}
                    libraryContainer={this.libraryContainer}
                    highlightedText={searchText}
                    pathToItem={pathToThisItem}
                    onParentTextClicked={this.directToLibrary.bind(this)}
                    detailed={detailed}
                    showExpandableToolTip={showExpandableToolTip}
                />);
            } else {
                this.generateListItems(
                    item.childItems,
                    searchText,
                    detailed,
                    showExpandableToolTip,
                    pathToThisItem,
                    leafItems,
                    false
                );
            }
        }

        return leafItems;
    }

    // Direct back to library and expand items based on pathToItem. 
    directToLibrary(pathToItem: LibraryUtilities.ItemData[]) {
        LibraryUtilities.setItemStateRecursive(this.sections, true, false);
        if (LibraryUtilities.findAndExpandItemByPath(pathToItem.slice(0), this.sections)) {
            this.clearSearch();
        }
    }

    // After generated items based on the search text, the categories will be updated as well.
    // This function will be called to the the updated categories.
    getDisplayedCategories(): string[] {
        return this.displayedCategories;
    }

    clearSearch() {
        let searchInput: any = document.getElementById("SearchInputText");
        searchInput.value = "";
        this.clearSearchFunc(searchInput.value);
    }
}