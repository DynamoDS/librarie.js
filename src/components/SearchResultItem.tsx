import * as React from "react";
import * as ReactDOM from "react-dom";
import { ItemData, getHighlightedText } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

interface SearchResultItemProps {
    data: ItemData;
    libraryContainer: LibraryContainer;
    highlightedText: string;
    pathToItem: ItemData[];
    onResultItemClicked: Function;
}

interface SearchResultItemStates { }

export class SearchResultItem extends React.Component<SearchResultItemProps, SearchResultItemStates> {

    constructor(props: SearchResultItemProps) {
        super(props);
    }

    render() {
        let iconPath = this.props.data.iconUrl;
        let categoryText = this.props.pathToItem.find(item => item.itemType === "category").text;
        let highLightedItemText = getHighlightedText(this.props.data.text, this.props.highlightedText, true);
        let highLightedCategoryText = getHighlightedText(categoryText, this.props.highlightedText, false);
        let ItemTypeIconPath = "src/resources/icons/library-" + this.props.data.itemType + ".svg";

        return (
            <div className={"SearchResultItemContainer"} onClick={this.onItemClicked.bind(this)}
                onMouseOver={this.onLibraryItemMouseEnter.bind(this)} onMouseLeave={this.onLibraryItemMouseLeave.bind(this)}>
                <img className={"ItemIcon"} src={iconPath} onError={this.onImageLoadFail.bind(this)} />
                <div className={"ItemInfo"}>
                    <div className={"ItemTitle"}>{highLightedItemText}</div>
                    <div className={"ItemDetails"}>
                        <img className={"ItemTypeIcon"} src={ItemTypeIconPath} onError={this.onImageLoadFail.bind(this)} />
                        <div className={"ItemCategory"} onClick={this.onTextClicked.bind(this)}>
                            {highLightedCategoryText}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/Dynamo.svg");
    }

    onTextClicked(event: any) {
        event.stopPropagation();
        this.props.onResultItemClicked(this.props.pathToItem);
    }

    onItemClicked() {
        this.props.libraryContainer.raiseEvent("itemClicked", this.props.data.contextData);
    };

    onLibraryItemMouseLeave() {
        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            libraryContainer.raiseEvent(libraryContainer.props.libraryController.ItemMouseLeaveEventName,
                { data: this.props.data.contextData });
        }
    }

    onLibraryItemMouseEnter() {
        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            var rec = ReactDOM.findDOMNode(this).getBoundingClientRect();
            libraryContainer.raiseEvent(libraryContainer.props.libraryController.ItemMouseEnterEventName,
                { data: this.props.data.contextData, rect: rec });
        }
    }
}