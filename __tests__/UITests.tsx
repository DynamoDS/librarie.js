import * as React from 'react';
import '@testing-library/jest-dom';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryItem } from '../src/components/LibraryItem';
import { ItemData } from "../src/LibraryUtilities";
import { createLibraryItem } from "../src/utils";
import { expect as expectChai} from 'chai';
import { LibraryContainer } from '../src/components/LibraryContainer';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import * as data from './data/mock-data';


describe("LibraryContainer UI", function () {
  let libController: LibraryEntryPoint.LibraryController;
  let libContainer: any;
  let onLibraryItemClickSpy: jest.SpyInstance;
  
  beforeEach(function () {
    // //replace the onLibraryItemClicked with a mocked method.
    onLibraryItemClickSpy = jest.spyOn(LibraryItem.prototype, 'onLibraryItemClicked').mockImplementation(jest.fn());

    libController = LibraryEntryPoint.CreateLibraryController();
    libContainer = render(libController.createLibraryContainer());
    
  });
  
  afterEach(()=> {
    // restore spy so it will not interfere with other tests 
    onLibraryItemClickSpy.mockRestore();
  })

  it("should recognize mouse click event and change expand state", async function () {
  //   // Test data to create LibraryItem  
  //   // Parent item that will hold the child items
    let data = createLibraryItem(ItemData);

    render(<LibraryItem libraryContainer={libContainer as any} data={data} showItemSummary={false} />);

    await waitFor(()=> {
      const header = screen.getByText("TestItem").closest('.LibraryItemHeader');
      if(header) {
        fireEvent.click(header);
      }
    });

    expect(onLibraryItemClickSpy).toHaveBeenCalled();
  });

});

describe("", () => {
  let libController: LibraryEntryPoint.LibraryController;
  let scrollToExpandedItemSpy: jest.SpyInstance;
    
  beforeEach(() => {
    const layoutSpecsJson = data.layoutSpecsJson;
    const loadedTypesJson = data.loadedTypesJson;

    // //replace the scrollToExpandedItem with a mocked method.
    scrollToExpandedItemSpy = jest.spyOn(LibraryContainer.prototype, 'scrollToExpandedItem').mockImplementation(jest.fn());
   
    libController = LibraryEntryPoint.CreateLibraryController();
    render(libController.createLibraryContainer());


    // Load the data to libController
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();

  })

  afterEach(()=> {
    // restore spy so it will not interfere with other tests 
    scrollToExpandedItemSpy.mockRestore();
  })

  it("scrollToElement should be called when libraryItem is expanded only", function () {
    let header = screen.getByText(/parent/i);
    fireEvent.click(header);
    expect(scrollToExpandedItemSpy).toHaveBeenCalled();
  });


  it("search a string in library and verify results", async function () {
    // Looks for the searchInput element
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('SearchInputText');
    
    // Trigger the search
    fireEvent.change(input, { target: { value: 'Child1' } });

    // Looks for the LibraryItem element 'Child1' that should matches with search results
    await waitFor(()=> {
      expect(screen.queryByText('Child1')).toBeInTheDocument();
    });

  });

  it("search a negative scenario for search", async function () {
    // Looks for the searchInput element
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('SearchInputText');
    
    // Trigger the search so the option for detail view is enabled
    fireEvent.change(input, { target: { value: 'Point' } });

    // Looks for the LibraryItem element 'Point' that should not matches with search results
    await waitFor(()=> {
       expect(screen.queryByText('Point')).not.toBeInTheDocument();
    });

  });

  it("verify the search results display item description after select detailed view", async function () {

    // Trigger the search so the option for detail view is enabled
    // Looks for the searchInput element
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('SearchInputText');

    // Set the search string 
    fireEvent.change(input, { target: { value: 'Child1' } });

    // Find the div for Detailed view and click on it
    const option = screen.getByTitle('Compact/Detailed View');

    await waitFor(()=> {
      expect(screen.getByText('Child1'));
      fireEvent.click(option);
      // Make sure the search results has correct item description
      expect(screen.getByText('First item'));
    });


  });

  it("search bar should not contain structured view button", function () {

    let buttons = screen.queryAllByRole('button');

    //detail view, filter.
    expectChai(buttons).to.have.lengthOf(2);

    // // Trigger the search so the option for detail view is enabled
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('SearchInputText');

    // // Set the search string 
    fireEvent.change(input,{ target: { value: 'Child' } });

    // // Find the buttons in the search
    buttons = screen.queryAllByRole('button');

    // //detail view, filter, and x button//
    expectChai(buttons).to.have.lengthOf(3);

  });

  it("click item text on search should return to the library item", async function () {

     // Trigger the search so the option for detail view is enabled
    // Looks for the searchInput element
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('SearchInputText');

    // Set the search string 
    fireEvent.change(input, { target: { value: 'Child1' } });

    
    await waitFor(()=> {
      // Look for parent selector to be clicked
      const detailWrapper = screen.getByText('Child1').closest('.ItemInfo');
      expect(detailWrapper).toBeInTheDocument();

      const itemParent = detailWrapper?.querySelector('.ItemParent');
      if(itemParent) {
        fireEvent.click(itemParent);
      }

    });

    await waitFor(()=> {
      const header = screen.getByText(/core/i);
      const itemGroup = header.closest('.LibraryItemContainerGroup');
      expect(itemGroup).toHaveClass('expanded');
    });

  });

  it("add-ons should auto expand", function () {
    const addOns = screen.getByText(/Add-ons/i);
    const sectionContainer = addOns.closest('.LibraryItemContainerSection');
    expect(sectionContainer).toHaveClass('expanded');
  });
})
