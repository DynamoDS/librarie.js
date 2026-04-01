import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import * as _ from 'underscore';
import { ObjectExtensions } from '../LibraryUtilities';
import { SearchIcon, ClearIcon } from './icons';
import { useStableWindowListener } from './componentHelpers';

type StructuredModeChangedFunc = (structured: boolean) => void;
type DetailedModeChangedFunc   = (detailed: boolean) => void;
type SearchCategoriesChangedFunc = (categories: string[], categoryData: CategoryData[]) => void;
type SearchTextChangedFunc = (event: any) => void;
type SearchBarExpandedFunc = (event: any) => void;

export interface SearchBarProps {
    onTextChanged: SearchTextChangedFunc;
    onDetailedModeChanged: DetailedModeChangedFunc;
    onCategoriesChanged: SearchCategoriesChangedFunc;
    categories: string[];
}

export interface SearchBarState {
    expanded: boolean;
    selectedCategories: string[];
    structured: boolean;
    detailed: boolean;
    hasText: boolean;
    hasFocus: boolean;
}

enum EventKey {
    ARROW_DOWN = "ArrowDown",
    DELETE     = "Delete",
    ESCAPE     = "Escape",
    KEYA       = "A",
    KEYC       = "C",
    KEYV       = "V"
}

export function SearchBar(props: SearchBarProps) {
    const { onTextChanged, onDetailedModeChanged, onCategoriesChanged, categories } = props;

    const [expanded, setExpanded]                 = useState(false);
    const [selectedCategories, setSelectedCats]   = useState<string[]>([]);
    const [detailed, setDetailed]                 = useState(false);
    const [hasText, setHasText]                   = useState(false);
    const [hasFocus, setHasFocus]                 = useState(false);

    // DOM refs (replace old instance variables)
    const searchOptionsContainerRef = useRef<HTMLDivElement | null>(null);
    const searchInputFieldRef       = useRef<HTMLInputElement | null>(null);
    const filterBtnRef              = useRef<HTMLButtonElement | null>(null);

    // categoryData is a mutable map; not state because its mutations don't need re-renders.
    // It is initialised lazily on first render.
    const categoryDataRef = useRef<{ [key: string]: CategoryData } | null>(null);
    if (categoryDataRef.current === null) {
        const initial: { [key: string]: CategoryData } = {};
        categories.forEach(name => {
            initial[name] = new CategoryData(name, "CategoryCheckbox");
        });
        categoryDataRef.current = initial;
    }

    // Sync categoryData when the categories prop reference changes
    useEffect(() => {
        const old = categoryDataRef.current ?? {};
        const updated: { [key: string]: CategoryData } = {};
        categories.forEach(name => {
            updated[name] = old[name] ?? new CategoryData(name, "CategoryCheckbox");
        });
        categoryDataRef.current = updated;
    }, [categories]);

    // ── Clipboard helpers (Dynamo-specific chrome.webview API) ───────────────

    async function copyToClipboard() {
        if (!document.getSelection) return;
        const text = document.getSelection()?.toString();
        // @ts-ignore
        if (chrome.webview === undefined) return;
        // @ts-ignore
        await chrome.webview.hostObjects.scriptObject.CopyToClipboard(text);
    }

    async function pasteFromClipboard() {
        // @ts-ignore
        if (chrome.webview === undefined) return;
        // @ts-ignore
        const text = await chrome.webview.hostObjects.scriptObject.PasteFromClipboard();
        const field = searchInputFieldRef.current;
        if (!field) return;

        const searchValueCopy = field.value.split("");
        const cursor = field.selectionStart ?? 0;
        const selectionLength = document.getSelection()?.toString().length ?? 0;
        searchValueCopy.splice(cursor, selectionLength, text);
        field.value = searchValueCopy.join("");
        field.focus();
        field.setSelectionRange(cursor + text.length, cursor + text.length);

        const newHasText = field.value.length > 0;
        const newExpanded = !newHasText ? false : expanded;
        if (hasText || newHasText) {
            setExpanded(newExpanded);
            setHasText(newHasText);
            onTextChanged(field.value);
        }
    }

    function fullTextSelection() {
        const field = searchInputFieldRef.current;
        if (!field) return;
        field.focus();
        field.setSelectionRange(0, field.value.length);
    }

    function clearInput() {
        const field = searchInputFieldRef.current;
        if (!field) return;
        field.value = '';
        onTextChanged(field.value);
        setHasText(false);
    }

    function forwardDelete(event: any) {
        const field = searchInputFieldRef.current;
        if (!field) return;
        const cursor = field.selectionStart ?? 0;
        const searchValueCopy = field.value.split("");
        const selectionLength =
            window.getSelection()?.toString().length === 0
                ? 1
                : window.getSelection()?.toString().length;
        searchValueCopy.splice(cursor, selectionLength);
        field.value = searchValueCopy.join("");
        field.focus();
        field.setSelectionRange(cursor, cursor);
        const newHasText = field.value.length > 0;
        const newExpanded = !newHasText ? false : expanded;
        if (hasText || newHasText) {
            setExpanded(newExpanded);
            setHasText(newHasText);
            onTextChanged(field.value);
        }
    }

    // ── Global event handlers ────────────────────────────────────────────────

    useStableWindowListener("keydown", (event: any) => {
        if (event.ctrlKey) {
            switch (event.key) {
                case EventKey.KEYA: fullTextSelection();  return;
                case EventKey.KEYC: copyToClipboard();    return;
                case EventKey.KEYV: pasteFromClipboard(); return;
            }
        }
        switch (event.key) {
            case EventKey.ARROW_DOWN:
                event.preventDefault();
                break;
            case EventKey.ESCAPE:
                clearInput();
                break;
            case EventKey.DELETE:
                forwardDelete(event);
                break;
            default:
                if (event.target.className === "SearchInputText") {
                    searchInputFieldRef.current?.focus();
                }
                break;
        }
    });

    useStableWindowListener("click", (event: any) => {
        const optionsEl = searchOptionsContainerRef.current;
        const filterEl  = filterBtnRef.current;
        if (optionsEl && filterEl) {
            if (!optionsEl.contains(event.target) && !filterEl.contains(event.target)) {
                setExpanded(false);
            }
        }
    });

    // ── Internal helpers ─────────────────────────────────────────────────────

    function getSelectedCategories(): string[] {
        return ObjectExtensions.values(categoryDataRef.current ?? {})
            .filter(x => x.isChecked())
            .map(x => x.name);
    }

    function setSelectedCategories(cats: string[]) {
        setSelectedCats(cats);
        const effective = cats.length === 0
            ? Object.keys(categoryDataRef.current ?? {})
            : cats;
        onCategoriesChanged(effective, ObjectExtensions.values(categoryDataRef.current ?? {}));
    }

    function clearSelectedCategories() {
        _.each(ObjectExtensions.values(categoryDataRef.current ?? {}), cat => {
            cat.setChecked(false);
        });
    }

    function getSearchOptionsDisabled() {
        return !(hasText && categories.length > 0);
    }

    // ── Event handlers for UI controls ───────────────────────────────────────

    function handleTextChanged(event: any) {
        const text = event.target.value.toLowerCase();
        const newExpanded = text.length === 0 ? false : expanded;
        const newHasText  = text.length > 0;
        if (hasText || newHasText) {
            setExpanded(newExpanded);
            setHasText(newHasText);
            onTextChanged(text);
        }
    }

    function handleFocusChanged(focus: boolean) {
        setHasFocus(focus);
    }

    function handleExpandButtonClick() {
        setExpanded(prev => !prev);
    }

    function handleDetailedModeChanged() {
        const next = !detailed;
        setDetailed(next);
        onDetailedModeChanged(next);
    }

    function handleApplyCategoryFilter() {
        setSelectedCategories(getSelectedCategories());
        setExpanded(false);
    }

    function handleClearCategoryFilters() {
        clearSelectedCategories();
        setSelectedCategories(getSelectedCategories());
    }

    // ── Sub-element builders ─────────────────────────────────────────────────

    function createClearFiltersButton(): React.ReactNode {
        const count = selectedCategories.length;
        if (count === 0) return null;
        const message = `Clear filters (${count})`;
        return (
            <button title={message} onClick={handleClearCategoryFilters}>
                {message}
            </button>
        );
    }

    function createFilterPanel(): React.ReactNode {
        const binIcon: string = require("../resources/ui/bin.svg");
        const checkboxes = ObjectExtensions.values(categoryDataRef.current ?? {})
            .map(cat => cat.getCheckbox(selectedCategories.includes(cat.name)));

        return (
            <div
                className="SearchFilterPanel"
                ref={el => { searchOptionsContainerRef.current = el; }}
            >
                <div className="header"><span>Filter by</span></div>
                <div className="body">{checkboxes}</div>
                <div className="footer">
                    <button onClick={handleApplyCategoryFilter}>Apply</button>
                    <button onClick={clearSelectedCategories}>
                        <img className="Icon ClearFilters" src={binIcon} />
                    </button>
                </div>
            </div>
        );
    }

    function createFilterButton(): React.ReactNode {
        const searchFilterIcon: string = expanded
            ? require("../resources/ui/search-filter-selected.svg")
            : require("../resources/ui/search-filter.svg");
        const filterPanel = expanded ? createFilterPanel() : null;
        const searchOptionsBtnClass = getSearchOptionsDisabled()
            ? "SearchOptionsBtnDisabled"
            : "SearchOptionsBtnEnabled";

        return (
            <div className="SearchFilterContainer">
                <button
                    className={searchOptionsBtnClass}
                    onClick={handleExpandButtonClick}
                    disabled={getSearchOptionsDisabled()}
                    ref={el => { filterBtnRef.current = el; }}
                    title="Filter results"
                >
                    <img className="Icon SearchFilter" src={searchFilterIcon} />
                </button>
                {filterPanel}
            </div>
        );
    }

    function createDetailedButton(): React.ReactNode {
        const searchDetailedIcon: string = require("../resources/ui/search-detailed.svg");
        const detailedBtnDisabled = getSearchOptionsDisabled();
        const detailedBtnClass = detailedBtnDisabled
            ? "SearchOptionsBtnDisabled"
            : "SearchOptionsBtnEnabled";

        return (
            <button
                className={detailedBtnClass}
                onClick={handleDetailedModeChanged}
                disabled={detailedBtnDisabled}
                title="Compact/Detailed View"
            >
                <img className="Icon SearchDetailed" src={searchDetailedIcon} />
            </button>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────

    const isSearchingClass = hasText  ? "searching" : "";
    const isFocusClass     = hasFocus ? "focus"     : "";

    const cancelButton = hasText
        ? <button className="CancelButton" onClick={clearInput}><ClearIcon /></button>
        : null;

    return (
        <div className={`SearchBar ${isSearchingClass}`}>
            <div className="LibraryHeader">Library</div>
            <div className={`SearchInput ${isSearchingClass} ${isFocusClass}`}>
                <SearchIcon />
                <input
                    className="SearchInputText"
                    type="input"
                    placeholder="Search"
                    onChange={handleTextChanged}
                    onFocus={() => handleFocusChanged(true)}
                    onBlur={() => handleFocusChanged(false)}
                    ref={el => { searchInputFieldRef.current = el; }}
                />
                {cancelButton}
            </div>
            <div className="SearchOptionContainer">
                {createClearFiltersButton()}
                {createFilterButton()}
                {createDetailedButton()}
            </div>
        </div>
    );
}


export class CategoryData {
    name: string;
    className: string;
    checkboxReference: HTMLInputElement;
    setInputRef: (element: HTMLInputElement) => void;
    displayText: string | null = null;

    constructor(name: string, className: string, displayText?: string) {
        this.name = name;
        this.className = className;
        this.setInputRef = element => { this.checkboxReference = element; };
        this.displayText = displayText ?? name;
    }

    getCheckbox(checked: boolean = false): React.ReactNode {
        const checkbox = (
            <input
                type="checkbox"
                name={this.name}
                className={this.className}
                onChange={this.onCheckboxChanged.bind(this)}
                defaultChecked={checked}
                ref={this.setInputRef}
            />
        );
        return (
            <label className={"Category"} key={this.name}>
                {checkbox}
                <div className="checkmark" />
                <div>{this.displayText}</div>
            </label>
        );
    }

    isChecked(): boolean {
        return this.checkboxReference ? this.checkboxReference.checked : false;
    }

    setChecked(checked: boolean): void {
        if (this.checkboxReference) this.checkboxReference.checked = checked;
    }

    onCheckboxChanged(event: any): void {
        this.checkboxReference.checked = event.target.checked;
    }
}
