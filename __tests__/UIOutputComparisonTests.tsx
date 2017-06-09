import * as React from 'react';
//import * as TestUtils from 'react-dom/lib/ReactTestUtils';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryContainer } from '../src/components/LibraryContainer';
import { LibraryItem } from '../src/components/LibraryItem';
import { ItemData } from "../src/LibraryUtilities";
import * as renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import jest


describe("LibraryContainer", function () {
  let loadedTypesJson: any;
  let layoutSpecsJson: any;
  let libController: LibraryEntryPoint.LibraryController;


  it("Test that Library Item renders correctly", function () {
    // test data to create LibraryItem  
    // parent item that will hold the child items
    let data = new ItemData("");
    data.text = "TestItem";
    data.itemType = "none";

    // create child items and link with parent
    for (var i = 0; i < 2; i++) {
      let item = new ItemData("");
      item.text = "Child " + i;
      item.itemType = "category";
      data.appendChild(item);
    }

    // create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
    let libContainer = LibraryEntryPoint.CreateLibraryController();
    let libraryItem = shallow(<LibraryItem libraryContainer={libContainer} data={data} />);
    // When running for the first time creates a snapshot in __snapshots__ folder
    // To compare with the existing snapshot for subsequent running. 
    expect(libraryItem ).toMatchSnapshot();  
  });
});

