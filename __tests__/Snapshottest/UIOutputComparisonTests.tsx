import * as React from 'react';
//import * as TestUtils from 'react-dom/lib/ReactTestUtils';
import * as LibraryEntryPoint from '../../src/entry-point';
import { LibraryContainer } from '../../src/components/LibraryContainer';
import { LibraryItem } from '../../src/components/LibraryItem';
import { ItemData } from "../../src/LibraryUtilities";
import * as renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';


describe("LibraryContainer", function () {
  let loadedTypesJson: any;
  let layoutSpecsJson: any;
  let libController: LibraryEntryPoint.LibraryController;

  it("Test UI rendering of single component Library Item", function () {
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
    let libraryItem = shallow(<LibraryItem libraryContainer={libContainer} data={data} />);
    // When running for the first time creates a snapshot in __snapshots__ folder
    // To compare with the existing snapshot for subsequent running. 
    expect(toJson(libraryItem)).toMatchSnapshot();  
  });

  it("Test UI rendering of Library Item and child components", function () {
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
    //Render wiht mount to test child components
    let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} />);
    expect(toJson(libraryItem)).toMatchSnapshot();  // toJson serializes the output
  });
});

