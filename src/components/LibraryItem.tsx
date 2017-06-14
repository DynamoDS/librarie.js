/*
      LibraryItemContainerXxx(Category/Group/None)
    +---------------------------------------------------+
    |   LibraryItemHeader                               |
    | +-----------------------------------------------+ |
    | | +-----------------+ +-----------------------+ | |
    | | | LibraryItemIcon | | LibraryItemText       | | |
    | | +-----------------+ +-----------------------+ | |
    | +-----------------------------------------------+ |
    |   LibraryItemBody                                 |
    | +-----------------------------------------------+ |
    | |                                               | |
    | |                                               | |
    | +-----------------------------------------------+ |
    +---------------------------------------------------+

*/

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as LibraryUtilities from "../LibraryUtilities";
import { ClusterView } from "./ClusterView";
import { LibraryContainer } from "./LibraryContainer";
import { ItemSummary } from "./ItemSummary";

export interface LibraryItemProps {
    libraryContainer: any,
    data: LibraryUtilities.ItemData,
    showItemSummary: boolean,
    onItemWillExpand?: Function
}

export interface LibraryItemState {
    itemSummaryExpanded: boolean,
    expanded: boolean
}

class GroupedItems {

    creates: LibraryUtilities.ItemData[] = [];
    actions: LibraryUtilities.ItemData[] = [];
    queries: LibraryUtilities.ItemData[] = [];
    others: LibraryUtilities.ItemData[] = [];

    constructor(items: LibraryUtilities.ItemData[]) {

        for (let i = 0; i < items.length; i++) {

            switch (items[i].itemType) {
                case "create": this.creates.push(items[i]); break;
                case "action": this.actions.push(items[i]); break;
                case "query": this.queries.push(items[i]); break;
                default: this.others.push(items[i]); break;
            }

            var finalData = {
                "inputParameters": [
                    {
                        "name": "c1",
                        "type": "Color"
                    },
                    {
                        "name": "c2",
                        "type": "Color"
                    }
                ],
                "outputParameters": [
                    "Color"
                ],
                "description": "Construct a Color by combining two input Colors."
            };
        }

        this.creates = LibraryUtilities.sortItemsByText(this.creates);
        this.actions = LibraryUtilities.sortItemsByText(this.actions);
        this.queries = LibraryUtilities.sortItemsByText(this.queries);
        this.others = LibraryUtilities.sortItemsByText(this.others);
    }

    getCreateItems(): LibraryUtilities.ItemData[] { return this.creates; }
    getActionItems(): LibraryUtilities.ItemData[] { return this.actions; }
    getQueryItems(): LibraryUtilities.ItemData[] { return this.queries; }
    getOtherItems(): LibraryUtilities.ItemData[] { return this.others; }
}

export class LibraryItem extends React.Component<LibraryItemProps, LibraryItemState> {

    constructor(props: LibraryItemProps) {
        super(props);

        // All items are collapsed by default, except for section items
        this.state = {
            expanded: this.props.data.expanded,
            itemSummaryExpanded: false
        };

        this.onLibraryItemClicked = this.onLibraryItemClicked.bind(this);
        this.onLibraryItemMouseEnter = this.onLibraryItemMouseEnter.bind(this);
        this.onLibraryItemMouseLeave = this.onLibraryItemMouseLeave.bind(this);
        this.onSectionIconClicked = this.onSectionIconClicked.bind(this);
        this.onSingleChildItemWillExpand = this.onSingleChildItemWillExpand.bind(this);
    }

    // By default all items in search view will be expanded. In search view, 
    // user is still able to expand/unexpand the item, which will toggle the 
    // expansion state. This will make sure that the expansion state of an item
    // in search view will not be affected by the previous user click.
    componentWillReceiveProps(nextProps: LibraryItemProps) {
        if (nextProps.data.expanded !== this.state.expanded) {
            this.setState({ expanded: nextProps.data.expanded });
        }
    }

    render() {
        if (!this.props.data.visible) {
            return null;
        }

        let iconElement: JSX.Element = null;
        let libraryItemTextStyle = "LibraryItemGroupText";

        // Group displays only text without icon.
        if (this.props.data.itemType !== "group" && this.props.data.itemType !== "section") {
            libraryItemTextStyle = "LibraryItemText";
            iconElement = <img
                className={"LibraryItemIcon"}
                src={this.props.data.iconUrl}
                onError={this.onImageLoadFail}
            />;
        }

        // If it is a section, display the icon (if given) and provide a click interaction.
        if (this.props.data.itemType === "section" && this.props.data.iconUrl) {
            iconElement = <img
                className={"LibraryItemIcon"}
                src={this.props.data.iconUrl}
                onError={this.onImageLoadFail}
                onClick={this.onSectionIconClicked}
            />;
        }

        let nestedElements: JSX.Element = null;
        let clusteredElements: JSX.Element = null;

        // visible only nested elements when expanded.
        if (this.state.expanded && this.props.data.childItems.length > 0) {

            // Break item list down into sub-lists based on the type of each item.
            let groupedItems = new GroupedItems(LibraryUtilities.sortItemsByText(this.props.data.childItems));

            // There are some leaf nodes (e.g. methods).
            clusteredElements = this.getClusteredElements(groupedItems);

            // There are intermediate child items.
            nestedElements = this.getNestedElements(groupedItems);
        }

        let arrow: JSX.Element = null;
        let bodyIndentation: JSX.Element = null;
        let header: JSX.Element = null;
        let parameters: JSX.Element = null;
        let expandIcon: JSX.Element = null;
        let itemSummary: JSX.Element = null;

        // Indentation and arrow are only added for non-category and non-section items
        if (this.props.data.itemType !== "category" && this.props.data.itemType !== "section") {

            // Indent one level for clustered and nested elements
            if (clusteredElements || nestedElements) {
                bodyIndentation = (<div className={"BodyIndentation"} />);
            }

            // Show arrow for non-leaf items
            if (this.props.data.childItems.length > 0) {
                let arrowIcon = this.state.expanded ? require("../resources/ui/indent-arrow-down.svg") : require("../resources/ui/indent-arrow-right.svg");
                arrow = <img className={"Arrow"} src={arrowIcon} onError={this.onImageLoadFail} />;
            }
        }

        // Show itemSummary only if this is a leaf item and showItemSummary is set to true
        if (this.props.showItemSummary && this.props.data.childItems.length == 0) {
            expandIcon = (
                <div className="ItemSummaryExpandIcon">
                    <i className="fa fa-ellipsis-h" aria-hidden="true" onClick={this.onExpandIconClicked.bind(this)} />
                </div>
            );

            if (this.state.itemSummaryExpanded) {
                itemSummary = <ItemSummary
                    libraryContainer={this.props.libraryContainer}
                    data={this.props.data}
                    showDescription={true}
                />;
            }
        }

        if (this.props.data.parameters && (this.props.data.parameters.length > 0)) {
            parameters = <div className="LibraryItemParameters">{this.props.data.parameters}</div>;
        }

        if (this.props.data.showHeader) {
            header = (
                <div className="LibraryHeaderContainer">
                    <div className={this.getLibraryItemHeaderStyle()}
                        onClick={this.onLibraryItemClicked}
                        onMouseOver={this.onLibraryItemMouseEnter}
                        onMouseLeave={this.onLibraryItemMouseLeave}>
                        {arrow}
                        {this.props.data.itemType === "section" ? null : iconElement}
                        <div className={libraryItemTextStyle}>{this.props.data.text}</div>
                        {parameters}
                        {this.props.data.itemType === "section" ? iconElement : null}
                        {expandIcon}
                    </div>
                    {itemSummary}
                </div>
            );
        }

        return (
            <div className={this.getLibraryItemContainerStyle()}>
                {header}
                <div className={"LibraryItemBodyContainer"}>
                    {bodyIndentation}
                    <div className={"LibraryItemBodyElements"}>
                        {clusteredElements}
                        {nestedElements}
                    </div>
                </div>
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/default-icon.svg");
    }

    getLibraryItemContainerStyle(): string {
        switch (this.props.data.itemType) {
            case "section":
                return "LibraryItemContainerSection";
            case "category":
                return "LibraryItemContainerCategory";
            case "group":
                return "LibraryItemContainerGroup";
            default:
                return "LibraryItemContainerNone";
        }
    }

    getLibraryItemHeaderStyle(): string {
        switch (this.props.data.itemType) {
            case "section":
                return "LibrarySectionHeader";
            default:
                return "LibraryItemHeader";
        }
    }

    getNestedElements(groupedItems: GroupedItems): JSX.Element {

        let regularItems = groupedItems.getOtherItems();
        if (regularItems.length <= 0) {
            return null; // No item to be generated.
        }

        let index = 0;
        return (
            <div className={"LibraryItemBody"}>
                {
                    // 'getNestedElements' method is meant to render all other 
                    // types of items except ones of type create/action/query.
                    regularItems.map((item: LibraryUtilities.ItemData) => {
                        return (<LibraryItem
                            key={index++}
                            libraryContainer={this.props.libraryContainer}
                            data={item}
                            showItemSummary={this.props.showItemSummary}
                            onItemWillExpand={this.onSingleChildItemWillExpand}
                        />);
                    })
                }
            </div>
        );
    }

    getClusteredElements(groupedItems: GroupedItems): JSX.Element {

        let createMethods = groupedItems.getCreateItems();
        let actionMethods = groupedItems.getActionItems();
        let queryMethods = groupedItems.getQueryItems();

        let createCluster = null;
        if (createMethods.length > 0 && createMethods.some(item => item.visible)) {
            createCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-create.svg")}
                borderColor="#62895b" /* green */
                showItemSummary={this.props.showItemSummary}
                childItems={createMethods} />);
        }

        let actionCluster = null;
        if (actionMethods.length > 0 && actionMethods.some(item => item.visible)) {
            actionCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-action.svg")}
                borderColor="#ad5446" /* red */
                showItemSummary={this.props.showItemSummary}
                childItems={actionMethods} />);
        }

        let queryCluster = null;
        if (queryMethods.length > 0 && queryMethods.some(item => item.visible)) {
            queryCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-query.svg")}
                borderColor="#4b9dbf" /* blue */
                showItemSummary={this.props.showItemSummary}
                childItems={queryMethods} />);
        }

        if ((!createCluster) && (!actionCluster) && (!queryCluster)) {
            return null; // No cluster should be generated.
        }

        return (
            <div className={"LibraryItemBody"}>
                {createCluster}
                {actionCluster}
                {queryCluster}
            </div>
        );
    }

    onExpandIconClicked(event: any) {
        event.stopPropagation();
        this.setState({ itemSummaryExpanded: !this.state.itemSummaryExpanded });
    }

    onLibraryItemClicked() {
        // Toggle expansion state.
        let currentlyExpanded = this.state.expanded;
        if (this.props.data.childItems.length > 0 && !currentlyExpanded && this.props.onItemWillExpand) {
            this.props.onItemWillExpand();
        }

        this.setState({ expanded: !currentlyExpanded });

        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            libraryContainer.raiseEvent(libraryContainer.props.libraryController.ItemClickedEventName,
                this.props.data.contextData);
        }
    }

    onSectionIconClicked(event: any) {
        let libraryContainer = this.props.libraryContainer;
        libraryContainer.raiseEvent(libraryContainer.props.libraryController.SectionIconClickedEventName, this.props.data.text);
        event.stopPropagation(); // Prevent the onClick event of its parent item from being called.
    }

    // Collapse all child items when one of the child items is expanded
    onSingleChildItemWillExpand() {
        for (let item of this.props.data.childItems) {
            item.expanded = false;
        }
        this.setState({ expanded: true }); // Make the current item (parent) expanded.
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
