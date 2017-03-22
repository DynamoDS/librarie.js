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
    childItems: ItemData[] = [];

    constructor(public text: string) {
    }

    constructFromLayoutElement(layoutElement: LayoutElement) {
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
            let fullyQualifiedNameParts = fullyQualifiedName.split('.');
            let lastIncludedPart = includeParts[includeParts.length - 1];

            // Check if a matching node is found, and if the fullyQualifiedName contains
            // the (whole) last word in includePath. 
            // E.g. This ensures EllipseArc nodes to be excluded in the Ellipse category.
            if (fullyQualifiedName.startsWith(includePath) && _.contains(fullyQualifiedNameParts, lastIncludedPart)) {

                // Check if the includePath represents a leaf node.
                if (includePath.length < fullyQualifiedName.length)
                    isLeafNode = false;

                parentNode = constructNestedLibraryItems(includeParts,
                    typeListNodes[j], inclusive, parentNode, layoutElement.include[i].iconUrl);

                if (isLeafNode && parentNode && (parentNode != result)) {
                    // If the new node created is a leaf node, append it as a child of 
                    // the current existing node. This step is necessary for nodes that
                    // have overloads with the same name but different parameters.
                    result.appendChild(parentNode);
                    nodeFound = true;

                    // Reset the value of parentNode, to check through the rest of typeListNodes.
                    parentNode = inclusive ? null : result;
                }
            }
        }

        // If a node that matches the includePath cannot be found
        if (!nodeFound) { 

            // isLeafNode is set to true if there are no nodes that can match the includePath,
            // or if the node is a leaf node.
            if (isLeafNode) {
                console.warn("Warning: The type '" + includePath + "' is not found in " +
                    "'RawTypeData.json'. No node of this type is rendered in the library view.");
            }
            if (parentNode && (parentNode != result)) {
                // Otherwise, if there is a parentNode created
                result.appendChild(parentNode);
            }
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
        typeListNodes.push(new TypeListNode(loadedTypes.loadedTypes[i]));
    }

    for (let i = 0; i < layoutSpecs.elements.length; i++) {
        layoutElements.push(new LayoutElement(layoutSpecs.elements[i]));
    }

    let libraryTreeItems: ItemData[] = convertToLibraryTree(typeListNodes, layoutElements);

    // Search for the nodes that are not displayed in library view.
    _.each(typeListNodes, function (node) {
        if (!node.processed) {
            console.warn("Warning: '" + node.contextData + "' is not specified in " +
                "'LayoutSpecs.json'. The node is not rendered in the library view.");
        }
    });

    return libraryTreeItems;
}
