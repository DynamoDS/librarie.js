import * as React from 'react';
import '@testing-library/jest-dom';
import { render, act, fireEvent } from '@testing-library/react';
import * as LibraryEntryPoint from '../../src/entry-point';
import { LibraryItem } from '../../src/components/LibraryItem';
import { ItemData } from "../../src/LibraryUtilities";
import { createLibraryItem } from "../../src/utils";
import { createMockHandle } from '../data/mock-data';

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
    const { asFragment, container } = render(
      <LibraryItem libraryContainer={mockHandle} data={data} showItemSummary={false} />
    );
    const header = container.querySelector('.LibraryItemHeader');
    if (header) fireEvent.click(header);
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

    const itemTexts = container.querySelectorAll('.LibraryItemText');
    expect(itemTexts.length).toBeGreaterThan(0);
  });
});
