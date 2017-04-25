/// <reference path="../node_modules/@types/node/index.d.ts" />

import * as React from "react";

type MemberType = "none" | "creation" | "action" | "query";
type ElementType = "none" | "category" | "group";
type ItemType = "none" | "category" | "group" | "creation" | "action" | "query";

import * as _ from 'underscore';

export class TypeListNode {

    fullyQualifiedName: string = "";
    iconUrl: string = "";
    contextData: string = "";
    memberType: MemberType = "none";
    processed: boolean = false;

    constructor(data: any) {
        this.fullyQualifiedName = data.fullyQualifiedName;
        this.iconUrl = data.iconUrl;
        this.contextData = data.contextData;
        this.memberType = data.itemType;
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
    }
    appendChild(childElement: LayoutElement) {
        this.childElements.push(childElement);
    }
}

export class ItemData {

    iconUrl: string = "";
    contextData: string = "";
    itemType: ItemType = "none";
    visible: boolean = true;
    expanded: boolean = false;
    searchStrings: string[] = [];
    childItems: ItemData[] = [];

    constructor(public text: string) {
        this.searchStrings.push(text ? text.toLowerCase() : text);
    }

    constructFromLayoutElement(layoutElement: LayoutElement) {
        this.searchStrings.pop();
        this.searchStrings.push(this.text ? this.text.toLowerCase() : this.text);
        this.contextData = layoutElement.text;
        this.iconUrl = layoutElement.iconUrl;
        this.itemType = layoutElement.elementType;
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
            libraryItem.contextData = typeListNode.contextData;
            libraryItem.iconUrl = typeListNode.iconUrl;
            libraryItem.itemType = typeListNode.memberType;

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
        if (layoutElement.include[i].inclusive) {
            inclusive = layoutElement.include[i].inclusive;
        }

        // If inclusive, then a new root node will be created (in the first iteration 
        // of 'j' below, and reused subsequently for all other 'j'), otherwise use the 
        // current 'result' as the parent node for child nodes to be appended.
        // 
        let parentNode = inclusive ? null : result;
        let nodeFound: boolean = false;
        let isLeafNode: boolean = true;

        for (let j = 0; j < typeListNodes.length; j++) {
            let fullyQualifiedName = typeListNodes[j].fullyQualifiedName;
            if (!fullyQualifiedName.startsWith(includePath)) {
                continue; // Not matching, skip to the next type node.
            }

            let fullyQualifiedNameParts = fullyQualifiedName.split('.');

            // Check if each part in fullyQualifiedName matches those in includePath,
            // and if fullyQualifiedName contains more parts than includePath.
            let k = leftoverPart(fullyQualifiedNameParts, includeParts);

            if (k >= 0) {
                nodeFound = true;
                parentNode = constructNestedLibraryItems(includeParts,
                    typeListNodes[j], inclusive, parentNode, layoutElement.include[i].iconUrl);
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
        result.appendChild(constructLibraryItem(typeListNodes, childLayoutElement));
    }

    return result;
}

/**
 * Compare two arrays of strings and check if the strings in the first array match
 * those in the second array.
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
 * Returns undefined if the two inputs do not match.
 * 
 */
function leftoverPart(parts: string[], partsToInclude: string[]): number | undefined {
    let leftover = parts.length;
    for (let i = 0; i < partsToInclude.length; i++) {
        leftover--;
        if (parts[i] != partsToInclude[i]) {
            return undefined;
        }
    }
    return leftover;
}

/**
 * Combine a data type tree and layout element tree to produce the resulting
 * library item tree.
 * 
 * @param {TypeTreeNode[]} typeTreeNodes
 * A tree of hierarchical data type identifiers. This tree is constructed 
 * based entirely on the loaded data types and their fully qualified names.
 * See TypeTreeNode for more information.
 * 
 * @param {LayoutElement[]} layoutElements
 * A tree serving as layout specifications from which library item tree is 
 * constructed. The specifications also contain information of how a given 
 * data type is merged into the resulting library item tree node.
 * 
 * @returns
 * Returns the resulting library item tree containing nodes merged from the 
 * type tree. The merging operation is done through the specifications of 
 * layout element tree.
 */
export function convertToLibraryTree(
    typeListNodes: TypeListNode[],
    layoutElements: LayoutElement[]): ItemData[] {
    let results: ItemData[] = []; // Resulting tree of library items.

    // Generate the resulting library item tree before merging data types.
    for (let i = 0; i < layoutElements.length; i++) {

        let layoutElement = layoutElements[i];
        results.push(constructLibraryItem(typeListNodes, layoutElement));
    }

    return results;
}

export function buildLibraryItemsFromLayoutSpecs(loadedTypes: any, layoutSpecs: any): ItemData[] {
    let typeListNodes: TypeListNode[] = [];
    let layoutElements: LayoutElement[] = [];

    // Converting raw data to strongly typed data.
    for (let i = 0; i < loadedTypes.loadedTypes.length; i++) {
        typeListNodes.push(new TypeListNode(loadedTypes.loadedTypes[i]));
    }

    for (let i = 0; i < layoutSpecs.elements.length; i++) {
        layoutElements.push(new LayoutElement(layoutSpecs.elements[i]));
    }

    let libraryTreeItems: ItemData[] = convertToLibraryTree(typeListNodes, layoutElements);

    // Search for the nodes that are not displayed in library view.
    _.each(typeListNodes, function (node) {
        if (!node.processed) {
            console.warn("Item filtered out from library view: " + node.contextData);
        }
    });

    return libraryTreeItems;
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
        let index = -1;

        for (let searchString of item.searchStrings) {
            index = searchString.indexOf(text);
            if (index >= 0) {
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

export function getHighlightedText(text: string, highlightedText: string): React.DOMElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>[] {
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
