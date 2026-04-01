import * as React from 'react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ItemData } from "../LibraryUtilities";
import type { LibraryContainerHandle } from "./LibraryContainer";
import { handleImageLoadFail } from "./componentHelpers";

/**
 * 'ItemSummary' can optionally display the description text. In regular library
 * view the description text is always shown as part of 'ItemSummary' when it is
 * expanded. In search result view however, 'ItemSummary' does not display its
 * description text as each search result item already displays the same description
 * text (in detailed view), in which case 'showDescription' property is set to false.
 */
interface ItemSummaryProps {
    libraryContainer: LibraryContainerHandle,
    data: ItemData;
    showDescription: boolean;
}

export function ItemSummary({ libraryContainer, data, showDescription }: ItemSummaryProps) {
    const [hasSummaryData, setHasSummaryData] = useState(false);
    const summaryData = useRef<any>(null);

    /**
     * Set data for displaying ItemSummary.
     * Expected JSON format:
     * {
     *   "inputParameters": [{ "name": "c1", "type": "Color" }, ...],
     *   "outputParameters": ["Color"],
     *   "description": "..."
     * }
     */
    const setItemSummary = useCallback((rawData: any) => {
        const parsed = JSON.parse(rawData);
        if (parsed.inputParameters && parsed.outputParameters && parsed.description) {
            summaryData.current = parsed;
            setHasSummaryData(true);
        }
    }, []);

    // Raise event to fetch summary data (replaces fetchMissingItemSummary in render)
    useEffect(() => {
        if (!hasSummaryData) {
            const eventName =
                libraryContainer.props.libraryController.ItemSummaryExpandedEventName;
            libraryContainer.raiseEvent(eventName, {
                setDataCallback: setItemSummary,
                contextData: data.contextData
            });
        }
    }, [hasSummaryData, libraryContainer, data.contextData, setItemSummary]);

    let descriptionText = data.description;
    const input: React.ReactNode[] = [];
    let output: React.ReactNode = null;
    let description: React.ReactNode = null;

    if (hasSummaryData && summaryData.current) {
        const inputParameters  = summaryData.current.InputParameters;
        const outputParameters = summaryData.current.OutputParameters;
        const descriptionReceived = summaryData.current.Description;

        if (inputParameters) {
            for (const inputParameter of inputParameters) {
                let inputParameterName = inputParameter.name;
                if (inputParameterName.length > 0) inputParameterName += ": ";
                input.push(
                    <div key={inputParameterName} className={"IOParameter"}>
                        {inputParameterName}{inputParameter.type}
                    </div>
                );
            }
        }

        output = <div className={"IOParameter"}>{outputParameters}</div>;

        if (descriptionReceived && descriptionReceived.length > 0) {
            descriptionText = descriptionReceived;
        }
    }

    if (!descriptionText) {
        descriptionText = hasSummaryData ? "No description available" : "Fetching summary...";
    }

    if (showDescription) {
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
            <img className={"Icon"} src={data.iconUrl} onError={handleImageLoadFail} />;
        </div>
    );
}
