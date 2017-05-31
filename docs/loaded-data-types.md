# Loaded Data Types
Library view consumes a flat list of loaded data types (in `json` format) for its contents.

### Loaded data type JSON format
This flat list of loaded data types takes the following form: it must contain exactly one `loadedTypes` root item that represents a list of loaded data types. Each of the loaded data types in made up of the following fields:

- `fullyQualifiedName` - Fully qualified name of a given type (e.g. a method or property in a class). An example of this would be `Autodesk.DesignScript.Geometry.Curve.Offset` property. The fully qualified name is used for inclusion/exclusion under a given branch of the library after transformation (transformation is done through a [Layout Specification](./layout-specs.md) document).

- `iconUrl` - Absolute URL of icon of a given type.

- `contextData` - The string value that will be passed to the event handler when a given library item is clicked.

- `parameters` - A string in the format of `(param1, param2, ...)` that represents the input parameters of an overloaded function. If the function does not have any overloads, the value is `null`.

- `itemType` - This value can either be `create`, `action` or `query`. For more details of these values, please refer to [Layout Specification](./layout-specs.md) document.

- `keywords` - Keywords to be used by the search algorithm, in addition to the item's text.

- `weight` - Weight to identify whether the item is more important. The smaller the value means it is more important. This field is optional.

- `description` - Detailed information of the methods. This is shown on the UI if "Display detailed info" is checked.

```json
{
  "loadedTypes": [
    {
      "fullyQualifiedName": "Core.Input.Code Block",
      "iconUrl": "/src/resources/icons/Dynamo.Graph.Nodes.CodeBlockNodeModel.png",
      "contextData": "Code Block",
      "parameters": null,
      "itemType": "action",
      "keywords": "Dynamo.Nodes.CodeBlockNodeModel, Code Block, codeblock",
      "description": "Allows for DesignScript code to be authored directly"
    },
    {
      "fullyQualifiedName": "Core.Input.Input",
      "iconUrl": "/src/resources/icons/Dynamo.Graph.Nodes.CustomNodes.Symbol.png",
      "contextData": "Input",
      "parameters": null,
      "itemType": "action",
      "keywords": "Dynamo.Nodes.Symbol, Input, variable, argument, parameter",
	  "weight": 0,
      "description": "A function parameter, use with custom nodes.\n\nYou can specify the type and default value for parameter. E.g.,\n\ninput : var[]..[]\nvalue : bool = false"
    },

    // ...
  ]
}
```
