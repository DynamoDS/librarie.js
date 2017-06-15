import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import * as LibraryEntryPoint from '../src/entry-point';
import { LibraryItem } from '../src/components/LibraryItem';
import { ItemData } from "../src/LibraryUtilities";

describe("sample test", function () {
  it("should add two numbers", function () {
    expect(1 + 2).to.equal(3);
  });
});

describe("LibraryContainer UI", function () {

  it("should recognize mouse click event and change expand state", function () {
    // test data to create LibraryItem  
    // parent item that will hold the child items
    let data = new ItemData("");
    data.text = "TestItem";
    data.itemType = "none";

    // create child items and link with parent
    for (var i = 0; i < 2; i++) {
      let item = new ItemData("");
      item.text = "Child" + i;
      item.itemType = "category";
      data.appendChild(item);
    }

    // create "LibraryContainer" to pass as an argument for creation of "LibraryItem"
    let libContainer = LibraryEntryPoint.CreateLibraryController();

    // Mount is "real" rendering that will actually render your component into a browser environment. 
    // If you are testing full React components, 
    // mount is used to do rendering  and test actions are simulated on mounted html

    let libraryItem = mount(<LibraryItem libraryContainer={libContainer} data={data} />);

    expect(libraryItem).to.have.lengthOf(1);
    expect(libraryItem.props().data.childItems).to.have.lengthOf(2);
    expect(libraryItem.props().data.text).to.equal("TestItem");
    expect(libraryItem.props().data.showHeader).to.be.true;
    expect(libraryItem.props().data.childItems[0].text).to.equal("Child0");
    expect(libraryItem.props().data.childItems[1].text).to.equal("Child1");
    let header = libraryItem.find(('div.LibraryItemHeader')).at(0);// the state of LibraryItem is changed when clicking on header
    expect(header).to.have.lengthOf(1); // verify that there is a header
    header.simulate('click'); // enzyme function to simulate mouse click
    expect(libraryItem.state('expanded')).to.be.true; // check for if the libraryItem is expanded after mouse click       
  });

});
