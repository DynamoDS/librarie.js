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

    updateSearchResultListItems(searchResultListItems: any) {
        this.searchResultListItems = searchResultListItems;
    }

    generateStructuredItems(): JSX.Element[] {
        let index = 0;
        return this.props.items.map((item: ItemData) =>
            <LibraryItem key={index++} libraryView={this.props.libraryView} data={item} indentLevel={0} />);
    }

    generateListItems(items: ItemData[] = this.props.items, leafItems: JSX.Element[] = []): JSX.Element[] {
        for (let item of items) {
            if (item.visible && item.childItems.length == 0) {
                let listItem = <SearchResultItem key={leafItems.length} data={item} libraryView={this.props.libraryView} highlightedText={this.state.searchText} />;
                leafItems.push(listItem);
            } else if (item.visible) {
                this.generateListItems(item.childItems, leafItems);
            }
        }
        return leafItems;
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
                this.props.libraryView.raiseEvent("searchStarted", this.state.searchText, this);
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