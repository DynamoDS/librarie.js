import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { LibraryContainer } from "./LibraryContainer";
import { searchItemResursive, setItemStateRecursive, ItemData } from "../LibraryUtilities";

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
}

export class SearchView extends React.Component<SearchViewProps, SearchViewStates> {

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
            <LibraryItem key={index++} libraryContainer={this.props.libraryContainer} data={item} />);
    }

    onTextChange(event: any) {
        let text = event.target.value.trim().toLowerCase();
        let hasText = text.length > 0;

        this.setState({ searchText: text });

        // Update LibraryContainer of the search
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