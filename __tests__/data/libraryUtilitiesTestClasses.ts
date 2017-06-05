export class TypeListNodeData {
    fullyQualifiedName: any;
    iconUrl: any;
    contextData: any;
    itemType: any;
    keywords: string = "";
}

export class LayoutElementData {
    text: any;
    iconUrl: any;
    elementType: any;
    include: any;
    childElements: LayoutElementData[] = [];
}

export class LayoutElementSectionData {
    text: any;
    iconUrl: any;
    elementType: any = "section";
    include: any = [];
    childElements: LayoutElementData[] = [];
}