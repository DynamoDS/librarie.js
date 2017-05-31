import * as React from 'react';
import * as TestUtils from 'react-dom/lib/ReactTestUtils';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import * as LibraryEntryPoint from '../src/entry-point';
import LibraryContainer from '../src/components/LibraryContainer';
import LibraryItem from '../src/components/LibraryItem';

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
      libController.createLibraryContainer()
    );

    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();
    
    // find is used to find a rendered component by css selectors, 
    // component constructors, display name or property selector.
    expect(libContainer.find('SearchBar')).to.have.lengthOf(1);

    let libraryItem = libContainer.find('LibraryItem');
    expect(libraryItem).to.have.lengthOf(1);
    expect(libraryItem.prop('data').childItems).to.have.lengthOf(1);
    expect(libraryItem.prop('data').childItems[0].text).to.equal("Parent");
    expect(libraryItem.prop('data').childItems[0].itemType).to.equal("category");
    expect(libraryItem.prop('data').childItems[0].childItems).to.have.lengthOf(2);
    expect(libraryItem.prop('data').childItems[0].childItems[0].text).to.equal("Child1");
    expect(libraryItem.prop('data').childItems[0].childItems[1].text).to.equal("Child2");
  });
});


