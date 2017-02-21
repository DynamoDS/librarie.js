
// This documentation makes use of naming convention outlined in Google JSON Style Guide:
//
//   https://google.github.io/styleguide/jsoncstyleguide.xml
// 

let layoutSpecificationSample = {
    elements: [
        {
            text: "Geometry",
            iconName: "Category.Geometry.png",
            elementType: "category",
            include: [],
            childElements: [
                {
                    text: "Abstract",
                    iconName: "",
                    elementType: "group",
                    include: [
                        "Autodesk.DesignScript.Geometry.BoundingBox",
                        "Autodesk.DesignScript.Geometry.CoordinateSystem",
                        "Autodesk.DesignScript.Geometry.Vector"
                    ],
                    childElements: []
                },
                {
                    text: "Curves",
                    iconName: "",
                    elementType: "group",
                    include: [
                        "Autodesk.DesignScript.Geometry.Arc",
                        "Autodesk.DesignScript.Geometry.Line"                        
                    ],
                    childElements: []
                }
            ]
        },
        {
            text: "Display",
            iconName: "Category.Display.png",
            elementType: "category",
            include: [
                "Core.Color.Color"
            ],
            childElements: []
        },
        {
            text: "List",
            iconName: "Category.List.png",
            elementType: "category",
            include: [],
            childElements: [
                {
                    text: "Generate",
                    iconName: "",
                    elementType: "group",
                    include: [
                        "Core.List"
                    ]
                }
            ]
        }
    ]
};

let libraryItemSample = 
{
    libraryItems: [
        {
            text: "Display",
            iconName: "",
            itemType: "category",
            childItems: []
        },
        {
            text: "Geometry",
            iconName: "GeometryCategory.png",
            itemType: "category",
            childItems: [
                {
                    text: "Abstract", // Group
                    iconName: "AbstractGroup.png",
                    itemType: "group",
                    childItems: [
                        {
                            text: "BoundingBox", // Class
                            iconName: "Autodesk.DesignScript.Geometry.BoundingBox.png",
                            itemType: "none",
                            childItems: [
                                {
                                    text: "ByCorners", // Method
                                    iconName: "Autodesk.DesignScript.Geometry.BoundingBox.ByCorners.png",
                                    itemType: "none|creation|action|query"
                                },
                                {
                                    text: "Intersects", // Method
                                    iconName: "Autodesk.DesignScript.Geometry.BoundingBox.Intersects.png",
                                    itemType: "none|creation|action|query"
                                },
                            ]
                        },
                    ]
                },
            ]
        }
    ]
};
