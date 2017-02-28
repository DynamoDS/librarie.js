# Loaded Data Types
Library view consumes a flat list of loaded data types (in `json` format) for its contents.

### Loaded data type JSON format
This flat list of loaded data types takes the following form: it must contain exactly one `loadedTypes` root item that represents a list of loaded data types. Each of the loaded data types in made up of the following fields:

- `fullyQualifiedName` - Fully qualified name of a given type (e.g. a method or property in a class). An example of this would be `Autodesk.DesignScript.Geometry.Curve.Offset` property. The fully qualified name is used for inclusion/exclusion under a given branch of the library after transformation (transformation is done through a [Layout Specification](./layout-specs.md) document).

- `iconName` - Icon name of a given type. This can optionally include `*.svg` extension; if it does not contain `*.svg` extension, then a `.png` is appended to the icon name by default. **Note**: absolute URL of icon is not currently supported yet.

- `creationName` - The string value that will be passed to the event handler when a given library item is clicked.

- `itemType` - This value can either be `creation`, `action` or `query`. For more details of these values, please refer to [Layout Specification](./layout-specs.md) document.

- More fields will be added soon.

```json
{
  "loadedTypes": [
    {
      "fullyQualifiedName": "Core.Input.Code Block",
      "iconName": "Dynamo.Graph.Nodes.CodeBlockNodeModel",
      "creationName": "Code Block",
      "itemType": "action"
    },
    {
      "fullyQualifiedName": "Core.Input.Input",
      "iconName": "Dynamo.Graph.Nodes.CustomNodes.Symbol",
      "creationName": "Input",
      "itemType": "action"
    },

    // ...
  ]
}
```
