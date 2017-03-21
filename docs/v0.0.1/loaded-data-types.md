# Loaded Data Types
Library view consumes a flat list of loaded data types (in `json` format) for its contents.

### Loaded data type JSON format
This flat list of loaded data types takes the following form: it must contain exactly one `loadedTypes` root item that represents a list of loaded data types. Each of the loaded data types in made up of the following fields:

- `fullyQualifiedName` - Fully qualified name of a given type (e.g. a method or property in a class). An example of this would be `Autodesk.DesignScript.Geometry.Curve.Offset` property. The fully qualified name is used for inclusion/exclusion under a given branch of the library after transformation (transformation is done through a [Layout Specification](./layout-specs.md) document).

- `iconUrl` - Absolute URL of icon of a given type.

- `contextData` - The string value that will be passed to the event handler when a given library item is clicked.

- `itemType` - This value can either be `creation`, `action` or `query`. For more details of these values, please refer to [Layout Specification](./layout-specs.md) document.

- More fields will be added soon.

```json
{
  "loadedTypes": [
    {
      "fullyQualifiedName": "Core.Input.Code Block",
      "iconUrl": "Dynamo.Graph.Nodes.CodeBlockNodeModel",
      "contextData": "Code Block",
      "itemType": "action"
    },
    {
      "fullyQualifiedName": "Core.Input.Input",
      "iconUrl": "Dynamo.Graph.Nodes.CustomNodes.Symbol",
      "contextData": "Input",
      "itemType": "action"
    },

    // ...
  ]
}
```
