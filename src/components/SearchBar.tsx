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

    onCategoriesChange(event: any) {
        let categories = this.state.selectedCategories;
        if (_.contains(this.state.selectedCategories, event.target.name)) {
            categories = _.without(categories, event.target.name);
        }
        else {
            categories.push(event.target.name);
        }
        this.setState({ selectedCategories: categories})
        this.props.onCategoriesChange(categories);
    }

    render() {
        let options = <div></div>;
        let searchOptionsBtn = <button id="SearchOptionsBtn" className="ArrowBg" onClick={this.onOptionsButtonClick.bind(this)}></button>;
        let thisObj = this;
        var checkboxes = [];
        _.each(this.props.categories, function (c) {
            let x = {c};
            checkboxes.push(<input type="checkbox" name={c} className="OptionCheckbox" onChange={thisObj.onCategoriesChange.bind(thisObj)}/>);
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