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
            selectedCategories: this.props.categories,
            structured: false,
            detailed: false,
            hasText: false
        };

        _.each(this.props.categories, function (c: string) {
            let data = new CategoryData(c, "CategoryCheckbox", true, this.onCategoriesChanged.bind(this));
            data.onOnlyButtonClicked = this.onOnlyButtonClicked.bind(this);
            this.categoryData.push(data);
        }.bind(this));
    }

    componentWillReceiveProps(newProps: SearchBarProps) {
        let oldState = this.state;
        this.setState({ selectedCategories: newProps.categories });

        let oldCategoryData = this.categoryData;
        this.categoryData = [];
        _.each(newProps.categories, function (c: string) {
            let oldCategory = oldCategoryData.find(x => x.name === c);
            let data = new CategoryData(c, "CategoryCheckbox", true, this.onCategoriesChanged.bind(this));
            data.onOnlyButtonClicked = this.onOnlyButtonClicked.bind(this);
            if (oldCategory) {
                data.checked = oldCategory.checked;
            }
            this.categoryData.push(data);
        }.bind(this));
    }

    componentWillMount() {
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
                this.searchInputField.focus();
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
        // Escape special chars
        let text = encodeURIComponent(event.target.value.toLowerCase());
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

    createFilterButton() {
        // Create the filter button
        let filterBtn = <button className={this.getSearchOptionsBtnClass()} onClick={this.onExpandButtonClick.bind(this)} disabled={this.getSearchOptionsDisabled()} ref={(button) => { this.filterBtn = button }} title="Filter results"><i className="fa fa-filter"></i></button>;
        return filterBtn;
    }

    createStructuredButton() {
        let structuredBtnClass = this.state.structured ? "fa fa-dedent" : "fa fa-indent";

        // Create the button to toggle structured state
        let structuredBtn = <button className={this.getSearchOptionsBtnClass()} onClick={this.onStructuredModeChanged.bind(this)} disabled={this.getSearchOptionsDisabled()} title="Structured view"><i className={structuredBtnClass}></i></button>;
        return structuredBtn;
    }

    createDetailedButton() {
        // Create the button to toggle between compact/detailed
        // This button is only enabled when the user is doing search and structured view is not enabled
        let detailedBtnClass = this.state.hasText && !this.state.structured ? "SearchOptionsBtnEnabled" : "SearchOptionsBtnDisabled";
        let detailedBtnDisabled = this.state.hasText && !this.state.structured ? false : true;
        let detailedBtn = <button className={detailedBtnClass} onClick={this.onDetailedModeChanged.bind(this)} disabled={detailedBtnDisabled} title="Compact/Detailed View"><i className="fa fa-align-justify"></i></button>;
        return detailedBtn;
    }

    render() {

        let options = null;
        let checkboxes: JSX.Element[] = [];
        let cancelButton: JSX.Element = null;

        this.categoryData.forEach(category => checkboxes.push(category.createCheckbox(true)));

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
                    <div className="SearchOptionsContainerArrow"></div>
                    <div className="SearchOptionsContainer" ref={(container) => this.searchOptionsContainer = container}>
                        <div className="SearchOptionsHeader">
                            <span>Filter:</span>
                            <div className="SelectAllBtn" onClick={this.onAllButtonClicked.bind(this)}>Select All</div>
                        </div>
                        <div className="CategoryCheckboxContainer">
                            {checkboxes}
                        </div>
                    </div></div>;
        }

        return (
            <div className="SearchBar">
                <div className="LibraryHeader">
                    Library
                    <div>
                        |{this.createFilterButton()}|{this.createDetailedButton()}
                    </div>
                </div>
                <div className="SearchInput">
                    <div>
                        <i className="fa fa-search SearchBarIcon"></i>
                        <input
                            className="SearchInputText"
                            type="input" placeholder="Search..."
                            onChange={this.onTextChanged.bind(this)}
                            ref={(field) => { this.searchInputField = field; }}>
                        </input>
                    </div>
                    {cancelButton}
                </div>
                {options}
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
            only = <label><input type="button" name={this.name} className="CheckboxLabelRightButton" onClick={this.onOnlyButtonClicked} value={"only"} /></label>
        }

        let checkboxLabelText = enabled ? "CheckboxLabelEnabled" : "CheckboxLabelDisabled";
        let checkbox: JSX.Element =
            <label className={checkboxLabelText}>
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