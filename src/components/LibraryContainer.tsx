/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");

import * as React from "react";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { SearchView } from "./SearchView";
import { buildLibrarySectionsFromLayoutSpecs, ItemData } from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryController: LibraryController,
    loadedTypesJson: any,
    layoutSpecsJson: any,
    defaultSectionString: string,
    miscSectionString: string
}

export interface LibraryContainerStates {
    inSearchMode: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    generatedSections: ItemData[] = null;

    constructor(props: LibraryContainerProps) {
        super(props);
        this.state = { inSearchMode: false };
        this.generatedSections = buildLibrarySectionsFromLayoutSpecs(this.props.loadedTypesJson, this.props.layoutSpecsJson, this.props.defaultSectionString, this.props.miscSectionString);
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });
    }

    render() {
        try {
            let sections: JSX.Element[] = null;
            const searchView = <SearchView onSearchModeChanged={this.onSearchModeChanged.bind(this)}
                libraryContainer={this} sections={this.generatedSections} />;

            if (!this.state.inSearchMode) {
                let index = 0;
                sections = this.generatedSections.map(data => <LibraryItem key={index++} libraryContainer={this} data={data} />)
            }

            return (
                <div>
                    {searchView}
                    {sections}
                </div>
            );
        } catch (exception) {
            return (<div>Exception thrown: {exception.message}</div>);
        }
    }
}
