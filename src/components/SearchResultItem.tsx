import * as React from "react";
import { ItemData, getHighlightedText } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

interface SearchResultItemProps {
    data: ItemData;
    libraryContainer: LibraryContainer;
    category: string;
    highlightedText: string;
}

interface SearchResultItemStates { }

export class SearchResultItem extends React.Component<SearchResultItemProps, SearchResultItemStates> {

    constructor(props: SearchResultItemProps) {
        super(props);
    }

    render() {
        let iconPath = this.props.data.iconUrl;
        let highLightedItemText = getHighlightedText(this.props.data.text, this.props.highlightedText, true);
        let highLightedCategoryText = getHighlightedText(this.props.category, this.props.highlightedText, false);
        let ItemTypeIconPath = "src/resources/icons/library-" + this.props.data.itemType + ".svg";

        return (
            <div className={"SearchResultItemContainer"} onClick={this.onItemClicked.bind(this)}>
                <img className={"ItemIcon"} src={iconPath} onError={this.onImageLoadFail.bind(this)} />
                <div className={"ItemInfo"}>
                    <div className={"ItemTitle"}>{highLightedItemText}</div>
                    <div className={"ItemDetails"}>
                        <img className={"ItemTypeIcon"} src={ItemTypeIconPath} onError={this.onImageLoadFail.bind(this)} />
                        <div className={"ItemCategory"}>{highLightedCategoryText}</div>
                    </div>
                </div>
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/ui/dynamo.png");
    }

    onItemClicked() {
        this.props.libraryContainer.raiseEvent("itemClicked", this.props.data.contextData);
    };
}