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
import { LibraryView } from "../LibraryView";
import { ItemData } from "../LibraryUtilities";

export interface LibraryItemProps {
    libraryView: LibraryView,
    data: ItemData
}

export interface LibraryItemState {
    expanded: boolean
}

class GroupedItems {

    creations: ItemData[] = [];
    actions: ItemData[] = [];
    queries: ItemData[] = [];
    others: ItemData[] = [];

    constructor(items: ItemData[]) {

        for (let i = 0; i < items.length; i++) {

            switch (items[i].itemType) {
                case "creation": this.creations.push(items[i]); break;
                case "action": this.actions.push(items[i]); break;
                case "query": this.queries.push(items[i]); break;
                default: this.others.push(items[i]); break;
            }
        }
    }

    getCreationItems(): ItemData[] { return this.creations; }
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

        if (this.props.data.itemType != "group") { // Group displays only text without icon.
            libraryItemTextStyle = "LibraryItemText";
            iconElement = (<img className={"LibraryItemIcon"} src={this.props.data.iconUrl} />);
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

        return (
            <div className={this.getLibraryItemContainerStyle()}>
                <div className={"LibraryItemHeader"} onClick={this.onLibraryItemClicked.bind(this)} >
                    {iconElement}
                    <div className={libraryItemTextStyle}>{this.props.data.text}</div>
                </div>
                {clusteredElements}
                {nestedElements}
            </div>
        );
    }

    getLibraryItemContainerStyle(): string {

        switch (this.props.data.itemType) {
            case "category":
                return "LibraryItemContainerCategory";

            case "group":
                return "LibraryItemContainerGroup";

            case "none":
            case "creation":
            case "action":
            case "query":
                return "LibraryItemContainerNone";
        }

        return "LibraryItemContainerNone";
    }

    getNestedElements(groupedItems: GroupedItems): any {

        let regularItems = groupedItems.getOtherItems();
        if (regularItems.length <= 0) {
            return null; // No item to be generated.
        }

        let index = 0;
        return (
            <div className={"LibraryItemBody"}>
                {
                    // 'getNestedElements' method is meant to render all other 
                    // types of items except ones of type creation/action/query.
                    // 
                    regularItems.map((item: ItemData) => {
                        return (<LibraryItem key={index++} libraryView={this.props.libraryView} data={item} />);
                    })
                }
            </div>
        );
    }

    getClusteredElements(groupedItems: GroupedItems): any {

        let creationMethods = groupedItems.getCreationItems();
        let actionMethods = groupedItems.getActionItems();
        let queryMethods = groupedItems.getQueryItems();

        let creationCluster = null;
        if (creationMethods.length > 0 && creationMethods.some(item => item.visible)) {
            creationCluster = (<ClusterView
                libraryView={this.props.libraryView}
                iconPath="src/resources/icons/library-creation.svg"
                borderColor="#62895b" /* green */
                childItems={creationMethods} />);
        }

        let actionCluster = null;
        if (actionMethods.length > 0 && actionMethods.some(item => item.visible)) {
            actionCluster = (<ClusterView
                libraryView={this.props.libraryView}
                iconPath="src/resources/icons/library-action.svg"
                borderColor="#ad5446" /* red */
                childItems={actionMethods} />);
        }

        let queryCluster = null;
        if (queryMethods.length > 0 && queryMethods.some(item => item.visible)) {
            queryCluster = (<ClusterView
                libraryView={this.props.libraryView}
                iconPath="src/resources/icons/library-query.svg"
                borderColor="#4b9dbf" /* blue */
                childItems={queryMethods} />);
        }

        if ((!creationCluster) && (!actionCluster) && (!queryCluster)) {
            return null; // No cluster should be generated.
        }

        return (
            <div className={"LibraryItemBody"}>
                {creationCluster}
                {actionCluster}
                {queryCluster}
            </div>
        );
    }

    onLibraryItemClicked() {

        // Toggle expansion state.
        let currentlyExpanded = this.state.expanded;
        this.setState({ expanded: !currentlyExpanded });

        let libraryView = this.props.libraryView;
        libraryView.raiseEvent("itemClicked", this.props.data.contextData);
    }
}
