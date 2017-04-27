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
import { ClusterView } from "./ClusterView";
import { LibraryContainer } from "./LibraryContainer";
import { ItemData } from "../LibraryUtilities";

export interface LibraryItemProps {
    libraryContainer: LibraryContainer,
    data: ItemData
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
    }

    getCreateItems(): ItemData[] { return this.creates; }
    getActionItems(): ItemData[] { return this.actions; }
    getQueryItems(): ItemData[] { return this.queries; }
    getOtherItems(): ItemData[] { return this.others; }
}

export class LibraryItem extends React.Component<LibraryItemProps, LibraryItemState> {

    constructor(props: LibraryItemProps) {
        super(props);

        // Assign initial state
        this.state = {
            expanded: this.props.data.expanded
        };
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

        let iconElement = null;
        let libraryItemTextStyle = "LibraryItemGroupText";

        // Group displays only text without icon.
        if (this.props.data.itemType !== "group") {
            libraryItemTextStyle = "LibraryItemText";
            iconElement = (<img className={"LibraryItemIcon"} src={this.props.data.iconUrl} onError={this.onImageLoadFail} />);
        }

        let nestedElements = null;
        let clusteredElements = null;

        // visible only nested elements when expanded.
        if (this.state.expanded && this.props.data.childItems.length > 0) {

            // Break item list down into sub-lists based on the type of each item.
            let groupedItems = new GroupedItems(this.props.data.childItems);

            // There are some leaf nodes (e.g. methods).
            clusteredElements = this.getClusteredElements(groupedItems);

            // There are intermediate child items.
            nestedElements = this.getNestedElements(groupedItems);
        }


        let arrow = null;
        let bodyIndentation = null;

        // Indentation and arrow are only added for non-category items
        if (this.props.data.itemType !== "category") {

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

        return (
            <div className={this.getLibraryItemContainerStyle()}>
                <div className={"LibraryItemHeader"} onClick={this.onLibraryItemClicked.bind(this)} 
                        onMouseOver={this.onLibraryItemHoveredOn.bind(this)} onMouseLeave={this.onLibraryItemMouseLeave.bind(this)}>
                    {arrow}
                    {iconElement}
                    <div className={libraryItemTextStyle}>{this.props.data.text}</div>
                </div>
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
        event.target.style.visibility = "hidden";
    }

    getLibraryItemContainerStyle(): string {
        switch (this.props.data.itemType) {
            case "category":
                return "LibraryItemContainerCategory";

            case "group":
                return "LibraryItemContainerGroup";

            case "none":
            case "create":
            case "action":
            case "query":
                return "LibraryItemContainerNone";
        }

        return "LibraryItemContainerNone";
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
                    // 
                    regularItems.map((item: ItemData) => {
                        return (<LibraryItem key={index++} libraryContainer={this.props.libraryContainer} data={item} />);
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
        this.setState({ expanded: !currentlyExpanded });

        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            libraryContainer.raiseEvent(libraryContainer.props.libraryController.ItemClickedEventName, 
                this.props.data.contextData);
        }
    }

    onLibraryItemHoveredOn() {
        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            libraryContainer.raiseEvent(libraryContainer.props.libraryController.ItemHoveredOnEventName,
                this.props.data.contextData);
        }
    }

    onLibraryItemMouseLeave() {
        let libraryContainer = this.props.libraryContainer;
        if (this.props.data.childItems.length == 0) {
            libraryContainer.raiseEvent(libraryContainer.props.libraryController.ItemMouseLeaveEventName, true);
        }
    }
}
