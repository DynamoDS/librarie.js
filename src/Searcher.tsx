import * as React from "react";
import * as _ from "underscore";
import { LibraryItem } from "./components/LibraryItem";
import { SearchResultItem } from "./components/SearchResultItem";
import { LibraryContainer } from "./components/LibraryContainer";
import * as LibraryUtilities from "./LibraryUtilities";
import { SearchBar } from "./components/SearchBar";

export class Searcher {
    libraryContainer: LibraryContainer = null;
    sections: LibraryUtilities.ItemData[] = [];
    searchInputField: HTMLInputElement = null;
    categories: string[] = [];

    // This list represents the actual categories beind displayed on the search bar 
    // at the time search is performed. It will be a subset of 'props.categories', 
    // that are most relevant to the current search results.
    displayedCategories: string[];

    constructor(
        libraryContainer: LibraryContainer,
        sections: LibraryUtilities.ItemData[] = [],
        categories: string[] = []) {
        this.libraryContainer = libraryContainer;
        this.sections = sections;
        this.setSearchInputField = this.setSearchInputField.bind(this);
        this.initializeCategories(categories);
    }

    // To set the categories and displayedCategories
    initializeCategories(categories: string[]) {
        this.categories = categories;
        this.displayedCategories = categories;
    }

    generateStructuredItems(): JSX.Element[] {
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
                data={item} />
            );
        }
        return structuredItems;
    }

    generateListItems(
        items: LibraryUtilities.ItemData[] = this.sections,
        searchText: string,
        detailed: boolean,
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
                    index={0}
                />);
            } else {
                this.generateListItems(item.childItems, searchText, detailed, pathToThisItem, leafItems, false);
            }
        }

        // Sort the result based on weight
        leafItems = leafItems.sort((a, b) => {
            if (a.props.data.weight > b.props.data.weight) {
                return 1;
            }
            if (a.props.data.weight < b.props.data.weight) {
                return -1;
            }
            return 0;
        });

        for (let i = 0; i < leafItems.length; i++) {
            leafItems[i].props.index = i;
        }

        this.libraryContainer.setMaxSelectionIndex(leafItems.length - 1);

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

    // Obtain the search input field from SearchBar.
    setSearchInputField(field: HTMLInputElement) {
        this.searchInputField = field;
    }

    clearSearch() {
        if (this.searchInputField) {
            this.searchInputField.value = "";
            this.libraryContainer.clearSearch();
        }
    }
}