import * as React from 'react';
import { ItemData } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

interface ItemSummaryProps {
    libraryContainer: LibraryContainer,
    data: ItemData;
    showDescription: boolean;
}

interface ItemSummaryStates {
    hasItemSummaryData: boolean;
}

export class ItemSummary extends React.Component<ItemSummaryProps, ItemSummaryStates> {
    itemSummaryData: any;

    constructor(props: ItemSummaryProps) {
        super(props);
        this.state = ({ hasItemSummaryData: false });
        this.itemSummaryData = null;
        this.onReceiveDataFromDynamo = this.onReceiveDataFromDynamo.bind(this);
    }

    render() {
        this.onLibraryItemSummaryExpand();

        let descriptionText = this.props.data.description;
        let input: JSX.Element[] = [];
        let output: JSX.Element = null;
        let description: JSX.Element = null;
        let icon: JSX.Element = null;

        if (this.state.hasItemSummaryData) {
            let inputParameters = this.itemSummaryData.Item1;
            let outputParameters = this.itemSummaryData.Item2;
            let descriptionTextFromDynamo = this.itemSummaryData.Item3;

            for (let inputParameter of inputParameters) {
                let inputParameterName = inputParameter.Item1
                if (inputParameterName.length > 0) {
                    inputParameterName.concat(": ");
                }

                input.push(<div className={"IOName"}>{inputParameterName}: {inputParameter.Item2}</div>);
            }

            output = <div className={"IOName"}>{outputParameters}</div>;

            if (descriptionTextFromDynamo.length > 0) {
                descriptionText = descriptionTextFromDynamo;
            }
        }

        if (!descriptionText) {
            descriptionText = "No description available";
        }

        if (this.props.showDescription) {
            description = <div className={"Description"}>{descriptionText}</div>;
        }

        return (
            <div className={"LibraryItemSummary"}>
                <div className={"LeftPane"}>
                    {description}
                    <div className={"Input"}>INPUT</div>
                    {input}
                    <div className={"Output"}>OUTPUT</div>
                    {output}
                </div>
                <img className={"Icon"} src={this.props.data.iconUrl} onError={this.onImageLoadFail} />;
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/Dynamo.svg");
    }

    // Raise event to get data from Dynamo side if there is no data yet.
    onLibraryItemSummaryExpand() {
        if (!this.state.hasItemSummaryData) {
            let libraryContainer = this.props.libraryContainer;
            let itemSummaryExpandEvent = libraryContainer.props.libraryController.ItemSummaryExpandEventName;
            libraryContainer.raiseEvent(
                itemSummaryExpandEvent,
                { dataReceiver: this.onReceiveDataFromDynamo, data: this.props.data.contextData }
            );
        }
    }

    // Data received from Dynamo side will be a tuple with Item1 being input parameters, 
    // Item2 being output parameters, Item3 being description text.
    onReceiveDataFromDynamo(data: any) {
        let itemSummaryData = JSON.parse(data);
        if (itemSummaryData && itemSummaryData.Item1 && itemSummaryData.Item2 && itemSummaryData.Item3) {
            this.itemSummaryData = itemSummaryData;
            this.setState({ hasItemSummaryData: true });
        }
    }
}