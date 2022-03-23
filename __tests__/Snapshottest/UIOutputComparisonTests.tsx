/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as LibraryEntryPoint from '../../src/entry-point';
import { LibraryContainer } from '../../src/components/LibraryContainer';
import { LibraryItem } from '../../src/components/LibraryItem';
import { ItemData } from "../../src/LibraryUtilities";
import { shallow, configure } from 'enzyme';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as Adapter from 'enzyme-adapter-react-16';
import * as chai from 'chai';

configure({adapter: new Adapter()});

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
    let libraryItem = shallow(<LibraryItem libraryContainer={libContainer} data={data} showItemSummary={false} />);
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
    let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} showItemSummary={false} />);
    expect(toJson(libraryItem)).toMatchSnapshot();  // toJson serializes the output    
  });
  it("Demonstrate testing UIitems loads correctly from static data", function () {
    // This is demo test to show how to test the LibrayUI is rendered correctly
    // Dynamo dynamcally generates the data in the libraryUI
    // So this test does not ensure all the required items are loaded there
    let layoutSpecsJson = require("../../docs/LayoutSpecs.json");
    let loadedTypesJson = require("../../docs/RawTypeData.json");
    let libController = LibraryEntryPoint.CreateLibraryController();
    // Render with mount to test child components
    const tree =mount(libController.createLibraryContainer()
      ); // required to dump the html version of librarie.js
      // create the library Controleer with the static data in the libraryui project 
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();
    let libContainer = LibraryEntryPoint.CreateLibraryController();
    // Search for all LibraryItems      
    let text = tree.find('div.LibraryItemText');
    expect(toJson(text)).toMatchSnapshot();
  });
});

