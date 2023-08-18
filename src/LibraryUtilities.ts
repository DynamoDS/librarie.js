/// <reference path="../node_modules/@types/node/index.d.ts" />

import * as React from "react";

type MemberType = "none" | "create" | "action" | "query";
type ElementType = "none" | "section" | "category" | "group" | "coregroup" | "classType";
type ItemType = "none" | "section" | "category" | "group" | "create" | "action" | "query" | "classType" | "coregroup";

export class TypeListNode {

    fullyQualifiedName: string = "";
    iconUrl: string = "";
    contextData: any = "";
    memberType: MemberType = "none";
    keywords: string = "";
    parameters: string = "";
    description: string = "";
    processed: boolean = false;
    weight: number = 0;

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
    owningItem: ItemData;

    constructor(include: IncludeInfo, owningItem: ItemData) {
        this.include = include;
        this.owningItem = owningItem;
    }
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
            for (const element of data.childElements) {
                this.childElements.push(new LayoutElement(element));
            }
        }

        if (data.showHeader === false) {
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
    pathToItem: ItemData[] = [];
    weight: number = 0;

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
 * This function converts LayoutElement objects to corresponding ItemData objects 
 * in hierarchical structure. As part of this process, the function generates a 
 * list of IncludeItemPair objects for each of the IncludeInfo object under a given 
 * LayoutElement object. 
 * 
 * @param {LayoutElement[]} layoutElements 
 * A list of LayoutElement objects to be converted to ItemData
 * 
 * @param {IncludeItemPair[]} pairs
 * A list of IncludeItemPair objects that are generated, each for an 
 * IncludeInfo under a given LayoutElement object.
 * 
 * @param {ItemData} parentItem 
 * The parent ItemData object if one exists. Each of the LayoutElement objects
 * will be converted to the corresponding ItemData, and these ItemData objects 
 * will be appended under 'parentItem' as a child item.
 */
function convertLayoutElementToItemData(
    layoutElements: LayoutElement[],
    pairs: IncludeItemPair[],
    parentItem?: ItemData):
    ItemData[] {

    let results: ItemData[] = [];

    for (let layoutElement of layoutElements) {
        let layoutData = new ItemData(layoutElement.text);
        layoutData.constructFromLayoutElement(layoutElement);

        // Sections that don't show its header will be expanded by default.
        if (layoutData.itemType === "section" && !layoutData.showHeader) {
            layoutData.expanded = true;
        }

        //https://jira.autodesk.com/browse/QNTM-2975
        if (layoutData.contextData === "Add-ons") {
            layoutData.expanded = true;
        }

        if (parentItem) {
            parentItem.appendChild(layoutData);
        }

        if (layoutElement.include.length > 0) {
            for (let include of layoutElement.include) {
                let pair = new IncludeItemPair(include, layoutData);
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

/**
 * This function merges all TypeListNode objects under the corresponding ItemData 
 * (i.e. a library item) based on information provided in IncludeItemPair. Each 
 * IncludeItemPair stores an IncludeInfo and the owning ItemData for that IncludeInfo.
 * 
 * When the function iterates through each IncludeItemPair object, comparison happens 
 * between fullyQualifiedName of a given TypeListNode, and the IncludeInfo.path found 
 * in each IncludeItemPair.
 * 
 * If fullyQualifiedName matches IncludeInfo.path, it means they are exactly the same 
 * and therefore the TypeListNode will be merged to the owning ItemData specified in 
 * the IncludeItemPair.
 * 
 * If IncludeInfo.path does not completely match fullyQualifiedName but represents a 
 * substring of fullyQualifiedName, then the following takes place:
 * 
 * Hierarchical structure of ItemData objects will be generated by looking at the 
 * fullyQualifiedName of TypeListNode. These ItemData objects will then be merged 
 * under the owning ItemData specified in the IncludeItemPair. For example: if the 
 * fullyQualifiedName is "A.B.C.D", IncludeInfo.path is "A.B", and IncludeInfo.inclusive 
 * is true(by default), then the generated ItemData will take the following form:
 * 
 * - owningItem
 *    |- B
 *       |- C
 *          |- D
 * 
 * If IncludeInfo.inclusive is false, then the generated ItemData will take this form instead:
 * 
 * - owningItem
*     |- C
*        |- D
 * 
 * If there is no match between fullyQualifiedName and IncludeInfo.path, then skip to 
 * the next IncludeInfo/TypeListNode depending on their lexicographical order.
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

    // previousIncludeParts is the includeInfo path parts of the pair before current pair.
    let previousIncludeParts: string[] = [];

    // previousStartingIndex keeps track of the index of typeListNodes when previousInclude starts comparison.
    let previousStartingIndex = 0;

    // currentStartingIndex keeps track of the index of typeListNodes when current IncludeInfo starts comparison.
    let currentStartingIndex = 0;

    for (let i = 0; i < includeItemPairs.length; i++) {

        let include = includeItemPairs[i].include;
        let includeParts = splitToParts(prefix, include.path);

        // Start from previousStartingIndex if current path is same as or included by previous path.
        if (i >= 1 && (previousIncludeParts.length > 0 && compareParts(includeParts, previousIncludeParts) >= 0)) {
            t = previousStartingIndex;
            currentStartingIndex = previousStartingIndex;
            previousIncludeParts = [];
        }

        // Continue iterating through the remaining includeInfo even if there are no more typeListNodes
        if (t >= typeListNodes.length) {
            previousIncludeParts = includeParts;
            previousStartingIndex = currentStartingIndex;
            currentStartingIndex = t;
            continue;
        }

        let node = typeListNodes[t];
        let fullyQualifiedNameParts = splitToParts(prefix, node.fullyQualifiedName);
        let owningItem = includeItemPairs[i].owningItem;
        nodeMatch = false;
        nodeInculde = false;

        let compareResult = compareParts(fullyQualifiedNameParts, includeParts);

        if (compareResult == 0) {
            nodeMatch = true;
        } else if (compareResult > 0) {
            nodeInculde = true;
            let newNameParts = -compareResult - 1;
            if (include.inclusive === false) {
                newNameParts = -compareResult;
            }

            if (fullyQualifiedNameParts[0].indexOf(prefix) != -1) {
                fullyQualifiedNameParts.shift();
            }

            let newName = fullyQualifiedNameParts.slice(newNameParts).join('.');
            buildLibraryItemsFromName(node, owningItem, newName, include.iconUrl);
        } else if (node.fullyQualifiedName.localeCompare(include.path) < 0) {
            i--;
            t++;
            continue;
        }

        if (nodeMatch) {
            let item = new ItemData(fullyQualifiedNameParts[fullyQualifiedNameParts.length - 1]);
            item.constructFromTypeListNode(node);
            owningItem.appendChild(item);
        }

        if (nodeMatch || nodeInculde) {
            node.processed = true;
            i--;
            t++;
        }

        // Go to next includeInfo and update previousIncludePath, previousStartingIndex and currentStartingIndex
        if (!(nodeMatch || nodeInculde) || t > typeListNodes.length) {
            previousIncludeParts = includeParts;
            previousStartingIndex = currentStartingIndex;
            currentStartingIndex = t;
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
    let sections = convertLayoutElementToItemData(sectionElements, includeItemPairs);
    let sortedIncludeItemPairs = [...includeItemPairs].sort((a, b) => a.include.path.localeCompare(b.include.path));
    let sortedTypeListNodes = [...typeListNodes].sort((a, b) => a.fullyQualifiedName.localeCompare(b.fullyQualifiedName));

    if (!isValidIncludeInfo(sortedIncludeItemPairs)) {
        console.error("Invalid layoutSpecs: include info is not unique");
    }

    constructFromIncludeInfo(sortedTypeListNodes, sortedIncludeItemPairs);

    // Misc section will take all unprocessed nodes
    //https://jira.autodesk.com/browse/QNTM-2976 - Remove the Miscellaneous section
    // let miscSection = sections.find(section => section.text == miscSectionStr);
    // let unprocessedNodes = sortedTypeListNodes.filter(node => !node.processed);
    // unprocessedNodes.forEach(node => buildLibraryItemsFromName(node, miscSection));

    removeEmptyNodes(sections);

    return sections;
}

// Remove empty non-leaf nodes from items
// Ignore the Add-ons section when removing the empty non-leaf nodes because we want to show that section always. 
export function removeEmptyNodes(items: ItemData[]) {
    let itemRemoved = false;

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.childItems.length > 0) {
            if (removeEmptyNodes(item.childItems)) {
                i--;
            }
        }
		// Do not remove the Add-ons section from the list even when it has no child elements, as we want to show this section at all times.
		else if (item.itemType === "section" && item.contextData === "Add-ons") {
			continue;
		}
		else if ( item.itemType === "section" || item.itemType === "category" || item.itemType === "group" || item.itemType === "coregroup") {
            items.splice(i, 1);
            i--;
            itemRemoved = true;
        }
    }

    return itemRemoved;
}

/**
 * Split text to an string array by prefix and delimiter ".".
 * 
 * For example, if prefix is "://", text is "test://a.b.c", this will return 
 * ["test://", "a", "b", "c"]; If text is "a.b.c", it will return ["a", "b", "c"]
 */
export function splitToParts(prefix: string, text: string): string[] {
    let parts: string[] = [];
    let prefixIndex = text.indexOf(prefix);

    if (prefixIndex == -1 && text.length > 0) {
        parts = text.split(".");
    } else if (text.length > 0) {
        let endIndex = prefixIndex + prefix.length;
        parts.push(text.substring(0, endIndex));

        let newText = text.substring(endIndex);
        if (newText.length > 0) {
            parts = parts.concat(newText.split("."));
        }
    }

    return parts;
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
    } else if (parentNode.itemType === "section") {
        newParentNode.itemType = "category";
    } else {
        newParentNode.itemType = "group";
    }

    // Create nested items for the name 'B.C.D' while passing 'A' as the parent node.
    buildLibraryItemsFromName(typeListNode, newParentNode, newName);
    parentNode.childItems.unshift(newParentNode);
}

/**
 * This method validates pairs. 
 * 
 * Pairs are not valid if there are multiple includeInfo samea as each other, or one contained by another,
 * like a and a.b, test:// and test://a, and they share the same owningItem.
 * 
 * @param {IncludeItemPair[]} pairs
 * An array of sorted IncludeItemPair to be validated
 */
export function isValidIncludeInfo(pairs: IncludeItemPair[]): boolean {
    for (let i = 0; i < pairs.length - 1; i++) {
        let prefix = "://";
        let currentPath = pairs[i].include.path;
        let currentParts = pairs[i].include.path.split(".");
        let nextPath = pairs[i + 1].include.path;
        let nextParts = pairs[i + 1].include.path.split(".");
        let included = compareParts(nextParts, currentParts) >= 0 ||
            (nextPath.indexOf(prefix) != -1 && currentPath.length > 0 && nextPath.startsWith(currentPath));

        if (included && pairs[i].owningItem === pairs[i + 1].owningItem) {
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

        //All groups defined in layoutspec.json should be expanded by default.
        //Commented as part of the task https://jira.autodesk.com/browse/QNTM-2975
        // if (item.itemType === "coregroup") {
        //     item.expanded = true;
        // }

        if (item.text === "Add-ons") {
            item.expanded = true;
        }


        setItemStateRecursive(item.childItems, visible, expanded);
    }
}

export function search(text: string, item: ItemData) {
    if (item.itemType !== "group" && item.itemType !== "coregroup") {
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

    let spans: React.DOMElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>[] = [];
    // attempt to escape regex specific characters and return no highlights if
    // we throw an exception here.
    try {
        let escapedRegexCharacters = highlightedText.replace(/[*+?^$.[\]{}()|\\/]/g, "\\$&");
        let regex = new RegExp(escapedRegexCharacters, 'gi');
        let segments = text.split(regex);
        let replacements = RegExp(regex).exec(text);

        for (let i = 0; i < segments.length; i++) {
            spans.push(React.createElement('span',{ key: spans.length }, segments[i]));
            if (i != segments.length - 1) {
                spans.push(React.createElement('span',{ className: "HighlightedText", key: spans.length }, replacements[i]));
            }
        }
    }
    catch (e) {
        console.log((<Error>e).message);
        return spans;
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
    //commented the check for iconUrl. This is false only for static RawDataType files.
    item = allItems.find(item =>
        item.text == pathToItem[0].text //&& item.iconUrl == pathToItem[0].iconUrl
    );

    if (pathToItem.length == 1) {
        return !!item;
    } else {
        pathToItem.shift();
        let result = findAndExpandItemByPath(pathToItem, item.childItems);
        item.expanded = result; // Expand only if item is found.
        return result;
    }

}

export function sortItemsByText(items: ItemData[]): ItemData[] {
    let sortedItems = [...items].sort(function (item1: ItemData, item2: ItemData) {
        return item1.text.localeCompare(item2.text);
    })

    return sortedItems;
}

const ObjectExtensions = {

    /**
     * Extension method to overcome es2015 lack of Object.values method
     * @param obj Object dictionary
     * @returns Array of object values
     */
    values: function<V>(obj: {[key: string]: V}): V[]{
        return Object.keys(obj).map(x => obj[x])
    }
}

export {ObjectExtensions};