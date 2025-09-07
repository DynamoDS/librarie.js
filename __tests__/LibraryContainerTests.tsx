import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect as expectChai} from 'chai';
import * as LibraryEntryPoint from '../src/entry-point';

describe("LibraryContainer class", function () {
  let loadedTypesJson: any;
  let layoutSpecsJson: any;
  let libController: LibraryEntryPoint.LibraryController;

  beforeEach(function () {
    loadedTypesJson = {
      "loadedTypes": [
        {
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
      "sections": [
        {
          "text": "default",
          "iconUrl": "",
          "elementType": "section",
          "showHeader": false,
          "include": [],
          "childElements": [
            {
              "text": "Parent",
              "iconUrl": "",
              "elementType": "category",
              "include": [{ "path": "Child1" }, { "path": "Child2" }],
              "childElements": []
            }
          ]
        },
        {
          "text": "Miscellaneous",
          "iconUrl": "",
          "elementType": "section",
          "showHeader": true,
          "include": [],
          "childElements": [
            {
              "text": "Parent",
              "iconUrl": "",
              "elementType": "category",
              "include": [{ "path": "Child1" }, { "path": "Child2" }],
              "childElements": []
            }
          ]
        }
      ]
    };

    libController = LibraryEntryPoint.CreateLibraryController();
  });

  it("should throw exception if set with an invalid loadedTypesJson", function () {
    render(
      libController.createLibraryContainer()
    );

    // loadedTypesJson is null
    expectChai(function () {
      libController.setLoadedTypesJson(null, false);
    }).to.throw("Parameter 'loadedTypesJson' must be supplied");

    // loadedTypesJson is invalid
    expectChai(function () {
      libController.setLoadedTypesJson({ "loadedTypes": "Hello!" }, false);
    }).to.throw("'loadedTypesJson.loadedTypes' must be a valid array");
  });

  it("should throw exception if set with an invalid layoutSpecsJson", function () {
    render(
      libController.createLibraryContainer()
    );

    // layoutSpecsJson is null
    expectChai(function () {
      libController.setLayoutSpecsJson(null, false);
    }).to.throw("Parameter 'layoutSpecsJson' must be supplied");

    // layoutSpecsJson is invalid
    expectChai(function () {
      libController.setLayoutSpecsJson({ "sections": "Hello!" }, false);
    }).to.throw("'layoutSpecsJson.sections' must be a valid array");
  });

  it("should set the loadedTypesJson correctly", function () {
    render(
      libController.createLibraryContainer()
    );
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();
    
    const parentItem = screen.getByText('Parent');
    fireEvent.click(parentItem);
    expect(screen.queryByText('Child1')).toBeInTheDocument();
    expect(screen.queryByText('Child2')).toBeInTheDocument();
  });

  it("should set the layoutSpecsJson correctly", async function () {
    render(
      libController.createLibraryContainer()
    );

    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    expect(screen.getByText("Miscellaneous")).toBeInTheDocument();
  });

  //TODO: it("should append the loadedTypesJson correctly");

  //TODO: it("should append the layoutSpecsJson correctly");

  it("should populate and render the LibraryItems correctly", function () {
    
    render(
      libController.createLibraryContainer()
    );

    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

    // Looks for the searchInput element
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('SearchInputText');

    const libraryItem = screen.getByText("Parent");
    // Check Parent to be rendered
    expect(libraryItem).toBeInTheDocument();
    // Confirm itemType it's equal to "category" based on LibraryItemContainerCategory class
    expect(libraryItem.closest('.LibraryItemContainerCategory')).not.toBeNull();
    
  });

});
