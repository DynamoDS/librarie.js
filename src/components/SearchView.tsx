import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { SearchResultItem } from "./SearchResultItem";
import { LibraryView } from "../LibraryView";
import { searchItemResursive, setItemStateRecursive, ItemData } from "../LibraryUtilities";

type displayMode = "strucutre" | "list";

interface SearchModeChangedFunc {
    (inSearchMode: boolean): void;
}

interface SearchViewProps {
    onSearchModeChanged: SearchModeChangedFunc;
    libraryView: LibraryView;
    items: ItemData[];
}

interface SearchViewStates {
    searchText: string;
    displayMode: displayMode;
}

export class SearchView extends React.Component<SearchViewProps, SearchViewStates> {

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

    updateSearchResultListItems(searchResultListItems: any) {
        this.searchResultListItems = searchResultListItems;
    }

    generateStructuredItems(): JSX.Element[] {
        let index = 0;
        return this.props.items.map((item: ItemData) =>
            <LibraryItem key={index++} libraryView={this.props.libraryView} data={item} indentLevel={0} />);
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
                    libraryView={this.props.libraryView}
                    category={category}
                    highlightedText={this.state.searchText} />);
            } else {
                this.getLeafItemsInCategory(category, item.childItems, leafItemsInCategory);
            }
        }

        return leafItemsInCategory;
    }

    onTextChange(event: any) {
        let text = event.target.value.trim().toLowerCase();

        this.setState({ searchText: text });

        // Update library container of current search
        this.props.onSearchModeChanged(text.length > 0);
    }

    render() {
        let listItems: JSX.Element[] = null;
        if (this.state.searchText.length > 0) {
            // Raise search event only when in list display mode
            if (this.state.displayMode === "list") {
                this.props.libraryView.raiseEvent("searchStarted", this);
            }

            if (this.searchResultListItems) {
                // construct listItems from json
            } else {
                // perform search locally
                searchItemResursive(this.props.items, this.state.searchText);
                listItems = (this.state.displayMode === "strucutre") ?
                    this.generateStructuredItems() : this.generateListItems();
            }
        } else {
            // Reset ItemData when search text is cleared
            setItemStateRecursive(this.props.items, true, false);
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