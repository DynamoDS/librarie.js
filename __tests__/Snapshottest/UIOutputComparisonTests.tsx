/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import * as LibraryEntryPoint from '../../src/entry-point';
import { LibraryItem } from '../../src/components/LibraryItem';
import { ItemData } from "../../src/LibraryUtilities";
import { createLibraryItem } from "../../src/utils";
import type { LibraryContainerHandle } from '../../src/components/LibraryContainer';
import { HostingContextType } from '../../src/SharedTypes';

function createMockHandle(): LibraryContainerHandle {
  return {
    get state() {
      return {
        inSearchMode: false,
        searchText: '',
        selectedCategories: [] as string[],
        structured: false,
        detailed: false,
        showItemSummary: false,
        tooltipContent: { create: '', action: '', query: '' },
        hostingContext: HostingContextType.none,
        shouldOverrideExpandedState: true,
      };
    },
    get selectionIndex() { return 0; },
    get props() {
      return {
        libraryController: LibraryEntryPoint.CreateLibraryController(),
        defaultSectionString: 'default',
        miscSectionString: 'Miscellaneous',
      };
    },
    setSelection(_index: number) {},
    raiseEvent(_name: string, _params?: any) {},
    scrollToExpandedItem(_element: HTMLElement | null) {},
    getContainerElement() { return null; },
    setShouldOverrideExpandedState(_value: boolean) {},
  };
}

describe("LibraryContainer", function () {
  const data = createLibraryItem(ItemData);
  const mockHandle = createMockHandle();

  it("Test UI rendering of single component of Library Item", function () {
    const { asFragment } = render(
      <LibraryItem libraryContainer={mockHandle} data={data} showItemSummary={false} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("Test UI rendering of Library Item and child components", function () {
    const { asFragment } = render(
      <LibraryItem libraryContainer={mockHandle} data={data} showItemSummary={false} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("Demonstrate testing UIitems loads correctly from static data", function () {
    const layoutSpecsJson = require("../../docs/LayoutSpecs.json");
    const loadedTypesJson = require("../../docs/RawTypeData.json");
    const libController = LibraryEntryPoint.CreateLibraryController();

    const { container } = render(libController.createLibraryContainer());

    act(() => {
      libController.setLoadedTypesJson(loadedTypesJson, false);
      libController.setLayoutSpecsJson(layoutSpecsJson, false);
      libController.refreshLibraryView();
    });

    const itemTexts = container.querySelectorAll('div.LibraryItemText');
    expect(itemTexts).toMatchSnapshot();
  });
});
