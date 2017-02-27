
import * as React from "react";
import * as ReactDOM from "react-dom";

import { LibraryContainer } from "./components/LibraryContainer";

export class LibraryView {

    loadedTypesJson: any = null;
    layoutSpecsJson: any = null;

    constructor(public htmlElementName: string) {
        this.setLoadedTypesJson = this.setLoadedTypesJson.bind(this);
        this.setLayoutSpecsJson = this.setLayoutSpecsJson.bind(this);
        this.updateContentsInternal = this.updateContentsInternal.bind(this);
    }

    setLoadedTypesJson(loadedTypesJson: any): void {
        this.loadedTypesJson = loadedTypesJson;
        this.updateContentsInternal();
    }

    setLayoutSpecsJson(layoutSpecsJson: any): void {
        this.layoutSpecsJson = layoutSpecsJson;
        this.updateContentsInternal();
    }

    updateContentsInternal(): void {

        if (!this.loadedTypesJson || (!this.layoutSpecsJson)) {
            return; // Not all required data is available yet.
        }

        let htmlElement = document.getElementById(this.htmlElementName);
        ReactDOM.render(<LibraryContainer />, htmlElement);
    }
}
