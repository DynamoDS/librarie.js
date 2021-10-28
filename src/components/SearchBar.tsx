import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'underscore';

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
}

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {

    categoryData: CategoryData[] = [];
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
            hasText: false
        };

        _.each(this.props.categories, function (c: string) {
            let data = new CategoryData(c, "CategoryCheckbox", true, this.onCategoriesChanged.bind(this));
            this.categoryData.push(data);
        }.bind(this));
    }

    UNSAFE_componentWillReceiveProps(newProps: SearchBarProps) {
        let oldState = this.state;
        this.setState({ selectedCategories: newProps.categories });

        let oldCategoryData = this.categoryData;
        this.categoryData = [];
        _.each(newProps.categories, function (c: string) {
            let oldCategory = oldCategoryData.find(x => x.name === c);
            let data = new CategoryData(c, "CategoryCheckbox", false, this.onCategoriesChanged.bind(this));
            if (oldCategory) {
                data.checked = oldCategory.checked;
            }
            this.categoryData.push(data);
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
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
                event.preventDefault();
               break;
            case "Escape":
                this.clearInput();
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

    onTextChanged(event: any) {
        let text = event.target.value.toLowerCase();
        let expanded = text.length == 0 ? false : this.state.expanded;
        let hasText = text.length > 0;

        if (this.state.hasText || hasText) {
            this.setState({ expanded: expanded, hasText: hasText });
            this.props.onTextChanged(text);
        }
    }

    onExpandButtonClick() {
        this.setState({ expanded: !this.state.expanded });
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

    onCategoriesChanged() {
        let selectedCategories: string[] = [];
        _.each(this.categoryData, function (data) {
            if (data.checked) selectedCategories.push(data.name);
        })
        this.setSelectedCategories(selectedCategories);
    }

    onApplyCategoryFilter(){
        let selectedCategories: string[] = [];
        _.each(this.categoryData, function (data) {
            if (data.checked) selectedCategories.push(data.name);
        })
        this.setSelectedCategories(selectedCategories);

    }

//    onAllButtonClicked() {
//        _.each(this.categoryData, function (category) {
//            category.checked = true;
//        })
//        this.setSelectedCategories(this.props.categories);
//    }

//    onOnlyButtonClicked(event: any): void {
//        _.each(this.categoryData, function (category) {
//            if (category.name == event.target.name) category.checked = true;
//            else category.checked = false;
//        })
//        this.setSelectedCategories([event.target.name]);
//    }

    setSelectedCategories(categories: string[]) {
        this.setState({ selectedCategories: categories })
        this.props.onCategoriesChanged(categories, this.categoryData);
    }

    getSearchOptionsBtnClass() {
        let searchOptionsBtnClass = this.state.hasText ? "SearchOptionsBtnEnabled" : "SearchOptionsBtnDisabled";
        return searchOptionsBtnClass;
    }

    getSearchOptionsDisabled() {
        let searchOptionsDisabled = this.state.hasText ? false : true; // Enable the button only when user is doing search
        return searchOptionsDisabled;
    }

    createClearFiltersButton(){

        const selectedCategoriesCount:number = this.state.selectedCategories.length;
        if(selectedCategoriesCount === 0)
            return null;

        const message = `Clear filters (${selectedCategoriesCount})`;


        return <button title={message}>
            {message}
        </button>
    }
    
    createFilterPanel(){
        let binIcon: string = require("../resources/ui/bin.svg");
        let checkboxes: JSX.Element[] = this.categoryData.map(cat => cat.createCheckbox(false))

        return <div className="SearchFilterPanel" ref={(container) => this.searchOptionsContainer = container}>
            <div className="header">
                <span>Filter by</span>
            </div>
            <div className="body">
                    {checkboxes}
            </div>
            <div className="footer">
                <button>Apply</button>
                <button>
                    <img className="Icon ClearFilters" src={binIcon} />
                </button>
            </div>
        </div>;
    }

    createFilterButton() {
        let searchFilterIcon: string = require("../resources/ui/search-filter.svg");
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
        let detailedBtnClass = this.state.hasText && !this.state.structured ? "SearchOptionsBtnEnabled" : "SearchOptionsBtnDisabled";
        let detailedBtnDisabled = this.state.hasText && !this.state.structured ? false : true;
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

        const isSearchingClass = this.state.hasText ? "isSearching" : "";

        return (
            <div className={`SearchBar ${isSearchingClass}`}>
                <div className="LibraryHeader">Library</div>
                <div className={`SearchInput ${isSearchingClass}`}>
                    <img className="Icon SeachBarIcon" src={searchIcon}/>
                    <input
                        className="SearchInputText"
                        type="input" placeholder="Search"
                        onChange={this.onTextChanged.bind(this)}
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
    checked: boolean;
    onChangedFunc: any = null;

    // Optional attributes
    displayText: string = null;

    constructor(name: string, className: string, checked: boolean, onChangedFunc: any, displayText?: string) {
        this.name = name;
        this.className = className;
        this.checked = checked;

        this.onChangedFunc = onChangedFunc;
        this.displayText = displayText ? displayText : name;
    }

    createCheckbox(enabled: boolean): JSX.Element {

        let checkbox: JSX.Element =
            <label className={"Category"} key={this.name}>
                <input type="checkbox" name={this.name} className={this.className} onChange={this.onCheckboxChanged.bind(this)} checked={this.checked}/>
                <div className="checkmark"/>
                <div>{this.displayText}</div>
            </label>;
        return checkbox;
    }

    onCheckboxChanged() {
        this.checked = !this.checked;
        this.onChangedFunc();
    }
}