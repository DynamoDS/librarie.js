import * as React from "react";
import { ItemData, getHighlightedText } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";
import { ToolTip } from "./ToolTip";

interface SearchResultItemProps {
    data: ItemData;
    libraryContainer: LibraryContainer;
    category: string;
    highlightedText: string;
    detailed: boolean;
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
        let parameters = this.props.data.parameters;
        let highLightedItemText = getHighlightedText(this.props.data.text, this.props.highlightedText, true);
        let highLightedCategoryText = getHighlightedText(this.props.category, this.props.highlightedText, false);
        let itemTypeIconPath = "src/resources/icons/library-" + this.props.data.itemType + ".svg";
        let itemDescription: JSX.Element = null;
        let toolTip: JSX.Element = null;
        let expandIcon = (
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

        if (this.props.detailed || this.state.toolTipExpanded) {
            let description = "No description available";
            if (this.props.data.description && this.props.data.description.length > 0) {
                description = this.props.data.description;
            }

            itemDescription = <div className={"ItemDescription"}>{description}</div>;
        }

        return (
            <div className={"SearchResultItemContainer"} onClick={this.onItemClicked.bind(this)}>
                <img className={"ItemIcon"} src={iconPath} onError={this.onImageLoadFail.bind(this)} />
                <div className={"ItemInfo"}>
                    <div className={"ItemTitle"}>{highLightedItemText}
                        <div className={"LibraryItemParameters"}>{parameters}</div>
                        {expandIcon}
                    </div>
                    {itemDescription}
                    <div className={"ItemDetails"}>
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

    onItemClicked() {
        this.props.libraryContainer.raiseEvent("itemClicked", this.props.data.contextData);
    };

    onExpandIconClicked(event: any) {
        event.stopPropagation();
        this.setState({ toolTipExpanded: !this.state.toolTipExpanded });
    }
}