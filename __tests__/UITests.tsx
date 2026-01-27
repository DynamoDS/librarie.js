/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { mount, configure } from 'enzyme';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryItem } from '../src/components/LibraryItem';
import { ItemData } from "../src/LibraryUtilities";
import { createLibraryItem } from "../src/utils";
import Adapter from '@cfaester/enzyme-adapter-react-18';
import { expect } from 'chai';
import { LibraryContainer } from '../src/components/LibraryContainer';

configure({adapter: new Adapter()});

describe("LibraryContainer UI", function () {
  let loadedTypesJson: any;
  let layoutSpecsJson: any;
  let libController: LibraryEntryPoint.LibraryController;
  let libContainer: any;
  
  beforeEach(function () {
    loadedTypesJson = {
      "loadedTypes": [
        {
          "fullyQualifiedName": "Child1",
          "iconUrl": "",
          "contextData": "Input",
          "itemType": "action",
          "description": "First item",
          "keywords": ""
        },
        {
          "fullyQualifiedName": "Child2",
          "iconUrl": "",
          "contextData": "",
          "itemType": "action",
          "description": "Second item",
          "keywords": ""
        },
        {
          "fullyQualifiedName": "pkg://Clockwork.Core.Math.+1",
          "iconUrl": "/src/resources/icons/ba8cd7c7-346a-45c6-857e-e47800b80818.png",
          "contextData": "+1",
          "parameters": null,
          "itemType": "action",
          "keywords": "",
          "weight": 0,
          "description": null
        },
      ]
    };

    layoutSpecsJson = {
      "sections": [
        {
          "text": "default",
          "iconUrl": "",
          "elementType": "section",
          "showHeader": false,
          "include": [],
          "childElements": [
            {
              "text": "Parent",
              "iconUrl": "",
              "elementType": "category",
              "include": [],
              "childElements": [{
                "text": "Core",
                "iconUrl": "",
                "elementType": "group",
                "include": [{"path": "Child1" }, { "path": "Child2" }],
                "childElements":[]
              }]
            }
          ]
        },
        {
          "text": "Miscellaneous",
          "iconUrl": "",
          "elementType": "section",
          "showHeader": true,
          "include": [],
          "childElements": []
        },
        {
          "text": "Add-ons",
          "iconUrl": "",
          "elementType": "section",
          "showHeader": true,
          "include": [
            {
              "path": "pkg://"
            }
          ],
          "childElements": []
        }
      ]
    };

    libController = LibraryEntryPoint.CreateLibraryController();
    libContainer = mount(libController.createLibraryContainer())
  });

  it("should recognize mouse click event and change expand state", function () {
    // Test data to create LibraryItem  
    // Parent item that will hold the child items
    let data = createLibraryItem(ItemData);

    // Mount is "real" rendering that will actually render your component into a browser environment. 
    // If you are testing full React components, 
    // mount is used to do rendering  and test actions are simulated on mounted html

    let libraryItem = mount(<LibraryItem libraryContainer={libContainer as any} data={data} showItemSummary={false} />);

    expect(libraryItem).to.have.lengthOf(1);
    expect(libraryItem.props().data.childItems).to.have.lengthOf(2);
    expect(libraryItem.props().data.text).to.equal("TestItem");
    expect(libraryItem.props().data.showHeader).to.be.true;
    expect(libraryItem.props().data.childItems[0].text).to.equal("Child0");
    expect(libraryItem.props().data.childItems[1].text).to.equal("Child1");
    let header = libraryItem.find(('div.LibraryItemHeader')).at(0);// the state of LibraryItem is changed when clicking on header
    expect(header).to.have.lengthOf(1); // verify that there is a header
    header.simulate('click'); // enzyme function to simulate mouse click
    expect(libraryItem.state('expanded')).to.be.true; // check for if the libraryItem is expanded after mouse click       
  });

  it("should raise the onItemWillExpand when expanding", function (done) {
    // Test data to create LibraryItem  
    // Parent item that will hold the child items
    let data = createLibraryItem(ItemData);
    
    //pass a callback which if called will end the test
    let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} showItemSummary={false} onItemWillExpand={() => { done() }} />);

    let header = libraryItem.find(('div.LibraryItemHeader')).at(0);// the state of LibraryItem is changed when clicking on header
    expect(header).to.have.lengthOf(1); // verify that there is a header
    header.simulate('click'); // enzyme function to simulate mouse click
    expect(libraryItem.state('expanded')).to.be.true;
  });

  describe("", () => {
    beforeEach(() => {
      libContainer = mount(
        libController.createLibraryContainer()
      );

      // Load the data to libController
      libController.setLoadedTypesJson(loadedTypesJson, false);
      libController.setLayoutSpecsJson(layoutSpecsJson, false);
      libController.refreshLibraryView();
      libContainer.update();

    })

    it("scrollToElement should be called when libraryItem is expanded only", function () {
  
      let scrolled = false;
      let header = libContainer.find('div.LibraryItemHeader').at(0);
      expect(header).to.have.lengthOf(1);
  
      //replace the scroll method with a method which ends the test.
      (libContainer.instance() as unknown as LibraryContainer).scrollToExpandedItem = () => { scrolled = !scrolled;}
      header.simulate('click');
      expect(scrolled).to.be.true;
  
    });
  
  
    it("search a string in library and verify change of state and results", function () {
  
      // find is used to find a rendered component by css selectors, 
      // component constructors, display name or property selector.
      let text = () => libContainer.find('input.SearchInputText');
      // Set the search text in searchbar
      text().simulate('change', { target: { value: 'Child' } });
      expect(text()).to.have.lengthOf(1);
  
      // Search is triggered after a timeout of 300 milli seconds
      // So wait before verifying the results 
      setTimeout(function () {
        // Verify the state 'inSearchMode' is changed
        expect(libContainer.state('inSearchMode')).to.be.true;
        // Verify the search results are correct
        let value = libContainer.find('SearchResultItem');
        expect(value).to.have.lengthOf(2);
        expect((value.at(0).props() as any).data.text).to.equal("Child1");
        expect((value.at(1).props() as any).data.text).to.equal("Child2");
      }, 500);
    });
  
    it("search a negative scenario for search", function () {
  
      // find is used to find a rendered component by css selectors, 
      // component constructors, display name or property selector.
      let text = () => libContainer.find('input.SearchInputText');
      // Set the search string 'Point' with a node name that does not exist in library 
      text().simulate('change', { target: { value: 'Point' } });
      expect(text()).to.have.lengthOf(1);
      // Search is triggered after a timeout of 300 milli seconds
      // So wait before verifying the results 
  
      setTimeout(function () {
        // Verify the state 'inSearchMode' is changed
        expect(libContainer.state('inSearchMode')).to.be.true;
        //let result = libContainer.find('div.LibraryItemContainer');
        // Verify the search does not return any nodes
        let value = libContainer.find('SearchResultItem');
        expect(value).to.have.lengthOf(0);
      }, 500);
    });
  
    it("change state of searchbar to detail view and verify the search results display item description", function () {
  
      // Trigger the search so the option for detail view is enabled
      let text = () => libContainer.find('input.SearchInputText');
      // Set the search string 
      text().simulate('change', { target: { value: 'Child' } });
      expect(text()).to.have.lengthOf(1);
      // Find the div for Detailed view and click on it
      let option = libContainer.find('button.SearchOptionsBtnEnabled');
      let detail = option.find('[title="Compact/Detailed View"]');
      expect(detail).to.have.lengthOf(1);
      detail.simulate('click');
      // Verify the detailed view is active
      expect(libContainer.state('detailed')).to.be.true;
  
      setTimeout(function () {    // Search has timeout delay so verify results after the search is displayed
        // Get the search results   
        let value = libContainer.find('SearchResultItem');
        expect(value).to.have.lengthOf(2);
        expect((value.at(0).props() as any).data.text).to.equal("Child1");
        expect((value.at(1).props()as any).data.text).to.equal("Child2");
        // Make sure the search results has correct item description
        let describe = libContainer.find('div.ItemDescription');
        expect(describe).to.have.lengthOf(2);
        expect(describe.at(0).text()).to.equal('First item');
        expect(describe.at(1).text()).to.equal('Second item');
      }, 500);
    });
  
    it("search bar should not contain structured view button", function () {
  
      let buttons = libContainer.find('button');
      //detail view, filter.
      expect(buttons).to.have.lengthOf(2);
  
      // Trigger the search so the option for detail view is enabled
      let text = () => libContainer.find('input.SearchInputText');
      // Set the search string 
      text().simulate('change', { target: { value: 'Child' } });
      expect(text()).to.have.lengthOf(1);
      // Find the buttons in the search
      buttons = libContainer.find('button');
      //detail view, filter, and x button//
      expect(buttons).to.have.lengthOf(3);
  
    });
  
    it("click item text on search should return to the library item", function () {
  
      // Trigger the search so the option for detail view is enabled
      let text = () => libContainer.find('input.SearchInputText');
      // Set the search string 
      text().simulate('change', { target: { value: 'Child' } });
      expect(text()).to.have.lengthOf(1);
  
      // Find the div for Detailed view and click on it
      let option = libContainer.find('button.SearchOptionsBtnEnabled');
      let detail = option.find('[title="Compact/Detailed View"]');
      expect(detail).to.have.lengthOf(1);
      detail.simulate('click');
     
      setTimeout(function () {    // Search has timeout delay so verify results after the search is displayed
        // Get the search results   
        let value = libContainer.find('SearchResultItem');
        expect(value).to.have.lengthOf(2);
        expect((value.at(0).props() as any).data.text).to.equal("Child1");
        expect((value.at(1).props() as any).data.text).to.equal("Child2");
  
        //make the library item expanded to false.
        (value.at(0).props() as any).data.pathToItem[0].expanded = false;
        
        let detials = libContainer.find('div.ItemParent');
        //click the item text
        detials.at(0).simulate('click');
        expect((value.at(0).props() as any).data.pathToItem[0].expanded).to.be.true;
      }, 500);
    });
  
    it("add-ons should auto expand", function () {

      let generatedSections = libContainer.instance().generatedSections;
      expect(generatedSections).to.have.lengthOf(2);
      if(!generatedSections) return;
      expect(generatedSections[1].text).to.equal("Add-ons");
      expect(generatedSections[1].expanded).to.be.true; 
      
    });
  })

});
