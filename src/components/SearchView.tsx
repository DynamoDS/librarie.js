import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { SearchResultItem } from "./SearchResultItem";
import { LibraryContainer } from "./LibraryContainer";
import { searchItemResursive, setItemStateRecursive, ItemData } from "../LibraryUtilities";
import { SearchBar } from "./SearchBar";

type displayMode = "structure" | "list";

interface SearchModeChangedFunc {
    (inSearchMode: boolean): void;
}

interface SearchViewProps {
    onSearchModeChanged: SearchModeChangedFunc;
    libraryContainer: LibraryContainer;
    items: ItemData[];
}

interface SearchViewStates {
    searchText: string;
    displayMode: displayMode;
    selectedCategories: string[];
    structured: boolean;
    detailed: boolean;
}

export class SearchView extends React.Component<SearchViewProps, SearchViewStates> {
    timeout: number;

    searchResultListItems: any;
    categories: string[] = [];

    constructor(props: SearchViewProps) {
        super(props);

        this.categories = ["List", "Input", "Math", "Script", "Display", "ImportExport", "String", "Geometry"];

        this.state = {
            searchText: '',
            displayMode: "list",
            selectedCategories: this.categories,
            structured: false,
            detailed: false
        };
        this.searchResultListItems = null;
    }

    getSearchText(): string {
        return this.state.searchText;
    }

    onStructuredModeChange() {
        this.setState({ structured: !this.state.structured });
    }

    onDetailedModeChange() {
        this.setState({ detailed: !this.state.detailed });
    }

    onCategoriesChange(categories: string[]) {
        this.setState({ selectedCategories: categories })
    }

    generateStructuredItems() {
        let structuredItems: JSX.Element[] = [];
        let index = 0;
        return this.props.items.map((item: ItemData) =>
            <LibraryItem key={index++} libraryContainer={this.props.libraryContainer} data={item} />);
    }

    generateListItems(): JSX.Element[] {
        let leafItems: JSX.Element[] = [];

        for (let item of this.props.items) {
            if (!item.visible) {
                continue;
            }

            if (item.childItems.length > 0) {
                leafItems = leafItems.concat(this.getLeafItemsInCategory(item.text, item.childItems));
            } else {
                leafItems = leafItems.concat(this.getLeafItemsInCategory(item.text, [item]));
            }
        }

        return leafItems;
    }

    getLeafItemsInCategory(category: string, items: ItemData[], leafItemsInCategory: JSX.Element[] = []): JSX.Element[] {
        for (let item of items) {
            if (!item.visible) {
                continue;
            }

            if (item.childItems.length == 0) {
                leafItemsInCategory.push(<SearchResultItem
                    data={item}
                    libraryContainer={this.props.libraryContainer}
                    category={category}
                    highlightedText={this.state.searchText} />);
            } else {
                this.getLeafItemsInCategory(category, item.childItems, leafItemsInCategory);
            }
        }

        return leafItemsInCategory;
    }

    onTextChange(event: any) {
        clearTimeout(this.timeout);

        let text = event.target.value.trim().toLowerCase();
        let hasText = text.length > 0;

        if (hasText) {
            // Starting searching immediately after user input, 
            // but only show change on ui after 300ms
            searchItemResursive(this.props.items, text);

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
            this.props.libraryContainer.raiseEvent("searchTextUpdated", text);
        }

        this.setState({ searchText: text });

        // Update library container of current search
        this.props.onSearchModeChanged(text.length > 0);
    }

    render() {
        let listItems: JSX.Element[] = null;

        if (this.state.searchText.length > 0) {
            listItems = (this.state.displayMode === "structure") ? this.generateStructuredItems() : this.generateListItems();
        } else {  // Reset ItemData when search text is cleared
            setItemStateRecursive(this.props.items, true, false);
        }

        return (
            <div className="searchView">
                <SearchBar onStructuredModeChanged={this.onStructuredModeChange.bind(this)} onDetailedModeChanged={this.onDetailedModeChange.bind(this)} categories={this.categories} onCategoriesChange={this.onCategoriesChange.bind(this)} onTextChange={this.onTextChange.bind(this)}></SearchBar>
                <div>{listItems}</div>
            </div>
        );
    }
}