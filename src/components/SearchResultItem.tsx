import * as React from "react";
import * as ReactDOM from "react-dom";
import * as LibraryUtilities from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";
import { ItemSummary } from "./ItemSummary";

interface ParentTextClickedFunc {
    (pathToItem: LibraryUtilities.ItemData[]): void;
}

interface SearchResultItemProps {
    data: LibraryUtilities.ItemData;
    libraryContainer: LibraryContainer;
    highlightedText: string;
    pathToItem: LibraryUtilities.ItemData[];
    onParentTextClicked: ParentTextClickedFunc;
    detailed: boolean;
    showItemSummary: boolean;
}

interface SearchResultItemStates {
    itemSummaryExpanded: boolean
}

export class SearchResultItem extends React.Component<SearchResultItemProps, SearchResultItemStates> {

    constructor(props: SearchResultItemProps) {
        super(props);
        this.state = ({ itemSummaryExpanded: false });
    }

    render() {
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
        let itemSummary: JSX.Element = null;
        let expandIcon: JSX.Element = null;

        if (this.props.showItemSummary) {
            expandIcon = (
                <div className="ItemSummaryExpandIcon">
                    <i className="fa fa-ellipsis-h" aria-hidden="true" onClick={this.onExpandIconClicked.bind(this)} />
                </div>
            );

            if (this.state.itemSummaryExpanded) {
                itemSummary = <ItemSummary
                    libraryContainer={this.props.libraryContainer}
                    data={this.props.data}
                    showDescription={false}
                />;
            }
        }

        if (this.props.detailed || this.state.itemSummaryExpanded) {
            let description = "No description available";
            if (this.props.data.description && this.props.data.description.length > 0) {
                description = this.props.data.description;
            }

            itemDescription = <div className={"ItemDescription"}>{description}</div>;
        }

        return (
            <div className={"SearchResultItemContainer"} onClick={this.onItemClicked.bind(this)}
                onMouseOver={this.onLibraryItemMouseEnter.bind(this)} onMouseLeave={this.onLibraryItemMouseLeave.bind(this)}>
                <img className={"ItemIcon"} src={iconPath} onError={this.onImageLoadFail.bind(this)} />
                <div className={"ItemInfo"}>
                    <div className={"ItemTitle"}>{highLightedItemText}
                        <div className={"LibraryItemParameters"}>{parameters}</div>
                        {expandIcon}
                    </div>
                    {itemDescription}
                    <div className={"ItemDetails"}>
                        <div className={"ItemParent"} onClick={this.onParentTextClicked.bind(this)}>
                            {highLightedParentText}
                        </div>
                        <img className={"ItemTypeIcon"} src={itemTypeIconPath} onError={this.onImageLoadFail.bind(this)} />
                        <div className={"ItemCategory"}>{highLightedCategoryText}</div>
                    </div>
                    {itemSummary}
                </div>
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/default-icon.svg");
    }

    onParentTextClicked(event: any) {
        event.stopPropagation();
        this.onLibraryItemMouseLeave(); // Floating toolTip should be dismissed when clicking on parent text
        this.props.onParentTextClicked(this.props.pathToItem);
    }

    onItemClicked() {
        this.props.libraryContainer.raiseEvent("itemClicked", this.props.data.contextData);
    };

    onExpandIconClicked(event: any) {
        event.stopPropagation();
        this.setState({ itemSummaryExpanded: !this.state.itemSummaryExpanded });
    }

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