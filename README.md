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

            // Register callback functions here.
        </script>

    </body>
</html>
```

### Registering and Dispatching Callback Functions
The callback mechanism of the library component involves the use of:
1. A  `Reactor` object that stores a number of `Event`s.
2. `Event` objects that store one or more callback functions.

To register an event to the library view component, add a new callback function and specify a name for the event:
```
libView.on("eventName", function() {
            // do something
        })
```
An `event` can contain multiple callback functions. To register more functions to an existing event, simply call `libView.on()` again by specifying the same event name and passing in a new function.

Then, use the `raiseEvent()` function to dispatch the event, which will execute all the callback functions registered to the event:
```
libView.raiseEvent("eventName");
```

To register a callback function that takes in a parameter, initialize the function and specify the parameter. While dispatching the event, pass in the input as the second parameter of `raiseEvent()`.
```
libView.on("eventWithParam", function(paramName: string) {
    console.log(paramName);
})
```
```
libView.raiseEvent("eventWithParam", "string parameter");
// (result:) string parameter
```
Note: The callback functions are limited to taking in 0 or 1 parameters only.