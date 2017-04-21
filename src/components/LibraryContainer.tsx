/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");

import * as React from "react";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { SearchView } from "./SearchView";
import { buildLibraryItemsFromLayoutSpecs, buildPackageItemsFromLoadedTypes, ItemData } from "../LibraryUtilities";

declare var boundContainer: any; // Object set from C# side.

export interface LibraryContainerProps {
    libraryController: LibraryController,
    loadedTypesJson: any,
    layoutSpecsJson: any
}

export interface LibraryContainerStates {
    inSearchMode: boolean
}

export class LibraryContainer extends React.Component<LibraryContainerProps, LibraryContainerStates> {

    generatedLibraryItems: any = null;
    generatedPackageItems: any = null;

    constructor(props: LibraryContainerProps) {

        super(props);
        this.state = { inSearchMode: false };
        this.generatedLibraryItems = buildLibraryItemsFromLayoutSpecs(
            this.props.loadedTypesJson, this.props.layoutSpecsJson);
        this.generatedPackageItems = buildPackageItemsFromLoadedTypes(this.props.loadedTypesJson);
    }

    raiseEvent(name: string, params?: any | any[]) {
        this.props.libraryController.raiseEvent(name, params);
    }

    onSearchModeChanged(inSearchMode: boolean) {
        this.setState({ inSearchMode: inSearchMode });
    }

    render() {

        try {
            let libraryListItems: JSX.Element[] = null;
            let packageView: JSX.Element = null;
            let allItems = this.generatedLibraryItems.concat(this.generatedPackageItems);
            const searchView = <SearchView
                onSearchModeChanged={this.onSearchModeChanged.bind(this)} libraryContainer={this} items={allItems} />;

            if (!this.state.inSearchMode) {
                let index = 0;
                libraryListItems = this.generatedLibraryItems.map((item: ItemData) =>
                    (<LibraryItem key={index++} libraryContainer={this} data={item} />)
                );

                let packageListItems = this.generatedPackageItems.map((item: ItemData) =>
                    (<LibraryItem key={index++} libraryContainer={this} data={item} />)
                );

                packageView = (
                    <div className="PackageView">
                        <div className="PackageViewHeader">
                            <img className="AddOnIcon" src={require("../resources/icons/add-on.svg")} />
                            <div className="HeaderText">Add-ons</div>
                            <div className="PlusButton">+</div>
                        </div>
                        {packageListItems}
                    </div>
                );
            }

            return (
                <div>
                    <div>{searchView}</div>
                    <div>{libraryListItems}</div>
                    <div>{packageView}</div>
                </div>
            );
        } catch (exception) {
            return (<div>Exception thrown: {exception.message}</div>);
        }
    }
}
