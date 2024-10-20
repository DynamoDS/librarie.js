import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'underscore';
import { ObjectExtensions } from '../LibraryUtilities'
import { SearchIcon, ClearIcon } from './icons';

type StructuredModeChangedFunc = (structured: boolean) => void;

type DetailedModeChangedFunc = (detailed: boolean) => void;

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
    DELETE = "Delete",
    ESCAPE =  "Escape",
    KEYA = "A",
    KEYC = "C",
    KEYV = "V"
};

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    categoryData: {[key: string]: CategoryData} = {};
    searchOptionsContainer: HTMLDivElement | null = null;
    searchInputField: HTMLInputElement | null = null;
    filterBtn: HTMLButtonElement | null = null;

    constructor(props: SearchBarProps) {
        super(props);
        this.state = {
            expanded: false,
            selectedCategories: [],
            structured: false,
            detailed: false,
            hasText: false,
            hasFocus: false
        };

        _.each(this.props.categories, function (name: string) {
            this.categoryData[name] = new CategoryData(name, "CategoryCheckbox");
        }.bind(this));
    }

    UNSAFE_componentWillReceiveProps(newProps: SearchBarProps) {
        let oldCategoryData = this.categoryData;
        this.categoryData = {};
        
        _.each(newProps.categories, function (name: string) {
            this.categoryData[name] = oldCategoryData[name]
                ? oldCategoryData[name]
                : new CategoryData(name, "CategoryCheckbox");

        }.bind(this));

    }

    UNSAFE_componentWillMount() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("click", this.handleGlobalClick.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
        window.removeEventListener("click", this.handleGlobalClick.bind(this));
    }

    handleKeyDown(event: any) {
        if(event.ctrlKey === true) {
            switch (event.key) {
                case EventKey.KEYA:
                this.fullTextSelection();
                break;
                case (EventKey.KEYC):
                    this.copyToClipboard();
                    break;
                case (EventKey.KEYV):
                    this.pasteFromClipboard();
                break;
            }
        }

        switch (event.key) {
            case EventKey.ARROW_DOWN:
                event.preventDefault();
               break;
            case EventKey.ESCAPE:
                this.clearInput();
                break;
            case EventKey.DELETE:
                this.forwardDelete(event);
                break;
            default:
                if (event.target.className == "SearchInputText") {
                    this.searchInputField?.focus();
                }
                break;
        }
    }

    handleGlobalClick(event: any) {
        if (this.searchOptionsContainer && this.filterBtn) {
            // Check if the user is clicking on the search options container or the filter button.
            // If they are clicking outside of them, collapse the search options container
            if (!ReactDOM.findDOMNode(this.searchOptionsContainer).contains(event.target) &&
                !ReactDOM.findDOMNode(this.filterBtn).contains(event.target)) {
                this.setState({ expanded: false });
            }
        }
    }

    clearInput() {
        if (this.searchInputField) {
            this.searchInputField.value = '';
            this.props.onTextChanged(this.searchInputField.value);
            this.setState({ hasText: false });
        }
    }

    forwardDelete(event: any) {
        if (!this.searchInputField) return;
        let cursor = this.searchInputField.selectionStart ?? 0;
        const searchValueCopy = this.searchInputField.value.split("");
        const selectionLength = window.getSelection()?.toString().length === 0 ? 1 : window.getSelection()?.toString().length;
        searchValueCopy.splice(cursor, selectionLength);
        this.searchInputField.value = searchValueCopy.join("");
        this.searchInputField.focus();
        this.searchInputField.setSelectionRange(cursor, cursor);
        let hasText = this.searchInputField.value.length > 0;
        let expanded = !hasText ? false : this.state.expanded;
        
        if (this.state.hasText || hasText) {
            this.setState({ expanded: expanded, hasText: hasText });
            this.props.onTextChanged(this.searchInputField.value);
        }
    }

    fullTextSelection() {
        if (!this.searchInputField) return;

        this.searchInputField.focus();
        this.searchInputField.setSelectionRange(0, this.searchInputField.value.length);
    }

    async copyToClipboard() {
        if(!document.getSelection) return;
        let text =  document.getSelection()?.toString();
        
        //@ts-ignore
        if(chrome.webview === undefined) return;
        //@ts-ignore
        await chrome.webview.hostObjects.scriptObject.CopyToClipboard(text);
    }

    async pasteFromClipboard () {
        //@ts-ignore
        if(chrome.webview === undefined) return;
        //@ts-ignore
        let text = await chrome.webview.hostObjects.scriptObject.PasteFromClipboard();
        //@ts-ignore
        
        if(!this.searchInputField) return;
        
        const field = this.searchInputField;
        const searchValueCopy = field.value.split("");
        let cursor = field.selectionStart ?? 0;
        let selectionLength = 0;

        if(document.getSelection()) {
            selectionLength = document.getSelection()?.toString().length ?? 0;
        }
        
        searchValueCopy.splice(cursor, selectionLength, text);
        field.value = searchValueCopy.join("");
        field.focus();

        field.setSelectionRange(cursor + text.length, cursor + text.length);

        let hasText = field.value.length > 0;
        let expanded = !hasText ? false : this.state.expanded;

        if (this.state.hasText || hasText) {
            this.setState({ expanded: expanded, hasText: hasText });
            this.props.onTextChanged(field.value);
        }
    }

    onTextChanged(event: any) {
        let text = event.target.value.toLowerCase();
        let expanded = text.length == 0 ? false : this.state.expanded;
        let hasText = text.length > 0;

        if (this.state.hasText || hasText) {
            this.setState({ expanded: expanded, hasText: hasText });
            this.props.onTextChanged(text);
        }
    }

    onFocusChanged(hasFocus: boolean)
    {
        this.setState({hasFocus})
    }

    onExpandButtonClick() {
        this.setState(prevState => ({expanded: !prevState.expanded}));
    }

    onDetailedModeChanged(event: any) {
        this.setState(prevState => ({detailed: !prevState.detailed}));
        this.props.onDetailedModeChanged(!this.state.detailed);
    }

    getSelectedCategories(): string[]{
        return ObjectExtensions.values(this.categoryData)
            .filter(x => x.isChecked())
            .map(x => x.name);
    }

    onApplyCategoryFilter(){
        this.setSelectedCategories(this.getSelectedCategories())
        this.setState({expanded: false});
    }

    onClearCategoryFilters(){
        this.clearSelectedCategories();
        this.setSelectedCategories(this.getSelectedCategories());
    }

    clearSelectedCategories(){
        _.each(ObjectExtensions.values(this.categoryData), category => {
            category.setChecked(false);
        });
    }

    setSelectedCategories(selectedCategories: string[]) {
        this.setState({ selectedCategories })

        // If no selected categories, search should default to show all
        if(selectedCategories.length === 0)
            selectedCategories = Object.keys(this.categoryData);

        this.props.onCategoriesChanged(selectedCategories, ObjectExtensions.values(this.categoryData));
    }

    getSearchOptionsBtnClass() {
        let searchOptionsBtnClass = this.getSearchOptionsDisabled()
            ? "SearchOptionsBtnDisabled"
            : "SearchOptionsBtnEnabled" ;
            
        return searchOptionsBtnClass;
    }

    getSearchOptionsDisabled() {
        // Enable the button only when user is doing search
        let searchOptionsDisabled = this.state.hasText && this.props.categories.length > 0;
        return !searchOptionsDisabled;
    }

    createClearFiltersButton(){

        const selectedCategoriesCount:number = this.state.selectedCategories.length;
        if(selectedCategoriesCount === 0)
            return null;

        const message = `Clear filters (${selectedCategoriesCount})`;
        return <button title={message} onClick={this.onClearCategoryFilters.bind(this)}>
            {message}
        </button>
    }
    
    createFilterPanel(){
        let binIcon: string = require("../resources/ui/bin.svg");

        let checkboxes: React.ReactNode[] = ObjectExtensions.values(this.categoryData)
            .map(cat => cat.getCheckbox(this.state.selectedCategories.includes(cat.name)))

        return <div className="SearchFilterPanel" ref={(container) => this.searchOptionsContainer = container}>
            <div className="header">
                <span>Filter by</span>
            </div>
            <div className="body">
                    {checkboxes}
            </div>
            <div className="footer">
                <button onClick={this.onApplyCategoryFilter.bind(this)}>Apply</button>
                <button onClick={this.clearSelectedCategories.bind(this)}>
                    <img className="Icon ClearFilters" src={binIcon} />
                </button>
            </div>
        </div>;
    }

    createFilterButton() {
        let searchFilterIcon: string = this.state.expanded
            ? require("../resources/ui/search-filter-selected.svg")
            : require("../resources/ui/search-filter.svg");
        let filterPanel:any = this.state.expanded ? this.createFilterPanel() : null;

        // Create the filter panel
        return <div className="SearchFilterContainer">
        <button 
                className={this.getSearchOptionsBtnClass()} 
                onClick={this.onExpandButtonClick.bind(this)} 
                disabled={this.getSearchOptionsDisabled()} 
                ref={(button) => { this.filterBtn = button }}
                title="Filter results">
                    <img className="Icon SearchFilter" src={searchFilterIcon}/>
                </button>
                    {filterPanel}
        </div>
    }

    createDetailedButton() {
        let searchDetailedIcon: string = require("../resources/ui/search-detailed.svg");

        // Create the button to toggle between compact/detailed
        // This button is only enabled when the user is doing search and structured view is not enabled
        let detailedBtnDisabled = this.getSearchOptionsDisabled() || this.state.structured;
        let detailedBtnClass = detailedBtnDisabled
            ? "SearchOptionsBtnDisabled"
            : "SearchOptionsBtnEnabled";

        return <button 
            className={detailedBtnClass}
            onClick={this.onDetailedModeChanged.bind(this)} 
            disabled={detailedBtnDisabled} 
            title="Compact/Detailed View">
                 <img className="Icon SearchDetailed" src={searchDetailedIcon}/>
            </button>;
    }

    render() {

        let cancelButton: React.ReactNode = null;

        if (this.state.hasText) {
            cancelButton = (
                <button className="CancelButton" onClick={this.clearInput.bind(this)} >
                    <ClearIcon />
                </button>
            );
        }

        const isSearchingClass = this.state.hasText ? "searching" : "";
        const isFocusClass = this.state.hasFocus ? "focus" : "";

        return (
            <div className={`SearchBar ${isSearchingClass}`}>
                <div className="LibraryHeader">Library</div>
                <div className={`SearchInput ${isSearchingClass} ${isFocusClass}`}>
                    <SearchIcon />
                    <input
                        className="SearchInputText"
                        type="input" placeholder="Search"
                        onChange={this.onTextChanged.bind(this)}
                        onFocus={this.onFocusChanged.bind(this, true)}
                        onBlur={this.onFocusChanged.bind(this, false)}
                        ref={(field) => { this.searchInputField = field; }}>
                    </input>
            
                    {cancelButton}
                </div>
                <div className="SearchOptionContainer">
                    {this.createClearFiltersButton()}
                    {this.createFilterButton()}
                    {this.createDetailedButton()}
                </div>    
            </div>
        );
    }
}


export class CategoryData {
    name: string;
    className: string;
    checkboxReference: HTMLInputElement;
    setInputRef: (element: HTMLInputElement) => void;

    // Optional attributes
    displayText: string | null = null;

    constructor(name: string, className: string, displayText?: string) {
        this.name = name;
        this.className = className;
        this.setInputRef = element => {
            this.checkboxReference = element;
        };
        this.displayText = displayText ?? name;
    }

    getCheckbox(checked: boolean = false): React.ReactNode {

        let checkbox = <input 
            type="checkbox"
            name={this.name}
            className={this.className}
            onChange={this.onCheckboxChanged.bind(this)}
            defaultChecked={checked}
            ref={this.setInputRef}
            />

        return <label className={"Category"} key={this.name}>
                {checkbox}
                <div className="checkmark"/>
                <div>{this.displayText}</div>
            </label>;
    }

    isChecked(){
        return this.checkboxReference
            ? this.checkboxReference.checked
            : false;
    }

    setChecked(checked:boolean){
        if(this.checkboxReference)
            this.checkboxReference.checked = checked;
    }

    onCheckboxChanged(event: any) {
        this.checkboxReference.checked = event.target.checked;
    }
}