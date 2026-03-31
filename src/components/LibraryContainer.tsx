/// <reference path="../../node_modules/@types/node/index.d.ts" />

require("../resources/LibraryStyles.css");

import * as React from "react";
import { useRef, useState, useCallback, useReducer } from "react";
import * as LibraryUtilities from "../LibraryUtilities";
import { LibraryController } from "../entry-point";
import { LibraryItem } from "./LibraryItem";
import { Searcher } from "../Searcher";
import { SearchBar, CategoryData } from "./SearchBar";
import { SearchResultItem } from "./SearchResultItem";
import type { SearchResultItemHandle } from "./SearchResultItem";
import { HostingContextType } from "../SharedTypes";

declare global {
    interface Window { setTooltipText: any; }
}

declare let boundContainer: any; // Object set from C# side.

enum ClusterTypeDescription {
    create = "Nodes that create data",
    action = "Nodes that execute an action",
    query = "Nodes that query data"
}

export interface LibraryContainerProps {
    libraryController: LibraryController,
    defaultSectionString: string,
    miscSectionString: string
}

export interface LibraryContainerStates {
    inSearchMode: boolean,
    searchText: string,
    selectedCategories: string[],
    structured: boolean,
    detailed: boolean,
    showItemSummary: boolean,
    tooltipContent: {
        create: string;
        action: string;
        query: string;
    }
    hostingContext: HostingContextType
    shouldOverrideExpandedState: boolean
}

export interface LibraryContainerHandle {
    readonly state: LibraryContainerStates;
    readonly selectionIndex: number;
    readonly props: LibraryContainerProps;
    setSelection(index: number): void;
    raiseEvent(name: string, params?: any): void;
    scrollToExpandedItem(element: HTMLElement | null): void;
    getContainerElement(): Element | null;
    setShouldOverrideExpandedState(value: boolean): void;
}

export function LibraryContainer(props: LibraryContainerProps) {
    // ── React state (triggers re-renders) ────────────────────────────────────
    const [inSearchMode, setInSearchMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [structured] = useState(false); // feature exists but is never toggled
    const [detailed, setDetailed] = useState(false);
    const [showItemSummary] = useState(false);
    const [tooltipContent, setTooltipContent] = useState({
        create: ClusterTypeDescription.create,
        action: ClusterTypeDescription.action,
        query: ClusterTypeDescription.query
    });
    const [hostingContext, setHostingContext] = useState<HostingContextType>("none");
    const [generatedSections, setGeneratedSections] = useState<LibraryUtilities.ItemData[] | null>(null);

    // ── Instance-variable refs (no re-render on change) ──────────────────────
    const loadedTypesJsonRef = useRef<any>(null);
    const layoutSpecsJsonRef = useRef<any>(null);
    const generatedSectionsRef = useRef<LibraryUtilities.ItemData[] | null>(null);
    const generatedSectionsOnSearchRef = useRef<LibraryUtilities.ItemData[] | null>(null);
    const searchResultItemRefsRef = useRef<SearchResultItemHandle[]>([]);
    const searchResultItemsRef = useRef<LibraryUtilities.ItemData[]>([]);
    const searcherRef = useRef<Searcher | null>(new Searcher());
    const searchCategoriesRef = useRef<string[]>([]);
    const timeoutRef = useRef<number>(0);
    const selectionIndexRef = useRef<number>(0);
    const shouldOverrideRef = useRef<boolean>(true);
    const containerDivRef = useRef<HTMLDivElement>(null);

    // Keep props/state accessible to the stable handle without re-creating it
    const propsRef = useRef(props);
    propsRef.current = props;

    const stateRef = useRef<LibraryContainerStates>({} as LibraryContainerStates);
    stateRef.current = {
        inSearchMode, searchText, selectedCategories, structured, detailed,
        showItemSummary, tooltipContent, hostingContext,
        shouldOverrideExpandedState: shouldOverrideRef.current
    };

    // ── Stable handle object (created once, reads latest values via refs) ────
    const handleRef = useRef<LibraryContainerHandle>({
        get state() { return stateRef.current; },
        get selectionIndex() { return selectionIndexRef.current; },
        get props() { return propsRef.current; },
        setSelection(index: number) {
            const refs = searchResultItemRefsRef.current;
            if (refs[selectionIndexRef.current]) refs[selectionIndexRef.current].setSelected(false);
            if (refs[index]) refs[index].setSelected(true);
            selectionIndexRef.current = index;
        },
        raiseEvent(name: string, params?: any) {
            propsRef.current.libraryController.raiseEvent(name, params);
        },
        scrollToExpandedItem(element: HTMLElement | null) {
            if (!element || !containerDivRef.current) return;
            const currentElement = containerDivRef.current.querySelector(".LibraryItemContainer");
            const offsetOf = (el: any) => {
                const rect = el.getBoundingClientRect();
                return {
                    top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
                    left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft)
                };
            };
            const offsetOldElement = offsetOf(element);
            setTimeout(() => {
                const distance = offsetOldElement.top - offsetOf(element).top;
                if (currentElement) {
                    (currentElement as Element).scrollTop -= distance;
                }
            }, 0);
        },
        getContainerElement() {
            return containerDivRef.current;
        },
        setShouldOverrideExpandedState(value: boolean) {
            shouldOverrideRef.current = value;
        }
    });

    // ── Core handlers (stable via useCallback with empty deps, use refs) ─────

    const setLoadedTypesJson = useCallback((loadedTypesJson: any, append: boolean = true): void => {
        if (!loadedTypesJson) {
            throw new Error("Parameter 'loadedTypesJson' must be supplied");
        }
        if (!loadedTypesJson.loadedTypes || !Array.isArray(loadedTypesJson.loadedTypes)) {
            throw new Error("'loadedTypesJson.loadedTypes' must be a valid array");
        }
        if (!loadedTypesJsonRef.current || !append) {
            loadedTypesJsonRef.current = loadedTypesJson;
            return;
        }
        Array.prototype.push.apply(loadedTypesJsonRef.current.loadedTypes, loadedTypesJson.loadedTypes);
    }, []);

    const setLayoutSpecsJson = useCallback((layoutSpecsJson: any, append: boolean = true): void => {
        if (!layoutSpecsJson) {
            throw new Error("Parameter 'layoutSpecsJson' must be supplied");
        }
        if (!layoutSpecsJson.sections || !Array.isArray(layoutSpecsJson.sections)) {
            throw new Error("'layoutSpecsJson.sections' must be a valid array");
        }
        if (!layoutSpecsJsonRef.current || !append) {
            layoutSpecsJsonRef.current = layoutSpecsJson;
            return;
        }
        LibraryUtilities.updateSections(layoutSpecsJsonRef.current, layoutSpecsJson);
    }, []);

    const updateSections = useCallback((sections: any): void => {
        for (const section of sections) {
            for (const childItem of section.childItems) {
                searchCategoriesRef.current.push(childItem.text);
            }
        }
        if (searcherRef.current) {
            searcherRef.current.sections = sections;
            searcherRef.current.initializeCategories(searchCategoriesRef.current);
        }
        // Callers always follow up with a state update that triggers re-render;
        // no explicit force-update needed here.
    }, []);

    const refreshLibraryView = useCallback((): void => {
        const p = propsRef.current;
        const sections = LibraryUtilities.buildLibrarySectionsFromLayoutSpecs(
            loadedTypesJsonRef.current, layoutSpecsJsonRef.current,
            p.defaultSectionString, p.miscSectionString
        );
        generatedSectionsRef.current = sections;
        setGeneratedSections(sections);
        updateSections(sections);
    }, [updateSections]);

    const setHostContext = useCallback((context: HostingContextType): void => {
        shouldOverrideRef.current = false;
        setHostingContext(context);
    }, []);

    const setTooltipTextHandler = useCallback((content: string): void => {
        setTooltipContent(JSON.parse(content));
    }, []);

    // Set handlers synchronously so they're available even with shallow rendering
    props.libraryController.setLoadedTypesJsonHandler = setLoadedTypesJson;
    props.libraryController.setLayoutSpecsJsonHandler = setLayoutSpecsJson;
    props.libraryController.refreshLibraryViewHandler = refreshLibraryView;
    props.libraryController.setHostContextHandler = setHostContext;
    window.setTooltipText = setTooltipTextHandler;

    // ── Search helpers ───────────────────────────────────────────────────────

    const updateSearchResultItems = useCallback((mode: boolean, isStructured: boolean): void => {
        if (!mode) {
            searchResultItemRefsRef.current = [];
            searchResultItemsRef.current = [];
            return;
        }
        if (isStructured) {
            searchResultItemsRef.current = searcherRef.current?.generateStructuredItems() ?? [];
        } else {
            const searcher = searcherRef.current;
            const p = propsRef.current;
            searchResultItemsRef.current = searcher?.generateListItems(
                p.libraryController.searchLibraryItemsHandler
                    ? (generatedSectionsOnSearchRef.current ?? [])
                    : (generatedSectionsRef.current ?? [])
            ) ?? [];
        }
    }, []);

    const onSearchModeChanged = useCallback((mode: boolean, text?: string): void => {
        selectionIndexRef.current = 0;
        updateSearchResultItems(mode, structured);
        if (text) {
            setInSearchMode(mode);
            setSearchText(text);
        } else {
            setInSearchMode(mode);
        }
    }, [structured, updateSearchResultItems]);

    const updateSearchViewDelayed = useCallback((text: string): void => {
        if (text.length === 0) {
            onSearchModeChanged(false);
        } else if (!structured) {
            propsRef.current.libraryController.raiseEvent(
                propsRef.current.libraryController.SearchTextUpdatedEventName, text
            );
            onSearchModeChanged(true, text);
        }
    }, [structured, onSearchModeChanged]);

    const onTextChanged = useCallback((text: string): void => {
        if (!generatedSectionsRef.current) return;
        clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            const hasText = text.length > 0;
            const p = propsRef.current;
            if (p.libraryController.searchLibraryItemsHandler) {
                p.libraryController.searchLibraryItemsHandler(
                    text.length === 0 ? "r" : text,
                    (loadedTypesJsonOnSearch: any) => {
                        if (hasText) {
                            generatedSectionsOnSearchRef.current =
                                LibraryUtilities.buildLibrarySectionsFromLayoutSpecs(
                                    loadedTypesJsonOnSearch, layoutSpecsJsonRef.current,
                                    p.defaultSectionString, p.miscSectionString
                                );
                            updateSections(generatedSectionsOnSearchRef.current);
                            LibraryUtilities.setItemStateRecursive(
                                generatedSectionsOnSearchRef.current, true, true
                            );
                        } else {
                            LibraryUtilities.setItemStateRecursive(
                                generatedSectionsRef.current, true, false
                            );
                        }
                        updateSearchViewDelayed(text);
                    }
                );
            } else {
                LibraryUtilities.searchItemResursive(generatedSectionsRef.current, text);
                if (text.length === 0) {
                    LibraryUtilities.setItemStateRecursive(generatedSectionsRef.current, true, false);
                }
                updateSearchViewDelayed(text);
            }
        }, 300) as unknown as number;
    }, [updateSections, updateSearchViewDelayed]);

    const onDetailedModeChanged = useCallback((value: boolean): void => {
        setDetailed(value);
    }, []);

    const onCategoriesChanged = useCallback((categories: string[], categoryData: CategoryData[]): void => {
        if (searcherRef.current) {
            searcherRef.current.categories = categories;
        }
        updateSearchResultItems(true, structured);
        setSelectedCategories(categories);
        propsRef.current.libraryController.raiseEvent(
            propsRef.current.libraryController.FilterCategoryEventName, categoryData
        );
    }, [structured, updateSearchResultItems]);

    // ── Keyboard navigation ──────────────────────────────────────────────────

    // Use a ref-based handler pattern so the stable listener always sees latest state
    const handleKeyDownRef = useRef<(event: KeyboardEvent) => void>(() => {});
    handleKeyDownRef.current = (event: KeyboardEvent) => {
        if (!inSearchMode || structured) return;
        const key = (event as any).key;
        if (key !== "ArrowUp" && key !== "ArrowDown") return;

        const selectNext = key === "ArrowDown";
        const items = searchResultItemsRef.current;
        let nextIndex = selectNext
            ? selectionIndexRef.current + 1
            : selectionIndexRef.current - 1;
        const maxIndex = items.length - 1;
        if (nextIndex < 0 && maxIndex >= 0) nextIndex = 0;
        if (nextIndex >= maxIndex) nextIndex = maxIndex;
        handleRef.current.setSelection(nextIndex);
    };

    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => handleKeyDownRef.current(e);
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // ── directToLibrary ──────────────────────────────────────────────────────

    const directToLibrary = useCallback((pathToItem: LibraryUtilities.ItemData[]): void => {
        if (!generatedSectionsRef.current) return;
        LibraryUtilities.setItemStateRecursive(generatedSectionsRef.current, true, false);
        if (LibraryUtilities.findAndExpandItemByPath(pathToItem.slice(0), generatedSectionsRef.current)) {
            onSearchModeChanged(false);
        }
    }, [onSearchModeChanged]);

    // ── Render ───────────────────────────────────────────────────────────────

    if (!generatedSections) {
        const eventName = props.libraryController.RefreshLibraryViewRequestName;
        props.libraryController.request(eventName);
        return <div>This is LibraryContainer</div>;
    }

    try {
        let sections: React.ReactNode = null;
        let index = 0;

        if (!inSearchMode) {
            sections = generatedSections.map(data =>
                <LibraryItem
                    key={index++}
                    libraryContainer={handleRef.current}
                    data={data}
                    showItemSummary={showItemSummary}
                    tooltipContent={tooltipContent}
                />
            );
        } else if (structured) {
            sections = searchResultItemsRef.current.map(item =>
                <LibraryItem
                    key={index++}
                    data={item}
                    libraryContainer={handleRef.current}
                    showItemSummary={showItemSummary}
                    tooltipContent={tooltipContent}
                />
            );
        } else {
            // Clear refs before rebuilding to avoid stale entries
            searchResultItemRefsRef.current = [];
            sections = searchResultItemsRef.current.map(item =>
                <SearchResultItem
                    ref={(handle: SearchResultItemHandle | null) => {
                        if (handle) searchResultItemRefsRef.current.push(handle);
                    }}
                    index={index}
                    key={index++}
                    data={item}
                    libraryContainer={handleRef.current}
                    highlightedText={searchText}
                    detailed={detailed}
                    onParentTextClicked={directToLibrary}
                />
            );
        }

        const searchBar = (
            <SearchBar
                onCategoriesChanged={onCategoriesChanged}
                onDetailedModeChanged={onDetailedModeChanged}
                onTextChanged={onTextChanged}
                categories={searcherRef.current?.getDisplayedCategories() ?? []}
            />
        );

        return (
            <div className="LibraryContainer" ref={containerDivRef}>
                {searchBar}
                <div className="LibraryItemContainer">
                    <div className="SearchResultsWrapper">
                        {sections}
                    </div>
                </div>
            </div>
        );
    } catch (exception: any) {
        return <div>Exception thrown: {exception.message}</div>;
    }
}
