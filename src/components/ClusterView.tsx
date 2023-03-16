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
import { LibraryContainer } from "./LibraryContainer";
import { LibraryItem } from "./LibraryItem";
import { ItemData } from "../LibraryUtilities";
import { Tooltip } from "react-tooltip";
require("react-tooltip/dist/react-tooltip.css");

export interface ClusterViewProps {
  libraryContainer: LibraryContainer;
  icon: any;
  clusterType: string;
  showItemSummary: boolean;
  childItems: ItemData[];
}

export class ClusterView extends React.Component<ClusterViewProps> {
  readableClusterType (clusterType:string): string {
    return clusterType.charAt(0).toUpperCase()
          + clusterType.slice(1);
  };

  render() {
    return (
      <div className={"ClusterViewContainer"}>
        <div className={`ClusterLeftPane ${this.props.clusterType}`}>
          <a id={this.props.clusterType} className={"tooltipWrapper"}>
            <img className={"ClusterIcon"} src={this.props.icon} />
          </a>
          <Tooltip
            anchorSelect={`#${this.props.clusterType}`}
            place="bottom"
            content={this.readableClusterType(this.props.clusterType)}
            className={"customTooltip"}
          />
        </div>
        <div className={"ClusterRightPane"}>{this.getNestedElements()}</div>
      </div>
    );
  }

  getNestedElements() {
    let index = 0;
    return this.props.childItems.map((item: ItemData) => {
      return (
        <LibraryItem
          key={index++}
          libraryContainer={this.props.libraryContainer}
          showItemSummary={this.props.showItemSummary}
          data={item}
        />
      );
    });
  }
}
