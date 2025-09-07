/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import * as LibraryEntryPoint from '../../src/entry-point';
import { LibraryItem } from '../../src/components/LibraryItem';
import { ItemData } from "../../src/LibraryUtilities";
import { createLibraryItem } from "../../src/utils";

describe("LibraryContainer", function () {
  // Test data to create LibraryItem  
    // Parent item that will hold the child items
  let data = createLibraryItem(ItemData);

  // Create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
  let libcontroller = LibraryEntryPoint.CreateLibraryController()
  let libContainer = render(libcontroller.createLibraryContainer())

  // Creation of LibraryItem component 
  const libraryItemComponent = <LibraryItem libraryContainer={libContainer as any} data={data} showItemSummary={false} />;

  it("Test UI rendering of single component of Library Item", function () {
    // "LibraryItem" with render() to testing component as a unit.
    const {container} = render(libraryItemComponent);

    // When running for the first time creates a snapshot in __snapshots__ folder
    // To compare with the existing snapshot for subsequent running. 
    expect(container).toMatchSnapshot();
  });

  it("Test UI rendering of Library Item and child components", function () {
    // Render with render() to test child components
    const { container } = render(libraryItemComponent);
    expect(container).toMatchSnapshot(); 
  });

  it("Demonstrate testing UIitems loads correctly from static data", function () {
    // This is demo test to show how to test the LibrayUI is rendered correctly
    // Dynamo dynamcally generates the data in the libraryUI
    // So this test does not ensure all the required items are loaded there
    const layoutSpecsJson = require("../../docs/LayoutSpecs.json");
    const loadedTypesJson = require("../../docs/RawTypeData.json");
    const libController = LibraryEntryPoint.CreateLibraryController();
    
    // Render with render() to test child components
    const { container } = render(libController.createLibraryContainer()); 
    
    // required to dump the html version of librarie.js
    // create the library Controleer with the static data in the libraryui project 
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();
    
    // Search for all LibraryItems      
    const text = container.querySelectorAll('.LibraryItemText');
    const serializedNodes = Array.from(text).map((node)=> node.outerHTML).join("\n");
    expect(serializedNodes).toMatchSnapshot();
  });
});

