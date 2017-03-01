export class typeListNodeData {
    fullyQualifiedName: any;
    iconName: any;
    creationName: any;
    itemType: any;
}


export class layoutElementData {
    text: any;
    iconName: any;
    elementType: any;
    include: any;
    childElements: layoutElementData[] = [];
}