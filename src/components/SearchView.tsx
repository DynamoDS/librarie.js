import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { SearchResultItem } from "./SearchResultItem";
import { LibraryContainer } from "./LibraryContainer";
import { searchItemResursive, setItemStateRecursive, ItemData } from "../LibraryUtilities";

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
            displayMode: "structure"
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

    generateListItems(): JSX.Element[] {
        let leafItems: JSX.Element[] = [];
        let categoryItems: ItemData[] = [];

        this.props.sections.forEach(section =>
            categoryItems = categoryItems.concat(section.childItems)
        );

        for (let item of categoryItems) {
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
            searchItemResursive(this.props.sections, text);

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
            setItemStateRecursive(this.props.sections, true, false);
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