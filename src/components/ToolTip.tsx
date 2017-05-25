import * as React from 'react';
import { ItemData } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

interface ToolTipProps {
    libraryContainer: LibraryContainer,
    data: ItemData;
    showDescription: boolean;
}

interface ToolTipState {
    hasToolTipData: boolean;
}

export class ToolTip extends React.Component<ToolTipProps, ToolTipState> {
    toolTipData: any;

    constructor(props: ToolTipProps) {
        super(props);
        this.state = ({ hasToolTipData: false });
        this.toolTipData = null;
        this.onReceiveDataFromDynamo = this.onReceiveDataFromDynamo.bind(this);
    }

    render() {
        this.onLibraryItemTooltipExpand();

        let descriptionText = this.props.data.description;
        let input: JSX.Element[] = [];
        let output: JSX.Element = null;
        let description: JSX.Element = null;
        let icon: JSX.Element = null;

        if (this.state.hasToolTipData) {
            let inputParameters = this.toolTipData.Item1;
            let outputParameters = this.toolTipData.Item2;
            let descriptionTextFromDynamo = this.toolTipData.Item3;

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
            <div className={"LibraryItemToolTip"}>
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
    onLibraryItemTooltipExpand() {
        if (!this.state.hasToolTipData) {
            let libraryContainer = this.props.libraryContainer;
            let tooltipExpandEvent = libraryContainer.props.libraryController.ItemToolTipExpandEventName;
            libraryContainer.raiseEvent(
                tooltipExpandEvent,
                { dataReceiver: this.onReceiveDataFromDynamo, data: this.props.data.contextData }
            );
        }
    }

    // Data received from Dynamo side will be a tuple with Item1 being input parameters, 
    // Item2 being output parameters, Item3 being description text.
    onReceiveDataFromDynamo(data: any) {
        let toolTipData = JSON.parse(data);
        if (toolTipData && toolTipData.Item1 && toolTipData.Item2 && toolTipData.Item3) {
            this.toolTipData = toolTipData;
            this.setState({ hasToolTipData: true });
        }
    }
}