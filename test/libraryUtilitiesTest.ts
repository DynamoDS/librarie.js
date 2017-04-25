import * as LibraryUtilities from '../src/LibraryUtilities'
import * as testClasses from './libraryUtilitiesTestClasses'

import { expect } from 'chai';
import 'mocha';

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

describe('constructNestedLibraryItems function', function () {
  var includedParts: any;
  var typeListNode: any;
  var inclusive: any;
  var parentItem: any;
  var result: any;

  it('should construct an empty LibraryItem', function () {
    includedParts = [];
    typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    inclusive = true;
    typeListNode.fullyQualifiedName = '';
    parentItem = new LibraryUtilities.ItemData('');

    result = LibraryUtilities.constructNestedLibraryItems(includedParts, typeListNode, inclusive, parentItem);
    expect(result).to.be.an.instanceOf(LibraryUtilities.ItemData);
    expect(result).to.equal(parentItem);
  });

  it('should throw error if includedParts is larger than fullNameParts', function () {
    includedParts = ['a', 'b', 'c'];
    typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    inclusive = true;
    parentItem = new LibraryUtilities.ItemData('');
    typeListNode.fullyQualifiedName = '';

    expect(LibraryUtilities.constructNestedLibraryItems.bind(
      LibraryUtilities.constructNestedLibraryItems, includedParts, typeListNode, inclusive, parentItem)).to.throw(/Invalid input/);
  });

  it('should work if incluedParts is less than fullNameParts, and parentItem is null', function () {
    includedParts = ['a'];
    typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode.fullyQualifiedName = 'a.b';
    inclusive = true;
    parentItem = null;

    result = LibraryUtilities.constructNestedLibraryItems(includedParts, typeListNode, inclusive, parentItem);

    expect(result.text).to.equal('a');
    expect(result.itemType).to.equal('none');
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].iconUrl).to.equal(typeListNode.iconUrl);
    expect(result.childItems[0].contextData).to.equal(typeListNode.contextData);
    expect(result.childItems[0].itemType).to.equal(typeListNode.memberType);
  });

  it('should work if incluedParts is less than fullNameParts, and parentItem is null', function () {
    includedParts = ['a'];
    typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode.fullyQualifiedName = 'a.b.c';
    inclusive = true;
    parentItem = null;

    result = LibraryUtilities.constructNestedLibraryItems(includedParts, typeListNode, inclusive, parentItem);

    expect(result.text).to.equal('a');
    expect(result.itemType).to.equal('none');
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].itemType).to.equal('none');
    expect(result.childItems[0].childItems.length).to.equal(1);

    expect(result.childItems[0].childItems[0].text).to.equal('c');
    expect(result.childItems[0].childItems[0].iconUrl).to.equal(typeListNode.iconUrl);
    expect(result.childItems[0].childItems[0].contextData).to.equal(typeListNode.contextData);
    expect(result.childItems[0].childItems[0].itemType).to.equal(typeListNode.memberType);
    expect(result.childItems[0].childItems[0].childItems.length).to.equal(0);
  });

  it('should work if incluedParts is less than fullNameParts, and parentItem is not null', function () {
    includedParts = ['a'];
    typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode.fullyQualifiedName = 'a.b';
    inclusive = true;
    parentItem = new LibraryUtilities.ItemData('');

    result = LibraryUtilities.constructNestedLibraryItems(includedParts, typeListNode, inclusive, parentItem);

    expect(result.text).to.equal(parentItem.text);
    expect(result.iconUrl).to.equal(parentItem.iconUrl);
    expect(result.contextData).to.equal(parentItem.contextData);
    expect(result.itemType).to.equal(parentItem.itemType);
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].iconUrl).to.equal(typeListNode.iconUrl);
    expect(result.childItems[0].contextData).to.equal(typeListNode.contextData);
    expect(result.childItems[0].itemType).to.equal(typeListNode.memberType);
  });

  it('should work if incluedParts is less than fullNameParts, and parentItem is not null', function () {
    includedParts = ['a'];
    typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode.fullyQualifiedName = 'a.b.c';
    inclusive = true;
    parentItem = new LibraryUtilities.ItemData('');

    result = LibraryUtilities.constructNestedLibraryItems(includedParts, typeListNode, inclusive, parentItem);

    expect(result.text).to.equal(parentItem.text);
    expect(result.iconUrl).to.equal(parentItem.iconUrl);
    expect(result.contextData).to.equal(parentItem.contextData);
    expect(result.itemType).to.equal(parentItem.itemType);
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].itemType).to.equal('none');
    expect(result.childItems[0].childItems.length).to.equal(1);

    expect(result.childItems[0].childItems[0].text).to.equal('c');
    expect(result.childItems[0].childItems[0].iconUrl).to.equal(typeListNode.iconUrl);
    expect(result.childItems[0].childItems[0].contextData).to.equal(typeListNode.contextData);
    expect(result.childItems[0].childItems[0].itemType).to.equal(typeListNode.memberType);
    expect(result.childItems[0].childItems[0].childItems.length).to.equal(0);
  });
});

describe('constructLibraryItem function', function () {
  var layoutElements: LibraryUtilities.LayoutElement[];
  var typeListNodes: LibraryUtilities.TypeListNode[];
  var includeInfo1: LibraryUtilities.IncludeInfo;
  var includeInfo2: LibraryUtilities.IncludeInfo;
  var includeInfo3: LibraryUtilities.IncludeInfo;
  var result: any;

  beforeEach(function () {
    layoutElements = [];
    typeListNodes = [];
  });

  it('should construct an empty LibraryItem', function () {
    let layoutElement = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    layoutElement.include = [];
    let typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());

    result = LibraryUtilities.constructLibraryItem(typeListNodes, layoutElement);

    expect(result).to.be.an.instanceOf(LibraryUtilities.ItemData);
    expect(result.text).to.equal(layoutElement.text);
    expect(result.iconUrl).to.equal(layoutElement.iconUrl);
    expect(result.itemType).to.equal(layoutElement.elementType);
    expect(result.childItems.length).to.equal(0);
  });

  it('should constrcut the correct LibraryItem when there is only one TypeListNode', function () {
    let layoutElement = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    layoutElement.include = [];
    includeInfo1 = { path: 'a' };
    layoutElement.include.push(includeInfo1);

    let typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode.fullyQualifiedName = 'b';
    typeListNodes.push(typeListNode);

    result = LibraryUtilities.constructLibraryItem(typeListNodes, layoutElement);

    expect(result.text).to.equal(layoutElement.text);
    expect(result.iconUrl).to.equal(layoutElement.iconUrl);
    expect(result.itemType).to.equal(layoutElement.elementType);
    expect(result.childItems.length).to.equal(0);
  });

  it('should constrcut the correct LibraryItem when there is only one TypeListNode', function () {
    let layoutElement = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    layoutElement.include = [];
    includeInfo1 = { path: 'a' };
    layoutElement.include.push(includeInfo1);

    let typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode.fullyQualifiedName = 'a';
    typeListNodes.push(typeListNode);

    result = LibraryUtilities.constructLibraryItem(typeListNodes, layoutElement);

    expect(result.text).to.equal(layoutElement.text);
    expect(result.iconUrl).to.equal(layoutElement.iconUrl);
    expect(result.itemType).to.equal(layoutElement.elementType);
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal(typeListNode.fullyQualifiedName);
    expect(result.childItems[0].iconUrl).to.equal(typeListNode.iconUrl);
    expect(result.childItems[0].contextData).to.equal(typeListNode.contextData);
    expect(result.childItems[0].itemType).to.equal(typeListNode.memberType);
    expect(result.childItems[0].childItems.length).to.equal(0);
  });

  /*
    This test creates a single layoutELement:
    {
      ...
      "include": [ { "path": "a.b" } ],
      "childElements": []
    }

    And two typeListNodes:
    {
      {
        "fullyQualifiedName": "a.b",
        "contextData": "a.b@param1"
      },
      {
        "fullyQualifiedName": "a.b",
        "contextData": "a.b@param1,param2",
      }
    }

    The result should have the following structure:
    - parent node
      |- b (overload 1)
      |- b (overload 2)
   */
  it('should construct overloads using a single path', function () {
    let layoutElement = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    layoutElement.include = [];
    includeInfo1 = { path: 'a.b' };
    layoutElement.include.push(includeInfo1);

    let typeListNode1 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode1.fullyQualifiedName = 'a.b';
    typeListNode1.contextData = 'a.b@param1';
    typeListNodes.push(typeListNode1);

    let typeListNode2 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode2.fullyQualifiedName = 'a.b'; // The overload has the same fullyQualifiedName
    typeListNode2.contextData = 'a.b@param1,param2';
    typeListNodes.push(typeListNode2);

    result = LibraryUtilities.constructLibraryItem(typeListNodes, layoutElement);
    expect(result.childItems.length).to.equal(2);
    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].contextData).to.equal('a.b@param1');
    expect(result.childItems[1].text).to.equal('b');
    expect(result.childItems[1].contextData).to.equal('a.b@param1,param2');
  })

  /*
    The following test creates a nested layoutElement:
    {
      ... //  parent item 1
      "include": []
      "childItems": [
        {
          ... // parent item 2
          "include": [ { "path": "a.b.c" } ],
          "childItems": []
        }
      ]
    }

    And two typeListNodes:
    {
      {
        "fullyQualifiedName": "a.b.c.d"
      },
      {
        "fullyQualifiedName": "a.b.c.e"
      }
    }

    The result should have the following structure:
    - parent item 1 (result)
      |- parent item 2
          |- c
             |- d
             |- e
  */
  it('should construct correctly nested library items', function () {
    let layoutElement = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    layoutElement.include = [];

    let childLayoutElement = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    childLayoutElement.include = [];
    includeInfo1 = { path: 'a.b.c' };
    childLayoutElement.include.push(includeInfo1);
    layoutElement.childElements.push(childLayoutElement);

    let typeListNode1 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode1.fullyQualifiedName = 'a.b.c.d';
    typeListNodes.push(typeListNode1);

    let typeListNode2 = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode2.fullyQualifiedName = 'a.b.c.e';
    typeListNodes.push(typeListNode2);

    result = LibraryUtilities.constructLibraryItem(typeListNodes, layoutElement);
    expect(result.childItems.length).to.equal(1);
    expect(result.childItems[0].childItems.length).to.equal(1);

    let cNode = result.childItems[0].childItems[0];
    expect(cNode.text).to.equal('c');
    expect(cNode.childItems.length).to.equal(2);
    expect(cNode.childItems[0].text).to.equal('d');
    expect(cNode.childItems[1].text).to.equal('e');
  })

  /*
    The following test creates two layoutElements:
    {
      {
        ... // parent item 1
        "include": [],
        "childItems": [
          {
            ... // child item 1
            "include": [ { "path": "a.b" } ],
            "childElements": []
          },
          {
            ... // child item 2
            "include": [ { "path": "a.b" } ],
            "childElements": []
          }
        ]
      }
    }

    And one typeListNode:
    {
      {
        "fullyQualifiedName": "a.b"
      }
    }

    The result should have the following structure:
    - parent item 1 (result)
      |- child item 1
         |- b
      |- child item 2
         |- b
  */
  it('should construct nodes from duplicated paths', function () {
    let layoutElement = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    layoutElement.include = [];

    includeInfo1 = { path: 'a.b' };

    let childItem1 = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    childItem1.include = [];
    childItem1.include.push(includeInfo1);

    let childItem2 = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
    childItem2.include = [];
    childItem2.include.push(includeInfo1);

    layoutElement.childElements.push(childItem1);
    layoutElement.childElements.push(childItem2);

    let typeListNode = new LibraryUtilities.TypeListNode(new testClasses.TypeListNodeData());
    typeListNode.fullyQualifiedName = 'a.b';
    typeListNodes.push(typeListNode);

    result = LibraryUtilities.constructLibraryItem(typeListNodes, layoutElement);
    expect(result.childItems.length).to.equal(2);
    expect(result.childItems[0].childItems.length).to.equal(1);
    expect(result.childItems[1].childItems.length).to.equal(1);
    expect(result.childItems[0].childItems[0].text).to.equal('b');
    expect(result.childItems[1].childItems[0].text).to.equal('b');
  })
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