// import * as React from 'react';
// import * as renderer from 'react-test-renderer';
// import * as ReactTestUtils from 'react-dom/lib/ReactTestUtils';
// import LibraryContainer from '../src/components/LibraryContainer';
// import * as LibraryEntryPoint from '../src/entry-point';

// test("add two numbers", function () {
//   expect(1 + 2).toBe(3);
// });

// test("create library item", function () {
//   let jsonUrls = ["testLoadedTypes", "testlayoutSpecs"];
//   let downloader = LibraryEntryPoint.CreateJsonDownloader(jsonUrls, function (jsonUrl, jsonObject) {

//     let downloaded = downloader.getDownloadedJsonObjects();
//     let loadedTypesJson = downloaded["loadedTypes"];
//     let layoutSpecsJson = downloaded["layoutSpecs"];


//     if (!loadedTypesJson || (!layoutSpecsJson)) {
//       return; // Not fully downloaded yet, bail.
//     }

//     let libController = LibraryEntryPoint.CreateLibraryController();

//     libController.on("itemClicked", function (item) {
//       console.log(item);
//     })

//     libController.on("searchTextUpdated", function (searchText) {
//       console.log(searchText);
//       return null;
//     });

//     let libContainer = libController.createLibraryByElementId(
//       "libraryContainerPlaceholder", layoutSpecsJson, loadedTypesJson);

//   });
// });

// /*
// test('Link changes the class when hovered', () => {
//   // const component = renderer.create(
//   //   <Link page="http://www.facebook.com">Facebook</Link>
//   // );
//   // let tree = component.toJSON();
//   // expect(tree).toMatchSnapshot();
//   let component = ReactTestUtils.renderIntoDocument(
//     <Link page="http://www.facebook.com">Facebook</Link>
//   );

//   let a = ReactTestUtils.findRenderedDOMComponentWithTag(component, "a");

//   expect(a.getDOMNode().)

//   // ReactTestUtils.Simulate.onMouseEnter(component);

//   // manually trigger the callback
//   tree.props.onMouseEnter();
//   // re-rendering
//   tree = component.toJSON();
//   expect(tree).toMatchSnapshot();

//   // manually trigger the callback
//   tree.props.onMouseLeave();
//   // re-rendering
//   tree = component.toJSON();
//   expect(tree).toMatchSnapshot();
// });
// */

