import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { LibraryView } from "../LibraryView";
import { searchItemResursive, setItemStateRecursive, ItemData } from "../LibraryUtilities";

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
}

export class SearchView extends React.Component<SearchViewProps, SearchViewStates> {
    timeout: any;

    constructor(props: SearchViewProps) {
        super(props);

        this.state = {
            searchText: ''
        };
    }

    generateStructuredItems() {
        let structuredItems: JSX.Element[] = [];
        let index = 0;
        return this.props.items.map((item: ItemData) =>
            <LibraryItem key={index++} libraryView={this.props.libraryView} data={item} />);
    }

    onTextChange(event: any) {
        clearTimeout(this.timeout);

        let text = event.target.value.trim().toLowerCase();

        // start searching only after user stops typing for some time
        this.timeout = setTimeout(function () {
            this.updateSearchState(text);
        }.bind(this), 250);
    }

    updateSearchState(text: string) {
        let hasText = text.length > 0;

        this.setState({ searchText: text });

        // Update LibraryContainer of current search
        this.props.onSearchModeChanged(hasText);
    }

    render() {
        let listItems: JSX.Element[] = [];
        if (this.state.searchText.length > 0) {
            searchItemResursive(this.props.items, this.state.searchText);
            listItems = this.generateStructuredItems();
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