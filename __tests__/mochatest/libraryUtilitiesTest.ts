import * as LibraryUtilities from '../../src/LibraryUtilities'
import * as testClasses from '../data/libraryUtilitiesTestClasses'

import { expect } from 'chai';
import 'mocha';

function compareLayoutElements(actual: LibraryUtilities.LayoutElement, expected: LibraryUtilities.LayoutElement) {

  // Basic element properties must match up.
  expect(actual.text).to.equal(expected.text);
  expect(actual.iconUrl).to.equal(expected.iconUrl);
  expect(actual.showHeader).to.equal(expected.showHeader);
  expect(actual.elementType).to.equal(expected.elementType);

  // Include paths comparison.
  expect(actual.include.length).to.equal(expected.include.length);
  for (let i = 0; i < expected.include.length; i++) {
    expect(actual.include[i].path).to.equal(expected.include[i].path);
    expect(actual.include[i].inclusive).to.equal(expected.include[i].inclusive);
    expect(actual.include[i].iconUrl).to.equal(expected.include[i].iconUrl);
  }

  // Each nested child element should also match up.
  expect(actual.childElements.length).to.equal(expected.childElements.length);
  for (let i = 0; i < expected.childElements.length; i++) {
    compareLayoutElements(actual.childElements[i], expected.childElements[i]);
  }
}

describe("isValidIncludeInfo function", function () {
  let includeItemPairs: LibraryUtilities.IncludeItemPair[];
  let owningItem1: LibraryUtilities.ItemData;
  let owningItem2: LibraryUtilities.ItemData;
  let owningItem3: LibraryUtilities.ItemData;
  let includeItemPair1: LibraryUtilities.IncludeItemPair;
  let includeItemPair2: LibraryUtilities.IncludeItemPair;
  let includeItemPair3: LibraryUtilities.IncludeItemPair;

  beforeEach(function () {
    includeItemPairs = [];
    owningItem1 = new LibraryUtilities.ItemData("1");
    owningItem2 = new LibraryUtilities.ItemData("2");
    owningItem3 = new LibraryUtilities.ItemData("3");
    includeItemPair1 = new LibraryUtilities.IncludeItemPair(null, owningItem1);
    includeItemPair2 = new LibraryUtilities.IncludeItemPair(null, owningItem2);
    includeItemPair3 = new LibraryUtilities.IncludeItemPair(null, owningItem3);
  });

  it("should return true if includeItemPairs is empty", function () {
    let result = LibraryUtilities.isValidIncludeInfo(includeItemPairs);
    expect(result).to.equal(true);
  });

  it("should return true if includeItemPairs is valid", function () {
    includeItemPairs = [includeItemPair1, includeItemPair2, includeItemPair3];
    let includeList = [{ "path": "a" }, { "path": "b" }, { "path": "c" }];
    let owningItemList = [owningItem1, owningItem2, owningItem3];

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
      pair.owningItem = owningItemList[i];
    });

    let result = LibraryUtilities.isValidIncludeInfo(includeItemPairs);
    expect(result).to.equal(true);
  });

  it("should return false if includes are not unique", function () {
    includeItemPairs = [includeItemPair1, includeItemPair2, includeItemPair3];
    let includeList = [{ "path": "a" }, { "path": "a" }, { "path": "b" }];
    let owningItemList = [owningItem1, owningItem1, owningItem2];

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
      pair.owningItem = owningItemList[i];
    });

    let result = LibraryUtilities.isValidIncludeInfo(includeItemPairs);
    expect(result).to.equal(false);
  });

  it("should return false if one include is contained in another include", function () {
    includeItemPairs = [includeItemPair1, includeItemPair2, includeItemPair3];
    let includeList = [{ "path": "a" }, { "path": "a.b" }, { "path": "c" }];
    let owningItemList = [owningItem1, owningItem1, owningItem2];

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
      pair.owningItem = owningItemList[i];
    });

    let result = LibraryUtilities.isValidIncludeInfo(includeItemPairs);
    expect(result).to.equal(false);
  });

  it("should return false if one include with prefix is contained in another include", function () {
    includeItemPairs = [includeItemPair1, includeItemPair2, includeItemPair3];
    let includeList = [{ "path": "a" }, { "path": "test://" }, { "path": "test://a" }];
    let owningItemList = [owningItem1, owningItem2, owningItem2];

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
      pair.owningItem = owningItemList[i];
    });

    let result = LibraryUtilities.isValidIncludeInfo(includeItemPairs);
    expect(result).to.equal(false);
  });
});

describe("removeEmptyNodes function", function () {

  it("should work for empty array", function () {
    let items: LibraryUtilities.ItemData[] = [];
    LibraryUtilities.removeEmptyNodes(items);
    expect(items.length).to.equal(0);
  });

  it("should remove all items for an array of sections with no childItems", function () {
    let section1 = new LibraryUtilities.ItemData("section1");
    let section2 = new LibraryUtilities.ItemData("section2");
    let section3 = new LibraryUtilities.ItemData("section3");
    let items: LibraryUtilities.ItemData[] = [];

    section1.itemType = "section";
    section2.itemType = "section";
    section3.itemType = "section";

    items = [section1, section2, section3];

    LibraryUtilities.removeEmptyNodes(items);

    expect(items.length).to.equal(0);
  });

  it("should remove all items from an array of sections with childItems but no leaf items", function () {
    let section1 = new LibraryUtilities.ItemData("section1");
    let section2 = new LibraryUtilities.ItemData("section2");
    let section3 = new LibraryUtilities.ItemData("section3");

    let category11 = new LibraryUtilities.ItemData("category11");
    let category12 = new LibraryUtilities.ItemData("category12");
    let category21 = new LibraryUtilities.ItemData("category21");

    let group111 = new LibraryUtilities.ItemData("group111");
    let group112 = new LibraryUtilities.ItemData("group112");

    section1.itemType = "section";
    section2.itemType = "section";
    section3.itemType = "section";
    category11.itemType = "category";
    category12.itemType = "category";
    category21.itemType = "category";
    group111.itemType = "group";
    group112.itemType = "group";

    category11.appendChild(group111);
    category11.appendChild(group112);
    section1.appendChild(category11);
    section1.appendChild(category12);
    section2.appendChild(category21);

    let items: LibraryUtilities.ItemData[] = [section1, section2, section3];

    LibraryUtilities.removeEmptyNodes(items);

    expect(items.length).to.equal(0);
  });

  it("should remove items with no leaf items", function () {
    let section1 = new LibraryUtilities.ItemData("section1");
    let section2 = new LibraryUtilities.ItemData("section2");
    let section3 = new LibraryUtilities.ItemData("section3");

    let category11 = new LibraryUtilities.ItemData("category11");
    let category12 = new LibraryUtilities.ItemData("category12");
    let category21 = new LibraryUtilities.ItemData("category21");

    let group111 = new LibraryUtilities.ItemData("group111");
    let group112 = new LibraryUtilities.ItemData("group112");

    let leaf1111 = new LibraryUtilities.ItemData("leaf1111");

    section1.itemType = "section";
    section2.itemType = "section";
    section3.itemType = "section";
    category11.itemType = "category";
    category12.itemType = "category";
    category21.itemType = "category";
    group111.itemType = "group";
    group112.itemType = "group";

    group111.appendChild(leaf1111);
    category11.appendChild(group111);
    category11.appendChild(group112);
    section1.appendChild(category11);
    section1.appendChild(category12);
    section2.appendChild(category21);

    let items: LibraryUtilities.ItemData[] = [section1, section2, section3];

    LibraryUtilities.removeEmptyNodes(items);

    expect(items.length).to.equal(1);
    expect(items[0]).to.equal(section1);
    expect(items[0].childItems[0].childItems[0].childItems[0].text).to.equal("leaf1111");
  });

  it("should not remove items if all items have leaf items", function () {
    let section1 = new LibraryUtilities.ItemData("section1");
    let section2 = new LibraryUtilities.ItemData("section2");

    let category11 = new LibraryUtilities.ItemData("category11");
    let category12 = new LibraryUtilities.ItemData("category12");
    let category21 = new LibraryUtilities.ItemData("category21");

    let group111 = new LibraryUtilities.ItemData("group111");
    let group112 = new LibraryUtilities.ItemData("group112");
    let group211 = new LibraryUtilities.ItemData("group211");

    let leaf1111 = new LibraryUtilities.ItemData("leaf1111");
    let leaf1121 = new LibraryUtilities.ItemData("leaf1121");
    let leaf2111 = new LibraryUtilities.ItemData("leaf2111");

    section1.itemType = "section";
    section2.itemType = "section";
    category11.itemType = "category";
    category12.itemType = "category";
    category21.itemType = "category";
    group111.itemType = "group";
    group112.itemType = "group";
    group211.itemType = "group";

    group111.appendChild(leaf1111);
    group112.appendChild(leaf1121);
    group211.appendChild(leaf2111);
    category11.appendChild(group111);
    category11.appendChild(group112);
    category21.appendChild(group211);
    section1.appendChild(category11);
    section1.appendChild(category12);
    section2.appendChild(category21);

    let items: LibraryUtilities.ItemData[] = [section1, section2];

    LibraryUtilities.removeEmptyNodes(items);

    expect(items.length).to.equal(2);
    expect(items[0]).to.equal(section1);
    expect(items[1]).to.equal(section2);
    expect(items[0].childItems[0].childItems[0].childItems[0].text).to.equal("leaf1111");
    expect(items[0].childItems[0].childItems[1].childItems[0].text).to.equal("leaf1121");
    expect(items[1].childItems[0].childItems[0].childItems[0].text).to.equal("leaf2111");
  });
});

describe("constructFromIncludeInfo function", function () {
  let includeItemPairs: LibraryUtilities.IncludeItemPair[];
  let typeListNodes: LibraryUtilities.TypeListNode[];

  let pair1: LibraryUtilities.IncludeItemPair;
  let pair2: LibraryUtilities.IncludeItemPair;
  let pair3: LibraryUtilities.IncludeItemPair;
  let pair4: LibraryUtilities.IncludeItemPair;

  let node1: LibraryUtilities.TypeListNode;
  let node2: LibraryUtilities.TypeListNode;
  let node3: LibraryUtilities.TypeListNode;
  let node4: LibraryUtilities.TypeListNode;

  let owningItem1: LibraryUtilities.ItemData;
  let owningItem2: LibraryUtilities.ItemData;
  let owningItem3: LibraryUtilities.ItemData;
  let owningItem4: LibraryUtilities.ItemData;

  beforeEach(function () {
    includeItemPairs = [];
    typeListNodes = [];

    owningItem1 = new LibraryUtilities.ItemData("1");
    owningItem2 = new LibraryUtilities.ItemData("2");
    owningItem3 = new LibraryUtilities.ItemData("3");
    owningItem4 = new LibraryUtilities.ItemData("4");

    pair1 = new LibraryUtilities.IncludeItemPair(null, owningItem1);
    pair2 = new LibraryUtilities.IncludeItemPair(null, owningItem2);
    pair3 = new LibraryUtilities.IncludeItemPair(null, owningItem3);
    pair4 = new LibraryUtilities.IncludeItemPair(null, owningItem4);

    node1 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    node2 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    node3 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    node4 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());

    includeItemPairs = [pair1, pair2, pair3, pair4];
    typeListNodes = [node1, node2, node3, node4];
  });

  it("should merge all typeListNodes if all of them are matched in include info", function () {
    let nameList = ["a", "b", "c", "d"];
    let includeList = [{ "path": "a" }, { "path": "b" }, { "path": "c" }, { "path": "d" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(1);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(1);
    expect(owningItem4.childItems.length).to.equal(1);

    expect(owningItem1.childItems[0].text).to.equal("a");
    expect(owningItem2.childItems[0].text).to.equal("b");
    expect(owningItem3.childItems[0].text).to.equal("c");
    expect(owningItem4.childItems[0].text).to.equal("d");

    expect(node1.processed).to.equal(true);
    expect(node2.processed).to.equal(true);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(true);
  });

  it("should skip nodes that are not matched or included", function () {
    let nameList = ["a", "b", "c", "d"];
    let includeList = [{ "path": "a" }, { "path": "c" }, { "path": "d" }, { "path": "e" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(1);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(1);
    expect(owningItem4.childItems.length).to.equal(0);

    expect(owningItem1.childItems[0].text).to.equal("a");
    expect(owningItem2.childItems[0].text).to.equal("c");
    expect(owningItem3.childItems[0].text).to.equal("d");

    expect(node1.processed).to.equal(true);
    expect(node2.processed).to.equal(false);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(true);
  });

  it("should merge typeListNodes even if appear in different include info", function () {
    let nameList = ["a", "b", "c", "d"];
    let includeList = [{ "path": "a" }, { "path": "b" }, { "path": "b" }, { "path": "c" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(1);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(1);
    expect(owningItem4.childItems.length).to.equal(1);

    expect(owningItem1.childItems[0].text).to.equal("a");
    expect(owningItem2.childItems[0].text).to.equal("b");
    expect(owningItem3.childItems[0].text).to.equal("b");
    expect(owningItem4.childItems[0].text).to.equal("c");

    expect(node1.processed).to.equal(true);
    expect(node2.processed).to.equal(true);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(false);
  });

  it("should merge typeListNodes if they are matched or included in include info", function () {
    let nameList = ["b", "c.d", "c.e.f", "c.g"];
    let includeList = [{ "path": "a" }, { "path": "c.d" }, { "path": "c.e" }, { "path": "c.g" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(0);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(1);
    expect(owningItem3.childItems[0].childItems.length).to.equal(1);
    expect(owningItem4.childItems.length).to.equal(1);

    expect(owningItem2.childItems[0].text).to.equal("d");
    expect(owningItem3.childItems[0].text).to.equal("e");
    expect(owningItem3.childItems[0].childItems[0].text).to.equal("f");
    expect(owningItem4.childItems[0].text).to.equal("g");

    expect(node1.processed).to.equal(false);
    expect(node2.processed).to.equal(true);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(true);
  });

  it("should merge typeListNodes based on the attribute inclusive of include info", function () {
    let nameList = ["b", "c.d", "c.e.f", "c.g"];
    let includeList = [{ "path": "a" }, { "path": "c.d" }, { "path": "c.e", "inclusive": false }, { "path": "c.g" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(0);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(1);
    expect(owningItem3.childItems[0].childItems.length).to.equal(0);
    expect(owningItem4.childItems.length).to.equal(1);

    expect(owningItem2.childItems[0].text).to.equal("d");
    expect(owningItem3.childItems[0].text).to.equal("f");
    expect(owningItem4.childItems[0].text).to.equal("g");

    expect(node1.processed).to.equal(false);
    expect(node2.processed).to.equal(true);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(true);
  });

  it("should merge typeListNodes based on include path with prefix", function () {
    let nameList = ["a", "b", "test://c", "test://d"];
    let includeList = [{ "path": "a" }, { "path": "b" }, { "path": "test://c" }, { "path": "test://d" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(1);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(1);
    expect(owningItem4.childItems.length).to.equal(1);

    expect(owningItem1.childItems[0].text).to.equal("a");
    expect(owningItem2.childItems[0].text).to.equal("b");
    expect(owningItem3.childItems[0].text).to.equal("c");
    expect(owningItem4.childItems[0].text).to.equal("d");

    expect(node1.processed).to.equal(true);
    expect(node2.processed).to.equal(true);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(true);
  });

  it("should merge typeListNodes even if multiple include paths have the same prefix", function () {
    let nameList = ["a", "b", "test://c", "test://d"];
    let includeList = [{ "path": "a" }, { "path": "b" }, { "path": "test://" }, { "path": "test://" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(1);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(2);
    expect(owningItem4.childItems.length).to.equal(2);

    expect(owningItem1.childItems[0].text).to.equal("a");
    expect(owningItem2.childItems[0].text).to.equal("b");
    expect(owningItem3.childItems[0].text).to.equal("c");
    expect(owningItem3.childItems[1].text).to.equal("d");
    expect(owningItem4.childItems[0].text).to.equal("c");
    expect(owningItem4.childItems[1].text).to.equal("d");

    expect(node1.processed).to.equal(true);
    expect(node2.processed).to.equal(true);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(true);
  });

  it("should merge typeListNodes and build node name from their fullyQualifiedNames after prefix", function () {
    let nameList = ["a", "b", "test://c.d.e", "test://f"];
    let includeList = [{ "path": "a" }, { "path": "b" }, { "path": "test://" }, { "path": "test://c" }];

    typeListNodes.forEach((node, i) => {
      node.fullyQualifiedName = nameList[i];
    });

    includeItemPairs.forEach((pair, i) => {
      pair.include = includeList[i];
    });

    LibraryUtilities.constructFromIncludeInfo(typeListNodes, includeItemPairs);

    expect(owningItem1.childItems.length).to.equal(1);
    expect(owningItem2.childItems.length).to.equal(1);
    expect(owningItem3.childItems.length).to.equal(2);
    expect(owningItem4.childItems.length).to.equal(1);

    expect(owningItem1.childItems[0].text).to.equal("a");
    expect(owningItem2.childItems[0].text).to.equal("b");
    expect(owningItem3.childItems[0].text).to.equal("c");
    expect(owningItem3.childItems[1].text).to.equal("f");
    expect(owningItem3.childItems[0].childItems[0].text).to.equal("d");
    expect(owningItem3.childItems[0].childItems[0].childItems[0].text).to.equal("e");
    expect(owningItem4.childItems[0].text).to.equal("c");
    expect(owningItem4.childItems[0].childItems[0].text).to.equal("d");
    expect(owningItem4.childItems[0].childItems[0].childItems[0].text).to.equal("e");

    expect(node1.processed).to.equal(true);
    expect(node2.processed).to.equal(true);
    expect(node3.processed).to.equal(true);
    expect(node4.processed).to.equal(true);
  });

});


describe("updateSections function", function () {

  it("should throw exceptions 0", function () {
    expect(function () {
      LibraryUtilities.updateSections(null, null);
    }).to.throw("Both 'oldLayoutSpecs' and 'newLayoutSpecs' parameters must be supplied");
  });

  it("should throw exceptions 1", function () {
    expect(function () {
      LibraryUtilities.updateSections({}, null);
    }).to.throw("Both 'oldLayoutSpecs' and 'newLayoutSpecs' parameters must be supplied");
  });

  it("should throw exceptions 2", function () {
    expect(function () {
      LibraryUtilities.updateSections(null, {});
    }).to.throw("Both 'oldLayoutSpecs' and 'newLayoutSpecs' parameters must be supplied");
  });

  it("should throw exceptions 3", function () {
    expect(function () {
      LibraryUtilities.updateSections({}, {});
    }).to.throw("'oldLayoutSpecs.sections' must be a valid array");
  });

  it("should throw exceptions 4", function () {
    expect(function () {
      LibraryUtilities.updateSections({ sections: [] }, {});
    }).to.throw("'newLayoutSpecs.sections' must be a valid array");
  });

  it("should insert a new element when there isn't an existing one", function () {

    let oldLayoutSpecs: any = {
      sections: []
    };

    let newLayoutSpecs: any = {
      sections: [
        {
          text: "My Favourites",
          iconUrl: "/icons/my-fav.svg",
          elementType: "section",
          showHeader: true,
          include: [
            {
              path: "Direct.Child.One",
              iconUrl: "/icons/Direct.Child.One.png",
              inclusive: false
            },
            {
              path: "Direct.Child.Two",
              iconUrl: "/icons/Direct.Child.Two.png",
              inclusive: true
            }
          ],
          childElements: [
            {
              text: "First Favourite",
              iconUrl: "/icons/first-fav.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One",
                  iconUrl: "/icons/Nested.Child.One.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Two",
                  iconUrl: "/icons/Nested.Child.Two.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Three",
                  iconUrl: "/icons/Nested.Child.Three.png",
                  inclusive: true
                }
              ],
              childElements: []
            }
          ]
        }
      ]
    };

    // Precondition
    expect(oldLayoutSpecs.sections.length).to.equal(0);
    expect(newLayoutSpecs.sections.length).to.equal(1);

    LibraryUtilities.updateSections(oldLayoutSpecs, newLayoutSpecs);
    expect(oldLayoutSpecs.sections.length).to.equal(1);

    let rootElement: LibraryUtilities.LayoutElement = oldLayoutSpecs.sections[0];
    compareLayoutElements(rootElement, newLayoutSpecs.sections[0]);
  });

  it("should update existing contents with new contents", function () {

    let oldLayoutSpecs: any = {
      sections: [
        {
          text: "My Favourites",
          iconUrl: "/icons/my-fav.svg",
          elementType: "section",
          showHeader: true,
          include: [
            {
              path: "Direct.Child.One",
              iconUrl: "/icons/Direct.Child.One.png",
              inclusive: false
            },
            {
              path: "Direct.Child.Two",
              iconUrl: "/icons/Direct.Child.Two.png",
              inclusive: true
            }
          ],
          "childElements": [
            {
              text: "First Favourite",
              iconUrl: "/icons/first-fav.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One",
                  iconUrl: "/icons/Nested.Child.One.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Two",
                  iconUrl: "/icons/Nested.Child.Two.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Three",
                  iconUrl: "/icons/Nested.Child.Three.png",
                  inclusive: true
                }
              ],
              "childElements": []
            }
          ]
        }
      ]
    };

    let newLayoutSpecs: any = {
      sections: [
        {
          text: "My Favourites",
          iconUrl: "/icons/my-fav-new.svg",
          elementType: "section",
          showHeader: false,
          include: [
            {
              path: "Direct.Child.One",
              iconUrl: "/icons/Direct.Child.One.New.png",
              inclusive: true
            },
            {
              path: "Direct.Child.Two.New",
              iconUrl: "/icons/Direct.Child.Two.New.png",
              inclusive: false
            }
          ],
          childElements: [
            {
              text: "First Favourite",
              iconUrl: "/icons/first-fav-new.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One.New",
                  iconUrl: "/icons/Nested.Child.One.New.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Two",
                  iconUrl: "/icons/Nested.Child.Two.New.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Three.New",
                  iconUrl: "/icons/Nested.Child.Three.New.png",
                  inclusive: false
                }
              ],
              childElements: []
            }
          ]
        }
      ]
    };

    let expectedLayoutSpecs: any = {
      sections: [
        {
          text: "My Favourites",
          iconUrl: "/icons/my-fav-new.svg",
          elementType: "section",
          showHeader: false,
          include: [
            {
              path: "Direct.Child.One",
              iconUrl: "/icons/Direct.Child.One.New.png",
              inclusive: true
            },
            {
              path: "Direct.Child.Two",
              iconUrl: "/icons/Direct.Child.Two.png",
              inclusive: true
            },
            {
              path: "Direct.Child.Two.New",
              iconUrl: "/icons/Direct.Child.Two.New.png",
              inclusive: false
            }
          ],
          "childElements": [
            {
              text: "First Favourite",
              iconUrl: "/icons/first-fav-new.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One",
                  iconUrl: "/icons/Nested.Child.One.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Two",
                  iconUrl: "/icons/Nested.Child.Two.New.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Three",
                  iconUrl: "/icons/Nested.Child.Three.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.One.New",
                  iconUrl: "/icons/Nested.Child.One.New.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Three.New",
                  iconUrl: "/icons/Nested.Child.Three.New.png",
                  inclusive: false
                }
              ],
              "childElements": []
            }
          ]
        }
      ]
    };

    // Precondition
    expect(oldLayoutSpecs.sections.length).to.equal(1);
    expect(newLayoutSpecs.sections.length).to.equal(1);
    expect(oldLayoutSpecs.sections[0].text).to.equal("My Favourites");
    expect(newLayoutSpecs.sections[0].text).to.equal("My Favourites");

    LibraryUtilities.updateSections(oldLayoutSpecs, newLayoutSpecs);

    let rootElement: LibraryUtilities.LayoutElement = oldLayoutSpecs.sections[0];
    compareLayoutElements(rootElement, expectedLayoutSpecs.sections[0]);
  });

  it("should update existing contents including child elements", function () {

    let oldLayoutSpecs: any = {
      sections: [
        {
          text: "My Favourites",
          iconUrl: "/icons/my-fav.svg",
          elementType: "section",
          showHeader: true,
          include: [
            {
              path: "Direct.Child.One",
              iconUrl: "/icons/Direct.Child.One.png",
              inclusive: false
            },
            {
              path: "Direct.Child.Two",
              iconUrl: "/icons/Direct.Child.Two.png",
              inclusive: true
            }
          ],
          "childElements": [
            {
              text: "First Favourite",
              iconUrl: "/icons/first-fav.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One",
                  iconUrl: "/icons/Nested.Child.One.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Two",
                  iconUrl: "/icons/Nested.Child.Two.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Three",
                  iconUrl: "/icons/Nested.Child.Three.png",
                  inclusive: true
                }
              ],
              "childElements": []
            }
          ]
        }
      ]
    };

    let newLayoutSpecs: any = {
      sections: [
        {
          text: "My Favourites",
          iconUrl: "/icons/my-fav-new.svg",
          elementType: "section",
          showHeader: false,
          include: [
            {
              path: "Direct.Child.One",
              iconUrl: "/icons/Direct.Child.One.New.png",
              inclusive: true
            },
            {
              path: "Direct.Child.Two.New",
              iconUrl: "/icons/Direct.Child.Two.New.png",
              inclusive: false
            }
          ],
          childElements: [
            {
              text: "Second Favourite",
              iconUrl: "/icons/first-fav-new.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One.New",
                  iconUrl: "/icons/Nested.Child.One.New.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Two.New",
                  iconUrl: "/icons/Nested.Child.Two.New.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Three.New",
                  iconUrl: "/icons/Nested.Child.Three.New.png",
                  inclusive: false
                }
              ],
              childElements: []
            }
          ]
        }
      ]
    };

    let expectedLayoutSpecs: any = {
      sections: [
        {
          text: "My Favourites",
          iconUrl: "/icons/my-fav-new.svg",
          elementType: "section",
          showHeader: false,
          include: [
            {
              path: "Direct.Child.One",
              iconUrl: "/icons/Direct.Child.One.New.png",
              inclusive: true
            },
            {
              path: "Direct.Child.Two",
              iconUrl: "/icons/Direct.Child.Two.png",
              inclusive: true
            },
            {
              path: "Direct.Child.Two.New",
              iconUrl: "/icons/Direct.Child.Two.New.png",
              inclusive: false
            }
          ],
          "childElements": [
            {
              text: "First Favourite",
              iconUrl: "/icons/first-fav.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One",
                  iconUrl: "/icons/Nested.Child.One.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Two",
                  iconUrl: "/icons/Nested.Child.Two.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Three",
                  iconUrl: "/icons/Nested.Child.Three.png",
                  inclusive: true
                }
              ],
              childElements: []
            },
            {
              text: "Second Favourite",
              iconUrl: "/icons/first-fav-new.svg",
              elementType: "group",
              include: [
                {
                  path: "Nested.Child.One.New",
                  iconUrl: "/icons/Nested.Child.One.New.png",
                  inclusive: false
                },
                {
                  path: "Nested.Child.Two.New",
                  iconUrl: "/icons/Nested.Child.Two.New.png",
                  inclusive: true
                },
                {
                  path: "Nested.Child.Three.New",
                  iconUrl: "/icons/Nested.Child.Three.New.png",
                  inclusive: false
                }
              ],
              childElements: []
            }
          ]
        }
      ]
    };

    // Precondition
    expect(oldLayoutSpecs.sections.length).to.equal(1);
    expect(newLayoutSpecs.sections.length).to.equal(1);
    expect(oldLayoutSpecs.sections[0].text).to.equal("My Favourites");
    expect(newLayoutSpecs.sections[0].text).to.equal("My Favourites");

    LibraryUtilities.updateSections(oldLayoutSpecs, newLayoutSpecs);

    let rootElement: LibraryUtilities.LayoutElement = oldLayoutSpecs.sections[0];
    compareLayoutElements(rootElement, expectedLayoutSpecs.sections[0]);
  });

});

describe('listNode Class', function () {

  var testData: any;

  beforeEach(function () {
    testData = new testClasses.TypeListNodeData();
  });

  it('should create an empty TypeListNode', function () {
    let emptyTypeListNode = new LibraryUtilities.TypeListNode(testData);

    expect(emptyTypeListNode.fullyQualifiedName).to.equal(undefined);
    expect(emptyTypeListNode.iconUrl).to.equal(undefined);
    expect(emptyTypeListNode.memberType).to.equal(undefined);
    expect(emptyTypeListNode.contextData).to.equal(undefined);
  });

  it('should create a TypeListNode with correct attributes', function () {
    let test = 'test';
    let none = 'none';

    testData.fullyQualifiedName = test;
    testData.iconUrl = test;
    testData.contextData = test;
    testData.itemType = none;

    let testTypeListNode = new LibraryUtilities.TypeListNode(testData);
    expect(testTypeListNode.fullyQualifiedName).to.equal(test);
    expect(testTypeListNode.iconUrl).to.equal(test);
    expect(testTypeListNode.contextData).to.equal(test);
    expect(testTypeListNode.memberType).to.equal(none);
  });
});

describe("LayoutElement class", function () {

  var testData: any;

  beforeEach(function () {
    testData = new testClasses.LayoutElementData();
  });

  it('should create an empty LayoutElement', function () {
    let emptyLayoutElement = new LibraryUtilities.LayoutElement(testData);

    expect(emptyLayoutElement.text).to.equal(undefined);
    expect(emptyLayoutElement.iconUrl).to.equal(undefined);
    expect(emptyLayoutElement.elementType).to.equal(undefined);
    expect(emptyLayoutElement.include).to.equal(undefined);
    expect(emptyLayoutElement.childElements.length).to.equal(0);
  });

  it('should be able to append a child', function () {
    let parentLayoutElement = new LibraryUtilities.LayoutElement(testData);
    let childLayoutElement = new LibraryUtilities.LayoutElement(testData);

    parentLayoutElement.appendChild(childLayoutElement);

    expect(parentLayoutElement.childElements.length).to.equal(1);
    expect(parentLayoutElement.childElements[0]).to.equal(childLayoutElement);
  });

  it('should create LayoutElement from data with child elements', function () {
    let testDataWithChildElements = new testClasses.LayoutElementData();
    testDataWithChildElements.childElements.push(testData);
    testDataWithChildElements.childElements.push(testData);

    let parentLayoutElement = new LibraryUtilities.LayoutElement(testDataWithChildElements);

    expect(parentLayoutElement.childElements.length).to.equal(2);
  });
});

describe('ItemData class', function () {

  var testData: any;
  var emptyString = '';

  beforeEach(function () {
    testData = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
  });

  it('should create an LibraryItem from string', function () {
    let testLibraryItem = new LibraryUtilities.ItemData(emptyString);

    expect(testLibraryItem.iconUrl).to.equal(emptyString);
    expect(testLibraryItem.contextData).to.equal(emptyString);
    expect(testLibraryItem.text).to.equal(emptyString);
    expect(testLibraryItem.itemType).to.equal('none');
    expect(testLibraryItem.childItems.length).to.equal(0);
  });

  it('should create an LibraryItem from layoutElement', function () {
    let testLibraryItem = new LibraryUtilities.ItemData(emptyString);
    testLibraryItem.constructFromLayoutElement(testData);

    expect(testLibraryItem.iconUrl).to.equal(undefined);
    expect(testLibraryItem.contextData).to.equal(undefined);
    expect(testLibraryItem.text).to.equal(emptyString);
    expect(testLibraryItem.itemType).to.equal(undefined);
    expect(testLibraryItem.childItems.length).to.equal(0);
  });

  it('should append some children', function () {
    let parentLibraryItem = new LibraryUtilities.ItemData(emptyString);
    parentLibraryItem.constructFromLayoutElement(testData);

    let childLibraryItem1 = new LibraryUtilities.ItemData(emptyString);
    let childLibraryItem2 = new LibraryUtilities.ItemData(emptyString);
    childLibraryItem2.constructFromLayoutElement(testData);

    parentLibraryItem.appendChild(childLibraryItem1);
    parentLibraryItem.appendChild(childLibraryItem2);

    expect(parentLibraryItem.childItems.length).to.equal(2);
    expect(parentLibraryItem.childItems[0]).to.equal(childLibraryItem1);
    expect(parentLibraryItem.childItems[1]).to.equal(childLibraryItem2);
  });
});

describe('buildLibraryItemsFromName function', function () {
  var typeListNodes: LibraryUtilities.TypeListNode[];
  var result: LibraryUtilities.ItemData;

  beforeEach(function () {
    typeListNodes = [];
    result = new LibraryUtilities.ItemData('');
  });

  /*
    The following test creates a typeListNode:
    {
      {
        "fullyQualifiedName": "a.b.c"
      }
    }
    The result should have the following structure:
    - a
      |- b
         |- c
  */
  it('should construct a library item with fullyQualifiedName', function () {
    let typeListNode1 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode1.fullyQualifiedName = 'a.b.c';
    typeListNodes.push(typeListNode1);

    LibraryUtilities.buildLibraryItemsFromName(typeListNode1, result);
    let aNode = result.childItems[0];
    expect(aNode.text).to.equal('a');
    expect(aNode.childItems.length).to.equal(1);
    expect(aNode.childItems[0].text).to.equal('b');
    expect(aNode.childItems[0].childItems.length).to.equal(1);
    expect(aNode.childItems[0].childItems[0].text).to.equal('c');
    expect(aNode.childItems[0].childItems[0].childItems.length).to.equal(0);
  });

  /*
    The following test creates typeListNodes:
    {
      {
        "fullyQualifiedName": "a.b.c"
      },
      {
        "fullyQualifiedName": "a.b.d"
      },
      {
        "fullyQualifiedName": "a.e"
      }
    }
    The result should have the following structure:
    - a
      |- b
         |- c
         |- d
      |- e
  */
  it('should construct correctly nested library items with fullyQualifiedName', function () {
    let typeListNode1 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode1.fullyQualifiedName = 'a.b.c';
    typeListNodes.push(typeListNode1);

    let typeListNode2 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode2.fullyQualifiedName = 'a.b.d';
    typeListNodes.push(typeListNode2);

    let typeListNode3 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode3.fullyQualifiedName = 'a.e';
    typeListNodes.push(typeListNode3);

    for (let node of typeListNodes) {
      LibraryUtilities.buildLibraryItemsFromName(node, result);
    }
    let aNode = result.childItems[0];
    expect(aNode.text).to.equal('a');
    expect(aNode.childItems.length).to.equal(2);
    expect(aNode.childItems[0].text).to.equal('b');
    expect(aNode.childItems[1].text).to.equal('e');
    expect(aNode.childItems[0].childItems.length).to.equal(2);
    expect(aNode.childItems[0].childItems[0].text).to.equal('c');
    expect(aNode.childItems[0].childItems[1].text).to.equal('d');
    expect(aNode.childItems[1].childItems.length).to.equal(0);
  });
});

describe('setItemStateRecursive function', function () {
  var itemArray: LibraryUtilities.ItemData[];
  let itemData1 = new LibraryUtilities.ItemData("1");
  let itemData2 = new LibraryUtilities.ItemData("2");
  let itemData3 = new LibraryUtilities.ItemData("3");
  let itemData11 = new LibraryUtilities.ItemData("11");
  let itemData21 = new LibraryUtilities.ItemData("21");
  let itemData31 = new LibraryUtilities.ItemData("31");
  let itemData111 = new LibraryUtilities.ItemData("111");

  beforeEach(function () {
    itemArray = [];
  });

  function isSetToValue(items: LibraryUtilities.ItemData[], visible: boolean, expanded: boolean): boolean {
    for (let item of items) {
      if (item.visible != visible) {
        return false;
      }
      if (item.expanded != expanded) {
        return false;
      }
    }
    return true;
  }

  it('should work on empty array', function () {
    LibraryUtilities.setItemStateRecursive(itemArray, true, false);
    expect(isSetToValue(itemArray, true, false)).to.equal(true);
  });

  it('should set the correct attributes', function () {
    itemData1.visible = false;
    itemData1.expanded = true;
    itemData2.visible = false;
    itemData3.expanded = true;

    itemArray.push(itemData1);
    itemArray.push(itemData2);
    itemArray.push(itemData3);

    LibraryUtilities.setItemStateRecursive(itemArray, true, false);

    expect(itemArray.length).to.equal(3);
    expect(isSetToValue(itemArray, true, false)).to.equal(true);
  });

  it('should set the correct attributes of child items', function () {
    itemData1.visible = false;
    itemData1.expanded = true;
    itemData2.visible = false;
    itemData3.expanded = true;
    itemData11.expanded = true;
    itemData111.visible = false;
    itemData21.visible = false;
    itemData31.visible = false;

    itemData11.appendChild(itemData111);
    itemData1.appendChild(itemData11);
    itemData2.appendChild(itemData21);
    itemData3.appendChild(itemData31);

    itemArray.push(itemData1);
    itemArray.push(itemData2);
    itemArray.push(itemData3);

    LibraryUtilities.setItemStateRecursive(itemArray, false, true);
    expect(itemArray.length).to.equal(3);
    expect(isSetToValue(itemArray, false, true)).to.equal(true);
  });
});

describe('Search function', function () {
  let itemData1: LibraryUtilities.ItemData;
  let itemData11: LibraryUtilities.ItemData;
  let itemData12: LibraryUtilities.ItemData;
  let itemData111: LibraryUtilities.ItemData;

  beforeEach(function () {
    itemData1 = new LibraryUtilities.ItemData("Points");
    itemData11 = new LibraryUtilities.ItemData("Point");
    itemData12 = new LibraryUtilities.ItemData("UV");
    itemData111 = new LibraryUtilities.ItemData("Origin");

    itemData1.itemType = "none";
    itemData11.itemType = "none";
    itemData12.itemType = "none";
    itemData111.itemType = "none";

    itemData11.appendChild(itemData111);
    itemData1.appendChild(itemData11);
    itemData1.appendChild(itemData12);
  });

  it('should return false when nothing is found', function () {
    let result = LibraryUtilities.search("add", itemData1);

    expect(result).to.equal(false);
    expect(itemData1.visible).to.equal(false);
    expect(itemData1.expanded).to.equal(false);
    expect(itemData11.visible).to.equal(false);
    expect(itemData11.expanded).to.equal(false);
    expect(itemData12.visible).to.equal(false);
    expect(itemData12.expanded).to.equal(false);
    expect(itemData111.visible).to.equal(false);
    expect(itemData111.expanded).to.equal(false);
  });

  it('should return true when matched items are found', function () {
    let result = LibraryUtilities.search("points", itemData1);
    expect(result).to.equal(true);
  });

  it('should show all child items when parent item matches', function () {
    let result = LibraryUtilities.search("points", itemData1);
    expect(result).to.equal(true);

    expect(itemData1.visible).to.equal(true);
    expect(itemData1.expanded).to.equal(true);
    expect(itemData11.visible).to.equal(true);
    expect(itemData11.expanded).to.equal(true);
    expect(itemData12.visible).to.equal(true);
    expect(itemData12.expanded).to.equal(true);
    expect(itemData111.visible).to.equal(true);
    expect(itemData111.expanded).to.equal(true);
  });

  it('should show parent item when some of its child items are matched', function () {
    let result = LibraryUtilities.search("uv", itemData1);
    expect(result).to.equal(true);

    expect(itemData1.visible).to.equal(true);
    expect(itemData1.expanded).to.equal(true);
    expect(itemData11.visible).to.equal(false);
    expect(itemData11.expanded).to.equal(false);
    expect(itemData12.visible).to.equal(true);
    expect(itemData12.expanded).to.equal(true);
    expect(itemData111.visible).to.equal(false);
    expect(itemData111.expanded).to.equal(false);
  });

  it('should ignore item of type group', function () {
    itemData12.itemType = "group";
    let result = LibraryUtilities.search("uv", itemData1);
    expect(result).to.equal(false);

    expect(itemData1.visible).to.equal(false);
    expect(itemData1.expanded).to.equal(false);
    expect(itemData11.visible).to.equal(false);
    expect(itemData11.expanded).to.equal(false);
    expect(itemData12.visible).to.equal(false);
    expect(itemData12.expanded).to.equal(false);
    expect(itemData111.visible).to.equal(false);
    expect(itemData111.expanded).to.equal(false);
  });

});

describe("findAndExpandItemByPath function", function () {
  let allItems: LibraryUtilities.ItemData[];
  let itemData1: LibraryUtilities.ItemData;
  let itemData11: LibraryUtilities.ItemData;
  let itemData111: LibraryUtilities.ItemData;
  let itemData112: LibraryUtilities.ItemData;
  let itemData113: LibraryUtilities.ItemData;

  beforeEach(function () {
    itemData1 = new LibraryUtilities.ItemData("1");
    itemData11 = new LibraryUtilities.ItemData("11");
    itemData111 = new LibraryUtilities.ItemData("111");
    itemData112 = new LibraryUtilities.ItemData("112");

    itemData11.appendChild(itemData111);
    itemData11.appendChild(itemData112);
    itemData1.appendChild(itemData11);

    allItems = [itemData1];
  });

  it("should return true if an item is found", function () {
    let pathToItem = [itemData1, itemData11, itemData111];
    expect(LibraryUtilities.findAndExpandItemByPath(pathToItem, allItems)).to.equal(true);
  });

  it("should return false if an item is not found", function () {
    let itemData113 = new LibraryUtilities.ItemData("113");
    let pathToItem = [itemData1, itemData11, itemData113];
    expect(LibraryUtilities.findAndExpandItemByPath(pathToItem, allItems)).to.equal(false);
  });
});

describe("sortItemsByText function", function () {
  let allItems: LibraryUtilities.ItemData[];
  let itemData1: LibraryUtilities.ItemData;
  let itemData2: LibraryUtilities.ItemData;
  let itemData3: LibraryUtilities.ItemData;
  let itemData4: LibraryUtilities.ItemData;
  let itemData5: LibraryUtilities.ItemData;

  beforeEach(function () {
    itemData1 = new LibraryUtilities.ItemData("atest");
    itemData2 = new LibraryUtilities.ItemData("btest");
    itemData3 = new LibraryUtilities.ItemData("ctest");
    itemData4 = new LibraryUtilities.ItemData("dtest");
    itemData5 = new LibraryUtilities.ItemData("etest");
  });

  it("should sort items in alphabetical order", function () {
    allItems = [itemData5, itemData2, itemData1, itemData4, itemData3];

    let result = LibraryUtilities.sortItemsByText(allItems);
    expect(result.length).to.equal(5);
    expect(result[0]).to.equal(itemData1);
    expect(result[1]).to.equal(itemData2);
    expect(result[2]).to.equal(itemData3);
    expect(result[3]).to.equal(itemData4);
    expect(result[4]).to.equal(itemData5);
  });

  it("should sort items ignoring cases", function () {
    itemData1.text = "Atest";
    itemData3.text = "Ctest";
    allItems = [itemData5, itemData2, itemData1, itemData4, itemData3];

    let result = LibraryUtilities.sortItemsByText(allItems);
    expect(result.length).to.equal(5);
    expect(result[0]).to.equal(itemData1);
    expect(result[1]).to.equal(itemData2);
    expect(result[2]).to.equal(itemData3);
    expect(result[3]).to.equal(itemData4);
    expect(result[4]).to.equal(itemData5);
  });
});

describe("splitToParts function", function () {
  let prefix = "://";

  it("should return empty array if text is empty", function () {
    let text = "";
    let result = LibraryUtilities.splitToParts(prefix, text);
    expect(result.length).to.equal(0);
  });

  it("should return correct parts if text doesn't have prefix or delimiter", function () {
    let text = "a";
    let result = LibraryUtilities.splitToParts(prefix, text);
    expect(result.length).to.equal(1);
    expect(result[0]).to.equal("a");
  });

  it("should return correct parts if text doesn't have prefix", function () {
    let text = "a.b.c";
    let result = LibraryUtilities.splitToParts(prefix, text);
    expect(result.length).to.equal(3);
    expect(result[0]).to.equal("a");
    expect(result[1]).to.equal("b");
    expect(result[2]).to.equal("c");
  });

  it("should return correct parts if text has only prefix", function () {
    let text = "test://";
    let result = LibraryUtilities.splitToParts(prefix, text);
    expect(result.length).to.equal(1);
    expect(result[0]).to.equal("test://");
  });

  it("should return correct parts if text has prefix but no delimiter", function () {
    let text = "test://a";
    let result = LibraryUtilities.splitToParts(prefix, text);
    expect(result.length).to.equal(2);
    expect(result[0]).to.equal("test://");
    expect(result[1]).to.equal("a");
  });

  it("should return correct parts if text has prefix and delimiter", function () {
    let text = "test://a.b.c";
    let result = LibraryUtilities.splitToParts(prefix, text);
    expect(result.length).to.equal(4);
    expect(result[0]).to.equal("test://");
    expect(result[1]).to.equal("a");
    expect(result[2]).to.equal("b");
    expect(result[3]).to.equal("c");
  });
});
