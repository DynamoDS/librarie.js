import * as React from "react";
import * as ReactDOM from "react-dom";

import { LibraryContainer } from "./components/LibraryContainer";
import { ItemData, JsonDownloader } from "./LibraryUtilities";
import { Reactor } from "./EventHandler";
import "core-js/actual/string/starts-with";
import "core-js/actual/string/includes";
import "core-js/actual/array/";
import { HostingContextType } from "./sharedTypes";

export function CreateJsonDownloader(jsonUrls: string[], callback: Function) {
    return new JsonDownloader(jsonUrls, callback);
}

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
    modifyItemHandler:((contextDataToMatch:any, dataToModify:ItemData)=> boolean) | null = null;
    setHostContextHandler:((context:HostingContextType)=> void) | null = null;

    // This is to make it possible to set an external search handler.
    // Given a search text, it will call the callback function with search result.
    // The search result will be in the same format as the first parameter for setLoadedTypesJsonHandler.
    searchLibraryItemsHandler: SearchLibraryItemsFunc | null = null;

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
        this.modifyLibraryItemData = this.modifyLibraryItemData.bind(this);
        this.setHostContext = this.setHostContext.bind(this);

        this.reactor = new Reactor();
    }

    on(eventName: string, callback: Function) {
        this.reactor?.registerEvent(eventName, callback);
    }

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

    createLibraryByElementId(htmlElementId: string, layoutSpecsJson: any = null, loadedTypesJson: any = null) {
        let htmlElement: any;
        htmlElement = document.querySelector(htmlElementId) || document.getElementById(htmlElementId);
        if (!htmlElement) {
            throw new Error("Element " + htmlElementId + " is not defined");
        }

        let libraryContainer = ReactDOM.render(this.createLibraryContainer(), htmlElement);

        if (loadedTypesJson && (layoutSpecsJson)) {
            let append = false; // Replace existing contents instead of appending.
            this.setLoadedTypesJson(loadedTypesJson, append);
            this.setLayoutSpecsJson(layoutSpecsJson, append);
            this.refreshLibraryView();
        }

        return libraryContainer;
    }

    createLibraryContainer() {
        return (<LibraryContainer
            libraryController={this}
            defaultSectionString={this.DefaultSectionName}
            miscSectionString={this.MiscSectionName} />);
    }

    setLoadedTypesJson(loadedTypesJson: any, append: boolean): void {
        if (this.setLoadedTypesJsonHandler) {
            this.setLoadedTypesJsonHandler(loadedTypesJson, append);
        }
    }

    setLayoutSpecsJson(layoutSpecsJson: any, append: boolean): void {
        if (this.setLayoutSpecsJsonHandler) {
            this.setLayoutSpecsJsonHandler(layoutSpecsJson, append);
        }
    }

    refreshLibraryView(): void {
        if (this.refreshLibraryViewHandler) {
            this.refreshLibraryViewHandler();
        }
    }

    modifyLibraryItemData(context:any ,data:ItemData):boolean{
        if(this.modifyItemHandler){
            return this.modifyItemHandler(context,data);
        }
       return false;
    }
    //TODO summary
    setHostContext(context:HostingContextType):void{
        console.log("I AM HERE")
        if(this.setHostContextHandler){
            console.log("set context to",context)
            return this.setHostContextHandler(context);
        }
    }
}
