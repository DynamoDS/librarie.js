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
import { useRef, useState, useEffect } from "react";
import { ClusterView } from "./ClusterView";
import * as LibraryUtilities from "../LibraryUtilities";
import { ArrowIcon } from "./icons";
import type { LibraryContainerHandle } from "./LibraryContainer";
import { HostingContextType } from "../SharedTypes";
import { raiseItemMouseLeave, raiseItemMouseEnter, handleImageLoadFail } from "./componentHelpers";

export interface LibraryItemProps {
    libraryContainer: LibraryContainerHandle,
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
                case "query":  this.queries.push(element); break;
                default:       this.others.push(element);  break;
            }
        }
        this.creates = LibraryUtilities.sortItemsByText(this.creates);
        this.actions = LibraryUtilities.sortItemsByText(this.actions);
        this.queries = LibraryUtilities.sortItemsByText(this.queries);
        this.others  = LibraryUtilities.sortItemsByText(this.others);
    }

    getCreateItems(): LibraryUtilities.ItemData[] { return this.creates; }
    getActionItems(): LibraryUtilities.ItemData[] { return this.actions; }
    getQueryItems():  LibraryUtilities.ItemData[] { return this.queries; }
    getOtherItems():  LibraryUtilities.ItemData[] { return this.others;  }
}

export function LibraryItem(props: LibraryItemProps) {
    const { libraryContainer, data, showItemSummary, onItemWillExpand, tooltipContent } = props;

    const [expanded, setExpanded] = useState(data.expanded);

    // DOM ref replaces findDOMNode(this)
    const containerRef = useRef<HTMLDivElement>(null);

    // Track previous data.expanded to detect prop-driven changes (componentDidUpdate)
    const prevExpandedRef = useRef(data.expanded);

    // componentDidMount: scroll into view if initially expanded
    useEffect(() => {
        if (data.expanded && data.itemType !== "coregroup") {
            const hasExpandedChildren = data.childItems.some((item: any) => item.expanded);
            if (!hasExpandedChildren) {
                setTimeout(() => {
                    containerRef.current?.scrollIntoView(false);
                }, 0);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // componentDidUpdate: sync expanded state when data.expanded prop changes
    useEffect(() => {
        if (
            prevExpandedRef.current !== data.expanded &&
            libraryContainer.state?.shouldOverrideExpandedState
        ) {
            setExpanded(data.expanded);
        }
        prevExpandedRef.current = data.expanded;
    }, [data.expanded, libraryContainer]);

    // ── Visibility guard ─────────────────────────────────────────────────────

    if (
        libraryContainer.state?.hostingContext === HostingContextType.home &&
        data.hiddenInWorkspaceContext
    ) {
        return null;
    }
    if (!data.visible) {
        return null;
    }

    // ── Event handlers ───────────────────────────────────────────────────────


    function handleItemClicked() {
        if (data.text === "Add-ons") return;
        const currentlyExpanded = expanded;
        if (data.childItems.length > 0 && !currentlyExpanded && onItemWillExpand) {
            onItemWillExpand(containerRef.current);
        }
        setExpanded(!currentlyExpanded);
        if (data.childItems.length === 0) {
            libraryContainer.raiseEvent(
                libraryContainer.props.libraryController.ItemClickedEventName,
                data.contextData
            );
        }
        libraryContainer.setShouldOverrideExpandedState?.(true);
    }

    function handleSectionIconClicked(event: any) {
        libraryContainer.raiseEvent(
            libraryContainer.props.libraryController.SectionIconClickedEventName,
            data.text
        );
        event.stopPropagation();
    }

    function handleSingleChildItemWillExpand() {
        setExpanded(true);
    }

    function handleMouseLeave() {
        raiseItemMouseLeave(data, libraryContainer);
    }

    function handleMouseEnter() {
        raiseItemMouseEnter(data, libraryContainer, containerRef.current);
    }

    // ── Sub-element builders ─────────────────────────────────────────────────

    function getIconElement(): React.ReactNode {
        if (data.itemType === "category") return null;

        if (
            data.itemType !== "group" &&
            data.itemType !== "section" &&
            data.itemType !== "coregroup" &&
            data.itemType !== "classType" &&
            data.itemType !== "none"
        ) {
            return (
                <div className="LibraryItemIconWrapper">
                    <img
                        className={"LibraryItemIcon"}
                        src={data.iconUrl}
                        onError={handleImageLoadFail}
                    />
                </div>
            );
        }

        if (data.itemType === "section" && data.text === "Add-ons" && data.iconUrl) {
            return (
                <img
                    className={"LibraryAddOnSectionIcon"}
                    src={data.iconUrl}
                    onError={handleImageLoadFail}
                    onClick={handleSectionIconClicked}
                    onKeyDown={handleSectionIconClicked}
                />
            );
        }

        if (data.itemType === "section" && data.iconUrl) {
            return (
                <img
                    className={"LibraryItemIcon"}
                    src={data.iconUrl}
                    onError={handleImageLoadFail}
                    onClick={handleSectionIconClicked}
                    onKeyDown={handleSectionIconClicked}
                />
            );
        }

        return null;
    }

    function getArrowElement(): React.ReactNode {
        if (data.itemType === "section" || data.itemType === "coregroup") return null;
        if (data.childItems.length === 0) return null;

        enum ArrowPositions {
            "RIGTH" = "Right",
            "DOWN"  = "Down"
        }

        const arrowPosition = expanded ? ArrowPositions.DOWN : ArrowPositions.RIGTH;

        if (data.itemType === "category") {
            return <ArrowIcon position={arrowPosition} />;
        }
        return <ArrowIcon color="#D8D8D8" position={arrowPosition} />;
    }

    function getLibraryItemContainerStyle(isExpanded: boolean): string {
        let style: string;
        switch (data.itemType) {
            case "section":  style = "LibraryItemContainerSection"; break;
            case "category": style = "LibraryItemContainerCategory"; break;
            case "group":
            case "coregroup": style = "LibraryItemContainerGroup"; break;
            default: style = "LibraryItemContainerNone"; break;
        }
        if (isExpanded) style += " expanded";
        return style;
    }

    function getLibraryItemHeaderStyle(): string {
        return data.itemType === "section" ? "LibrarySectionHeader" : "LibraryItemHeader";
    }

    function getLibraryItemTextStyle(): string {
        switch (data.itemType) {
            case "group":
            case "coregroup":
            case "section": return "LibraryItemGroupText";
            default:        return "LibraryItemText";
        }
    }

    function getHeaderElement(): React.ReactNode {
        if (!data.showHeader) return null;

        const arrow = getArrowElement();
        const iconElement = getIconElement();
        let parameters: React.ReactNode = null;
        if (data.parameters && data.parameters.length > 0 && data.childItems.length === 0) {
            parameters = <span className="LibraryItemParameters">{data.parameters}</span>;
        }

        return (
            <div
                className={getLibraryItemHeaderStyle()}
                onClick={handleItemClicked}
                onKeyDown={handleItemClicked}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {arrow}
                {data.itemType === "section" ? null : iconElement}
                <div className="LibraryItemTextWrapper">
                    <div className="TextBox">
                        <span className={getLibraryItemTextStyle()}>{data.text}</span>
                        {parameters}
                    </div>
                </div>
                {data.itemType === "section" ? iconElement : null}
            </div>
        );
    }

    function getNestedElements(groupedItems: GroupedItems): React.ReactNode {
        const regularItems = groupedItems.getOtherItems();
        if (regularItems.length <= 0) return null;
        let index = 0;
        return (
            <div className={"LibraryItemBody"}>
                {regularItems.map((item) => (
                    <LibraryItem
                        key={index++}
                        libraryContainer={libraryContainer}
                        data={item}
                        showItemSummary={showItemSummary}
                        onItemWillExpand={(args: any) => {
                            handleSingleChildItemWillExpand();
                            libraryContainer.scrollToExpandedItem(args);
                        }}
                        tooltipContent={tooltipContent}
                    />
                ))}
            </div>
        );
    }

    function getClusteredElements(groupedItems: GroupedItems): React.ReactNode {
        const createMethods = groupedItems.getCreateItems();
        const actionMethods = groupedItems.getActionItems();
        const queryMethods  = groupedItems.getQueryItems();

        const createCluster = createMethods.length > 0 && createMethods.some(i => i.visible)
            ? <ClusterView
                libraryContainer={libraryContainer}
                icon={require("../resources/icons/library-create.svg")}
                clusterType="create"
                showItemSummary={showItemSummary}
                childItems={createMethods}
                tooltipContent={tooltipContent?.["create"]}
            />
            : null;

        const actionCluster = actionMethods.length > 0 && actionMethods.some(i => i.visible)
            ? <ClusterView
                libraryContainer={libraryContainer}
                icon={require("../resources/icons/library-action.svg")}
                clusterType="action"
                showItemSummary={showItemSummary}
                childItems={actionMethods}
                tooltipContent={tooltipContent?.["action"]}
            />
            : null;

        const queryCluster = queryMethods.length > 0 && queryMethods.some(i => i.visible)
            ? <ClusterView
                libraryContainer={libraryContainer}
                icon={require("../resources/icons/library-query.svg")}
                clusterType="query"
                showItemSummary={showItemSummary}
                childItems={queryMethods}
                tooltipContent={tooltipContent?.["query"]}
            />
            : null;

        if (!createCluster && !actionCluster && !queryCluster) return null;

        return (
            <div className={"LibraryItemBody"}>
                {createCluster}
                {actionCluster}
                {queryCluster}
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────

    let nestedElements: React.ReactNode = null;
    let clusteredElements: React.ReactNode = null;
    let bodyIndentation = "";

    if (expanded && data.childItems.length > 0) {
        const groupedItems = new GroupedItems(LibraryUtilities.sortItemsByText(data.childItems));
        clusteredElements = getClusteredElements(groupedItems);
        nestedElements    = getNestedElements(groupedItems);
    }

    if (nestedElements && ["group", "category"].includes(data.itemType)) {
        bodyIndentation = "BodyIndentation";
    }

    return (
        <div ref={containerRef} className={getLibraryItemContainerStyle(expanded)}>
            {getHeaderElement()}
            <div className={"LibraryItemBodyContainer"}>
                <div className={`LibraryItemBodyElements ${bodyIndentation}`}>
                    {clusteredElements}
                    {nestedElements}
                </div>
            </div>
        </div>
    );
}
