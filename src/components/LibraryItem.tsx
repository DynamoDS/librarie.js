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
import * as LibraryUtilities from "../LibraryUtilities";

export interface LibraryItemProps {
    libraryContainer: any,
    data: LibraryUtilities.ItemData,
    showItemSummary: boolean,
    isLastItem?: boolean,
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

    //Afer rendering each Library item, scroll to the expanded item
    componentDidMount() {
        if (this.props.data.expanded) {
            //scroll to only that element clicked from search. Determining that element from 
            //other elements is little tricky. The idea here is, the element which has
            //its child elements expanded to false is the actual element clicked from search. Scroll
            //to that element.
            let isThereChildItemsToExpand = this.props.data.childItems.filter((item: any) => {
                return item.expanded == true;
            });
            if (isThereChildItemsToExpand.length == 0) {
                setTimeout(() => {
                    let elem = ReactDOM.findDOMNode(this);
                    elem.scrollIntoView();
                }, 0);
            }

        }
    }

    render() {
        if (!this.props.data.visible) {
            return null;
        }

        let nestedElements: JSX.Element = null;
        let clusteredElements: JSX.Element = null;
        let bodyIndentation: JSX.Element = null;
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

    getIconElement(): JSX.Element {
        // Group displays only text without icon.
        if (this.props.data.itemType !== "group" && this.props.data.itemType !== "section") {
            return <img
                className={"LibraryItemIcon"}
                src={this.props.data.iconUrl}
                onError={this.onImageLoadFail}
            />;
        }

        // If it is a section, display the icon (if given) and provide a click interaction.
        if (this.props.data.itemType === "section" && this.props.data.iconUrl) {
            return <img
                className={"LibraryItemIcon"}
                src={this.props.data.iconUrl}
                onError={this.onImageLoadFail}
                onClick={this.onSectionIconClicked}
            />;
        }

        return null;
    }

    // Show arrow for non-section, non-category and non-leaf items
    getArrowElement(): JSX.Element {
        if (this.props.data.itemType === "section" || this.props.data.itemType === "category") {
            return null;
        }

        if (this.props.data.childItems.length == 0) {
            return null;
        };

        let arrowIcon: any = null;

        if (!this.state.expanded) {
            if (this.props.isLastItem) {
                arrowIcon = require("../resources/ui/indent-arrow-right-last.svg");
            } else {
                arrowIcon = require("../resources/ui/indent-arrow-right.svg");
            }
        } else {
            arrowIcon = require("../resources/ui/indent-arrow-down.svg");
        }

        return <img className={"Arrow"} src={arrowIcon} onError={this.onImageLoadFail} />;
    }

    getHeaderElement(): JSX.Element {
        let arrow = this.getArrowElement();
        let iconElement = this.getIconElement();
        let parameters: JSX.Element = null;

        if (this.props.data.parameters && this.props.data.parameters.length > 0 && this.props.data.childItems.length == 0) {
            parameters = <div className="LibraryItemParameters">{this.props.data.parameters}</div>;
        }

        if (this.props.data.showHeader) {
            return (
                <div className={this.getLibraryItemHeaderStyle()} onClick={this.onLibraryItemClicked}
                    onMouseOver={this.onLibraryItemMouseEnter} onMouseLeave={this.onLibraryItemMouseLeave}>
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

    getLibraryItemTextStyle(): string {
        switch (this.props.data.itemType) {
            case "group":
            case "section":
                return "LibraryItemGroupText";
            default:
                return "LibraryItemText";
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
                    regularItems.map((item, i) => {
                        let isLastItem = false;

                        if (i == regularItems.length - 1) {
                            isLastItem = true;
                        }
                        return (<LibraryItem
                            key={index++}
                            libraryContainer={this.props.libraryContainer}
                            data={item}
                            showItemSummary={this.props.showItemSummary}
                            isLastItem={isLastItem}
                            onItemWillExpand={(args: any) => {
                                this.onSingleChildItemWillExpand();
                                this.props.libraryContainer.scrollToExpandedItem(args)
                            }}
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

    onLibraryItemClicked() {
        // Toggle expansion state.
        let currentlyExpanded = this.state.expanded;
        if (this.props.data.childItems.length > 0 && !currentlyExpanded && this.props.onItemWillExpand) {
            this.props.onItemWillExpand(ReactDOM.findDOMNode(this));
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
