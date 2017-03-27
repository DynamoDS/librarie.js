import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { LibraryView } from "../LibraryView";
import { searchItemResursive, setItemStateRecursive, ItemData } from "../LibraryUtilities";
import { SearchBar } from "./SearchBar";

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
    selectedCategories: string[];
    structured: boolean;
    detailed: boolean;
}

export class SearchView extends React.Component<SearchViewProps, SearchViewStates> {
    categories: string[] = [];

    constructor(props: SearchViewProps) {
        super(props);

        this.categories = ["List", "Input", "Math", "Script", "Display", "ImportExport", "String", "Geometry"];

        this.state = {
            searchText: '',
            selectedCategories: [],
            structured: false,
            detailed: false
        };
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
            <LibraryItem key={index++} libraryView={this.props.libraryView} data={item} indentLevel={0}/>);
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
                <SearchBar onStructuredModeChanged={this.onStructuredModeChange.bind(this)} onDetailedModeChanged={this.onDetailedModeChange.bind(this)} categories={this.categories} onCategoriesChange={this.onCategoriesChange.bind(this)} onTextChange={this.onTextChange.bind(this)}></SearchBar>
                <div>{listItems}</div>
            </div>
        );
    }
}