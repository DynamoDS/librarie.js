import * as React from 'react';
import { ItemData } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

interface ToolTipProps {
    libraryContainer: LibraryContainer,
    data: ItemData;
    showDescription: boolean;
    showIcon: boolean;
}

interface ToolTipState {
    toolTipData: any;
}

export class ToolTip extends React.Component<ToolTipProps, ToolTipState> {
    constructor(props: ToolTipProps) {
        super(props);
        this.state = ({ toolTipData: null });
    }

    render() {
        this.onLibraryItemTooltipExpand();

        let input: JSX.Element[] = [];
        let output: JSX.Element = null;

        if (this.state.toolTipData && this.state.toolTipData.Item1) {
            let inputParameters = this.state.toolTipData.Item1;
            for (let inputParameter of inputParameters) {
                let inputParameterName = inputParameter.Item1
                if (inputParameterName.length > 0) {
                    inputParameterName.concat(": ");
                }

                input.push(<div className={"IOName"}>{inputParameterName}: {inputParameter.Item2}</div>);
            }
        }

        if (this.state.toolTipData && this.state.toolTipData.Item2) {
            let outputParameters = this.state.toolTipData.Item2;
            output = <div className={"IOName"}>{outputParameters}</div>;
        }

        let descriptionText = this.props.data.description;
        let description: JSX.Element = null;

        if (this.state.toolTipData && this.state.toolTipData.Item3 && this.state.toolTipData.Item3.length > 0) {
            descriptionText = this.state.toolTipData.Item3;
        }

        if (this.props.showDescription) {
            description = <div className={"Description"}>{descriptionText}</div>;
        }

        if (!descriptionText) {
            descriptionText = "No description available";
        }

        let icon: JSX.Element = null;
        if (this.props.showIcon) {
            icon = <img className={"Icon"} src={this.props.data.iconUrl} onError={this.onImageLoadFail} />;
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
                {icon}
            </div>
        );
    }

    onImageLoadFail(event: any) {
        event.target.src = require("../resources/icons/Dynamo.svg");
    }

    onLibraryItemTooltipExpand() {
        if (!this.state.toolTipData) {
            let libraryContainer = this.props.libraryContainer;
            let tooltipExpandEvent = libraryContainer.props.libraryController.ItemToolTipExpandEventName;
            libraryContainer.raiseEvent(
                tooltipExpandEvent,
                { dataReceiver: this.onReceiveIOParametersFromDynamo.bind(this), data: this.props.data.contextData }
            );
        }
    }

    onReceiveIOParametersFromDynamo(data: any) {
        this.setState({ toolTipData: JSON.parse(data) });
    }
}