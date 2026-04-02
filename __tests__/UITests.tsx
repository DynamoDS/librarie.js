import * as React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryItem } from '../src/components/LibraryItem';
import { ItemData } from "../src/LibraryUtilities";
import { createLibraryItem } from "../src/utils";
import { createMockHandle, loadedTypesJson, layoutSpecsJson } from './data/mock-data';

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

    expect(data.childItems).toHaveLength(2);
    expect(data.text).toBe("TestItem");
    expect(data.showHeader).toBe(true);
    expect(data.childItems[0].text).toBe("Child0");
    expect(data.childItems[1].text).toBe("Child1");

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

    expect(expanded).toBe(true);
    const itemContainer = container.querySelector('.LibraryItemContainerNone');
    expect(itemContainer).toHaveClass('expanded');
  });

  describe("with library data loaded", () => {
    beforeEach(() => {
      // Render first so handlers are registered, then load data
      render(libController.createLibraryContainer());
      act(() => {
        libController.setLoadedTypesJson(loadedTypesJson, false);
        libController.setLayoutSpecsJson(layoutSpecsJson, false);
        libController.refreshLibraryView();
      });
    });

    it("expanding a library item should not throw", function () {
      const headers = document.querySelectorAll('.LibraryItemHeader, .LibrarySectionHeader');
      expect(() => {
        if (headers.length > 0) {
          fireEvent.click(headers[0]);
        }
      }).not.toThrow();
    });

    it("search a string in library and verify results", async function () {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Child' } });

      await waitFor(() => {
        const results = document.querySelectorAll('.SearchResultItemContainer');
        expect(results.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    it("search a negative scenario for search", async function () {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'NonExistentItem12345' } });

      await waitFor(() => {
        const results = document.querySelectorAll('.SearchResultItemContainer');
        expect(results.length).toBe(0);
      }, { timeout: 1000 });
    });

    it("search bar should not contain structured view button", function () {
      const buttons = document.querySelectorAll('button');
      // detail view, filter - 2 buttons before search
      expect(buttons.length).toBe(2);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Child' } });

      const buttonsAfter = document.querySelectorAll('button');
      // detail view, filter, and x button - 3 buttons during search
      expect(buttonsAfter.length).toBe(3);
    });

    it("add-ons section should be rendered", function () {
      expect(screen.getByText('Add-ons')).toBeInTheDocument();
    });
  });

});
