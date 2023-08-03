import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'underscore';
import { ObjectExtensions } from '../LibraryUtilities'

interface StructuredModeChangedFunc {
    (structured: boolean): void;
}

interface DetailedModeChangedFunc {
    (detailed: boolean): void;
}

interface SearchCategoriesChangedFunc {
    (categories: string[], categoryData: CategoryData[]): void;
}

interface SearchTextChangedFunc {
    (event: any): void;
}

interface SearchBarExpandedFunc {
    (event: any): void;
}

export interface SearchBarProps {
    onTextChanged: SearchTextChangedFunc;
    onStructuredModeChanged: StructuredModeChangedFunc;
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
    ARROW_LEFT = "ArrowLeft",
    ARROW_RIGHT = "ArrowRight",
    DELETE = "Delete",
    ESCAPE =  "Escape"
};

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    categoryData: {[key: string]: CategoryData} = {};
    searchOptionsContainer: HTMLDivElement = null;
    searchInputField: HTMLInputElement = null;
    filterBtn: HTMLButtonElement = null;

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
        // window.handleKeyDown = this.handleKeyDown();
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("click", this.handleGlobalClick.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
        window.removeEventListener("click", this.handleGlobalClick.bind(this));
    }

    handleKeyDown(event: any) {
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
                    this.searchInputField.focus();
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
        searchValueCopy.splice(cursor, 1);
        this.searchInputField.value = searchValueCopy.join("");
        this.searchInputField.focus();
        this.searchInputField.setSelectionRange(cursor, cursor);
        this.props.onTextChanged(this.searchInputField.value);
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
        let expanded = !this.state.expanded;
        this.setState({ expanded });
    }

    onStructuredModeChanged(event: any) {
        let value = !this.state.structured;
        this.props.onStructuredModeChanged(value);
        this.setState({ structured: value });
    }

    onDetailedModeChanged(event: any) {
        let value = !this.state.detailed;
        this.props.onDetailedModeChanged(value);
        this.setState({ detailed: value });
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
        let searchOptionsDisabled = this.state.hasText && this.props.categories.length > 0
            ? false
            : true; // Enable the button only when user is doing search
        return searchOptionsDisabled;
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

        console.log(this.state.selectedCategories)
        let checkboxes: JSX.Element[] = ObjectExtensions.values(this.categoryData)
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

        let cancelButton: JSX.Element = null;
        let searchIcon: string = require("../resources/ui/search-icon.svg");
        let searchIconClear: string = require("../resources/ui/search-icon-clear.svg");


        if (this.state.hasText) {
            cancelButton = (
                <button className="CancelButton" onClick={this.clearInput.bind(this)} >
                    <img className="Icon ClearSearch" src={searchIconClear}/>
                </button>
            );
        }

        const isSearchingClass = this.state.hasText ? "searching" : "";
        const isFocusClass = this.state.hasFocus ? "focus" : "";

        return (
            <div className={`SearchBar ${isSearchingClass}`}>
                <div className="LibraryHeader">Library</div>
                <div className={`SearchInput ${isSearchingClass} ${isFocusClass}`}>
                    <img className="Icon SeachBarIcon" src={searchIcon}/>
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
    checkboxReference:HTMLInputElement;

    // Optional attributes
    displayText: string = null;

    constructor(name: string, className: string, displayText?: string) {
        this.name = name;
        this.className = className;

        this.displayText = displayText ? displayText : name;
    }

    getCheckbox(checked: boolean = false): JSX.Element {

        let checkbox = <input 
            type="checkbox"
            name={this.name}
            className={this.className}
            onChange={this.onCheckboxChanged.bind(this)}
            defaultChecked={checked}
            ref={cb => {this.checkboxReference = cb}}/>

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