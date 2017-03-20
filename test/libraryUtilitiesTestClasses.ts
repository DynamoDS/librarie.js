export class TypeListNodeData {
    fullyQualifiedName: any;
    iconUrl: any;
    contextData: any;
    itemType: any;
}


export class LayoutElementData {
    text: any;
    iconUrl: any;
    elementType: any;
    include: any;
    childElements: LayoutElementData[] = [];
}