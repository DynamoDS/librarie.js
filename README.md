# librarie.js
Reusable lightweight library component based on React.js

## Set up
Installing all dependencies

    $ npm install

## Build and run librarie.js
- Build source scripts

    `$ npm run build`
    
    Both `librarie.js` (development script) and `librarie.min.js` (production script) will be output in `./dist/v0.0.1/` folder. By default `librarie.min.js` will be referenced in index.html.

- Serve up the new library view

    `$ node ./index.js`

- Navigate to `localhost:3456` in Google Chrome browser

## Usage
There are few ways in which library view (i.e. `LibraryContainer` object) can be constructed. Regardless of which method is used, the caller should first call `LibraryEntryPoint.CreateLibraryController` method to create `LibraryController` before obtaining an instance of `LibraryContainer` object.

```html
    <script>
        let libController = LibraryEntryPoint.CreateLibraryController();
    </script>
```

### Method 1
Constructing library view given the ID of an existing HTML element:

```html
    <div id="libraryContainerPlaceholder"></div>
    <script>
        let libController = LibraryEntryPoint.CreateLibraryController();
        let libContainer = libController.createLibraryByElementId("libraryContainerPlaceholder",
            loadedTypesJsonObject, layoutSpecsJsonObject);
    </script>
```

`LibraryController.createLibraryByElementId` function takes the following values as its arguments:

- `htmlElementId` - The ID of an HTML whose content is to be replaced with `LibraryContainer`.

- `loadedTypesJsonObject` - The JSON object to be used by library view as Loaded Data Types. This argument is mandatory.

- `layoutSpecsJsonObject` - The JSON object to be used by library view as Layout Specification. This argument is mandatory.

### Method 2
Constructing a library view for consumption by other React.js components (e.g. hosting the library within a React.js tab control). This method creates a valid `JSX.Element` object so that it can be directly embedded under another React.js element. For details of `loadedTypesJsonObject` and `layoutSpecsJsonObject`, please refer to the above section.

```html
    <script>
        let libController = LibraryEntryPoint.CreateLibraryController();
        let libContainer = libController.createLibraryContainer(,
            loadedTypesJsonObject, layoutSpecsJsonObject);

        let aReactJsTabContainer = ...;
        aReactJsTabContainer.addTabPage(libContainer);
    </script>
```

## Sample usage of librarie.js
The following simple HTML code illustrates the way to embed library view into an existing web page.

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

## Registering event handlers

`LibraryController` object supports several events. So subscribe to an event of interest, do the following:

```js
// 'libController' is an instance of 'LibraryController' previously constructed. 
libController.on("someEventName", function(data) {
    // Handle 'someEventName' here, the argument 'data` is event dependent.
});
```

### Event 'itemClicked'

This event is raised when a library item is clicked. The registered event handler will be called with the following argument:

- `contextData`: This is the value of `contextData` passed through [Loaded Data Types](./docs/v0.0.1/loaded-data-types.md) JSON data for the corresponding item.

```js
libController.on("itemClicked", function(contextData) {
    console.log(contextData);
})
```

### Event 'searchTextUpdated'

This event is raised when user starts typing on the search bar, and the display mode of SearchView is `list`. In this event, it should call a search algorithm from some other components, and return a list of [Search Result Items](./docs/v0.0.1/search-items.md) in JSON format to the caller.

- `searchText`: This is the value of state `searchText` in `SearchView` component, which is a string value that user has entered in the search bar.

 ```js
libView.on("searchTextUpdated", function (searchText) {
    console.log(searchText);
    return null;
});
```
