# librarie.js
Reusable lightweight library component based on React.js

### Set up
Installing Webpack and TypeScript globally

    $ npm install -g webpack
    $ npm install -g typescript
    $ npm install

### Easy development build
- Build source scripts

    `$ npm run dev`

- Serve up the new library view

    `$ node ./index.js`

- Navigate to `localhost:3456` in Google Chrome browser

### Easy production build
- Build source scripts

    `$ npm run build`

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

        <!-- The main library view compoment will be injected depending on build environment-->
        <!-- start:librarie inject -->
        <script src = './dist/librarie.min.js'></script>
        <!-- end:librarie inject -->


        <!-- Initialize the library view component -->
        <script>
            let configuration = {
                htmlElementId: "libraryContainerPlaceholder",
                loadedTypesUrl: "loadedTypes", // A relative or absolute URL.
                layoutSpecsUrl: "layoutSpecs"  // A relative or absolute URL.
            };

            let libView = new LibraryEntryPoint.LibraryView(configuration);

            // TODO: The callback when a library item is clicked on has not been 
            // provided yet, it is scheduled to be done in the near future.
        </script>

    </body>
</html>

```
