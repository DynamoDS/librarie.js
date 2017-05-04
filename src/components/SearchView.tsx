import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { SearchResultItem } from "./SearchResultItem";
import { LibraryContainer } from "./LibraryContainer";
import { searchItemResursive, setItemStateRecursive, findItemByPath, ItemData } from "../LibraryUtilities";

type displayMode = "structure" | "list";

interface SearchModeChangedFunc {
    (inSearchMode: boolean): void;
}

interface SearchViewProps {
    onSearchModeChanged: SearchModeChangedFunc;
    libraryContainer: LibraryContainer;
    sections: ItemData[];
}

interface SearchViewStates {
    searchText: string;
    displayMode: displayMode;
}

export class SearchView extends React.Component<SearchViewProps, SearchViewStates> {
    timeout: number;
    searchResultListItems: any;

    constructor(props: SearchViewProps) {
        super(props);

        // set default state
        this.state = ({
            searchText: "",
            displayMode: "list"
        })

        this.searchResultListItems = null;
    }

    getSearchText(): string {
        return this.state.searchText;
    }

    generateStructuredItems(): JSX.Element[] {
        let index = 0;
        return this.props.sections.map((item: ItemData) =>
            <LibraryItem key={index++} libraryContainer={this.props.libraryContainer} data={item} />);
    }

    generateListItems(
        items: ItemData[] = this.props.sections,
        pathToItem: ItemData[] = [],
        leafItems: JSX.Element[] = []): JSX.Element[] {

        for (let item of items) {
            if (!item.visible) {
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
                    onResultItemClicked={this.onResultItemClicked.bind(this)}
                />);
            } else {
                this.generateListItems(item.childItems, pathToThisItem, leafItems);
            }
        }

        return leafItems;
    }

    onTextChange(event: any) {
        clearTimeout(this.timeout);

        let text = event.target.value.trim().toLowerCase();
        let hasText = text.length > 0;

        if (hasText) {
            // Starting searching immediately after user input, 
            // but only show change on ui after 300ms
            searchItemResursive(this.props.sections, text);

            this.timeout = setTimeout(function () {
                this.updateSearchView(text);
            }.bind(this), 300);
        } else {
            // Show change on ui immediately if search text is cleared
            setItemStateRecursive(this.props.sections, true, false);
            this.updateSearchView(text);
        }
    }

    onResultItemClicked(pathToItem: ItemData[]) {
        setItemStateRecursive(this.props.sections, true, false);
        if (findItemByPath(pathToItem.slice(0), this.props.sections)) {
            this.clearSearch();
        }
    }

    updateSearchView(text: string) {
        if (text.length > 0 && this.state.displayMode === "list") {
            this.props.libraryContainer.raiseEvent("searchTextUpdated", text);
        }

        this.setState({ searchText: text });
        this.props.onSearchModeChanged(text.length > 0);
    }

    clearSearch() {
        let searchInput: any = document.getElementById("searchInput");
        searchInput.value = "";
        this.setState({ searchText: searchInput.value })
        this.props.onSearchModeChanged(false);
    }

    render() {
        let listItems: JSX.Element[] = null;
        if (this.state.searchText.length > 0) {
            listItems = (this.state.displayMode === "structure") ? this.generateStructuredItems() : this.generateListItems();
        }

        return (
            <div className="searchView">
                <div className="searchBar">
                    <input id="searchInput" type="search" placeholder="Search..." onChange={this.onTextChange.bind(this)}></input>
                </div>
                <div>{listItems}</div>
            </div>
        );
    }
}