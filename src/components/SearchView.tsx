import * as React from "react";
import * as _ from "underscore";
import { LibraryItem } from "./LibraryItem";
import { SearchResultItem } from "./SearchResultItem";
import { LibraryContainer } from "./LibraryContainer";
import { SearchBar } from "./SearchBar";
import * as LibraryUtilities from "../LibraryUtilities";

interface SearchModeChangedFunc {
    (inSearchMode: boolean): void;
}

interface SearchViewProps {
    onSearchModeChanged: SearchModeChangedFunc;
    libraryContainer: LibraryContainer;
    sections: LibraryUtilities.ItemData[];
    categories: string[];
}

interface SearchViewStates {
    searchText: string;
    selectedCategories: string[];
    structured: boolean;
    detailed: boolean;
}

export class SearchView extends React.Component<SearchViewProps, SearchViewStates> {
    timeout: number;
    searchResultListItems: any;

    constructor(props: SearchViewProps) {
        super(props);

        this.state = {
            searchText: '',
            selectedCategories: this.props.categories,
            structured: false,
            detailed: false
        };
        this.searchResultListItems = null;
    }

    getSearchText(): string {
        return this.state.searchText;
    }

    generateStructuredItems(): JSX.Element[] {
        let structuredItems: JSX.Element[] = [];
        let categoryItems: LibraryUtilities.ItemData[] = [];

        this.props.sections.forEach(section =>
            categoryItems = categoryItems.concat(section.childItems)
        );

        let index = 0;
        for (let item of categoryItems) {
            if (!item.visible || !_.contains(this.state.selectedCategories, item.text)) {
                continue;
            }
            structuredItems.push(<LibraryItem
                key={index++}
                libraryContainer={this.props.libraryContainer}
                data={item} />
            );
        }
        return structuredItems;
    }

    generateListItems(
        items: LibraryUtilities.ItemData[] = this.props.sections,
        pathToItem: LibraryUtilities.ItemData[] = [],
        leafItems: JSX.Element[] = []): JSX.Element[] {

        for (let item of items) {
            if (!item.visible) {
                continue;
            }

            if (item.itemType === "category" && !_.contains(this.state.selectedCategories, item.text)) {
                continue;
            }

            let pathToThisItem = pathToItem.slice(0);
            pathToThisItem.push(item);

            if (item.childItems.length == 0) {
                leafItems.push(<SearchResultItem
                    data={item}
                    libraryContainer={this.props.libraryContainer}
                    highlightedText={this.state.searchText}
                    pathToItem={pathToThisItem}
                    onParentTextClicked={this.directToLibrary.bind(this)}
                    detailed={this.state.detailed}
                />);
            } else {
                this.generateListItems(item.childItems, pathToThisItem, leafItems);
            }
        }

        return leafItems;
    }

    onTextChanged(text: string) {
        clearTimeout(this.timeout);

        let hasText = text.length > 0;

        if (hasText) {
            // Starting searching immediately after user input, 
            // but only show change on ui after 300ms

            this.timeout = setTimeout(function () {
                LibraryUtilities.searchItemResursive(this.props.sections, text);
                this.updateSearchViewDelayed(text);
            }.bind(this), 300);
        } else {
            // Show change on ui immediately if search text is cleared
            LibraryUtilities.setItemStateRecursive(this.props.sections, true, false);
            this.updateSearchViewDelayed(text);
        }
    }

    // Direct back to library and expand items based on pathToItem. 
    directToLibrary(pathToItem: LibraryUtilities.ItemData[]) {
        LibraryUtilities.setItemStateRecursive(this.props.sections, true, false);
        if (LibraryUtilities.findAndExpandItemByPath(pathToItem.slice(0), this.props.sections)) {
            this.clearSearch();
        }
    }

    onStructuredModeChanged(value: boolean) {
        this.setState({ structured: value });
    }

    onDetailedModeChanged(value: boolean) {
        this.setState({ detailed: value });
    }

    onCategoriesChanged(categories: string[]) {
        this.setState({ selectedCategories: categories });
    }

    updateSearchViewDelayed(text: string) {
        if (text.length > 0 && !this.state.structured) {
            this.props.libraryContainer.raiseEvent("searchTextUpdated", text);
        }

        this.setState({ searchText: text });
        this.props.onSearchModeChanged(text.length > 0);
    }

    clearSearch() {
        let searchInput: any = document.getElementById("SearchInputText");
        searchInput.value = "";
        this.setState({ searchText: searchInput.value })
        this.props.onSearchModeChanged(false);
    }

    render() {
        let listItems: JSX.Element[] = null;
        if (this.state.searchText.length > 0) {
            listItems = (this.state.structured) ? this.generateStructuredItems() : this.generateListItems();
        }

        return (
            <div className="searchView">
                <SearchBar
                    onStructuredModeChanged={this.onStructuredModeChanged.bind(this)}
                    onDetailedModeChanged={this.onDetailedModeChanged.bind(this)}
                    categories={this.props.categories}
                    onCategoriesChanged={this.onCategoriesChanged.bind(this)}
                    onTextChanged={this.onTextChanged.bind(this)}>
                </SearchBar>
                <div>{listItems}</div>
            </div>
        );
    }
}