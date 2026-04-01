/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryItem } from '../src/components/LibraryItem';
import { ItemData } from "../src/LibraryUtilities";
import { createLibraryItem } from "../src/utils";
import { expect as expectChai } from 'chai';
import type { LibraryContainerHandle } from '../src/components/LibraryContainer';
import * as mockData from './data/mock-data';
import { HostingContextType } from '../src/SharedTypes';

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

describe("LibraryContainer UI", function () {
  let libController: LibraryEntryPoint.LibraryController;

  beforeEach(function () {
    libController = LibraryEntryPoint.CreateLibraryController();
  });

  it("should recognize mouse click event and change expand state", function () {
    const data = createLibraryItem(ItemData);
    const mockHandle = createMockHandle();

    const { container } = render(
      <LibraryItem libraryContainer={mockHandle} data={data} showItemSummary={false} />
    );

    expectChai(data.childItems).to.have.lengthOf(2);
    expectChai(data.text).to.equal("TestItem");
    expectChai(data.showHeader).to.be.true;
    expectChai(data.childItems[0].text).to.equal("Child0");
    expectChai(data.childItems[1].text).to.equal("Child1");

    const header = container.querySelector('.LibraryItemHeader');
    expect(header).not.toBeNull();
    fireEvent.click(header!);

    const itemContainer = container.querySelector('.LibraryItemContainerNone');
    expect(itemContainer).toHaveClass('expanded');
  });

  it("should raise the onItemWillExpand when expanding", function () {
    const data = createLibraryItem(ItemData);
    const mockHandle = createMockHandle();
    let expanded = false;

    const { container } = render(
      <LibraryItem
        libraryContainer={mockHandle}
        data={data}
        showItemSummary={false}
        onItemWillExpand={() => { expanded = true; }}
      />
    );

    const header = container.querySelector('.LibraryItemHeader');
    expect(header).not.toBeNull();
    fireEvent.click(header!);

    expectChai(expanded).to.be.true;
    const itemContainer = container.querySelector('.LibraryItemContainerNone');
    expect(itemContainer).toHaveClass('expanded');
  });

  describe("with library data loaded", () => {
    beforeEach(() => {
      // Render first so handlers are registered, then load data
      render(libController.createLibraryContainer());
      act(() => {
        libController.setLoadedTypesJson(mockData.loadedTypesJson, false);
        libController.setLayoutSpecsJson(mockData.layoutSpecsJson, false);
        libController.refreshLibraryView();
      });
    });

    it("expanding a library item should not throw", function () {
      const headers = document.querySelectorAll('.LibraryItemHeader, .LibrarySectionHeader');
      expectChai(() => {
        if (headers.length > 0) {
          fireEvent.click(headers[0]);
        }
      }).to.not.throw();
    });

    it("search a string in library and verify results", async function () {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Child' } });

      await waitFor(() => {
        const results = document.querySelectorAll('.SearchResultItemContainer');
        expectChai(results.length).to.be.greaterThan(0);
      }, { timeout: 1000 });
    });

    it("search a negative scenario for search", async function () {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'NonExistentItem12345' } });

      await waitFor(() => {
        const results = document.querySelectorAll('.SearchResultItemContainer');
        expectChai(results.length).to.equal(0);
      }, { timeout: 1000 });
    });

    it("search bar should not contain structured view button", function () {
      const buttons = document.querySelectorAll('button');
      // detail view, filter - 2 buttons before search
      expectChai(buttons.length).to.equal(2);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Child' } });

      const buttonsAfter = document.querySelectorAll('button');
      // detail view, filter, and x button - 3 buttons during search
      expectChai(buttonsAfter.length).to.equal(3);
    });

    it("add-ons section should be rendered", function () {
      expect(screen.getByText('Add-ons')).toBeInTheDocument();
    });
  });

});
