import * as React from 'react';
import * as _ from 'underscore';

interface StructuredModeChangedFunc {
    (structured: boolean): void;
}

interface DetailedModeChangedFunc {
    (detailed: boolean): void;
}

interface SearchCategoriesChangedFunc {
    (categories: string[]): void;
}

interface SearchTextChangedFunc {
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
}

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {

    categoryData: CategoryData[] = []

    constructor(props: SearchBarProps) {
        super(props);
        this.state = { expanded: false, selectedCategories: this.props.categories, structured: false, detailed: false };

        let thisObj = this;
        _.each(this.props.categories, function(c) {
            let data = new CategoryData(c, "CategoryCheckbox", true, thisObj.onCategoriesChanged.bind(thisObj));
            data.onOnlyButtonClicked = thisObj.onOnlyButtonClicked.bind(thisObj);
            thisObj.categoryData.push(data);
        })
    }

    onTextChanged(event: any) {
        this.props.onTextChanged(event);
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
        _.each(this.categoryData, function(data) {
            if (data.checked) selectedCategories.push(data.name);
        })
        this.setSelectedCategories(selectedCategories);
    }

    onAllButtonClicked() {
        _.each(this.categoryData, function(category) {
            category.checked = true;
        })
        this.setSelectedCategories(this.props.categories);
    }

    onOnlyButtonClicked(event: any) {
        _.each(this.categoryData, function(category) {
            if (category.name == event.target.name) category.checked = true;
            else category.checked = false;
        })
        this.setSelectedCategories([event.target.name]);
    }

    allCategoriesSelected() {
        return (this.state.selectedCategories.length == this.props.categories.length);
    }

    setSelectedCategories(categories: string[]) {
        this.setState({ selectedCategories: categories })
        this.props.onCategoriesChanged(categories);
    }

    render() {
        let options = null;
        let searchOptionsBtn = <button id="SearchOptionsBtn" onClick={this.onExpandButtonClick.bind(this)}><i className="fa fa-angle-double-down fa-2x"></i></button>;
        let thisObj = this;
        let checkboxes: JSX.Element[] = [];

        this.categoryData.forEach(category => checkboxes.push(category.createCheckbox()));

        let structuredCheckbox = new CategoryData("Structured", "SearchCheckbox", this.state.structured, this.onStructuredModeChanged.bind(this), "Display as structured view");
        let detailedCheckbox = new CategoryData("Detailed", "SearchCheckbox", this.state.detailed, this.onDetailedModeChanged.bind(this), "Display detailed info");

        if (this.state.expanded) {
            searchOptionsBtn = <button id="SearchOptionsBtn" onClick={this.onExpandButtonClick.bind(this)}><i className="fa fa-angle-double-up fa-2x"></i></button>
            options =
                <div className="SearchOptions">
                    <div className="SearchOptionsContainer">
                        {structuredCheckbox.createCheckbox()}
                        {detailedCheckbox.createCheckbox()}
                    </div>
                    <div className="SearchOptionsContainer">
                        <div className="SearchOptionsHeader">
                            <span>Filter by category:</span>
                            <div className="SelectAllBtn" onClick={this.onAllButtonClicked.bind(this)}>Select All</div>
                        </div>
                        <div className="CategoryCheckboxContainer">
                            {checkboxes}
                        </div>
                    </div></div>;
        }

        return (
            <div className="SearchBar">
                <div className="SearchInput">
                    <div className="SearchInputContainer">
                        <i className="fa fa-search SearchBarIcon"></i>
                        <input id="SearchInputText" type="search" placeholder="Search..." onChange={this.onTextChanged.bind(this)}></input>
                    </div>
                    {searchOptionsBtn}
                </div>
                {options}
            </div>
        );
    }
}

class CategoryData {
    name: string;
    className: string;
    checked: boolean;
    onChangedFunc: any = null;

    // Optional attributes
    displayText: string = null;
    onOnlyButtonClicked: any = null;

    constructor(name: string, className: string, checked: boolean, onChangedFunc: any, displayText?: string) {
        this.name = name;
        this.className = className;
        this.checked = checked;
        
        this.onChangedFunc = onChangedFunc;
        this.displayText = displayText ? displayText : name;
    }

    createCheckbox(): JSX.Element {
        let checkSymbol = this.checked ? <i className="fa fa-check CheckboxSymbol"></i> : null;

        let only = null;
        if (this.onOnlyButtonClicked) {
            // Show the "only" option if there is a callback function provided
            only = <label><input type="button" name={this.name} className="CheckboxLabelRightButton" onClick={this.onOnlyButtonClicked} value={"only"} /></label>
        }

        let checkbox: JSX.Element =
            <label className="CheckboxLabel">
                {checkSymbol}
                <input type="checkbox" name={this.name} className={this.className} onChange={this.onCheckboxChanged.bind(this)} checked={this.checked} />
                <div className="CheckboxLabelText">{this.displayText}</div>
                {only}
            </label>;
        return checkbox;
    }

    onCheckboxChanged() {
        this.checked = !this.checked;
        this.onChangedFunc();
    }
}