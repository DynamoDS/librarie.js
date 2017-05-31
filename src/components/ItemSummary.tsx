import * as React from 'react';
import { ItemData } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

interface ItemSummaryProps {
    libraryContainer: LibraryContainer,
    data: ItemData;
    showDescription: boolean;
}

interface ItemSummaryStates {
    hasSummaryData: boolean;
}

export class ItemSummary extends React.Component<ItemSummaryProps, ItemSummaryStates> {
    summaryData: any;

    constructor(props: ItemSummaryProps) {
        super(props);
        this.state = ({ hasSummaryData: false });
        this.summaryData = null;
        this.onDataReceived = this.onDataReceived.bind(this);
    }

    render() {
        this.onLibraryItemSummaryExpand();

        let descriptionText = this.props.data.description;
        let input: JSX.Element[] = [];
        let output: JSX.Element = null;
        let description: JSX.Element = null;
        let icon: JSX.Element = null;

        if (this.state.hasSummaryData) {
            let inputParameters = this.summaryData.InputParameters;
            let outputParameters = this.summaryData.OutputParameters;
            let descriptionTextReceived = this.summaryData.Description;

            for (let inputParameter of inputParameters) {
                let inputParameterName = inputParameter.Item1
                if (inputParameterName.length > 0) {
                    inputParameterName += ": ";
                }

                input.push(<div className={"IOParameter"}>{inputParameterName}{inputParameter.Item2}</div>);
            }

            output = <div className={"IOParameter"}>{outputParameters}</div>;

            if (descriptionTextReceived.length > 0) {
                descriptionText = descriptionTextReceived;
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
        event.target.src = require("../resources/icons/default-icon.svg");
    }

    // Raise event to get data from Dynamo side if there is no data yet.
    onLibraryItemSummaryExpand() {
        if (!this.state.hasSummaryData) {
            let libraryContainer = this.props.libraryContainer;
            let itemSummaryExpandEvent = libraryContainer.props.libraryController.ItemSummaryExpandEventName;
            libraryContainer.raiseEvent(
                itemSummaryExpandEvent,
                { onDataReceivedHandler: this.onDataReceived, data: this.props.data.contextData }
            );
        }
    }

    // Data received should have three attributes, InputParameters, OutputParameters and Description.
    onDataReceived(data: any) {
        let summaryData = JSON.parse(data);
        if (summaryData && summaryData.InputParameters && summaryData.OutputParameters && summaryData.Description) {
            this.summaryData = summaryData;
            this.setState({ hasSummaryData: true });
        }
    }
}