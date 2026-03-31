/**
 * @jest-environment jsdom
 */
import { shallow, mount, configure } from 'enzyme';
import { expect } from 'chai';
import * as LibraryEntryPoint from '../src/entry-point';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import { ItemData } from '../src/LibraryUtilities';
import { act } from 'react-dom/test-utils';
configure({adapter: new Adapter()});

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
          "childElements": []
        }
      ]
    };

    libController = LibraryEntryPoint.CreateLibraryController();
  });

  it("should throw exception if set with an invalid loadedTypesJson", function () {
    // Rendering registers the handlers synchronously in the component body
    shallow(libController.createLibraryContainer());

    // loadedTypesJson is null
    expect(function () {
      libController.setLoadedTypesJson(null, false);
    }).to.throw("Parameter 'loadedTypesJson' must be supplied");

    // loadedTypesJson is invalid
    expect(function () {
      libController.setLoadedTypesJson({ "loadedTypes": "Hello!" }, false);
    }).to.throw("'loadedTypesJson.loadedTypes' must be a valid array");
  });

  it("should throw exception if set with an invalid layoutSpecsJson", function () {
    shallow(libController.createLibraryContainer());

    // layoutSpecsJson is null
    expect(function () {
      libController.setLayoutSpecsJson(null, false);
    }).to.throw("Parameter 'layoutSpecsJson' must be supplied");

    // layoutSpecsJson is invalid
    expect(function () {
      libController.setLayoutSpecsJson({ "sections": "Hello!" }, false);
    }).to.throw("'layoutSpecsJson.sections' must be a valid array");
  });

  it("should accept valid loadedTypesJson without throwing", function () {
    shallow(libController.createLibraryContainer());

    // Should not throw with valid data
    expect(function () {
      libController.setLoadedTypesJson(loadedTypesJson, false);
    }).to.not.throw();
  });

  it("should accept valid layoutSpecsJson without throwing", function () {
    shallow(libController.createLibraryContainer());

    // Should not throw with valid data
    expect(function () {
      libController.setLayoutSpecsJson(layoutSpecsJson, false);
    }).to.not.throw();
  });

  //TODO: it("should append the loadedTypesJson correctly");
  //TODO: it("should append the layoutSpecsJson correctly");

  it("should populate and render the LibraryItems correctly", function () {

    // shallow rendering renders a component only one-level deep,
    // errors in children components wouldn't propagate to top level components,
    // this is useful when testing one component as a unit.
    let libContainer = shallow(
      libController.createLibraryContainer()
    );

    act(() => {
      libController.setLoadedTypesJson(loadedTypesJson, false);
      libController.setLayoutSpecsJson(layoutSpecsJson, false);
      libController.refreshLibraryView();
    });
    libContainer.update();

    // find is used to find a rendered component by css selectors,
    // component constructors, display name or property selector.
    expect(libContainer.find('SearchBar')).to.have.lengthOf(1);

    let libraryItem = libContainer.find('LibraryItem');
    expect(libraryItem).to.have.lengthOf(1);
    expect((libraryItem.prop<ItemData>('data')).childItems).to.have.lengthOf(1);
    expect((libraryItem.prop<ItemData>('data')).childItems[0].text).to.equal("Parent");
    expect((libraryItem.prop<ItemData>('data')).childItems[0].itemType).to.equal("category");
    expect((libraryItem.prop<ItemData>('data')).childItems[0].childItems).to.have.lengthOf(2);
    expect((libraryItem.prop<ItemData>('data')).childItems[0].childItems[0].text).to.equal("Child1");
    expect((libraryItem.prop<ItemData>('data')).childItems[0].childItems[1].text).to.equal("Child2");
  });

});
