import * as React from "react";
import * as _ from "underscore";
import { LibraryItem } from "./components/LibraryItem";
import { SearchResultItem } from "./components/SearchResultItem";
import { LibraryContainer } from "./components/LibraryContainer";
import * as LibraryUtilities from "./LibraryUtilities";
import { SearchBar } from "./components/SearchBar";

type displayMode = "structure" | "list";

interface SearchModeChangedFunc {
    (inSearchMode: boolean): void;
}

interface ClearSearchFunc {
    (searchText: string): void;
}

export class Searcher {
    onSearchModeChanged: SearchModeChangedFunc = null;
    clearSearchFunc: ClearSearchFunc = null;
    libraryContainer: LibraryContainer = null;
    sections: LibraryUtilities.ItemData[] = [];
    categories: string[] = [];

    constructor(searchModeChangedFunc: SearchModeChangedFunc, clearSearchFunc: ClearSearchFunc, libraryContainer: LibraryContainer, sections: LibraryUtilities.ItemData[], categories: string[]) {
        this.onSearchModeChanged = searchModeChangedFunc;
        this.clearSearchFunc = clearSearchFunc;
        this.libraryContainer = libraryContainer;
        this.sections = sections;
        this.categories = categories;
    }

    generateStructuredItems(): JSX.Element[] {
        let structuredItems: JSX.Element[] = [];
        let categoryItems: LibraryUtilities.ItemData[] = [];

        this.sections.forEach(section =>
            categoryItems = categoryItems.concat(section.childItems)
        );

        let index = 0;
        for (let item of categoryItems) {
            if (!item.visible || !_.contains(this.categories, item.text)) {
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
        leafItems: JSX.Element[] = []): JSX.Element[] {

        for (let item of items) {
            if (!item.visible) {
                continue;
            }

            if (item.itemType === "category" && !_.contains(this.categories, item.text)) {
                continue;
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
                />);
            } else {
                this.generateListItems(item.childItems, searchText, detailed, pathToThisItem, leafItems);
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

    clearSearch() {
        let searchInput: any = document.getElementById("SearchInputText");
        searchInput.value = "";
        this.clearSearchFunc(searchInput.value);
    }
}