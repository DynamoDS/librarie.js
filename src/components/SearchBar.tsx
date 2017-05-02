import * as React from 'react';
import * as _ from 'underscore';

export interface SearchBarProps {
    onTextChange: Function;
    onStructuredModeChanged: Function;
    onDetailedModeChanged: Function;
    onCategoriesChange: Function;
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

    onTextChange(event: any) {
        this.props.onTextChange(event);
    }

    onOptionsButtonClick() {
        this.setState({ expanded: !this.state.expanded });
    }

    onStructuredModeChange(event: any) {
        this.props.onStructuredModeChanged();
        this.setState({ structured: !this.state.structured });
    }

    onDetailedModeChange(event: any) {
        this.props.onDetailedModeChanged();
        this.setState({ detailed: !this.state.detailed });
    }

    onAllCheckboxChange(event: any) {
        if (event.target.checked) {
            this.setState({ selectedCategories: this.props.categories });
            this.props.onCategoriesChange(this.props.categories);
        }
        else {
            this.setState({ selectedCategories: [] })
            this.props.onCategoriesChange([]);
        }
    }

    onCategoriesChange(event: any) {
        let categories = this.state.selectedCategories;
        if (event.target.checked) {
            if (!_.contains(this.state.selectedCategories, event.target.name)) {
                categories.push(event.target.name);
            }
        }
        else {
            categories = _.without(categories, event.target.name);
        }
        this.setState({ selectedCategories: categories })
        this.props.onCategoriesChange(categories);
    }

    allCategoriesSelected() {
        return (this.state.selectedCategories.length == this.props.categories.length);
    }

    isSelectedCategory(category: string) {
        return _.contains(this.state.selectedCategories, category);
    }

    createCheckbox(name: string, checkboxClassName: string, checked: boolean, onChangeFunc: any, displayText?: string): JSX.Element {
        let checkSymbol = checked ? <img className="CheckboxSymbol" src="/src/resources/UI/check-symbol.svg" /> : null;
        if (!displayText) displayText = name;

        let checkbox: JSX.Element =
            <label className="CheckboxLabel">
                {checkSymbol}
                <input type="checkbox" name={name} className={checkboxClassName} onChange={onChangeFunc} checked={checked} />
                <div className="CheckboxLabelText">{displayText}</div>
            </label>;
        return checkbox;
    }

    render() {
        let options = null;
        let searchOptionsBtn = <button id="SearchOptionsBtn" className="ArrowBg" onClick={this.onOptionsButtonClick.bind(this)}></button>;
        let thisObj = this;
        let checkboxes: JSX.Element[] = [];

        checkboxes.push(this.createCheckbox("All", "CategoryCheckbox", this.allCategoriesSelected(), this.onAllCheckboxChange.bind(this)));

        _.each(this.props.categories, function (c) {
            let checked = thisObj.isSelectedCategory(c);
            checkboxes.push(thisObj.createCheckbox(c, "CategoryCheckbox", checked, thisObj.onCategoriesChange.bind(thisObj)));
        })

        if (this.state.expanded) {
            searchOptionsBtn = <button id="SearchOptionsBtn" className="ArrowReversedBg" onClick={this.onOptionsButtonClick.bind(this)}></button>
            options =
                <div className="SearchOptions">
                    <div className="SearchOptionsContainer">
                        {this.createCheckbox("Structured", "SearchCheckbox", this.state.structured, this.onStructuredModeChange.bind(this), "Display as structured view")}
                        {this.createCheckbox("Detailed", "SearchCheckbox", this.state.detailed, this.onDetailedModeChange.bind(this), "Display detailed info")}
                    </div>
                    <div className="SearchOptionsContainer">
                        <div className="SearchOptionsHeader">Filter by category:</div>
                        <div className="CategoryCheckboxContainer">
                            {checkboxes}
                        </div>
                    </div></div>;
        }

        return (
            <div className="SearchBar">
                <div className="SearchInput">
                    <div className="SearchInputContainer">
                        <img src="/src/resources/UI/search.svg" className="SearchBarIcon"/>
                        <input id="SearchInputText" type="search" placeholder="Search..." onChange={this.onTextChange.bind(this)}></input>
                    </div>
                    {searchOptionsBtn}
                </div>
                {options}
            </div>
        );
    }
}