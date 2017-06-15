import * as React from 'react';
import * as LibraryEntryPoint from '../../src/entry-point';
import { LibraryContainer } from '../../src/components/LibraryContainer';
import { LibraryItem } from '../../src/components/LibraryItem';
import { ItemData } from "../../src/LibraryUtilities";
import { shallow } from 'enzyme';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as chai from 'chai';

describe("LibraryContainer", function () {

  it("Test UI rendering of single component of Library Item", function () {
    // Test data to create LibraryItem  
    // Parent item that will hold the child items
    let data = new ItemData("");
    data.text = "TestItem";
    data.itemType = "none";

    // Create child items and link with parent
    for (var i = 0; i < 2; i++) {
      let item = new ItemData("");
      item.text = "Child" + i;
      item.itemType = "category";
      data.appendChild(item);
    }

    // Create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
    let libContainer = LibraryEntryPoint.CreateLibraryController();
    let libraryItem = shallow(<LibraryItem libraryContainer={libContainer} data={data} />);
    // When running for the first time creates a snapshot in __snapshots__ folder
    // To compare with the existing snapshot for subsequent running. 
    expect(toJson(libraryItem)).toMatchSnapshot();
  });

  it("Test UI rendering of Library Item and child components", function () {
    // Test data to create LibraryItem  
    // Parent item that will hold the child items
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
    // Create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
    let libContainer = LibraryEntryPoint.CreateLibraryController();
    // Render with mount to test child components
    let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} />);
    expect(toJson(libraryItem)).toMatchSnapshot();  // toJson serializes the output    
  });
});

