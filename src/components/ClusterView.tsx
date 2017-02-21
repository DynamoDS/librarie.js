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
import { LibraryItem, ItemData } from "./LibraryItem";

export interface ClusterViewProps { iconPath: string, borderColor: string, childItems: ItemData[] }

export class ClusterView extends React.Component<ClusterViewProps, undefined> {

    render() {

        let localStyle = {
            borderColor: this.props.borderColor
        };

        return (
            <div className={ "ClusterViewContainer" }>
                <div className={ "ClusterLeftPane" } style={ localStyle }>
                    <img className={ "ClusterIcon" } src={ this.props.iconPath } />
                </div>
                <div className={ "ClusterRightPane" }>
                    { this.getNestedElements() }
                </div>
            </div>
        );
    }

    getNestedElements() {

        let index = 0;
        return this.props.childItems.map((item: ItemData) => {
            return (<LibraryItem key={ index++ } data={ item } />);
        });
    }

}
