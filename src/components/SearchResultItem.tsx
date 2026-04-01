/// <reference path="../../node_modules/@types/node/index.d.ts" />

import * as React from "react";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { LibraryContainerHandle } from "./LibraryContainer";
import * as LibraryUtilities from "../LibraryUtilities";
import { HostingContextType } from "../SharedTypes";
import { useStableWindowListener, raiseItemMouseLeave, raiseItemMouseEnter, handleImageLoadFail } from "./componentHelpers";

type ParentTextClickedFunc = (pathToItem: LibraryUtilities.ItemData[]) => void;

interface SearchResultItemProps {
    index: number,
    data: LibraryUtilities.ItemData,
    libraryContainer: LibraryContainerHandle,
    highlightedText: string;
    detailed: boolean;
    onParentTextClicked: ParentTextClickedFunc,
}

export interface SearchResultItemHandle {
    setSelected(selected: boolean): void;
}

export const SearchResultItem = forwardRef<SearchResultItemHandle, SearchResultItemProps>(
    function SearchResultItem(props, ref) {
        const { index, data, libraryContainer, highlightedText, detailed } = props;

        const [selected, setSelectedState] = useState(
            () => index === (libraryContainer.selectionIndex ?? 0)
        );

        // DOM ref replacing findDOMNode(this)
        const containerRef = useRef<HTMLDivElement>(null);

        // Expose setSelected for LibraryContainer keyboard navigation
        useImperativeHandle(ref, () => ({
            setSelected(value: boolean) {
                setSelectedState(value);
            }
        }));

        // Use a ref-based stable handler so the window listener is registered once
        // but always reads the latest `selected` state (same pattern as SearchBar/LibraryContainer).
        useStableWindowListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter" && selected) {
                handleItemClicked();
            }
        });

        // Scroll selected item into view when selection state changes
        useEffect(() => {
            if (!selected) return;
            const container = libraryContainer.getContainerElement();
            const currentItem = containerRef.current;
            if (!container || !currentItem) return;

            const containerRect = container.getBoundingClientRect();
            const currentRect = currentItem.getBoundingClientRect();

            if (currentRect.top < currentRect.height) {
                currentItem.scrollIntoView();
            }
            if (currentRect.bottom > containerRect.bottom) {
                currentItem.scrollIntoView(false);
            }
        }, [selected, libraryContainer]);


        function handleItemClicked() {
            libraryContainer.setSelection(index);
            libraryContainer.raiseEvent("itemClicked", data.contextData);
        }

        function handleMouseLeave() {
            raiseItemMouseLeave(data, libraryContainer);
        }

        function handleMouseEnter() {
            raiseItemMouseEnter(data, libraryContainer, containerRef.current);
        }

        function handleParentTextClicked(event: React.MouseEvent | React.KeyboardEvent) {
            event.stopPropagation();
            handleMouseLeave(); // dismiss tooltip
            props.onParentTextClicked(data.pathToItem);
        }

        if (
            libraryContainer.state?.hostingContext === HostingContextType.home &&
            data.hiddenInWorkspaceContext
        ) {
            return null;
        }

        const itemContainerStyle = selected
            ? "SearchResultItemContainerSelected"
            : "SearchResultItemContainer";

        if (data.itemType !== "section" && data.pathToItem.length - 2 > 0) {
            const parentText = data.pathToItem[data.pathToItem.length - 2].text;
            const categoryText =
                data.pathToItem.find(item => item.itemType === "category")?.text ?? "";
            const highLightedItemText = LibraryUtilities.getHighlightedText(
                data.text, highlightedText, true
            );
            const highLightedParentText = LibraryUtilities.getHighlightedText(
                parentText, highlightedText, false
            );
            const highLightedCategoryText = LibraryUtilities.getHighlightedText(
                categoryText, highlightedText, false
            );
            const itemTypeIconPath = require(`../resources/icons/library-${data.itemType}.svg`);

            let itemDescription: React.ReactNode = null;
            if (detailed) {
                const description =
                    data.description && data.description.length > 0
                        ? data.description
                        : "No description available";
                itemDescription = <div className={"ItemDescription"}>{description}</div>;
            }

            return (
                <div
                    ref={containerRef}
                    className={itemContainerStyle}
                    onClick={handleItemClicked}
                    onKeyDown={handleItemClicked}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <img
                        className={"ItemIcon"}
                        src={data.iconUrl}
                        onError={handleImageLoadFail}
                    />
                    <div className={"ItemInfo"}>
                        <div className={"ItemTitle"}>
                            {highLightedItemText}
                            <div className={"LibraryItemParameters"}>{data.parameters}</div>
                        </div>
                        {itemDescription}
                        <div className={"ItemDetails"}>
                            <div
                                className={"ItemParent"}
                                onClick={handleParentTextClicked}
                                onKeyDown={handleParentTextClicked}
                            >
                                {highLightedParentText}
                            </div>
                            <img
                                className={"ItemTypeIcon"}
                                src={itemTypeIconPath}
                                onError={handleImageLoadFail}
                            />
                            <div className={"ItemCategory"}>{highLightedCategoryText}</div>
                        </div>
                    </div>
                </div>
            );
        }

        return <div ref={containerRef} />;
    }
);

SearchResultItem.displayName = "SearchResultItem";
