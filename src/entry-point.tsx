import * as React from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";

import { LibraryContainer } from "./components/LibraryContainer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { JsonDownloader } from "./LibraryUtilities";
import { Reactor } from "./EventHandler";
import { HostingContextType } from "./SharedTypes";

/**
 * Creates a new JsonDownloader instance to asynchronously load JSON data from one or more URLs.
 * @param {string[]} jsonUrls An array of URLs from which JSON data is to be downloaded.
 * @param {Function} callback Callback invoked for each URL with (url, jsonObject) arguments.
 * @returns {JsonDownloader} A new JsonDownloader instance.
 */
export function CreateJsonDownloader(jsonUrls: string[], callback: Function) {
    return new JsonDownloader(jsonUrls, callback);
}

/**
 * Creates and returns a new LibraryController instance.
 * This is the primary factory function for host applications to obtain a library controller.
 * @returns {LibraryController} A new LibraryController instance.
 */
export function CreateLibraryController() {
    return new LibraryController();
}

type SetLoadedTypesJsonFunc = (loadedTypesJson: any, append: boolean) => void;

type SetLayoutSpecsJsonFunc = (layoutSpecsJson: any, append: boolean) => void;

type RefreshLibraryViewFunc = () => void;

type SearchLibraryItemsCallbackFunc = (loadedTypesJsonOnSearch: any) => void;

type SearchLibraryItemsFunc = (text: string, callback: SearchLibraryItemsCallbackFunc) => void;

export class LibraryController {

    ItemClickedEventName = "itemClicked";
    ItemMouseEnterEventName = "itemMouseEnter";
    ItemMouseLeaveEventName = "itemMouseLeave";
    ItemSummaryExpandedEventName = "itemSummaryExpanded";
    SectionIconClickedEventName = "sectionIconClicked";
    SearchTextUpdatedEventName = "searchTextUpdated";
    RefreshLibraryViewRequestName = "refreshLibraryView";
    FilterCategoryEventName = "filterCategoryChange"; 
    DefaultSectionName = "default";
    MiscSectionName = "Miscellaneous";

    reactor: Reactor | null = null;
    requestHandler: any = {};
    setLoadedTypesJsonHandler: SetLoadedTypesJsonFunc | null = null;
    setLayoutSpecsJsonHandler: SetLayoutSpecsJsonFunc | null = null;
    refreshLibraryViewHandler: RefreshLibraryViewFunc | null = null;
    setHostContextHandler:((context:HostingContextType)=> void) | null = null;

    // This is to make it possible to set an external search handler.
    // Given a search text, it will call the callback function with search result.
    // The search result will be in the same format as the first parameter for setLoadedTypesJsonHandler.
    searchLibraryItemsHandler: SearchLibraryItemsFunc | null = null;

    private root: Root | null = null;

    constructor() {
        this.on = this.on.bind(this);
        this.raiseEvent = this.raiseEvent.bind(this);
        this.registerRequestHandler = this.registerRequestHandler.bind(this);
        this.request = this.request.bind(this);
        this.createLibraryByElementId = this.createLibraryByElementId.bind(this);
        this.createLibraryContainer = this.createLibraryContainer.bind(this);
        this.setLoadedTypesJson = this.setLoadedTypesJson.bind(this);
        this.setLayoutSpecsJson = this.setLayoutSpecsJson.bind(this);
        this.refreshLibraryView = this.refreshLibraryView.bind(this);
        this.setHostContext = this.setHostContext.bind(this);

        this.reactor = new Reactor();
    }

    /**
     * Subscribes to a named library event.
     * @param {string} eventName The event name (e.g. "itemClicked", "searchTextUpdated").
     * @param {Function} callback The callback invoked when the event is raised.
     */
    on(eventName: string, callback: Function) {
        this.reactor?.registerEvent(eventName, callback);
    }

    /**
     * Raises a named library event with optional parameters.
     * @param {string} name The event name to raise.
     * @param {any} [params] Optional parameters passed to the event subscribers.
     */
    raiseEvent(name: string, params?: any | any[]) {
        this.reactor?.raiseEvent(name, params);
    }

    /**
     * This method registers the callback function when the value of a given 
     * named variable is requested. See LibraryController.request method for 
     * more information on each available variable name.
     * 
     * Note that if called more than once, this method replaces the original 
     * callback function with the new value.
     * 
     * @param {string} variableName The name of the variable.
     * @param {Function} callback The callback function to be invoked when a 
     * variable of the given name is queried.
     */
    registerRequestHandler(variableName: string, callback: Function) {

        // Storing the callback function in the property map.
        this.requestHandler[variableName] = callback;
    }

    /**
     * External code calls this method to obtain the value of the given named 
     * variable. The execution of this method may or may not be asynchronous 
     * depending on the corresponding handler registered in onRequest. Once 
     * the value of the variable is obtained, the callback function is invoked 
     * with the value.
     * 
     * Possible variable and their corresponding data types are as followed:
     * 
     *      packageState: string
     * 
     * @param {string} variableName The name of the variable whose value is to 
     * be retrieved.
     * @param {Function} callback The callback function to be invoked when the 
     * variable value is obtained.
     * @param {any[]} argsArray Zero or more argument values to be passed to the 
     * subscribed handler for this named variable.
     */
    request(variableName: string, callback?: Function, ...argsArray: any[]) {

        // Invokve handler if there's one registered.
        let requestHandler = this.requestHandler[variableName];
        // If the a request handler was not specified, the callback 
        // function will still be invoked with a 'null' as result.
        let value = null; 
        if (requestHandler) {
            value = requestHandler(argsArray);
        }
        if(callback){
            callback(value);
        }
    }

    /**
     * Mounts the library view into the DOM element identified by the given CSS selector or element ID.
     * Optionally pre-populates the library with type and layout data.
     *
     * If called more than once, the existing React root is reused to avoid multiple roots on the
     * same container, which would cause React warnings and undefined behaviour.
     *
     * @param {string} htmlElementId A CSS selector (e.g. "#myDiv") or plain element ID used to locate
     *   the target DOM container. Uses querySelector first, then getElementById as fallback.
     * @param {any} [layoutSpecsJson] Optional layout specification JSON. When provided together with
     *   loadedTypesJson, the library will be populated immediately after mounting.
     * @param {any} [loadedTypesJson] Optional loaded types JSON. When provided together with
     *   layoutSpecsJson, the library will be populated immediately after mounting.
     * @throws {Error} Throws if the target element cannot be found in the DOM.
     */
    createLibraryByElementId(htmlElementId: string, layoutSpecsJson: any = null, loadedTypesJson: any = null): void {
        const htmlElement: Element | null =
            document.querySelector(htmlElementId) || document.getElementById(htmlElementId);
        if (!htmlElement) {
            throw new Error("Element " + htmlElementId + " is not defined");
        }

        if (this.root) {
            // Reuse the existing root to avoid React warnings from creating multiple roots
            // on the same container element.
            this.root.render(this.createLibraryContainer());
        } else {
            this.root = createRoot(htmlElement);
            this.root.render(this.createLibraryContainer());
        }

        if (loadedTypesJson && (layoutSpecsJson)) {
            let append = false; // Replace existing contents instead of appending.
            this.setLoadedTypesJson(loadedTypesJson, append);
            this.setLayoutSpecsJson(layoutSpecsJson, append);
            this.refreshLibraryView();
        }
    }

    /**
     * Creates the React element tree for the library container wrapped in an ErrorBoundary.
     * This is typically used by host applications that manage their own React root
     * and want to embed the library container inside an existing React tree.
     * @returns {React.ReactElement} The LibraryContainer React element wrapped in an ErrorBoundary.
     */
    createLibraryContainer() {
        return (
            <ErrorBoundary>
                <LibraryContainer
                    libraryController={this}
                    defaultSectionString={this.DefaultSectionName}
                    miscSectionString={this.MiscSectionName} />
            </ErrorBoundary>
        );
    }

    /**
     * Passes the loaded types JSON to the library for rendering.
     * @param {any} loadedTypesJson The loaded types data object.
     * @param {boolean} append When true, appends to the existing types; when false, replaces them.
     */
    setLoadedTypesJson(loadedTypesJson: any, append: boolean): void {
        if (this.setLoadedTypesJsonHandler) {
            this.setLoadedTypesJsonHandler(loadedTypesJson, append);
        }
    }

    /**
     * Passes the layout specification JSON to the library for rendering.
     * @param {any} layoutSpecsJson The layout specification data object.
     * @param {boolean} append When true, appends to the existing layout; when false, replaces it.
     */
    setLayoutSpecsJson(layoutSpecsJson: any, append: boolean): void {
        if (this.setLayoutSpecsJsonHandler) {
            this.setLayoutSpecsJsonHandler(layoutSpecsJson, append);
        }
    }

    /**
     * Triggers a refresh of the library view, causing it to re-render with the current data.
     */
    refreshLibraryView(): void {
        if (this.refreshLibraryViewHandler) {
            this.refreshLibraryViewHandler();
        }
    }
    /**
     * Set the host context that the library is being displayed in.
     * Some loadedTypes will not be displayed in the home context.
     * @param context current host context. 
     * @returns void
     */
    setHostContext(context:HostingContextType):void{
        if(this.setHostContextHandler){
            console.log("set context to",context)
            return this.setHostContextHandler(context);
        }
    }
}
