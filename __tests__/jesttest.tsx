import * as React from 'react';
import * as TestUtils from 'react-dom/lib/ReactTestUtils';
import {shallow} from 'enzyme';
import { mount } from 'enzyme';
import {expect} from 'chai';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryContainer }  from '../src/components/LibraryContainer';
import { LibraryItem } from '../src/components/LibraryItem';
import { ItemData } from "../src/LibraryUtilities";

describe("sample test", function () {
  it("should add two numbers", function () {
    expect(1 + 2).to.equal(3);
  });
});

describe("LibraryContainer", function () {
  let loadedTypesJson: any;
  let layoutSpecsJson: any;
  let libController: LibraryEntryPoint.LibraryController;

  beforeEach(function () {
    loadedTypesJson = {
      "loadedTypes": [{
        "fullyQualifiedName": "Child1",
        "iconUrl": "",
        "contextData": "Input",
        "itemType": "action",
        "keywords": ""
      },
      {
        "fullyQualifiedName": "Child2",
        "iconUrl": "",
        "contextData": "",
        "itemType": "action",
        "keywords": ""
      }
      ]
    };

    layoutSpecsJson = {
      "sections": [{
        "text": "default",
        "iconUrl": "",
        "elementType": "section",
        "showHeader": false,
        "include": [],
        "childElements": [{
          "text": "Parent",
          "iconUrl": "",
          "elementType": "category",
          "include": [{
            "path": "Child1"
          },
          {
            "path": "Child2"
          }
          ],
          "childElements": []
        }]
      },
      {
        "text": "Miscellaneous",
        "iconUrl": "",
        "elementType": "section",
        "showHeader": true,
        "include": [],
        "childElements": []
      }]
    };

    libController = LibraryEntryPoint.CreateLibraryController();
  });

  it("should create a LibraryContainer", function () {

    // shallow rendering renders a component only one-level deep, 
    // errors in children components wouldn't propagate to top level components,
    // this is useful when testing one component as a unit.
    let libContainer = shallow(
      libController.createLibraryContainer(layoutSpecsJson, loadedTypesJson)
    );

    // find is used to find a rendered component by css selectors, 
    // component constructors, display name or property selector.
    expect(libContainer.find('SearchView')).to.have.lengthOf(1);

    let libraryItem = libContainer.find('LibraryItem');
    expect(libraryItem).to.have.lengthOf(1);
    expect(libraryItem.prop('data').childItems).to.have.lengthOf(1);
    expect(libraryItem.prop('data').childItems[0].text).to.equal("Parent");
    expect(libraryItem.prop('data').childItems[0].itemType).to.equal("category");
    expect(libraryItem.prop('data').childItems[0].childItems).to.have.lengthOf(2);
    expect(libraryItem.prop('data').childItems[0].childItems[0].text).to.equal("Child1");
    expect(libraryItem.prop('data').childItems[0].childItems[1].text).to.equal("Child2");
  });
   describe("Test mouse click event and change in expand state", function () {
        it("Must recognise mouse event and change state", function () {
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
  
          let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} />);

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
});


