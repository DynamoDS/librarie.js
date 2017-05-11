import * as React from 'react';
import * as _ from 'underscore';

export interface SearchBarProps {
    onTextChanged: Function;
    onStructuredModeChanged: Function;
    onDetailedModeChanged: Function;
    onCategoriesChanged: Function;
    categories: string[];
}

export interface SearchBarState {
    expanded: boolean;
    selectedCategories: string[];
    structured: boolean;
    detailed: boolean;
}

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {

    constructor(props: SearchBarProps) {
        super(props);
        this.state = { expanded: false, selectedCategories: this.props.categories, structured: false, detailed: false };
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

    onCategoriesChanged(event: any) {
        let categories = this.state.selectedCategories;
        if (event.target.checked) {
            if (!_.contains(this.state.selectedCategories, event.target.name)) {
                categories.push(event.target.name);
            }
        }
        else {
            categories = _.without(categories, event.target.name);
        }
        this.setSelectedCategories(categories);
    }

    onAllButtonClicked() {
        this.setSelectedCategories(this.props.categories);
    }

    onOnlyButtonClicked(event: any) {
        this.setSelectedCategories([event.target.name]);
    }

    allCategoriesSelected() {
        return (this.state.selectedCategories.length == this.props.categories.length);
    }

    isCategorySelected(category: string) {
        return _.contains(this.state.selectedCategories, category);
    }

    setSelectedCategories(categories: string[]) {
        this.setState({ selectedCategories: categories })
        this.props.onCategoriesChanged(categories);
    }

    createCheckbox(name: string, checkboxClassName: string, checked: boolean, onChangeFunc: any, displayText?: string): JSX.Element {
        let checkSymbol = checked ? <i className="fa fa-check CheckboxSymbol"></i> : null;
        if (!displayText) displayText = name;

        let only = null;
        if ((checkboxClassName == "CategoryCheckbox")) {
            only = <label><input type="button" name={name} className="CheckboxLabelRightButton" onClick={this.onOnlyButtonClicked.bind(this)} value={"only"}/></label>
        }

        let checkbox: JSX.Element =
            <label className="CheckboxLabel">
                {checkSymbol}
                <input type="checkbox" name={name} className={checkboxClassName} onChange={onChangeFunc} checked={checked} />
                <div className="CheckboxLabelText">{displayText}</div>
                {only}
            </label>;
        return checkbox;
    }

    render() {
        let options = null;
        let searchOptionsBtn = <button id="SearchOptionsBtn" onClick={this.onExpandButtonClick.bind(this)}><i className="fa fa-angle-double-down fa-2x"></i></button>;
        let thisObj = this;
        let checkboxes: JSX.Element[] = [];

        _.each(this.props.categories, function (c) {
            let checked = thisObj.isCategorySelected(c);
            checkboxes.push(thisObj.createCheckbox(c, "CategoryCheckbox", checked, thisObj.onCategoriesChanged.bind(thisObj)));
        })

        if (this.state.expanded) {
            searchOptionsBtn = <button id="SearchOptionsBtn" onClick={this.onExpandButtonClick.bind(this)}><i className="fa fa-angle-double-up fa-2x"></i></button>
            options =
                <div className="SearchOptions">
                    <div className="SearchOptionsContainer">
                        {this.createCheckbox("Structured", "SearchCheckbox", this.state.structured, this.onStructuredModeChanged.bind(this), "Display as structured view")}
                        {this.createCheckbox("Detailed", "SearchCheckbox", this.state.detailed, this.onDetailedModeChanged.bind(this), "Display detailed info")}
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