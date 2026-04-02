/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect as expectChai } from 'chai';
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
          "text": "Add-ons",
          "iconUrl": "",
          "elementType": "section",
          "showHeader": true,
          "include": [],
          "childElements": []
        }
      ]
    };

    libController = LibraryEntryPoint.CreateLibraryController();
  });

  it("should throw exception if set with an invalid loadedTypesJson", function () {
    render(libController.createLibraryContainer());

    expectChai(function () {
      libController.setLoadedTypesJson(null, false);
    }).to.throw("Parameter 'loadedTypesJson' must be supplied");

    expectChai(function () {
      libController.setLoadedTypesJson({ "loadedTypes": "Hello!" }, false);
    }).to.throw("'loadedTypesJson.loadedTypes' must be a valid array");
  });

  it("should throw exception if set with an invalid layoutSpecsJson", function () {
    render(libController.createLibraryContainer());

    expectChai(function () {
      libController.setLayoutSpecsJson(null, false);
    }).to.throw("Parameter 'layoutSpecsJson' must be supplied");

    expectChai(function () {
      libController.setLayoutSpecsJson({ "sections": "Hello!" }, false);
    }).to.throw("'layoutSpecsJson.sections' must be a valid array");
  });

  it("should accept valid loadedTypesJson without throwing", function () {
    render(libController.createLibraryContainer());

    expectChai(function () {
      libController.setLoadedTypesJson(loadedTypesJson, false);
    }).to.not.throw();
  });

  it("should accept valid layoutSpecsJson without throwing", function () {
    render(libController.createLibraryContainer());

    expectChai(function () {
      libController.setLayoutSpecsJson(layoutSpecsJson, false);
    }).to.not.throw();
  });

  describe("with library data loaded", function () {
    beforeEach(function () {
      render(libController.createLibraryContainer());
      act(() => {
        libController.setLoadedTypesJson(loadedTypesJson, false);
        libController.setLayoutSpecsJson(layoutSpecsJson, false);
        libController.refreshLibraryView();
      });
    });

    it("should set the loadedTypesJson correctly", function () {
      const parentItem = screen.getByText('Parent');
      fireEvent.click(parentItem);
      expect(screen.queryByText('Child1')).toBeInTheDocument();
      expect(screen.queryByText('Child2')).toBeInTheDocument();
    });

    it("should set the layoutSpecsJson correctly", function () {
      // "Add-ons" section is always preserved even when empty (special case in removeEmptyNodes)
      expect(screen.getByText("Add-ons")).toBeInTheDocument();
      // "Parent" category is rendered from the layout spec
      expect(screen.getByText("Parent")).toBeInTheDocument();
    });

    it("should populate and render the LibraryItems correctly", function () {
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('SearchInputText');

      const libraryItem = screen.getByText("Parent");
      expect(libraryItem).toBeInTheDocument();
      expect(libraryItem.closest('.LibraryItemContainerCategory')).not.toBeNull();
    });
  });

});
