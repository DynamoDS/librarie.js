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
    categories: string[] = [];

    // This list represents the actual categories beind displayed on the search bar 
    // at the time search is performed. It will be a subset of 'props.categories', 
    // that are most relevant to the current search results.
    displayedCategories: string[];

    constructor() {
    }

    // To set the categories and displayedCategories
    initializeCategories(categories: string[]) {
        this.categories = categories;
        this.displayedCategories = categories;
    }

    generateStructuredItems(): LibraryUtilities.ItemData[] {
        let structuredItems: LibraryUtilities.ItemData[] = [];
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

            structuredItems.push(item);
        }
        return structuredItems;
    }

    generateListItems(
        items: LibraryUtilities.ItemData[] = this.sections,
        pathToItem: LibraryUtilities.ItemData[] = [],
        leafItems: LibraryUtilities.ItemData[] = [],
        top: boolean = true): LibraryUtilities.ItemData[] {
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
                item.pathToItem = pathToThisItem;
                leafItems.push(item);
            } else {
                this.generateListItems(item.childItems, pathToThisItem, leafItems, false);
            }
        }

        // Sort the result based on weight
        leafItems = leafItems.sort((a, b) => a.weight - b.weight);

        return leafItems;
    }

    // After generated items based on the search text, the categories will be updated as well.
    // This function will be called to the the updated categories.
    getDisplayedCategories(): Set<string> {
        return new Set(this.displayedCategories);
    }
}