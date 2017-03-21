# Search Item Type
Search view consumes a flat list of search item type (in `json` format) for its contents.

## Search item type JSON format
This flat list of search item type takes the following form: it must contain exactly one `searchItemTypes` root item that represents a list of search item types. Each of the search item types is made up of the following fields: 

- `text` - The name of a given search item.
- `iconUrl`- The absolute URL of icon of a given search item.
- `contextData` - The string value that will be passed to the event handler when a given search item is clicked.
- `itemType` - This value can either be creation, action or query. For more details of these values, please refer to [Layout Specification](./layout-specs.md) document.
- `group` - The name of the group that a given search item belongs to.
- `category` - The name of the category that a given search item belongs to.
- `description` - The description text of the given search item.
- More fields will be added soon.

```json
{
  "searchItemTypes": [
    {
      "text": "ByCoordinates",
      "iconUrl": "/src/resources/icons/Autodesk.DesignScript.Geometry.Point.ByCoordinates.double-double.png",
      "contextData": "Autodesk.DesignScript.Geometry.Point.ByCoordinates@double,double",
      "itemType": "creation",
      "group": "Point",
      "category": "Geometry",
      "description": "Form a Point in the XY plane given two cartesian coordinates. The Z component is 0."
    },
    {
      "text": "Length",
      "iconUrl": "/src/resources/icons/Autodesk.DesignScript.Geometry.Curve.Length.png",
      "contextData": "Autodesk.DesignScript.Geometry.Curve.Length",
      "itemType": "query",
      "group": "Curve",
      "category": "Geometry",
      "description": "The total arc length of the curve"
    },

    // ...
  ]
}
```