import * as React from "react";
import * as ReactDOM from "react-dom";
import { ItemData, getHighlightedText } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

interface SearchResultItemProps {
    data: ItemData;
    libraryContainer: LibraryContainer;
    highlightedText: string;
    pathToItem: ItemData[];
    onGroupTextClicked: Function;
}

interface SearchResultItemStates { }

export class SearchResultItem extends React.Component<SearchResultItemProps, SearchResultItemStates> {

    constructor(props: SearchResultItemProps) {
        super(props);
    }

    render() {
        let iconPath = this.props.data.iconUrl;

        // Parent of the item is the last but one item in the array pathToItem
        let parentText = this.props.pathToItem[this.props.pathToItem.length - 2].text;

        // Category of the item is the item with type category in the array pathToItem
        let categoryText = this.props.pathToItem.find(item => item.itemType === "category").text;
        
        let parameters = this.props.data.parameters;
        let highLightedItemText = getHighlightedText(this.props.data.text, this.props.highlightedText, true);
        let highLightedParentText = getHighlightedText(parentText, this.props.highlightedText, false);
        let highLightedCategoryText = getHighlightedText(categoryText, this.props.highlightedText, false);
        let ItemTypeIconPath = "src/resources/icons/library-" + this.props.data.itemType + ".svg";

        return (
            <div className={"SearchResultItemContainer"} onClick={this.onItemClicked.bind(this)}
                onMouseOver={this.onLibraryItemMouseEnter.bind(this)} onMouseLeave={this.onLibraryItemMouseLeave.bind(this)}>
                <img className={"ItemIcon"} src={iconPath} onError={this.onImageLoadFail.bind(this)} />
                <div className={"ItemInfo"}>
                    <div className={"ItemTitle"}>{highLightedItemText}<div className={"LibraryItemParameters"}>{parameters}</div></div>
                    <div className={"ItemDetails"}>
                        <div className={"ItemParent"} onClick={this.onGroupTextClicked.bind(this)}>
                            {highLightedParentText}
                        </div>
                        <img className={"ItemTypeIcon"} src={ItemTypeIconPath} onError={this.onImageLoadFail.bind(this)} />
                        <div className={"ItemCategory"}>{highLightedCategoryText}</div>
                    </div>
                </div>
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/Dynamo.svg");
    }

    onGroupTextClicked(event: any) {
        event.stopPropagation();
        this.props.onGroupTextClicked(this.props.pathToItem);
    }

    onItemClicked() {
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