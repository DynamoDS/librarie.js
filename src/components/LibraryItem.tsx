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
import { ClusterView } from "./ClusterView";
import { LibraryContainer } from "./LibraryContainer";
import { ItemData, sortItemsByText } from "../LibraryUtilities";

export interface LibraryItemProps {
    libraryContainer: any,
    data: ItemData,
    onItemWillExpand?: Function
}

export interface LibraryItemState {
    expanded: boolean
}

class GroupedItems {

    creates: ItemData[] = [];
    actions: ItemData[] = [];
    queries: ItemData[] = [];
    others: ItemData[] = [];

    constructor(items: ItemData[]) {

        for (let i = 0; i < items.length; i++) {

            switch (items[i].itemType) {
                case "create": this.creates.push(items[i]); break;
                case "action": this.actions.push(items[i]); break;
                case "query": this.queries.push(items[i]); break;
                default: this.others.push(items[i]); break;
            }
        }

        this.creates = sortItemsByText(this.creates);
        this.actions = sortItemsByText(this.actions);
        this.queries = sortItemsByText(this.queries);
        this.others = sortItemsByText(this.others);
    }

    getCreateItems(): ItemData[] { return this.creates; }
    getActionItems(): ItemData[] { return this.actions; }
    getQueryItems(): ItemData[] { return this.queries; }
    getOtherItems(): ItemData[] { return this.others; }
}

export class LibraryItem extends React.Component<LibraryItemProps, LibraryItemState> {

    constructor(props: LibraryItemProps) {
        super(props);

        // All items are collapsed by default, except for section items
        this.state = {
            expanded: this.props.data.expanded
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
            let groupedItems = new GroupedItems(sortItemsByText(this.props.data.childItems));

            // There are some leaf nodes (e.g. methods).
            clusteredElements = this.getClusteredElements(groupedItems);

            // There are intermediate child items.
            nestedElements = this.getNestedElements(groupedItems);
        }

        let arrow: JSX.Element = null;
        let bodyIndentation: JSX.Element = null;
        let header: JSX.Element = null;
        let parameters: JSX.Element = null;

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

        if (this.props.data.parameters && (this.props.data.parameters.length > 0)) {
            parameters = <div className="LibraryItemParameters">{this.props.data.parameters}</div>;
        }

        if (this.props.data.showHeader) {
            header = (
                <div className={this.getLibraryItemHeaderStyle()} onClick={this.onLibraryItemClicked}
                    onMouseOver={this.onLibraryItemMouseEnter} onMouseLeave={this.onLibraryItemMouseLeave}>
                    {arrow}
                    {this.props.data.itemType === "section" ? null : iconElement}
                    <div className={libraryItemTextStyle}>{this.props.data.text}</div>
                    {parameters}
                    {this.props.data.itemType === "section" ? iconElement : null}
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
        event.target.src = require("../resources/icons/Dynamo.svg");
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
                    regularItems.map((item: ItemData) => {
                        return (<LibraryItem
                            key={index++}
                            libraryContainer={this.props.libraryContainer}
                            data={item}
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
                childItems={createMethods} />);
        }

        let actionCluster = null;
        if (actionMethods.length > 0 && actionMethods.some(item => item.visible)) {
            actionCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-action.svg")}
                borderColor="#ad5446" /* red */
                childItems={actionMethods} />);
        }

        let queryCluster = null;
        if (queryMethods.length > 0 && queryMethods.some(item => item.visible)) {
            queryCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-query.svg")}
                borderColor="#4b9dbf" /* blue */
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
