import * as React from 'react';
import { shallow, mount, configure } from 'enzyme';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryItem } from '../src/components/LibraryItem';
import { SearchResultItem } from '../src/components/SearchResultItem';
import { ItemData } from "../src/LibraryUtilities";
import * as Adapter from 'enzyme-adapter-react-16';
import * as chai from 'chai';

configure({adapter: new Adapter()});

describe("sample test", function () {
  it("should add two numbers", function () {
    chai.expect(1 + 2).to.equal(3);
  });
});

describe("LibraryContainer UI", function () {
  let loadedTypesJson: any;
  let layoutSpecsJson: any;
  let libController: LibraryEntryPoint.LibraryController;
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
  });
  it("should recognize mouse click event and change expand state", function () {
    // test data to create LibraryItem  
    // parent item that will hold the child items
    let data = new ItemData("");
    data.text = "TestItem";
    data.itemType = "none";

    // create child items and link with parent
    for (var i = 0; i < 2; i++) {
      let item = new ItemData("");
      item.text = "Child" + i;
      item.itemType = "category";
      data.appendChild(item);
    }

    // create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
    let libContainer = LibraryEntryPoint.CreateLibraryController();

    // Mount is "real" rendering that will actually render your component into a browser environment. 
    // If you are testing full React components, 
    // mount is used to do rendering  and test actions are simulated on mounted html

    let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} showItemSummary={false} />);

    chai.expect(libraryItem).to.have.lengthOf(1);
    chai.expect(libraryItem.props().data.childItems).to.have.lengthOf(2);
    chai.expect(libraryItem.props().data.text).to.equal("TestItem");
    chai.expect(libraryItem.props().data.showHeader).to.be.true;
    chai.expect(libraryItem.props().data.childItems[0].text).to.equal("Child0");
    chai.expect(libraryItem.props().data.childItems[1].text).to.equal("Child1");
    let header = libraryItem.find(('div.LibraryItemHeader')).at(0);// the state of LibraryItem is changed when clicking on header
    chai.expect(header).to.have.lengthOf(1); // verify that there is a header
    header.simulate('click'); // enzyme function to simulate mouse click
    chai.expect(libraryItem.state('expanded')).to.be.true; // check for if the libraryItem is expanded after mouse click       
  });

  it("should raise the onItemWillExpand when expanding", function (done) {
    // test data to create LibraryItem  
    // parent item that will hold the child items
    let data = new ItemData("");
    data.text = "TestItem";
    data.itemType = "none";

    // create child items and link with parent
    for (var i = 0; i < 2; i++) {
      let item = new ItemData("");
      item.text = "Child" + i;
      item.itemType = "category";
      data.appendChild(item);
    }

    // create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
    let libContainer = LibraryEntryPoint.CreateLibraryController();
    //pass a callback which if called will end the test
    let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} showItemSummary={false} onItemWillExpand={() => { done() }} />);

    let header = libraryItem.find(('div.LibraryItemHeader')).at(0);// the state of LibraryItem is changed when clicking on header
    chai.expect(header).to.have.lengthOf(1); // verify that there is a header
    header.simulate('click'); // enzyme function to simulate mouse click
    chai.expect(libraryItem.state('expanded')).to.be.true;
  });

  xit("scrollToElement should be called when libraryItem is expanded only", function () {

    // Test for positive scenario where the node names are correct
    let libContainer = mount(
      libController.createLibraryContainer()
    );
    // Load the data to libController
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    let header = libContainer.find('div.LibraryItemHeader').at(0);
    chai.expect(header).to.have.lengthOf(1);
    var count = 0;
    //replace the scroll method with a method which ends the test.
    libContainer.getNode().scrollToExpandedItem = () => { count = count + 1; }
    header.simulate('click');
    header.simulate('click');
    chai.assert.equal(count, 1);

  });


  // Test uses timeout function and testframework knows 
  // when to complete the test bases on calling funciton 'done()' 
  xit("search a string in library and verify change of state and results", function (done) {

    // Test for positive scenario where the node names are correct
    let libContainer = mount(
      libController.createLibraryContainer()
    );

    // Load the data to libController
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    // find is used to find a rendered component by css selectors, 
    // component constructors, display name or property selector.
    let text = () => libContainer.find('input.SearchInputText');
    // Set the search text in searchbar
    text().simulate('change', { target: { value: 'Child' } });
    chai.expect(text()).to.have.lengthOf(1);

    // Search is triggered after a timeout of 300 milli seconds
    // So wait before verifying the results 

    setTimeout(function () {
      // Verify the state 'inSearchMode' is changed
      chai.expect(libContainer.state('inSearchMode')).to.be.true;
      //let result = libContainer.find('div.LibraryItemContainer');
      // Verify the search results are correct
      let value = libContainer.find('SearchResultItem');
      chai.expect(value).to.have.lengthOf(2);
      chai.expect(value.at(0).props().data.text).to.equal("Child1");
      chai.expect(value.at(1).props().data.text).to.equal("Child2");
      done();// For testframework to figure out when to complete this test
    }, 500);
  });

  // Test uses timeout function and testframework knows 
  // when to complete the test bases on calling funciton 'done()' 
  xit("search a negative scenario for search", function (done) {

    // Test for negative scenario where search results are not found 
    let libContainer = mount(
      libController.createLibraryContainer()
    );
    // Load the data to libController
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    // find is used to find a rendered component by css selectors, 
    // component constructors, display name or property selector.
    let text = () => libContainer.find('input.SearchInputText');
    // Set the search string 'Point' with a node name that does not exist in library 
    text().simulate('change', { target: { value: 'Point' } });
    chai.expect(text()).to.have.lengthOf(1);
    // Search is triggered after a timeout of 300 milli seconds
    // So wait before verifying the results 

    setTimeout(function () {
      // Verify the state 'inSearchMode' is changed
      chai.expect(libContainer.state('inSearchMode')).to.be.true;
      //let result = libContainer.find('div.LibraryItemContainer');
      // Verify the search does not return any nodes
      let value = libContainer.find('SearchResultItem');
      chai.expect(value).to.have.lengthOf(0);
      done();// For testframework to figure out when to complete this test
    }, 500);
  });

  xit("change state of searchbar to detail view and verify the search results display item description", function (done) {

    // Change the search mode to detail view and verify the results display description  
    let libContainer = mount(
      libController.createLibraryContainer()
    );
    // Load the data to libController
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    // Trigger the search so the option for detail view is enabled
    let text = () => libContainer.find('input.SearchInputText');
    // Set the search string 
    text().simulate('change', { target: { value: 'Child' } });
    chai.expect(text()).to.have.lengthOf(1);
    // Find the div for Detailed view and click on it
    let option = libContainer.find('button.SearchOptionsBtnEnabled');
    let detail = option.find('[title="Compact/Detailed View"]');
    chai.expect(detail).to.have.lengthOf(1);
    detail.simulate('click');
    // Verify the detailed view is active
    chai.expect(libContainer.state('detailed')).to.be.true;

    setTimeout(function () {    // Search has timeout delay so verify results after the search is displayed
      // Get the search results   
      let value = libContainer.find('SearchResultItem');
      chai.expect(value).to.have.lengthOf(2);
      chai.expect(value.at(0).props().data.text).to.equal("Child1");
      chai.expect(value.at(1).props().data.text).to.equal("Child2");
      // Make sure the search results has correct item description
      let describe = libContainer.find('div.ItemDescription');
      chai.expect(describe).to.have.lengthOf(2);
      chai.expect(describe.at(0).text()).to.equal('First item');
      chai.expect(describe.at(1).text()).to.equal('Second item');
      done(); // For testframework to know when to terminate execution
    }, 500);
  });

  xit("search bar should not contain structured view button", function () {
    let libContainer = mount(
      libController.createLibraryContainer()
    );

    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    let buttons = libContainer.find('button');
    //detail view, filter.
    chai.expect(buttons).to.have.lengthOf(2);

    // Trigger the search so the option for detail view is enabled
    let text = () => libContainer.find('input.SearchInputText');
    // Set the search string 
    text().simulate('change', { target: { value: 'Child' } });
    chai.expect(text()).to.have.lengthOf(1);
    // Find the buttons in the search
    buttons = libContainer.find('button');
    //detail view, filter, and x button//
    chai.expect(buttons).to.have.lengthOf(3);

  });

  xit("click item text on search should return to the library item", function (done) {

    // create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
    let libContainer = mount(
      libController.createLibraryContainer()
    );

    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    // Trigger the search so the option for detail view is enabled
    let text = () => libContainer.find('input.SearchInputText');
    // Set the search string 
    text().simulate('change', { target: { value: 'Child' } });
    chai.expect(text()).to.have.lengthOf(1);

    // Find the div for Detailed view and click on it
    let option = libContainer.find('button.SearchOptionsBtnEnabled');
    let detail = option.find('[title="Compact/Detailed View"]');
    chai.expect(detail).to.have.lengthOf(1);
    detail.simulate('click');
   
    setTimeout(function () {    // Search has timeout delay so verify results after the search is displayed
      // Get the search results   
      let value = libContainer.find('SearchResultItem');
      chai.expect(value).to.have.lengthOf(2);
      chai.expect(value.at(0).props().data.text).to.equal("Child1");
      chai.expect(value.at(1).props().data.text).to.equal("Child2");

      //make the library item expanded to false.
      value.at(0).props().data.pathToItem[0].expanded = false;
      
      let detials = libContainer.find('div.ItemParent');
      //click the item text
      detials.at(0).simulate('click');
      chai.expect(value.at(0).props().data.pathToItem[0].expanded).to.be.true;
      done();
    }, 500);
  });

  xit("coregroup items should auto expand", function () {
        // Test for positive scenario where the node names are correct
        let libContainer = mount(
          libController.createLibraryContainer()
        );
        // Load the data to libController
        libController.setLoadedTypesJson(loadedTypesJson, false);
        libController.setLayoutSpecsJson(layoutSpecsJson, false);
        libController.refreshLibraryView();
    
        let header = libContainer.find('div.LibraryItemHeader').at(0);
        chai.expect(header).to.have.lengthOf(1);
        
        header.simulate('click');

        let libraryItem = libContainer.find('LibraryItem');
        chai.expect(libraryItem.nodes[2].props.data.expanded).to.be.true; 

      });
    
      it("add-ons should auto expand", function () {
        // Test for positive scenario where the node names are correct
        let libContainer = mount(
          libController.createLibraryContainer()
        );
        // Load the data to libController
        libController.setLoadedTypesJson(loadedTypesJson, false);
        libController.setLayoutSpecsJson(layoutSpecsJson, false);
        libController.refreshLibraryView();

        let generatedSections = libContainer.instance().generatedSections;
        chai.expect(generatedSections).to.have.lengthOf(2);
        chai.expect(generatedSections[1].text).to.equal("Add-ons");
        chai.expect(generatedSections[1].expanded).to.be.true; 
        
      });
});
