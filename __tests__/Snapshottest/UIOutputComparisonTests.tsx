/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as LibraryEntryPoint from '../../src/entry-point';
import { LibraryItem } from '../../src/components/LibraryItem';
import { ItemData } from "../../src/LibraryUtilities";
import { createLibraryItem } from "../../src/utils";
import { mount, shallow, configure } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from '@cfaester/enzyme-adapter-react-18';

configure({adapter: new Adapter()});

describe("LibraryContainer", function () {
  // Test data to create LibraryItem  
    // Parent item that will hold the child items
  let data = createLibraryItem(ItemData);

  // Create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
  let libcontroller = LibraryEntryPoint.CreateLibraryController()
  let libContainer = mount(libcontroller.createLibraryContainer())

  // Creation of LibraryItem component 
  const libraryItemComponent = <LibraryItem libraryContainer={libContainer as any} data={data} showItemSummary={false} />;

  it("Test UI rendering of single component of Library Item", function () {
    // "LibraryItem" with Shallow rendering to testing component as a unit.
    let libraryItem = shallow(libraryItemComponent);

    // When running for the first time creates a snapshot in __snapshots__ folder
    // To compare with the existing snapshot for subsequent running. 
    expect(toJson(libraryItem)).toMatchSnapshot();
  });

  it("Test UI rendering of Library Item and child components", function () {
    // Render with mount to test child components
    let libraryItem = mount(libraryItemComponent);
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
    const tree =mount(libController.createLibraryContainer()); 
    
    // required to dump the html version of librarie.js
    // create the library Controleer with the static data in the libraryui project 
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();
    
    // Search for all LibraryItems      
    let text = tree.find('div.LibraryItemText');
    expect(toJson(text)).toMatchSnapshot();
  });
});

