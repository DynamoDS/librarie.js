# Search Result Items
Search view consumes a flat list of search result items (in `json` format) for its contents.

## Search item JSON format
This flat list of search result items takes the following form: it must contain exactly one `searchItems` root item that represents a list of search result items. Each of the search result items is made up of the following fields: 

- `text` - The name of a given search result item.
- `iconUrl`- The absolute URL of icon of a given search result item.
- `contextData` - The string value that will be passed to the event handler when a given search result item is clicked.
- `itemType` - This value can either be `creation`, `action` or `query`. For more details of these values, please refer to [Layout Specification](./layout-specs.md) document.
- `description` - The description text of a given search result item.
- More fields will be added soon.

```json
{
  "searchItems": [
    {
      "text": "ByCoordinates",
      "iconUrl": "/src/resources/icons/Autodesk.DesignScript.Geometry.Point.ByCoordinates.double-double.png",
      "contextData": "Autodesk.DesignScript.Geometry.Point.ByCoordinates@double,double",
      "itemType": "creation",
      "description": "Form a Point in the XY plane given two cartesian coordinates. The Z component is 0."
    },
    {
      "text": "Length",
      "iconUrl": "/src/resources/icons/Autodesk.DesignScript.Geometry.Curve.Length.png",
      "contextData": "Autodesk.DesignScript.Geometry.Curve.Length",
      "itemType": "query",
      "description": "The total arc length of the curve."
    },

    // ...
  ]
}
```