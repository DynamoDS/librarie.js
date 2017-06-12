/// <reference path="../node_modules/@types/node/index.d.ts" />

import * as React from "react";

type MemberType = "none" | "create" | "action" | "query";
type ElementType = "none" | "section" | "category" | "group";
type ItemType = "none" | "section" | "category" | "group" | "create" | "action" | "query";

import * as _ from 'underscore';

export class TypeListNode {

    fullyQualifiedName: string = "";
    iconUrl: string = "";
    contextData: any = "";
    memberType: MemberType = "none";
    keywords: string = "";
    parameters: string = "";
    description: string = "";
    processed: boolean = false;
    weight: Number = 0;

    constructor(data: any) {
        this.fullyQualifiedName = data.fullyQualifiedName;
        this.iconUrl = data.iconUrl;
        this.contextData = data.contextData;
        this.memberType = data.itemType;
        this.keywords = data.keywords;
        this.parameters = data.parameters;
        this.description = data.description;
        this.weight = data.weight;
    }
}

export interface IncludeInfo {
    path: string;
    iconUrl?: string;
    inclusive?: boolean;
}

export class IncludeItemPair {
    include: IncludeInfo;
    parentItem: ItemData;
}

export class LayoutElement {

    text: string = "";
    iconUrl: string = "";
    showHeader: boolean = true;
    elementType: ElementType = "none";
    include: IncludeInfo[] = [];
    childElements: LayoutElement[] = [];

    constructor(data: any) {
        this.text = data.text;
        this.iconUrl = data.iconUrl;
        this.elementType = data.elementType;
        this.include = data.include;

        if (data.childElements) {
            for (let i = 0; i < data.childElements.length; i++) {
                this.childElements.push(new LayoutElement(data.childElements[i]));
            }
        }

        if (data.showHeader == false) {
            this.showHeader = data.hideSectionHeader;
        }
    }

    appendChild(childElement: LayoutElement) {
        this.childElements.push(childElement);
    }
}

export class ItemData {

    iconUrl: string = "";
    contextData: any = "";
    itemType: ItemType = "none";
    visible: boolean = true;
    expanded: boolean = false;
    showHeader: boolean = true;
    keywords: string[] = [];
    parameters: string = "";
    description: string = "";
    childItems: ItemData[] = [];
    weight: Number = 0;

    constructor(public text: string) {
        this.keywords.push(text ? text.toLowerCase() : text);
    }

    constructFromLayoutElement(layoutElement: LayoutElement) {
        this.contextData = layoutElement.text;
        this.iconUrl = layoutElement.iconUrl;
        this.itemType = layoutElement.elementType;
        this.showHeader = layoutElement.showHeader;
    }

    constructFromTypeListNode(typeListNode: TypeListNode) {
        this.contextData = typeListNode.contextData;
        this.iconUrl = typeListNode.iconUrl;
        this.itemType = typeListNode.memberType;
        this.parameters = typeListNode.parameters;
        this.description = typeListNode.description;
        if (typeListNode.weight) {
            this.weight = typeListNode.weight;
        }

        // Get keywords from typeListNode and push them into itemData
        let keywords = typeListNode.keywords.split(",");
        this.keywords.forEach(keyword => {
            this.keywords.push(keyword.toLowerCase().replace(/ /g, ''));
        });
        this.keywords.push(typeListNode.fullyQualifiedName.toLowerCase().replace(/ /g, ''));
    }

    appendChild(childItem: ItemData) {
        this.childItems.push(childItem);
    }
}

export class JsonDownloader {

    callback: Function = null;
    downloadedJson: any = {};

    constructor(jsonUrls: string[], callback: Function) {

        this.notifyOwner = this.notifyOwner.bind(this);
        this.fetchJsonContent = this.fetchJsonContent.bind(this);
        this.getDownloadedJsonObjects = this.getDownloadedJsonObjects.bind(this);

        // Begin download each contents.
        this.callback = callback;
        for (let key in jsonUrls) {
            this.fetchJsonContent(jsonUrls[key]);
        }
    }

    notifyOwner(jsonUrl: string, jsonObject: any) {
        this.callback(jsonUrl, jsonObject);
    }

    fetchJsonContent(jsonUrl: string) {

        let thisObject = this;

        // Download the locally hosted data type json file.
        fetch(jsonUrl)
            .then(function (response: Response) {
                return response.text();
            }).then(function (jsonString) {
                let parsedJsonObject = JSON.parse(jsonString);
                thisObject.downloadedJson[jsonUrl] = parsedJsonObject;
                thisObject.notifyOwner(jsonUrl, parsedJsonObject);
            });
    }

    getDownloadedJsonObjects() {
        return this.downloadedJson;
    }
}

/**
 * Checks if each string in 'partsToInclude' matches the string with the same index in 'parts'.
 * If all match, returns how many strings 'parts' has more than 'partsToInclude'.
 * 
 * @param {string[]} parts 
 * The array of strings to be checked.
 * 
 * @param {string[]} partsToInclude 
 * The array of strings that should be present in 'parts'.
 * 
 * @returns
 * Returns 0 if the two inputs match completely.
 * Returns how many items 'parts' has more than 'partsToInclude', provided that
 * 'parts' contains all items in 'partsToInclude'.
 * Returns -1 if the two inputs do not match.
 * 
 * Example:
 * parts = ['A', 'B', 'C'], partsToInclude = ['A', 'B', 'C', 'D', 'E'] -> returns 2
 * parts = ['A', 'B', 'C'], partsToInclude = ['A', 'B', 'C'] -> returns 0 (match completely)
 * parts = ['A', 'B', 'C'], partsToInclude = ['A', 'B', 'D'] -> returns -1 (not matching)
 * parts = ['A', 'B', 'C'], partsToInclude = ['A', 'X', 'C'] -> returns -1 (not matching)
 * 
 */
function compareParts(parts: string[], partsToInclude: string[]): number {
    for (let i = 0; i < partsToInclude.length; i++) {
        if (parts[i] != partsToInclude[i]) {
            return -1;
        }
    }
    return parts.length - partsToInclude.length;
}

function updateElement(oldElement: LayoutElement, newElement: LayoutElement): void {

    // Duplicate basic properties.
    oldElement.text = newElement.text;
    oldElement.iconUrl = newElement.iconUrl;
    oldElement.showHeader = newElement.showHeader;
    oldElement.elementType = newElement.elementType;

    // Find an existing IncludeInfo that matches the new IncludeInfo. 
    // If one is found, then its contents are updated to match the new 
    // IncludeInfo, otherwise the new IncludeInfo will be appended to
    // the existing include list.
    // 
    for (let pathInfo of newElement.include) {
        let pathToUpdate = oldElement.include.find(function (p: IncludeInfo) {
            return p.path === pathInfo.path;
        });

        if (pathToUpdate) {
            // An existing entry is found, update its contents.
            pathToUpdate.path = pathInfo.path;
            pathToUpdate.iconUrl = pathInfo.iconUrl;
            pathToUpdate.inclusive = pathInfo.inclusive;
        } else {
            // No existing entry is found, make a copy of the new IncludeInfo
            oldElement.include.push({
                path: pathInfo.path,
                iconUrl: pathInfo.iconUrl,
                inclusive: pathInfo.inclusive
            });
        }
    }

    // Done handling 'include' property, proceed to deal with 'childElements'
    for (let childElement of newElement.childElements) {

        let nameOfChildToUpdate = childElement.text;
        let childToUpdate = oldElement.childElements.find(function (c) {
            return c.text === nameOfChildToUpdate;
        });

        if (!childToUpdate) {
            // If no existing child is found, insert the new element directly.
            oldElement.childElements.push(childElement);
        } else {
            // If an existing child is found, update it recursively.
            updateElement(childToUpdate, childElement);
        }
    }
}

// See 'updateElement' method above for details.
export function updateSections(oldLayoutSpecs: any, newLayoutSpecs: any): void {

    if (!oldLayoutSpecs || (!newLayoutSpecs)) {
        throw new Error("Both 'oldLayoutSpecs' and 'newLayoutSpecs' parameters must be supplied");
    }

    if (!oldLayoutSpecs.sections || (!Array.isArray(oldLayoutSpecs.sections))) {
        throw new Error("'oldLayoutSpecs.sections' must be a valid array");
    }

    if (!newLayoutSpecs.sections || (!Array.isArray(newLayoutSpecs.sections))) {
        throw new Error("'newLayoutSpecs.sections' must be a valid array");
    }

    // Go through each of the new sections...
    for (let section of newLayoutSpecs.sections) {

        // Find out the corresponding old section (with the same name) to update.
        let sectionNameToUpdate = section.text;
        let sectionToUpdate = oldLayoutSpecs.sections.find(
            function (s: LayoutElement) {
                return s.text === sectionNameToUpdate
            });

        // If section with the same name cannot be found, then this is a new section.
        // Append the new section and then proceed to check on the next section.
        if (!sectionToUpdate) {
            oldLayoutSpecs.sections.push(section);
            continue;
        }

        // Recursively update the element and its child elements.
        updateElement(sectionToUpdate, section);
    }
}

/**
 * This function will convert layoutElements to ItemData, and construct an array of IncludeItemPair,
 * which stores an includeInfo and its parent item.
 * 
 * @param {LayoutElement[]} layoutElements 
 * The layoutElements to be converted to ItemData
 * 
 * @param {IncludeItemPair[]} pairs
 * The IncludeItemPairs to be contructed from
 * 
 * @param {ItemData} parentItem 
 * The parentItem of layoutElements (if exist)
 */
function convertLayoutElementToItemData(
    layoutElements: LayoutElement[],
    pairs: IncludeItemPair[],
    parentItem?: ItemData): ItemData[] {
    let results: ItemData[] = [];

    for (let layoutElement of layoutElements) {
        let layoutData = new ItemData(layoutElement.text);
        layoutData.constructFromLayoutElement(layoutElement);

        // Sections that don't show its header will be expanded by default.
        if (layoutData.itemType === "section" && !layoutData.showHeader) {
            layoutData.expanded = true;
        }

        if (parentItem) {
            parentItem.appendChild(layoutData);
        }

        if (layoutElement.include.length > 0) {
            for (let include of layoutElement.include) {
                let pair = new IncludeItemPair();
                pair.include = include;
                pair.parentItem = layoutData;
                pairs.push(pair);
            }
        }

        if (layoutElement.childElements.length > 0) {
            convertLayoutElementToItemData(layoutElement.childElements, pairs, layoutData);
        }

        results.push(layoutData);
    }

    return results;
}

// This method will return a sorted array of all the includeInfo in layoutElements
export function getIncludeInfo(layoutElements: LayoutElement[]): IncludeInfo[] {
    let results: IncludeInfo[] = [];

    for (let layoutElement of layoutElements) {
        if (layoutElement.include.length > 0) {
            results = results.concat(layoutElement.include);
        }

        if (layoutElement.childElements.length > 0) {
            results = results.concat(getIncludeInfo(layoutElement.childElements));
        }
    }

    results = results.sort((a, b) => a.path.localeCompare(b.path));

    return results;
}

/**
 * This method will merge all typeListNodes under corresponding library items based on includeItemPairs.
 * Each includeItemPair stores includeInfo and the parent item of this includeInfo.
 * 
 * When iterating through includeItemPairs, comparison will happen between fullyQualifiedName of typeListNode 
 * and path of the include info of each pair.. 
 * 
 * If there is a match of them, which means they are exactly the same, this type node will be merged to 
 * the parent item of the includeInfo. 
 * 
 * If there is not a match, but fullyQualifiedName includes path, this type node will
 * first be built from name, and then merged to the parent item.
 * For example, if fullayQualifiedName is A.B.C.D, path is A.B, the item to be merged would have the 
 * following structure.
 * 
 * - parentItem
 *  |- B
 *      |- C
 *          |- D
 * 
 * If there is not a match or include, skip to next includeInfo/typeListNode, depending on their 
 * lexicographical order.
 * 
 * @param {TypeListNode[]} typeListNodes 
 * An array of TypelistNode sorted in alphabetical order
 * 
 * @param {IncludeItemPairs[]} includeItemPairs
 * An array of IncludeItemPair sorted in alphabetical order of include.path
 */
export function constructFromIncludeInfo(typeListNodes: TypeListNode[], includeItemPairs: IncludeItemPair[]) {
    let t = 0;
    let prefix = "://";
    let nodeMatch = false;
    let nodeInculde = false;

    for (let i = 0; i < includeItemPairs.length && t < typeListNodes.length; i++) {

        let fullyQualifiedNameParts = typeListNodes[t].fullyQualifiedName.split(".");
        let include = includeItemPairs[i].include;
        let parentItem = includeItemPairs[i].parentItem;
        let node = typeListNodes[t];
        nodeMatch = false;
        nodeInculde = false;

        if (include.path.indexOf(prefix) == -1) {
            let includeParts = include.path.split(".");
            let compareResult = compareParts(fullyQualifiedNameParts, includeParts);

            if (compareResult == 0) {
                nodeMatch = true;
            } else if (compareResult > 0) {
                nodeInculde = true;

                let newNameParts = -compareResult - 1;
                if (include.inclusive == false) {
                    newNameParts = -compareResult;
                }

                let newName = fullyQualifiedNameParts.slice(newNameParts).join('.');

                buildLibraryItemsFromName(node, parentItem, newName, include.iconUrl);
            } else if (node.fullyQualifiedName.localeCompare(include.path) < 0) {
                i--;
                t++;
            }
        } else if (node.fullyQualifiedName.startsWith(include.path)) {
            nodeInculde = true;
            let prefixIndex = node.fullyQualifiedName.indexOf(prefix);
            let newName = node.fullyQualifiedName.substring(prefixIndex + prefix.length);
            buildLibraryItemsFromName(node, parentItem, newName);
        }

        if (nodeMatch) {
            let item = new ItemData(fullyQualifiedNameParts[fullyQualifiedNameParts.length - 1]);
            item.constructFromTypeListNode(node);
            parentItem.appendChild(item);
        }

        if (nodeMatch || nodeInculde) {
            node.processed = true;
            i--;
            t++;
        }
    }
}

export function buildLibrarySectionsFromLayoutSpecs(loadedTypes: any, layoutSpecs: any, defaultSectionStr: string, miscSectionStr: string): ItemData[] {

    let typeListNodes: TypeListNode[] = [];
    let sectionElements: LayoutElement[] = [];

    // Converting raw data to strongly typed data.
    for (let loadedType of loadedTypes.loadedTypes) {
        typeListNodes.push(new TypeListNode(loadedType));
    }

    for (let section of layoutSpecs.sections) {
        sectionElements.push(new LayoutElement(section));
    }

    let includeItemPairs: IncludeItemPair[] = [];
    let sortedIncludeInfoList = getIncludeInfo(sectionElements);

    if (!isValidaIncludeInfoList(sortedIncludeInfoList)) {
        console.error("Invalid layoutSpecs: include info is not unique");
    }

    let sections = convertLayoutElementToItemData(sectionElements, includeItemPairs);

    let sortedIncludeItemPairs = includeItemPairs.sort((a, b) => a.include.path.localeCompare(b.include.path));
    let sortedTypeListNodes = typeListNodes.sort((a, b) => a.fullyQualifiedName.localeCompare(b.fullyQualifiedName));

    constructFromIncludeInfo(sortedTypeListNodes, sortedIncludeItemPairs);

    // Misc section will take all unprocessed nodes
    let miscSection = sections.find(section => section.text == miscSectionStr);
    let unprocessedNodes = sortedTypeListNodes.filter(node => !node.processed);
    unprocessedNodes.forEach(node => buildLibraryItemsFromName(node, miscSection));

    for (let section of sections) {
        // Change the itemType of the outermost nodes to category
        section.childItems.forEach(item => {
            if (item.itemType == "group") {
                item.itemType = "category";
            }
        });
    }

    removeEmptyNodes(sections);

    return sections;
}

// Remove empty non-leaf nodes from items
function removeEmptyNodes(items: ItemData[]) {
    items.forEach((item, index, items) => {
        if (item.childItems.length > 0) {
            removeEmptyNodes(item.childItems);
        } else if (item.itemType === "section" || item.itemType === "category" || item.itemType === "group") {
            items.splice(index, 1);
        }
    });
}

export function buildLibraryItemsFromName(typeListNode: TypeListNode, parentNode: ItemData, newNodeName?: string, iconUrl?: string) {
    let fullyQualifiedNameParts: string[] = newNodeName ? newNodeName.split('.') : typeListNode.fullyQualifiedName.split('.');

    // Take an example:
    // Given fullyQualifiedName = 'A.B.C.D'
    //       fullyQualifiedNameParts  = [ A, B, C, D ];
    // At each recursive call, the fullyQualifiedName is sliced to exclude its first 
    // part, and the sliced name is reassigned to fullyQualifiedName.

    // Check if the fullyQualifiedName represents a leaf node
    // (i.e. the name has been reduced to 'D')
    if (fullyQualifiedNameParts.length == 1) {
        let newNode: ItemData = new ItemData(fullyQualifiedNameParts[0]);
        newNode.constructFromTypeListNode(typeListNode);
        typeListNode.processed = true;

        // All items without category will fall under Others
        if (parentNode.itemType === "section") {
            let categoryName = "Others";
            let category = parentNode.childItems.find(item => item.text == categoryName);

            if (!category) {
                category = new ItemData(categoryName);
                category.itemType = "category";
                parentNode.appendChild(category);
            }

            category.appendChild(newNode);
        } else {
            parentNode.appendChild(newNode);
        }

        return;
    }

    // 'slicedParts' excludes the first item in fullyQualifiedNameParts.
    // Given fullyQualifiedNameParts  = [ A, B, C, D ];
    // then slicedParts = [ B, C, D ];
    let slicedParts = fullyQualifiedNameParts.slice(1);

    // Use the reduced parts ('B.C.D') as the new name of the node 
    let newName = slicedParts.join('.');

    // Determine whether a node named 'A' should be created (using the previous example).
    // Check through the parent's child items to see if a node of the same name already exists.
    for (let item of parentNode.childItems) {
        if (item.text == fullyQualifiedNameParts[0]) {
            // Since fullyQualifiedName of typeListNode has been reduced to 'B.C.D', 
            // this function will create nested items for the name 'B.C.D' while passing 'A'
            // as the parent node.
            buildLibraryItemsFromName(typeListNode, item, newName);
            return;
        }
    }

    // Otherwise, create the new parent node 'A' (using the previous example).
    let newParentNode = new ItemData(fullyQualifiedNameParts[0]);
    newParentNode.constructFromTypeListNode(typeListNode);

    if (iconUrl) {
        newParentNode.itemType = "none";
        newParentNode.iconUrl = iconUrl;
    } else {
        newParentNode.itemType = "group";
    }

    // Create nested items for the name 'B.C.D' while passing 'A' as the parent node.
    buildLibraryItemsFromName(typeListNode, newParentNode, newName);
    parentNode.childItems.unshift(newParentNode);
}

export function isValidaIncludeInfoList(includeInfoList: IncludeInfo[]): boolean {
    for (let i = 0; i < includeInfoList.length - 1; i++) {
        let currentParts = includeInfoList[i].path.split(".");
        let nextParts = includeInfoList[i + 1].path.split(".");
        if (compareParts(nextParts, currentParts) >= 0) {
            return false;
        }
    }

    return true;
}

// Recursively set visible and expanded states of ItemData
export function setItemStateRecursive(items: ItemData | ItemData[], visible: boolean, expanded: boolean) {
    items = (items instanceof Array) ? items : [items];
    for (let item of items) {
        item.visible = visible;
        if (item.itemType !== "section") {
            item.expanded = expanded;
        }

        // All sections other than default section are collapsed by default.
        if (item.itemType === "section" && item.text !== "default") {
            item.expanded = false;
        }

        setItemStateRecursive(item.childItems, visible, expanded);
    }
}

export function search(text: string, item: ItemData) {
    if (item.itemType !== "group") {
        for (let keyword of item.keywords) {
            if (keyword.includes(text)) {
                // Show all items recursively if a given text is found in the current 
                // (parent) item. Note that this does not apply to items of "group" type
                setItemStateRecursive(item, true, true);
                return true;
            }
        }
    }

    // Recusively search in child items if the item is of "group" type, 
    // or text is not found in the current(parent) item
    item.visible = false;
    for (let childItem of item.childItems) {
        if (search(text, childItem)) {
            item.visible = true;
            item.expanded = true;
        }
    }

    return item.visible;
}

export function searchItemResursive(items: ItemData[], text: string) {
    for (let item of items) {
        search(text, item);
    }
}

export function getHighlightedText(text: string, highlightedText: string, matchDelimiter: boolean): React.DOMElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>[] {
    if (matchDelimiter) {
        let delimiter = ".";
        if (highlightedText.includes(delimiter)) {
            let leafText = highlightedText.split(delimiter).pop();
            if (text.toLowerCase().includes(leafText)) {
                highlightedText = leafText;
            }
        }
    }

    let regex = new RegExp(highlightedText, 'gi');
    let segments = text.split(regex);
    let replacements = text.match(regex);
    let spans: React.DOMElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>[] = [];

    for (let i = 0; i < segments.length; i++) {
        spans.push(React.DOM.span({ key: spans.length }, segments[i]));
        if (i != segments.length - 1) {
            spans.push(React.DOM.span({ className: "HighlightedText", key: spans.length }, replacements[i]));
        }
    }

    return spans;
}

/**
 * Find an item from all Items based on path to the item, and expand all Items along the path.
 * 
 * @param {ItemData[]} pathToItem
 * An arry of ItemData which represents the path to an item.
 * 
 * For example, in the following tree, pathToItem for D would be [A, B, D]
 * - A
 *   |- B
 *      |- C
 *      |- D
 * 
 * @param {ItemData} allItems
 * An array of ItemData, which contains all the items. In the example above,
 * allItems would be [A]
 * 
 * @return {boolean} true if an item is found, false otherwise
 */
export function findAndExpandItemByPath(pathToItem: ItemData[], allItems: ItemData[]): boolean {
    let item: ItemData;

    item = allItems.find(item =>
        item.text == pathToItem[0].text && item.iconUrl == pathToItem[0].iconUrl
    );

    if (pathToItem.length == 1) {
        return item ? true : false;
    } else {
        pathToItem.shift();
        let result = findAndExpandItemByPath(pathToItem, item.childItems);
        item.expanded = result; // Expand only if item is found.
        return result;
    }
}

export function sortItemsByText(items: ItemData[]): ItemData[] {
    let sortedItems = items.sort(function (item1: ItemData, item2: ItemData) {
        return item1.text.localeCompare(item2.text);
    })

    return sortedItems;
}