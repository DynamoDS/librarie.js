import * as React from "react";
import * as ReactDOM from "react-dom";
import { LibraryContainer } from "./LibraryContainer";
import { ToolTip } from "./ToolTip";
import * as LibraryUtilities from "../LibraryUtilities";

interface ParentTextClickedFunc {
    (pathToItem: LibraryUtilities.ItemData[]): void;
}

interface SearchResultItemProps {
    libraryContainer: LibraryContainer;
    data: LibraryUtilities.ItemData;
    pathToItem: LibraryUtilities.ItemData[];
    onParentTextClicked: ParentTextClickedFunc;
    highlightedText: string;
    detailed: boolean;
    showExpandableToolTip: boolean;
}

interface SearchResultItemStates {
    toolTipExpanded: boolean;
}

export class SearchResultItem extends React.Component<SearchResultItemProps, SearchResultItemStates> {

    constructor(props: SearchResultItemProps) {
        super(props);
        this.state = ({ toolTipExpanded: false });
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
        let toolTip: JSX.Element = null;
        let expandIcon: JSX.Element = null;

        if (this.props.showExpandableToolTip) {
            expandIcon = (
                <div className="ToolTipExpandIcon">
                    <i className="fa fa-ellipsis-h" aria-hidden="true" onClick={this.onExpandIconClicked.bind(this)} />
                </div>
            );

            if (this.state.toolTipExpanded) {
                toolTip = <ToolTip
                    libraryContainer={this.props.libraryContainer}
                    data={this.props.data}
                    showDescription={false}
                    showIcon={false}
                />;
            }
        }

        if (this.props.detailed || this.state.toolTipExpanded) {
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
                    {toolTip}
                </div>
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/Dynamo.svg");
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
        this.setState({ toolTipExpanded: !this.state.toolTipExpanded });
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