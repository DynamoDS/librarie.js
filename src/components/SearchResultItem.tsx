import * as React from "react";
import * as ReactDOM from "react-dom";
import { LibraryContainer } from "./LibraryContainer";
import * as LibraryUtilities from "../LibraryUtilities";

interface ParentTextClickedFunc {
    (pathToItem: LibraryUtilities.ItemData[]): void;
}

interface SearchResultItemProps {
    data: LibraryUtilities.ItemData,
    libraryContainer: LibraryContainer,
    highlightedText: string,
    pathToItem: LibraryUtilities.ItemData[],
    onParentTextClicked: ParentTextClickedFunc,
    detailed: boolean,
    selected: boolean,
    index: number
}

interface SearchResultItemStates { }

export class SearchResultItem extends React.Component<SearchResultItemProps, SearchResultItemStates> {

    constructor(props: SearchResultItemProps) {
        super(props);
    }

    componentWillMount() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    // Scroll current item to top/bottom selection changed
    componentDidUpdate() {
        if (this.props.selected) {
            let container = ReactDOM.findDOMNode(this.props.libraryContainer);
            let currentItem = ReactDOM.findDOMNode(this);
            let containerRect = container.getBoundingClientRect();
            let currentRect = currentItem.getBoundingClientRect();

            if (currentRect.top < currentRect.height) {
                currentItem.scrollIntoView();
            }

            if (currentRect.bottom > containerRect.bottom) {
                currentItem.scrollIntoView(false);
            }
        }
    }

    handleKeyDown(event: any) {
        switch (event.code) {
            case "Enter":
                if (this.props.selected) {
                    this.onItemClicked();
                }
            default:
                break;
        }
    }

    render() {
        let ItemContainerStyle = this.props.selected ? "SearchResultItemContainerSelected" : "SearchResultItemContainer";
        let iconPath = this.props.data.iconUrl;

        // The parent of a search result item is the second last entry in 'pathToItem'
        let parentText = this.props.pathToItem[this.props.pathToItem.length - 2].text;

        // Category of the item is the item with type category in the array pathToItem
        let categoryText = this.props.pathToItem.find(item => item.itemType === "category").text;

        let parameters = this.props.data.parameters;
        let highLightedItemText = LibraryUtilities.getHighlightedText(this.props.data.text, this.props.highlightedText, true);
        let highLightedParentText = LibraryUtilities.getHighlightedText(parentText, this.props.highlightedText, false);
        let highLightedCategoryText = LibraryUtilities.getHighlightedText(categoryText, this.props.highlightedText, false);
        let itemTypeIconPath = "src/resources/icons/library-" + this.props.data.itemType + ".svg";
        let itemDescription: JSX.Element = null;

        if (this.props.detailed) {
            let description = "No description available";
            if (this.props.data.description && this.props.data.description.length > 0) {
                description = this.props.data.description;
            }

            itemDescription = <div className={"ItemDescription"}>{description}</div>;
        }

        return (
            <div className={ItemContainerStyle} onClick={this.onItemClicked.bind(this)}
                onMouseOver={this.onLibraryItemMouseEnter.bind(this)} onMouseLeave={this.onLibraryItemMouseLeave.bind(this)}>
                <img className={"ItemIcon"} src={iconPath} onError={this.onImageLoadFail.bind(this)} />
                <div className={"ItemInfo"}>
                    <div className={"ItemTitle"}>{highLightedItemText}
                        <div className={"LibraryItemParameters"}>{parameters}</div>
                    </div>
                    {itemDescription}
                    <div className={"ItemDetails"}>
                        <div className={"ItemParent"} onClick={this.onParentTextClicked.bind(this)}>
                            {highLightedParentText}
                        </div>
                        <img className={"ItemTypeIcon"} src={itemTypeIconPath} onError={this.onImageLoadFail.bind(this)} />
                        <div className={"ItemCategory"}>{highLightedCategoryText}</div>
                    </div>
                </div>
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/Dynamo.svg");
    }

    onParentTextClicked(event: any) {
        event.stopPropagation();
        this.props.onParentTextClicked(this.props.pathToItem);
    }

    onItemClicked() {
        // Update selection index when an item is clicked
        this.props.libraryContainer.setSelectionIndex(this.props.index);
        this.props.libraryContainer.raiseEvent("itemClicked", this.props.data.contextData);
    };

    onLibraryItemMouseLeave() {
        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            let mouseLeaveEvent = libraryContainer.props.libraryController.ItemMouseLeaveEventName;
            libraryContainer.raiseEvent(mouseLeaveEvent, { data: this.props.data.contextData });
        }
    }

    onLibraryItemMouseEnter() {
        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            let rec = ReactDOM.findDOMNode(this).getBoundingClientRect();
            let mouseEnterEvent = libraryContainer.props.libraryController.ItemMouseEnterEventName;
            libraryContainer.raiseEvent(mouseEnterEvent, { data: this.props.data.contextData, rect: rec });
        }
    }
}