import * as React from 'react';
import * as _ from 'underscore';

interface StructuredModeChangedFunc {
    (structured: boolean): void;
}

interface DetailedModeChangedFunc {
    (detailed: boolean): void;
}

interface ShowExpandableToolTipFunc {
    (ShowExpandableToolTip: boolean): void;
}

interface SearchCategoriesChangedFunc {
    (categories: string[]): void;
}

interface SearchTextChangedFunc {
    (event: any): void;
}

export interface SearchBarProps {
    onStructuredModeChanged: StructuredModeChangedFunc;
    onDetailedModeChanged: DetailedModeChangedFunc;
    onShowExpandableToolTipModeChanged: ShowExpandableToolTipFunc;
    onCategoriesChanged: SearchCategoriesChangedFunc;
    onTextChanged: SearchTextChangedFunc;
    categories: string[];
}

export interface SearchBarState {
    expanded: boolean;
    structured: boolean;
    detailed: boolean;
    showExpandableToolTip: boolean;
    hasText: boolean;
    selectedCategories: string[];
}

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {

    categoryData: CategoryData[] = []

    constructor(props: SearchBarProps) {
        super(props);
        this.state = {
            expanded: false,
            structured: false,
            detailed: false,
            showExpandableToolTip: false,
            hasText: false,
            selectedCategories: this.props.categories
        };

        _.each(this.props.categories, function (c: string) {
            let data = new CategoryData(c, "CategoryCheckbox", true, this.onCategoriesChanged.bind(this));
            data.onOnlyButtonClicked = this.onOnlyButtonClicked.bind(this);
            this.categoryData.push(data);
        }.bind(this));
    }

    clearInput() {
        let searchInput: any = document.getElementById("SearchInputText");
        searchInput.value = '';
        this.setState({
            hasText: false,
            expanded: false // collapse filter options menu when text is cleared
        });
        this.props.onTextChanged(searchInput.value);
    }

    onTextChanged(event: any) {
        let text = event.target.value.toLowerCase().replace(/ /g, '');
        let expanded = text.length == 0 ? false : this.state.expanded;

        this.setState({ expanded: expanded, hasText: text.length > 0 });
        this.props.onTextChanged(text);
    }

    onSearchOptionButtonClick() {
        this.setState({ expanded: !this.state.expanded });
    }

    onStructuredModeChanged(event: any) {
        let value = !this.state.structured;
        this.props.onStructuredModeChanged(value);
        this.setState({ structured: value });
    }

    onDetailedModeChanged(event: any) {
        // disable detailed mode in structured display mode
        if (!this.state.structured) {
            let value = !this.state.detailed;
            this.props.onDetailedModeChanged(value);
            this.setState({ detailed: value });
        }
    }

    onShowExpandableToolTipModeChanged(event: any) {
        let value = !this.state.showExpandableToolTip;
        this.props.onShowExpandableToolTipModeChanged(value);
        this.setState({ showExpandableToolTip: value });
    }

    onCategoriesChanged() {
        let selectedCategories: string[] = [];
        _.each(this.categoryData, function (data) {
            if (data.checked) selectedCategories.push(data.name);
        })
        this.setSelectedCategories(selectedCategories);
    }

    onAllButtonClicked() {
        _.each(this.categoryData, function (category) {
            category.checked = true;
        })
        this.setSelectedCategories(this.props.categories);
    }

    onOnlyButtonClicked(event: any) {
        _.each(this.categoryData, function (category) {
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
        let options: JSX.Element = null;
        let categoryCheckboxes: JSX.Element[] = [];
        let categoryCheckboxContainer: JSX.Element = null;
        let optionCheckboxes: JSX.Element[] = [];
        let cancelButton: JSX.Element = null;
        let filterOptionHeader: JSX.Element = null;
        let searchOptionsBtn = (
            <button id={"SearchOptionsBtn"} onClick={this.onSearchOptionButtonClick.bind(this)}>
                <i className="fa fa-filter"></i>
            </button>
        );

        let structuredCheckbox = new CategoryData(
            "Structured",
            "SearchCheckbox",
            this.state.structured,
            this.onStructuredModeChanged.bind(this),
            "Display as structured view"
        );
        let detailedCheckbox = new CategoryData(
            "Detailed",
            "SearchCheckbox",
            this.state.detailed,
            this.onDetailedModeChanged.bind(this),
            "Display detailed info"
        );
        let expandableTooltipCheckbox = new CategoryData(
            "ShowExpandedToolTip",
            "SearchCheckbox",
            this.state.showExpandableToolTip,
            this.onShowExpandableToolTipModeChanged.bind(this),
            "Show expandable tooltip"
        );

        if (this.state.hasText) {
            optionCheckboxes.push(structuredCheckbox.createCheckbox(true));
            optionCheckboxes.push(detailedCheckbox.createCheckbox(!this.state.structured));
            filterOptionHeader = (
                <div className="SearchOptionsHeader">
                    <span>Filter by category:</span>
                    <div className="SelectAllBtn" onClick={this.onAllButtonClicked.bind(this)}>Select All</div>
                </div>
            );
            this.categoryData.forEach(category => categoryCheckboxes.push(category.createCheckbox(true)));

            categoryCheckboxContainer = (
                <div className="SearchOptionsContainer">
                    {filterOptionHeader}
                    <div className="CategoryCheckboxContainer">
                        {categoryCheckboxes}
                    </div>
                </div>
            );
        }

        optionCheckboxes.push(expandableTooltipCheckbox.createCheckbox(true));

        if (this.state.hasText) {
            cancelButton = (
                <div className="CancelButton">
                    <button onClick={this.clearInput.bind(this)} >
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                </div>
            );
        }

        if (this.state.expanded) {
            options =
                <div className="SearchOptions">
                    <div className="SearchOptionsContainer">
                        {optionCheckboxes}
                    </div>
                    {categoryCheckboxContainer}
                </div>;
        }

        return (
            <div className="SearchBar">
                <div className="SearchInput">
                    <div className="SearchInputContainer">
                        <i className="fa fa-search SearchBarIcon"></i>
                        <input
                            id="SearchInputText"
                            type="input"
                            placeholder="Search..."
                            onChange={this.onTextChanged.bind(this)}>
                        </input>
                        {cancelButton}
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

    createCheckbox(enabled: boolean): JSX.Element {
        let checkSymbol = this.checked ? <i className="fa fa-check CheckboxSymbol"></i> : null;

        let only = null;
        if (this.onOnlyButtonClicked) {
            // Show the "only" option if there is a callback function provided
            only = (
                <label>
                    <input
                        type="button"
                        name={this.name}
                        className="CheckboxLabelRightButton"
                        onClick={this.onOnlyButtonClicked}
                        value={"only"}
                    />
                </label>
            );
        }

        let checkboxLabelText = enabled ? "CheckboxLabelEnabled" : "CheckboxLabelDisabled";
        let checkbox: JSX.Element =
            <label className={checkboxLabelText}>
                {checkSymbol}
                <input
                    type="checkbox"
                    name={this.name}
                    className={this.className}
                    onChange={this.onCheckboxChanged.bind(this)}
                    checked={this.checked}
                />
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