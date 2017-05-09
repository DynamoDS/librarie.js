import * as React from 'react';
import * as TestUtils from 'react-dom/lib/ReactTestUtils';
import {shallow} from 'enzyme';
import {expect} from 'chai';
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

    libController.on("itemClicked", function (item) {
      console.log(item);
    })

    libController.on("searchTextUpdated", function (searchText) {
      console.log(searchText);
      return null;
    });

  });

  it("should create a LibraryContainer", function () {
    let libContainer = shallow(
      libController.createLibraryContainer(layoutSpecsJson, loadedTypesJson)
    );

    expect(libContainer.find('SearchView')).to.have.lengthOf(1);
  });
});


