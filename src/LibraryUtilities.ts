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

    constructor(data: any) {
        this.fullyQualifiedName = data.fullyQualifiedName;
        this.iconUrl = data.iconUrl;
        this.contextData = data.contextData;
        this.memberType = data.itemType;
        this.keywords = data.keywords;
        this.parameters = data.parameters;
        this.description = data.description;
    }
}

export interface IncludeInfo {
    path: string;
    iconUrl?: string;
    inclusive?: boolean;
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
    }

    appendChild(childItem: ItemData) {
        this.childItems.push(childItem);
    }
}

export function constructNestedLibraryItems(
    includeParts: string[],
    typeListNode: TypeListNode,
    inclusive: boolean,
    parentItem: ItemData,
    iconUrl?: string): ItemData {
    // 'includeParts' is always lesser or equal to 'fullNameParts' in length.
    // 
    // Take an example:
    //      includeParts  = [ A, B, C ];
    //      fullNameParts = [ A, B, C, D, E ];
    // 
    let fullyQualifiedName = typeListNode.fullyQualifiedName;
    let fullNameParts: string[] = fullyQualifiedName.split('.');
    if (includeParts.length > fullNameParts.length) {
        throw new Error("Invalid input");
    }

    // If 'inclusive == true', then for the above example we start building 
    // LibraryItem from 'C' onward, otherwise it starts from 'D'.
    // 
    let startIndex = inclusive ? includeParts.length - 1 : includeParts.length;

    // Starting index may optionally include the first item in the case when 
    // 'inclusive = true'. If 'parentItem != null && inclusive == true', then 
    // the 'parentItem' is already created in a previous iteration, so we will 
    // continue to append child items under 'parentItem' without recreating 
    // a new LibraryItem from 'remainingParts[0]'.
    // 
    if (inclusive && parentItem) {
        startIndex = startIndex + 1;
    }

    let rootLibraryItem: ItemData = parentItem;
    for (let i = startIndex; i < fullNameParts.length; i++) {
        let libraryItem = new ItemData(fullNameParts[i]);
        libraryItem.itemType = "none";

        if (iconUrl) {
            libraryItem.iconUrl = iconUrl;
        } else {
            // If 'i' is now '2' (i.e. it points to 'C'), then we will construct 
            // the iconName as 'A.B.C'. And since the second parameter of 'slice' 
            // is exclusive, we add '1' to it otherwise 'C' won't be included.
            //  
            libraryItem.iconUrl = fullNameParts.slice(0, i + 1).join(".");
        }
        // If this is the leaf most level, copy all item information over.
        if (i == fullNameParts.length - 1) {
            libraryItem.constructFromTypeListNode(typeListNode);
            pushKeywords(libraryItem, typeListNode);

            // Mark the typeListNode as processed.
            typeListNode.processed = true;
        }

        if (parentItem) {
            // If there was a parent item, insert the new 'libraryItem' under 
            // it as a child item, then update 'parentItem' to be 'libraryItem'.
            parentItem.appendChild(libraryItem);
            parentItem = libraryItem;
        } else {
            // If there was not a parent item, that means this is the first 
            // library item node that we create. Make it the rootLibraryItem
            // and point 'parentItem' to it.
            parentItem = libraryItem;
            rootLibraryItem = libraryItem;
        }
    }

    return rootLibraryItem;
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
 * This method merges a type node (and its immediate sub nodes) under the given
 * library item.
 * 
 * Note that this is not a recursive function by design, it only considers the
 * current TypeTreeNode, and any possible child TypeTreeNode but nothing beyond
 * that depth.
 * 
 * @param {TypeTreeNode} typeTreeNode
 * The type node to be merged under the given library item. Its immediate child 
 * nodes will also be merged under the new library item, but the recursion does 
 * not go beyond that depth.
 * 
 * @param {LibraryItem} libraryItem
 * The library item under which a type node (and its sub nodes) is to be merged.
 */
export function constructLibraryItem(
    typeListNodes: TypeListNode[],
    layoutElement: LayoutElement): ItemData {
    let result = new ItemData(layoutElement.text);
    result.constructFromLayoutElement(layoutElement);

    // Traverse through the strings in 'include'
    for (let i = 0; i < layoutElement.include.length; i++) {

        let includePath = layoutElement.include[i].path;
        let includeParts = includePath.split('.');

        let inclusive = true; // If not specified, inclusive by default.
        if (layoutElement.include[i].inclusive != null) {
            inclusive = layoutElement.include[i].inclusive;
        }

        // If inclusive, then a new root node will be created (in the first iteration 
        // of 'j' below, and reused subsequently for all other 'j'), otherwise use the 
        // current 'result' as the parent node for child nodes to be appended.
        // 
        let parentNode = inclusive ? null : result;
        let nodeFound: boolean = false;

        for (let j = 0; j < typeListNodes.length; j++) {
            let fullyQualifiedName = typeListNodes[j].fullyQualifiedName;
            if (!fullyQualifiedName.startsWith(includePath)) {
                continue; // Not matching, skip to the next type node.
            }

            let fullyQualifiedNameParts = fullyQualifiedName.split('.');

            // Check if each part in fullyQualifiedName matches those in includePath,
            // and if fullyQualifiedName contains more parts than includePath.
            let k = compareParts(fullyQualifiedNameParts, includeParts);

            if (k >= 0) {
                nodeFound = true;

                if (k > 1) {
                    // If the includePath does not represent the immediate parent of the leaf node
                    // E.g. includePath = "A.B", fullyQualifiedName = "A.B.C.D"
                    // The library structure should be constructed such that B contains C, which
                    // contains the leaf node D.

                    // If the path is not inclusive, start constructing from "C.D" (B will not be created)
                    // Otherwise, start constructing using "B.C.D"
                    let newName = inclusive ? fullyQualifiedNameParts.slice(k - 1).join('.') : fullyQualifiedNameParts.slice(k).join('.');
                    buildLibraryItemsFromName(typeListNodes[j], result, newName);
                }
                else {
                    parentNode = constructNestedLibraryItems(includeParts,
                        typeListNodes[j], inclusive, parentNode, layoutElement.include[i].iconUrl);
                }
            }

            if (k == 0) {
                // If fullyQualifiedName == includePath, then includePath represents a leaf node
                result.appendChild(parentNode);

                // Reset the value of parentNode, to check through the rest of typeListNodes.
                parentNode = inclusive ? null : result;
            }
        }
        if (parentNode && (parentNode != result)) {
            // If a new parent node was created, append it as a child of 
            // the current resulting node.
            result.appendChild(parentNode);
        }

        if (!nodeFound) {
            console.warn("Matching type not found: " + includePath);
        }
    }

    // Construct all child library items from child layout elements.
    for (let i = 0; i < layoutElement.childElements.length; i++) {
        let childLayoutElement = layoutElement.childElements[i];
        let libItem = constructLibraryItem(typeListNodes, childLayoutElement);
        if (libItem.childItems.length > 0) {
            // Only append the item to results if there are nodes generated
            result.appendChild(libItem);
        }
    }

    return result;
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

/**
 * Combine a data type tree and layout element tree to 
 * produce the resulting library item tree under a specific section .
 * 
 * @param {TypeTreeNode[]} typeTreeNodes
 * A tree of hierarchical data type identifiers. This tree is constructed 
 * based entirely on the loaded data types and their fully qualified names.
 * See TypeTreeNode for more information.
 * 
 * @param {LayoutElement} section
 * The section that the converted items will be under
 * 
 * @returns
 * Returns the resulting library item tree containing nodes merged from the 
 * type tree. The merging operation is done through the specifications of 
 * layout element tree.
 */
export function convertToDefaultSection(typeListNodes: TypeListNode[], section: LayoutElement): ItemData {
    let layoutElements = section.childElements;
    let sectionData = convertSectionToItemData(section);

    // Generate the resulting library item tree before merging data types.
    for (let layoutElement of layoutElements) {
        let libItem = constructLibraryItem(typeListNodes, layoutElement);

        if (libItem.childItems.length > 0) {
            // Only append the new item header if there are child nodes generated
            sectionData.appendChild(libItem);
        }
    }

    return sectionData;
}

export function buildLibrarySectionsFromLayoutSpecs(loadedTypes: any, layoutSpecs: any, defaultSectionStr: string, miscSectionStr: string): ItemData[] {
    let typeListNodes: TypeListNode[] = [];
    let sections: LayoutElement[] = [];

    // Converting raw data to strongly typed data.
    for (let loadedType of loadedTypes.loadedTypes) {
        typeListNodes.push(new TypeListNode(loadedType));
    }

    for (let section of layoutSpecs.sections) {
        sections.push(new LayoutElement(section));
    }

    let results: ItemData[] = [];
    let defaultSection = sections.find(x => x.text == defaultSectionStr);
    let miscSection = sections.find(x => x.text == miscSectionStr);

    results.push(convertToDefaultSection(typeListNodes, defaultSection));

    _.each(sections, function (section) {
        if (section.text != defaultSectionStr && section.text != miscSectionStr) {
            let convertedSection = convertToOtherSection(typeListNodes, section);

            // If there are nodes generated in the section, append it to results
            if (convertedSection.childItems.length > 0) {
                // Change the itemType of the outermost parents
                _.each(convertedSection.childItems, function (node) {
                    if (node.itemType === "group") node.itemType = "category";
                })
                results.push(convertedSection);
            }
        }
    })

    let convertedMiscSection = convertToMiscSection(typeListNodes, miscSection);

    // If there are leftover nodes, add the Miscellaneous section into results
    if (convertedMiscSection.childItems.length > 0) {
        // Change the itemType of the outermost parents
        _.each(convertedMiscSection.childItems, function (node) {
            if (node.itemType === "group") node.itemType = "category";
        })
        results.push(convertedMiscSection);
    }

    return results;
}

function convertToOtherSection(typeListNodes: TypeListNode[], section: LayoutElement): ItemData {
    let sectionData = convertSectionToItemData(section);
    let includePatterns = section.include;
    let nodeToProcess: TypeListNode[] = [];

    _.each(typeListNodes, function (node) {
        _.each(includePatterns, function (includePattern) {
            if (node.fullyQualifiedName.startsWith(includePattern.path)) {
                // If the path contains '://', remove it with the text before it from the fullyQualifiedName 
                let tempName = (includePattern.path.indexOf("://") == -1) ? node.fullyQualifiedName : node.fullyQualifiedName.split(includePattern.path)[1];

                // Construct the library item using the new name
                node.processed = true;
                buildLibraryItemsFromName(node, sectionData, tempName);
            }
        })
    })

    return sectionData;
}

export function convertSectionToItemData(section: LayoutElement): ItemData {
    let sectionData = new ItemData(section.text);
    sectionData.constructFromLayoutElement(section);
    return sectionData;
}

function updateElement(oldElement: LayoutElement, newElement: LayoutElement, append: boolean): void {

    // Duplicate basic properties.
    oldElement.text = newElement.text;
    oldElement.iconUrl = newElement.iconUrl;
    oldElement.showHeader = newElement.showHeader;
    oldElement.elementType = newElement.elementType;

    if (!append) { // Deal with include path information.

        // Replacing (not appending) existing include paths.
        oldElement.include = []; // Reset the original array before merging with the new one.
        Array.prototype.push.apply(oldElement.include, newElement.include);

    } else {

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
                pathToUpdate.iconUrl = pathInfo.iconUrl + "Hey";
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
            updateElement(childToUpdate, childElement, append);
        }
    }
}

// See 'updateElement' method above for details.
export function updateSections(oldLayoutSpecs: any, newLayoutSpecs: any, append: boolean): void {

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
        updateElement(sectionToUpdate, section, append);
    }
}

/**
 * Convert an array of typeListNodes to ItemData which are not processed based on their fullyQualifiedNames, 
 * by splitting the name with '.', and put them under a specific section.
 * 
 * As an example, for two typeListNodes 'A.B.C' and 'A.B.D', the resulting nodes are:
 * - A
 *   |- B
 *      |- C
 *      |- D
 * 
 * @param {TypeListNode[]} allNodes 
 * All the typeListNodes
 * 
 * @param {LayoutElement} section
 * The section that the converted items will be under
 * 
 * @returns
 * Returns a single ItemData that contains the new nodes in its childItems.
 */
export function convertToMiscSection(allNodes: TypeListNode[], section: LayoutElement): ItemData {

    // Search for the nodes that are not displayed in library view.
    let unprocessedNodes: TypeListNode[] = [];
    let sectionData = convertSectionToItemData(section);

    _.each(allNodes, function (node) {
        if (!node.processed) {
            console.warn("Item filtered out from library view: " + node.contextData);
            unprocessedNodes.push(node);
        }
    });

    _.each(unprocessedNodes, function (node) {
        buildLibraryItemsFromName(node, sectionData)
    })

    return sectionData;
}

export function buildLibraryItemsFromName(typeListNode: TypeListNode, parentNode: ItemData, newNodeName?: string) {
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
        pushKeywords(newNode, typeListNode);

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
    newParentNode.itemType = "group";

    // Create nested items for the name 'B.C.D' while passing 'A' as the parent node.
    buildLibraryItemsFromName(typeListNode, newParentNode, newName);
    parentNode.childItems.unshift(newParentNode);
}

// Get keywords from typeListNode and push them into itemData
export function pushKeywords(itemData: ItemData, typeListNode: TypeListNode) {
    let keywords = typeListNode.keywords.split(",");
    keywords.forEach(keyword => {
        itemData.keywords.push(keyword.toLowerCase().trim())
    });
    itemData.keywords.push(typeListNode.fullyQualifiedName.toLowerCase());
}

// Recursively set visible and expanded states of ItemData
export function setItemStateRecursive(items: ItemData | ItemData[], visible: boolean, expanded: boolean) {
    items = (items instanceof Array) ? items : [items];
    for (let item of items) {
        item.visible = visible;
        item.expanded = expanded;
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
