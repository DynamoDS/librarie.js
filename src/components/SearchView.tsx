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
    timeout: number;

    constructor(props: SearchViewProps) {
        super(props);

        this.state = { searchText: '' };
    }

    generateStructuredItems() {
        let index = 0;
        return this.props.items.map((item: ItemData) =>
            <LibraryItem key={index++} libraryView={this.props.libraryView} data={item} />);
    }

    onTextChange(event: any) {
        clearTimeout(this.timeout);

        let text = event.target.value.trim().toLowerCase();
        let hasText = text.length > 0;

        if (hasText) {
            // Starting searching immediately after user typings, 
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
        this.setState({ searchText: text });
        this.props.onSearchModeChanged(text.length > 0);;
    }

    render() {
        let listItems: JSX.Element[] = [];
        if (this.state.searchText.length > 0) {
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