import * as React from 'react';
import * as _ from 'underscore';

export interface SearchBarProps {
    onTextChange: Function;
    onStructuredModeChanged: Function;
    onDetailedModeChanged: Function;
    onCategoriesChange: Function;
    categories: string[];
}

export interface SearchBarState { expanded: boolean; selectedCategories: string[] }

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {

    constructor(props: SearchBarProps) {
        super(props);
        this.state = { expanded: false, selectedCategories: [] };
    }

    onTextChange(event: any) {
        this.props.onTextChange(event);
    }

    onOptionsButtonClick() {
        this.setState({ expanded: !this.state.expanded });
    }

    onStructuredModeChange(event: any) {
        this.props.onStructuredModeChanged();
    }

    onDetailedModeChange(event: any) {
        this.props.onDetailedModeChanged();
    }

    onAllCheckboxChange(event: any) {
        if (event.target.checked) {
            this.setState({ selectedCategories: this.props.categories });
        }
        else {
            this.setState({ selectedCategories: [] })
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

    isAllSelected() {
        return (this.state.selectedCategories.length == this.props.categories.length);
    }

    isSelectedCategory(category: string) {
        return _.contains(this.state.selectedCategories, category);
    }

    render() {
        let options = null;
        let searchOptionsBtn = <button id="SearchOptionsBtn" className="ArrowBg" onClick={this.onOptionsButtonClick.bind(this)}></button>;
        let thisObj = this;
        let checkboxes: JSX.Element[] = [];

        checkboxes.push(<input type="checkbox" name="All" className="OptionCheckbox" onChange={this.onAllCheckboxChange.bind(thisObj)}
            checked={this.isAllSelected()} />);
        checkboxes.push(<span className="OptionText">All</span>);
        checkboxes.push(<br />);

        _.each(this.props.categories, function (c) {
            let checked = thisObj.isSelectedCategory(c);
            checkboxes.push(<input type="checkbox" name={c} className="OptionCheckbox" onChange={thisObj.onCategoriesChange.bind(thisObj)}
                checked={checked} />);
            checkboxes.push(<span className="OptionText">{c}</span>);
            checkboxes.push(<br />);
        })

        if (this.state.expanded) {
            searchOptionsBtn = <button id="SearchOptionsBtn" className="ArrowReversedBg" onClick={this.onOptionsButtonClick.bind(this)}></button>
            options =
                <div className="SearchOptions"><div className="SearchOptionsContainer">
                    <input type="checkbox" className="OptionCheckbox" onChange={this.onStructuredModeChange.bind(this)} />
                    <span className="OptionText">Display as structured view</span><br />
                    <input type="checkbox" className="OptionCheckbox" onChange={this.onDetailedModeChange.bind(this)} />
                    <span className="OptionText">Display detailed info</span>
                </div>
                    <div className="SearchOptionsContainer">
                        Filter by category:
                <div className="CategoryContainer">
                            {checkboxes}
                        </div>
                    </div></div>;
        }

        return (
            <div className="SearchBar">
                <div className="SearchInput">
                    <div className="SearchInputContainer">
                        <img src="/src/resources/UI/search.svg" />
                        <input id="SearchInputText" type="search" placeholder="Search..." onChange={this.onTextChange.bind(this)}></input>
                    </div>
                    {searchOptionsBtn}
                </div>
                {options}
            </div>
        );
    }
}