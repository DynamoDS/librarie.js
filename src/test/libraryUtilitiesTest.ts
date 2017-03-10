import * as LibraryUtilities from '../LibraryUtilities'
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
    expect(emptyTypeListNode.iconName).to.equal(undefined);
    expect(emptyTypeListNode.memberType).to.equal(undefined);
    expect(emptyTypeListNode.creationName).to.equal(undefined);
  });

  it('should create a TypeListNode with correct attributes', function () {
    let test = 'test';
    let none = 'none';

    testData.fullyQualifiedName = test;
    testData.iconName = test;
    testData.creationName = test;
    testData.itemType = none;

    let testTypeListNode = new LibraryUtilities.TypeListNode(testData);
    expect(testTypeListNode.fullyQualifiedName).to.equal(test);
    expect(testTypeListNode.iconName).to.equal(test);
    expect(testTypeListNode.creationName).to.equal(test);
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
    expect(emptyLayoutElement.iconName).to.equal(undefined);
    expect(emptyLayoutElement.elementType).to.equal(undefined);
    expect(emptyLayoutElement.include).to.equal(undefined);
    expect(emptyLayoutElement.childElements.length).to.equal(0);
  });

  it('should be able to apped a child', function () {
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

describe('LibraryItem class', function () {

  var testData: any;
  var emptyString = '';

  beforeEach(function () {
    testData = new LibraryUtilities.LayoutElement(new testClasses.LayoutElementData());
  });

  it('should create an LibraryItem from string', function () {
    let testLibraryItem = new LibraryUtilities.ItemData(emptyString);

    expect(testLibraryItem.iconName).to.equal(emptyString);
    expect(testLibraryItem.creationName).to.equal(emptyString);
    expect(testLibraryItem.text).to.equal(emptyString);
    expect(testLibraryItem.itemType).to.equal('none');
    expect(testLibraryItem.childItems.length).to.equal(0);
  });

  it('should create an LibraryItem from layoutElement', function () {
    let testLibraryItem = new LibraryUtilities.ItemData(emptyString);
    testLibraryItem.constructFromLayoutElement(testData);

    expect(testLibraryItem.iconName).to.equal(undefined);
    expect(testLibraryItem.creationName).to.equal(emptyString);
    expect(testLibraryItem.text).to.equal(undefined);
    expect(testLibraryItem.itemType).to.equal(undefined);
    expect(testLibraryItem.childItems.length).to.equal(0);
  });

  it('should appedn some children', function () {
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
    expect(result.iconName).to.equal('a');
    expect(result.itemType).to.equal('none');
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].iconName).to.equal(typeListNode.iconName);
    expect(result.childItems[0].creationName).to.equal(typeListNode.creationName);
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
    expect(result.iconName).to.equal('a');
    expect(result.itemType).to.equal('none');
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].iconName).to.equal('a.b');
    expect(result.childItems[0].itemType).to.equal('none');
    expect(result.childItems[0].childItems.length).to.equal(1);

    expect(result.childItems[0].childItems[0].text).to.equal('c');
    expect(result.childItems[0].childItems[0].iconName).to.equal(typeListNode.iconName);
    expect(result.childItems[0].childItems[0].creationName).to.equal(typeListNode.creationName);
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
    expect(result.iconName).to.equal(parentItem.iconName);
    expect(result.creationName).to.equal(parentItem.creationName);
    expect(result.itemType).to.equal(parentItem.itemType);
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].iconName).to.equal(typeListNode.iconName);
    expect(result.childItems[0].creationName).to.equal(typeListNode.creationName);
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
    expect(result.iconName).to.equal(parentItem.iconName);
    expect(result.creationName).to.equal(parentItem.creationName);
    expect(result.itemType).to.equal(parentItem.itemType);
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal('b');
    expect(result.childItems[0].iconName).to.equal('a.b');
    expect(result.childItems[0].itemType).to.equal('none');
    expect(result.childItems[0].childItems.length).to.equal(1);

    expect(result.childItems[0].childItems[0].text).to.equal('c');
    expect(result.childItems[0].childItems[0].iconName).to.equal(typeListNode.iconName);
    expect(result.childItems[0].childItems[0].creationName).to.equal(typeListNode.creationName);
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
    expect(result.iconName).to.equal(layoutElement.iconName);
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
    expect(result.iconName).to.equal(layoutElement.iconName);
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
    expect(result.iconName).to.equal(layoutElement.iconName);
    expect(result.itemType).to.equal(layoutElement.elementType);
    expect(result.childItems.length).to.equal(1);

    expect(result.childItems[0].text).to.equal(typeListNode.fullyQualifiedName);
    expect(result.childItems[0].iconName).to.equal(typeListNode.iconName);
    expect(result.childItems[0].creationName).to.equal(typeListNode.creationName);
    expect(result.childItems[0].itemType).to.equal(typeListNode.memberType);
    expect(result.childItems[0].childItems.length).to.equal(0);
  });

});