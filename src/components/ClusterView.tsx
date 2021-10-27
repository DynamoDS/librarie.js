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

export interface ClusterViewProps {
    libraryContainer: LibraryContainer,
    icon: any,
    clusterType: string,
    showItemSummary: boolean,
    childItems: ItemData[]
}

export class ClusterView extends React.Component<ClusterViewProps, undefined> {

    render() {
        return (
            <div className={"ClusterViewContainer"}>
                <div className={`ClusterLeftPane ${this.props.clusterType}`}>
                    <img className={"ClusterIcon"} src={this.props.icon} />
                </div>
                <div className={"ClusterRightPane"}>
                    {this.getNestedElements()}
                </div>
            </div>
        );
    }

    getNestedElements() {

        let index = 0;
        return this.props.childItems.map((item: ItemData) => {
            return (<LibraryItem
                key={index++}
                libraryContainer={this.props.libraryContainer}
                showItemSummary={this.props.showItemSummary}
                data={item}
            />);
        });
    }

}
