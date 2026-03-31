/*
      ClusterViewContainer
    +-----------------------------------------------------+
    |  ClusterLeftPane     ClusterRightPane               |
    | +-----------------+ +-----------------------------+ |
    | |    ClusterIcon  | | LibraryItemContainerXxx     | |
    | |       +-------+ | | +-------------------------+ | |
    | |       |       | | | | ...                     | | |
    | |       |       | | | +-------------------------+ | |
    | |       +-------+ | | +-------------------------+ | |
    | |                 | | | ...                     | | |
    | |                 | | +-------------------------+ | |
    | |                 | | +-------------------------+ | |
    | |                 | | | ...                     | | |
    | |                 | | +-------------------------+ | |
    | +-----------------+ +-----------------------------+ |
    +-----------------------------------------------------+
*/

import * as React from "react";
import { LibraryItem } from "./LibraryItem";
import { ItemData } from "../LibraryUtilities";
import { Tooltip } from "react-tooltip";
import type { LibraryContainerHandle } from "./LibraryContainer";
require("react-tooltip/dist/react-tooltip.css");

export interface ClusterViewProps {
    libraryContainer: LibraryContainerHandle;
    icon: any;
    clusterType: string;
    showItemSummary: boolean;
    childItems: ItemData[];
    tooltipContent?: string;
}

export function ClusterView({
    libraryContainer,
    icon,
    clusterType,
    showItemSummary,
    childItems,
    tooltipContent
}: ClusterViewProps) {
    let index = 0;
    const nestedElements = childItems.map((item: ItemData) => (
        <LibraryItem
            key={index++}
            libraryContainer={libraryContainer}
            showItemSummary={showItemSummary}
            data={item}
            tooltipContent={tooltipContent}
        />
    ));

    return (
        <div className={"ClusterViewContainer"}>
            <div className={`ClusterLeftPane ${clusterType}`}>
                <a id={clusterType} className={"tooltipWrapper"}>
                    <img className={"ClusterIcon"} src={icon} />
                </a>
                <Tooltip
                    anchorSelect={`#${clusterType}`}
                    place="bottom"
                    content={tooltipContent}
                    className={"customTooltip"}
                />
            </div>
            <div className={"ClusterRightPane"}>{nestedElements}</div>
        </div>
    );
}
