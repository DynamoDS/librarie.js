export const loadedTypesJson: any = {
  "loadedTypes": [
    {
      "fullyQualifiedName": "Child1",
      "iconUrl": "",
      "contextData": "Input",
      "itemType": "action",
      "description": "First item",
      "keywords": ""
    },
    {
      "fullyQualifiedName": "Child2",
      "iconUrl": "",
      "contextData": "",
      "itemType": "action",
      "description": "Second item",
      "keywords": ""
    },
    {
      "fullyQualifiedName": "pkg://Clockwork.Core.Math.+1",
      "iconUrl": "/src/resources/icons/ba8cd7c7-346a-45c6-857e-e47800b80818.png",
      "contextData": "+1",
      "parameters": null,
      "itemType": "action",
      "keywords": "",
      "weight": 0,
      "description": null
    },
  ]
};

export const layoutSpecsJson: any = {
  "sections": [
    {
      "text": "default",
      "iconUrl": "",
      "elementType": "section",
      "showHeader": false,
      "include": [],
      "childElements": [
        {
          "text": "Parent",
          "iconUrl": "",
          "elementType": "category",
          "include": [],
          "childElements": [{
            "text": "Core",
            "iconUrl": "",
            "elementType": "group",
            "include": [{"path": "Child1" }, { "path": "Child2" }],
            "childElements":[]
          }]
        }
      ]
    },
    {
      "text": "Miscellaneous",
      "iconUrl": "",
      "elementType": "section",
      "showHeader": true,
      "include": [],
      "childElements": []
    },
    {
      "text": "Add-ons",
      "iconUrl": "",
      "elementType": "section",
      "showHeader": true,
      "include": [
        {
          "path": "pkg://"
        }
      ],
      "childElements": []
    }
  ]
};