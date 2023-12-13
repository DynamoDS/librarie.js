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
import * as LibraryUtilities from "../LibraryUtilities";

export interface LibraryItemProps {
    libraryContainer: any,
    data: LibraryUtilities.ItemData,
    showItemSummary: boolean,
    onItemWillExpand?: Function,
    tooltipContent?: any
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

        for (const element of items) {

            switch (element.itemType) {
                case "create": this.creates.push(element); break;
                case "action": this.actions.push(element); break;
                case "query": this.queries.push(element); break;
                default: this.others.push(element); break;
            }

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
    UNSAFE_componentWillReceiveProps(nextProps: LibraryItemProps) {
        if (nextProps.data.expanded !== this.state.expanded) {
            this.setState({ expanded: nextProps.data.expanded });
        }
        //keep the core group defined in layoutspec always expanded.
        //Commented as part of the task : https://jira.autodesk.com/browse/QNTM-2975
        // if(nextProps.data.itemType == "coregroup") {
        //     this.setState({expanded:true});
        // }
    }

    render() {
        if (!this.props.data.visible) {
            return null;
        }

        let nestedElements: React.ReactNode = null;
        let clusteredElements: React.ReactNode = null;
        let bodyIndentation: React.ReactNode = null;
        let header = this.getHeaderElement();

        // visible only nested elements when expanded.
        if (this.state.expanded && this.props.data.childItems.length > 0) {

            // Break item list down into sub-lists based on the type of each item.
            let groupedItems = new GroupedItems(LibraryUtilities.sortItemsByText(this.props.data.childItems));

            // There are some leaf nodes (e.g. methods).
            clusteredElements = this.getClusteredElements(groupedItems);

            // There are intermediate child items.
            nestedElements = this.getNestedElements(groupedItems);
        }

        // Indent one level for clustered and nested elements
        if (this.props.data.itemType !== "section" && (nestedElements || clusteredElements)) {
            bodyIndentation = <div className={"BodyIndentation"} />;
        }

        return (
            <div className={this.getLibraryItemContainerStyle(this.state.expanded)}>
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
        event.target.orgSrc = event.target.src;
        event.target.src = require("../resources/icons/default-icon.svg");
    }

    getIconElement(): React.ReactNode {
        // Category type don't display any icon
        if(this.props.data.itemType === "category"){
            return null;
        }

        // If the element type is a section, group, coregroup, class or none an icon shouldn't be displayed
        if (this.props.data.itemType !== "group" && 
        this.props.data.itemType !== "section" && 
        this.props.data.itemType !== "coregroup" &&
        this.props.data.itemType !== "classType" &&
        this.props.data.itemType !== "none") {
            return <img
                className={"LibraryItemIcon"}
                src={this.props.data.iconUrl}
                onError={this.onImageLoadFail}
            />;
        }

         // If it is a section, display the icon (if given) and provide a click interaction.
         //Add-ons have a different style. The icons opacity changes when hovering
        if (this.props.data.itemType === "section" && this.props.data.text == "Add-ons" &&
            this.props.data.iconUrl) {
            return <img
                className={"LibraryAddOnSectionIcon"}
                src={this.props.data.iconUrl}
                onError={this.onImageLoadFail}
                onClick={this.onSectionIconClicked}
                onKeyDown={this.onSectionIconClicked}
            />;
        }

        // If it is a section, display the icon (if given) and provide a click interaction.
        if (this.props.data.itemType === "section" && this.props.data.iconUrl) {
            return <img
                className={"LibraryItemIcon"}
                src={this.props.data.iconUrl}
                onError={this.onImageLoadFail}
                onClick={this.onSectionIconClicked}
                onKeyDown={this.onSectionIconClicked}
            />;
        }

        return null;
    }

    // Show arrow for non-section, non-category and non-leaf items
    getArrowElement(): React.ReactNode {
        //no arrow for groups defined in layout spec
        if (this.props.data.itemType === "section" || this.props.data.itemType === "coregroup" ) { 
            return null;
        }

        if (this.props.data.childItems.length == 0) {
            return null;
        };

        let arrowIcon: any = null;

        if (!this.state.expanded) {
            arrowIcon = require("../resources/ui/indent-arrow-right.svg");
        } else {
            arrowIcon = require("../resources/ui/indent-arrow-down.svg");
        }

        if (this.props.data.itemType == "category") {
            if (!this.state.expanded) {
                arrowIcon = require("../resources/ui/indent-arrow-category-right.svg");
            }
            else {
                arrowIcon = require("../resources/ui/indent-arrow-category-down.svg");
            }

            return <img className={"CategoryArrow"} src={arrowIcon} onError={this.onImageLoadFail} />;

        }

        return <img className={`Arrow`} src={arrowIcon} onError={this.onImageLoadFail} />;
    }

    getHeaderElement(): React.ReactNode {
        let arrow = this.getArrowElement();
        let iconElement = this.getIconElement();
        let parameters: React.ReactNode = null;

        if (this.props.data.parameters && this.props.data.parameters.length > 0 && this.props.data.childItems.length == 0) {
            parameters = <div className="LibraryItemParameters">{this.props.data.parameters}</div>;
        }

        if (this.props.data.showHeader) {
            return (
                <div className={this.getLibraryItemHeaderStyle()} 
                    onClick={this.onLibraryItemClicked}
                    onKeyDown={this.onLibraryItemClicked}
                    onMouseEnter={this.onLibraryItemMouseEnter} onMouseLeave={this.onLibraryItemMouseLeave}>
                    {arrow}
                    {this.props.data.itemType === "section" ? null : iconElement}
                    <div className={this.getLibraryItemTextStyle()}>{this.props.data.text}</div>
                    {parameters}
                    {this.props.data.itemType === "section" ? iconElement : null}
                </div>
            );
        }

        return null;
    }

    getLibraryItemContainerStyle(isExpanded : boolean): string {
        let style : string = "";
        switch (this.props.data.itemType) {
            case "section":
                style = "LibraryItemContainerSection";
                break;
            case "category":
                style = "LibraryItemContainerCategory";
                break;
            case "group":
            case "coregroup":
                style = "LibraryItemContainerGroup";
                break;
            default:
                style = "LibraryItemContainerNone";
                break;
        }

        if(isExpanded)
            style += " expanded";

        return style;
    }

    getLibraryItemHeaderStyle(): string {
        if (this.props.data.itemType === "section") {
            return "LibrarySectionHeader";
        } else {
            return "LibraryItemHeader";
        }
    }

    getLibraryItemTextStyle(): string {
        switch (this.props.data.itemType) {
            case "group":
            case "coregroup":
            case "section":
                return "LibraryItemGroupText";
            default:
                return "LibraryItemText";
        }
    }

    getNestedElements(groupedItems: GroupedItems): React.ReactNode {

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
                    regularItems.map((item, i) => {
                        return (<LibraryItem
                            key={index++}
                            libraryContainer={this.props.libraryContainer}
                            data={item}
                            showItemSummary={this.props.showItemSummary}
                            onItemWillExpand={(args: any) => {
                                this.onSingleChildItemWillExpand();
                                this.props.libraryContainer.scrollToExpandedItem(args)
                            }}
                            tooltipContent={this.props.tooltipContent}
                        />);
                    })
                }
            </div>
        );
    }

    getClusteredElements(groupedItems: GroupedItems): React.ReactNode {

        const createMethods = groupedItems.getCreateItems();
        const actionMethods = groupedItems.getActionItems();
        const queryMethods = groupedItems.getQueryItems();

        let createCluster: React.ReactNode = null;

        if (createMethods.length > 0 && createMethods.some(item => item.visible)) {
            createCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-create.svg")}
                clusterType="create"
                showItemSummary={this.props.showItemSummary}
                childItems={createMethods} 
                tooltipContent={this.props?.tooltipContent["create"]}
                />);
        }

        let actionCluster: React.ReactNode = null;
        if (actionMethods.length > 0 && actionMethods.some(item => item.visible)) {
            actionCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-action.svg")}
                clusterType="action"
                showItemSummary={this.props.showItemSummary}
                childItems={actionMethods} 
                tooltipContent={this.props?.tooltipContent["action"]}
                />);
        }

        let queryCluster: React.ReactNode = null;
        if (queryMethods.length > 0 && queryMethods.some(item => item.visible)) {
            queryCluster = (<ClusterView
                libraryContainer={this.props.libraryContainer}
                icon={require("../resources/icons/library-query.svg")}
                clusterType="query"
                showItemSummary={this.props.showItemSummary}
                childItems={queryMethods} 
                tooltipContent={this.props?.tooltipContent["query"]}
                />);
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
        //https://jira.autodesk.com/browse/QNTM-2975
        //Add-ons section is always expanded.
        if(this.props.data.text == "Add-ons") return;
        // Toggle expansion state.
        let currentlyExpanded = this.state.expanded;

        if (this.props.data.childItems.length > 0 && !currentlyExpanded && this.props.onItemWillExpand) {
            this.props.onItemWillExpand(ReactDOM.findDOMNode(this));
        }

        this.setState({ expanded: !currentlyExpanded });

        //auto expand the coregroup elements
        //commenting as part of the task : https://jira.autodesk.com/browse/QNTM-2975
        // if(this.props.data.itemType === "category" ) {
        //     this.props.data.childItems.forEach((item: any) => {
        //         if(item.itemType == "coregroup"){
        //             item.expanded = true;
        //         }
        //     });
        // }

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
            libraryContainer.raiseEvent(mouseEnterEvent, { data: this.props.data.contextData, rect: rec, element:  ReactDOM.findDOMNode(this) });
        }
    }
}
