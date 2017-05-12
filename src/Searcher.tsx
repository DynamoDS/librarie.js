import * as React from "react";
import * as _ from "underscore";
import { LibraryItem } from "./components/LibraryItem";
import { SearchResultItem } from "./components/SearchResultItem";
import { LibraryContainer } from "./components/LibraryContainer";
import { searchItemResursive, setItemStateRecursive, ItemData } from "./LibraryUtilities";
import { SearchBar } from "./components/SearchBar";

type displayMode = "structure" | "list";

interface SearchModeChangedFunc {
    (inSearchMode: boolean): void;
}

interface SearchViewProps {
    onSearchModeChanged: SearchModeChangedFunc;
    libraryContainer: LibraryContainer;
    sections: ItemData[];
    categories: string[];
}

interface SearchViewStates {}

export class Searcher extends React.Component<SearchViewProps, SearchViewStates> {

    searchResultListItems: any;

    constructor(props: SearchViewProps) {
        super(props);
        this.searchResultListItems = null;
    }

    generateStructuredItems(searchText: string, selectedCategories: string[]): JSX.Element[] {
        let structuredItems: JSX.Element[] = [];
        let categoryItems: ItemData[] = [];
        
        let index = 0;

        this.props.sections.forEach(section =>
            categoryItems = categoryItems.concat(section.childItems)
        );

        for (let item of categoryItems) {
            if (!item.visible || !_.contains(selectedCategories, item.text)) {
                continue;
            }
            structuredItems = structuredItems.concat([<LibraryItem key={index++} libraryContainer={this.props.libraryContainer} data={item} />])
        }
        return structuredItems;
    }

    generateListItems(searchText: string, selectedCategories: string[]): JSX.Element[] {
        let leafItems: JSX.Element[] = [];
        let categoryItems: ItemData[] = [];

        this.props.sections.forEach(section =>
            categoryItems = categoryItems.concat(section.childItems)
        );

        for (let item of categoryItems) {
            if (!item.visible || !_.contains(selectedCategories, item.text)) {
                continue;
            }

            if (item.childItems.length > 0) {
                leafItems = leafItems.concat(this.getLeafItemsInCategory(searchText, item.text, item.childItems));
            } else {
                leafItems = leafItems.concat(this.getLeafItemsInCategory(searchText, item.text, [item]));
            }
        }

        return leafItems;
    }

    getLeafItemsInCategory(searchText: string, category: string, items: ItemData[], leafItemsInCategory: JSX.Element[] = []): JSX.Element[] {
        for (let item of items) {
            if (!item.visible) {
                continue;
            }

            if (item.childItems.length == 0) {
                leafItemsInCategory.push(<SearchResultItem
                    data={item}
                    libraryContainer={this.props.libraryContainer}
                    category={category}
                    highlightedText={searchText} />);
            } else {
                this.getLeafItemsInCategory(searchText, category, item.childItems, leafItemsInCategory);
            }
        }

        return leafItemsInCategory;
    }
}