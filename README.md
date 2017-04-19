# librarie.js
Reusable lightweight library component based on React.js

### Set up
Installing all dependencies

    $ npm install

### Build and run librarie.js
- Build source scripts

    `$ npm run build`
    
    Both `librarie.js` (development script) and `librarie.min.js` (production script) will be output in `./dist/v0.0.1/` folder. By default `librarie.min.js` will be referenced in index.html.

- Serve up the new library view

    `$ node ./index.js`

- Navigate to `localhost:3456` in Google Chrome browser

### Usage
The following simple HTML code illustrates the way to embed library view into an existing web page. Note that this is a work-in-progress, `LibraryContainer` API set will be further simplified in the near future.

`LibraryEntryPoint.CreateLibraryController` function is used to create a new `LibraryController`. This object is required as an entry point to the rest of the `librarie.js` system:

```html
    <script>
        let libController = LibraryEntryPoint.CreateLibraryController();
        let libContainer = libController.createLibraryByElementId(...);
    </script>

```


`LibraryController.createLibraryByElementId` function takes the following values as its arguments:

- `htmlElementId` - The ID of an HTML whose content is to be replaced with `LibraryContainer`.

- `loadedTypesJsonObject` - The JSON object to be used by library view as Loaded Data Types. This argument is mandatory.

- `layoutSpecsJsonObject` - The JSON object to be used by library view as Layout Specification. This argument is mandatory.

```html
<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                padding: 0;
                margin: 0;
                background-color: #353535;
            }
        </style>
    </head>
    <body>
        <!-- This is where the library view should appear -->
        <div id="libraryContainerPlaceholder"></div>

        <!-- The main library view compoment -->
        <script src = './dist/v0.0.1/librarie.min.js'></script>

        <!-- Initialize the library view component -->
        <script>
            // Through client specific logic download json objects
            let loadedTypesJsonObject = getLoadedTypesJsonObject();
            let layoutSpecsJsonObject = getLayoutSpecsJsonObject();

            let libController = LibraryEntryPoint.CreateLibraryController();

            libController.on("itemClicked", function (item) {
                console.log(item); // Subscribed to click event
            })

            let libContainer = libController.createLibraryByElementId(
                "libraryContainerPlaceholder", // htmlElementId
                loadedTypesJsonObject,
                layoutSpecsJsonObject);

        </script>

    </body>
</html>
```

### Registering event handlers

`LibraryController` object supports several events. So subscribe to an event of interest, do the following:

```js
// 'libController' is an instance of 'LibraryController' previously constructed. 
libController.on("someEventName", function(data) {
    // Handle 'someEventName' here, the argument 'data` is event dependent.
});
```

#### Event 'itemClicked'

This event is raised when a library item is clicked. The registered event handler will be called with the following argument:

- `contextData`: This is the value of `contextData` passed through [Loaded Data Types](./docs/v0.0.1/loaded-data-types.md) JSON data for the corresponding item.

```js
libController.on("itemClicked", function(contextData) {
    console.log(contextData);
})
```
