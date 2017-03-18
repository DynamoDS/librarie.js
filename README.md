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
The following simple HTML code illustrates the way to embed library view into an existing web page. Note that this is a work-in-progress, `LibraryView` API set will be further simplified in the near future.

`LibraryEntryPoint.LibraryView` constructor takes the following values as its configurations:

- `htmlElementId` - The id of a placeholder HTML element to be replaced by library view.

- `loadedTypesUrl` - This represents a relative or absolute URL from where [Loaded Data Types](./docs/v0.0.1/loaded-data-types.md) JSON data is to be downloaded.

- `layoutSpecsUrl` - This represents a relative or absolute URL from where [Layout Specification](./docs/v0.0.1/layout-specs.md) JSON data is to be downloaded.

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
        <!-- Style sheets for library view  -->
        <!-- TODO: Find a way to embed style sheet in bundle.js -->
        <link rel="stylesheet" href="/src/resources/LibraryStyles.css" />

        <!-- This is where the library view should appear -->
        <div id="libraryContainerPlaceholder"></div>

        <!-- React.js dependencies through CDN -->
        <script src="./node_modules/react/dist/react.js"></script>
        <script src="./node_modules/react-dom/dist/react-dom.js"></script>

        <!-- The main library view compoment -->
        <script src = './dist/v0.0.1/librarie.min.js'></script>


        <!-- Initialize the library view component -->
        <script>
            let configuration = {
                htmlElementId: "libraryContainerPlaceholder",
                loadedTypesUrl: "loadedTypes", // A relative or absolute URL.
                layoutSpecsUrl: "layoutSpecs"  // A relative or absolute URL.
            };

            let libView = new LibraryEntryPoint.LibraryView(configuration);
            
            libView.on("itemClicked", function(item) {
                console.log(item);
            })
        </script>

    </body>
</html>
```

### Registering event handlers

`LibraryView` object supports several events. So subscribe to an event of interest, do the following:

```js
// 'libView' is an instance of 'LibraryView' previously constructed. 
libView.on("someEventName", function(data) {
    // Handle 'someEventName' here, the argument 'data` is event dependent.
});
```

#### Event 'itemClicked'

This event is raised when a library item is clicked. The registered event handler will be called with the following argument:

- `contextData`: This is the value of `contextData` passed through [Loaded Data Types](./docs/v0.0.1/loaded-data-types.md) JSON data for the corresponding item.

```js
libView.on("itemClicked", function(contextData) {
    console.log(contextData);
})
```
