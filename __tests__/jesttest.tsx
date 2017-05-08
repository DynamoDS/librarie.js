import * as React from 'react';
import * as renderer from 'react-test-renderer';
import * as ReactTestUtils from 'react-dom/lib/ReactTestUtils';
import * as LibraryEntryPoint from '../src/entry-point';
import LibraryContainer from '../src/components/LibraryContainer';
import LibraryItem from '../src/components/LibraryItem';

var fs = require('fs');

test("add two numbers", function () {
  expect(1 + 2).toBe(3);
});

test("create library item", function () {

  let loadedTypesJson = {
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

  let layoutSpecsJson = {
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

  let libController = LibraryEntryPoint.CreateLibraryController();

  libController.on("itemClicked", function (item) {
    console.log(item);
  })

  libController.on("searchTextUpdated", function (searchText) {
    console.log(searchText);
    return null;
  });

  let libContainer = ReactTestUtils.renderIntoDocument(
    libController.createLibraryContainer(layoutSpecsJson, loadedTypesJson)
  );
});


