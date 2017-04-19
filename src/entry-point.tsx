import * as React from "react";
import * as ReactDOM from "react-dom";

import { LibraryContainer } from "./components/LibraryContainer";
import { JsonDownloader } from "./LibraryUtilities";

export function CreateJsonDownloader(jsonUrls: string[], callback: Function) {
    return new JsonDownloader(jsonUrls, callback);
}

export function CreateLibraryByElementId(htmlElementId: string, layoutSpecsJson: any, loadedTypesJson: any) {

    let htmlElement = document.getElementById(htmlElementId);
    return ReactDOM.render(<LibraryContainer loadedTypesJson={loadedTypesJson}
        layoutSpecsJson={layoutSpecsJson} />, htmlElement);
}

export function CreateLibraryContainer(layoutSpecsJson: any, loadedTypesJson: any) {
    return (<LibraryContainer layoutSpecsJson={layoutSpecsJson} loadedTypesJson={loadedTypesJson} />);
}
