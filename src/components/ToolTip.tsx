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
    ioParameters: any;
}

export class ToolTip extends React.Component<ToolTipProps, ToolTipState> {
    constructor(props: ToolTipProps) {
        super(props);
        this.state = ({ ioParameters: null });
    }

    render() {
        this.onLibraryItemTooltipExpand();

        let descriptionText = this.props.data.description;

        if (!descriptionText) {
            descriptionText = "No description available";
        }

        let description: JSX.Element = null;
        if (this.props.showDescription) {
            description = <div className={"Description"}>{descriptionText}</div>;
        }

        let icon: JSX.Element = null;
        if (this.props.showIcon) {
            icon = <img className={"Icon"} src={this.props.data.iconUrl} onError={this.onImageLoadFail} />;
        }

        let input: JSX.Element[] = [];
        let output: JSX.Element = null;

        if (this.state.ioParameters && this.state.ioParameters.Item1) {
            let inputParameters = this.state.ioParameters.Item1;
            for (let inputParameter of inputParameters) {
                let inputParameterName = inputParameter.Item1
                if (inputParameterName.length > 0) {
                    inputParameterName.concat(": ");
                }

                input.push(<div className={"IOName"}>{inputParameterName}: {inputParameter.Item2}</div>);
            }
        }

        if (this.state.ioParameters && this.state.ioParameters.Item2) {
            let outputParameters = this.state.ioParameters.Item2;
            output = <div className={"IOName"}>{outputParameters}</div>;
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
        if (!this.state.ioParameters) {
            let libraryContainer = this.props.libraryContainer;
            let tooltipExpandEvent = libraryContainer.props.libraryController.ItemToolTipExpandEventName;
            libraryContainer.raiseEvent(
                tooltipExpandEvent,
                { dataReceiver: this.onReceiveIOParametersFromDynamo.bind(this), data: this.props.data.contextData }
            );
        }
    }

    onReceiveIOParametersFromDynamo(data: any) {
        this.setState({ ioParameters: JSON.parse(data) });
    }
}