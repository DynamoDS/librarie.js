export class TypeListNodeData {
    fullyQualifiedName: any;
    iconName: any;
    creationName: any;
    itemType: any;
}


export class LayoutElementData {
    text: any;
    iconName: any;
    elementType: any;
    include: any;
    childElements: LayoutElementData[] = [];
}