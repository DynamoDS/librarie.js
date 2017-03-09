import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { search, ItemData } from "../LibraryUtilities";

interface SearchViewProps {
    onSearchChanged: any;
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

    performSearch(text: string) {
        this.props.items.forEach(item => search(text, item));
    }

    generateStructuredItems() {
        let structuredItems: JSX.Element[] = [];
        let index = 0;
        structuredItems = this.props.items.map((item: ItemData) => <LibraryItem key={index++} data={item} />);
        return structuredItems;
    }

    setItemVisibility(visibility: boolean, items: ItemData[] = this.props.items) {
        items.forEach(item => {
            item.visible = visibility;
            this.setItemVisibility(visibility, item.childItems);
        });
    }

    setItemExpandability(expandability: boolean, items: ItemData[] = this.props.items) {
        items.forEach(item => {
            item.expanded = expandability;
            this.setItemExpandability(expandability, item.childItems);
        });
    }

    onTextChange(event: any) {
        let text = event.target.value.trim().toLowerCase();

        this.setState({
            searchText: text
        });

        this.performSearch(text);
        this.props.onSearchChanged(text.length > 0);
    }

    render() {
        let listItems: JSX.Element[] = [];
        if (this.state.searchText.length > 0) {
            this.setItemExpandability(true);
            listItems = this.generateStructuredItems();
        } else {
            this.setItemExpandability(false);
            this.setItemVisibility(true);
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