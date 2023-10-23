import * as React from 'react';
import { ItemData } from "../LibraryUtilities";
import { LibraryContainer } from "./LibraryContainer";

/**
 * 'ItemSummary' can optionally display the description text. In regular library 
 * view the description text is always shown as part of 'ItemSummary' when it is 
 * expanded. In search result view however, 'ItemSummary' does not display its 
 * description text as each search result item already displays the same description
 * text (in detailed view), in which case 'showDescription' property is set to false. 
 */
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
        this.setItemSummary = this.setItemSummary.bind(this);
    }

    render() {
        this.fetchMissingItemSummary();

        let descriptionText = this.props.data.description;
        let input: JSX.Element[] = [];
        let output: JSX.Element | null = null;
        let description: JSX.Element | null = null;
        let icon: JSX.Element | null = null;

        if (this.state.hasSummaryData) {
            let inputParameters = this.summaryData.InputParameters;
            let outputParameters = this.summaryData.OutputParameters;
            let descriptionTextReceived = this.summaryData.Description;

            for (let inputParameter of inputParameters) {
                let inputParameterName = inputParameter.name
                if (inputParameterName.length > 0) {
                    inputParameterName += ": ";
                }

                input.push(<div className={"IOParameter"}>{inputParameterName}{inputParameter.type}</div>);
            }

            output = <div className={"IOParameter"}>{outputParameters}</div>;

            if (descriptionTextReceived.length > 0) {
                descriptionText = descriptionTextReceived;
            } else {
                descriptionText = this.props.data.description;
            }
        }

        if (!descriptionText) {
            descriptionText = this.state.hasSummaryData ? "No description available" : "Fetching summary...";
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

    // Raise event to get data if there is no data yet.
    fetchMissingItemSummary() {
        if (!this.state.hasSummaryData) {
            let libraryContainer = this.props.libraryContainer;
            let itemSummaryExpandedEvent = libraryContainer.props.libraryController.ItemSummaryExpandedEventName;
            libraryContainer.raiseEvent(
                itemSummaryExpandedEvent,
                { setDataCallback: this.setItemSummary, contextData: this.props.data.contextData }
            );
        }
    }

    /**
     * Set data for displaying ItemSummary
     * @param data The data received should in the following format: 
     * 
     * {
     *   "inputParameters":[
     *      {
     *          "name":"c1",
     *          "type":"Color"
     *      },
     *      {
     *          "name":"c2",
     *          "type":"Color"
     *      }
     *   ],
     *   "outputParameters":[
     *      "Color"
     *   ],
     *   "description": "Construct a Color by combining two input Colors."
     * }
     * 
     */
    setItemSummary(data: any) {
        let summaryData = JSON.parse(data);
        if (summaryData.inputParameters && summaryData.outputParameters && summaryData.description) {
            this.summaryData = summaryData;
            this.setState({ hasSummaryData: true });
        }
    }
}