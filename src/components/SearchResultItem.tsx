/// <reference path="../../node_modules/@types/node/index.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";
import { LibraryContainer } from "./LibraryContainer";
import * as LibraryUtilities from "../LibraryUtilities";

type ParentTextClickedFunc = (pathToItem: LibraryUtilities.ItemData[]) => void;

interface SearchResultItemProps {
    index: number,
    data: LibraryUtilities.ItemData,
    libraryContainer: LibraryContainer,
    highlightedText: string;
    detailed: boolean;
    onParentTextClicked: ParentTextClickedFunc,
}

interface SearchResultItemStates {
    selected: boolean,
    itemSummaryExpanded: boolean
}

export class SearchResultItem extends React.Component<SearchResultItemProps, SearchResultItemStates> {

    constructor(props: SearchResultItemProps) {
        super(props);
        this.state = {
            selected: this.props.index == this.props.libraryContainer.selectionIndex,
            itemSummaryExpanded: false
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }

    UNSAFE_componentWillMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    // Update selection state and scroll current item into view if the selected item is not in view yet.
    componentDidUpdate() {
        if (this.state.selected) {
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
        if(event.key !== "Enter") return;
        // Allow node creation by pressing enter key
        if (this.state.selected) {
            this.onItemClicked();
        }
    }
    setSelected(selected: boolean) {
        this.setState({ selected: selected });
    }

    render() {
        let ItemContainerStyle = this.state.selected ? "SearchResultItemContainerSelected" : "SearchResultItemContainer";
        let iconPath = this.props.data.iconUrl;

		// Render the element only if the search element is a not a library section.
		// In the case where the search element is a library section, the pathToItem list may not have any child elements and should not displayed in search results.
        if(this.props.data.itemType !== "section" && this.props.data.pathToItem.length - 2 > 0)
		{
			// The parent of a search result item is the second last entry in 'pathToItem'
			let parentText = this.props.data.pathToItem[this.props.data.pathToItem.length - 2].text;
			
			// Category of the item is the item with type category in the array pathToItem
			let categoryText = this.props.data.pathToItem.find(item => item.itemType === "category")?.text ?? "";
			let parameters = this.props.data.parameters;
			let highLightedItemText = LibraryUtilities.getHighlightedText(this.props.data.text, this.props.highlightedText, true);
			let highLightedParentText = LibraryUtilities.getHighlightedText(parentText, this.props.highlightedText, false);
			let highLightedCategoryText = LibraryUtilities.getHighlightedText(categoryText, this.props.highlightedText, false);
			let itemTypeIconPath = require(`../resources/icons/library-${this.props.data.itemType}.svg`)
			let itemDescription: JSX.Element | null = null;
				
			if (this.props.detailed) {
					let description = "No description available";
					if (this.props.data.description && this.props.data.description.length > 0) {
						description = this.props.data.description;
					}

					itemDescription = <div className={"ItemDescription"}>{description}</div>;
				}

			return (
				<div className={ItemContainerStyle} 
                    onClick={this.onItemClicked.bind(this)}
                    onKeyDown={this.onItemClicked.bind(this)}
					onMouseEnter={this.onLibraryItemMouseEnter.bind(this)}
                    onMouseLeave={this.onLibraryItemMouseLeave.bind(this)}
                >
					<img className={"ItemIcon"} src={iconPath} onError={this.onImageLoadFail.bind(this)} />
					<div className={"ItemInfo"}>
						<div className={"ItemTitle"}>{highLightedItemText}
							<div className={"LibraryItemParameters"}>{parameters}</div>
						</div>
						{itemDescription}
						<div className={"ItemDetails"}>
							<div className={"ItemParent"} 
                                onClick={this.onParentTextClicked.bind(this)}
                                onKeyDown={this.onParentTextClicked.bind(this)}
                            >
								{highLightedParentText}
							</div>
							<img className={"ItemTypeIcon"} src={itemTypeIconPath} onError={this.onImageLoadFail.bind(this)} />
							<div className={"ItemCategory"}>{highLightedCategoryText}</div>
						</div>
					</div>
				</div>
			);	
		}
		else
		{
			return (
				<div></div>
			);
		}
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/default-icon.svg");
    }

    onParentTextClicked(event: any) {
        event.stopPropagation();
        this.onLibraryItemMouseLeave(); // Floating toolTip should be dismissed when clicking on parent text
        this.props.onParentTextClicked(this.props.data.pathToItem);
    }

    onItemClicked() {
        // Update selection index when an item is clicked
        this.props.libraryContainer.setSelection(this.props.index);
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
            libraryContainer.raiseEvent(mouseEnterEvent, { data: this.props.data.contextData, rect: rec, element: ReactDOM.findDOMNode(this) });
        }
    }
}