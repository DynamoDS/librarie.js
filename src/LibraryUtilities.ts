/// <reference path="../node_modules/@types/node/index.d.ts" />

import * as React from "react";

type MemberType = "none" | "creation" | "action" | "query";
type ElementType = "none" | "category" | "group";
type ItemType = "none" | "category" | "group" | "creation" | "action" | "query";

export class TypeListNode {

    fullyQualifiedName: string = "";
    iconUrl: string = "";
    contextData: string = "";
    memberType: MemberType = "none";

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
        libraryItem.iconUrl = iconUrl;

        // If this is the leaf most level, copy all item information over.
        if (i == fullNameParts.length - 1) {
            libraryItem.contextData = typeListNode.contextData;
            libraryItem.iconUrl = typeListNode.iconUrl;
            libraryItem.itemType = typeListNode.memberType;
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

        for (let j = 0; j < typeListNodes.length; j++) {

            let fullyQualifiedName = typeListNodes[j].fullyQualifiedName;
            if (!fullyQualifiedName.startsWith(includePath)) {
                continue; // Not matching, skip to the next type node.
            }

            parentNode = constructNestedLibraryItems(includeParts,
                typeListNodes[j], inclusive, parentNode, layoutElement.include[i].iconUrl);
        }

        if (parentNode && (parentNode != result)) {
            // If a new parent node was created, append it as a child of 
            // the current resulting node.
            result.appendChild(parentNode);
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
        let node = new TypeListNode(loadedTypes.loadedTypes[i]);
        if (!node.fullyQualifiedName.startsWith("pkg://")) {
            typeListNodes.push(node);
        }
    }

    for (let i = 0; i < layoutSpecs.elements.length; i++) {
        layoutElements.push(new LayoutElement(layoutSpecs.elements[i]));
    }

    return convertToLibraryTree(typeListNodes, layoutElements);
}

export function buildPackageItemsFromLoadedTypes(loadedTypes: any): ItemData[] {
    let pkgTypeListNodes: TypeListNode[] = [];

    // Converting raw data to strongly typed data.
    for (let loadedType of loadedTypes.loadedTypes) {
        let node = new TypeListNode(loadedType);
        let pkgPrefix = "pkg://";
        if (node.fullyQualifiedName.startsWith(pkgPrefix)) {
            node.fullyQualifiedName = node.fullyQualifiedName.substring(pkgPrefix.length);
            pkgTypeListNodes.push(node);
        }
    }
    
    return convertToPackageTree(pkgTypeListNodes);
}

export function convertToPackageTree(typeListNodes: TypeListNode[]): ItemData[] {
    let results: ItemData[] = [];
    
    for (let typeListNode of typeListNodes) {
        let fullNameParts: string[] = typeListNode.fullyQualifiedName.split(".");
        let parentItem: any = results;

        for (let i = 0; i < fullNameParts.length; i++) {
            let name = fullNameParts[i];
            let item = new ItemData(name);

            if (i == 0 && !containsItemWithText(parentItem, name)) {
                item.itemType = "category";
                results.push(item);
                parentItem = item;
            } else if (containsItemWithText(parentItem, name)) {
                parentItem = containsItemWithText(parentItem, name);
            } else if (i == fullNameParts.length - 1) {
                item.itemType = typeListNode.memberType;
                parentItem.appendChild(item);
            } else {
                item.itemType = "group";
                parentItem.appendChild(item);
                parentItem = item;
            }
        }
    }

    return results;
}

export function containsItemWithText(items: ItemData | ItemData[], text: string): ItemData {
    if (!(items instanceof Array)) {
        items = items.childItems;
    }

    for (let item of items) {
        if (item.text == text) {
            return item;
        }
    }

    return null;
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
