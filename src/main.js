
require("./resources/index.css");
const LibraryEntryPoint = require("./entry-point");

let jsonUrls = ["loadedTypes", "layoutSpecs"];
let libController = LibraryEntryPoint.CreateLibraryController();
LibraryEntryPoint.CreateJsonDownloader(jsonUrls, function (jsonUrl, jsonObject) {

    let downloaded = this.getDownloadedJsonObjects();
    let loadedTypesJson = downloaded["loadedTypes"];
    let layoutSpecsJson = downloaded["layoutSpecs"];

    if (!loadedTypesJson || (!layoutSpecsJson)) {
        return; // Not fully downloaded yet, bail.
    }

    libController.createLibraryByElementId(
        "libraryContainerPlaceholder", layoutSpecsJson, loadedTypesJson);
});

const replaceImageDelayTime = 100;
let intervalId;

// Disable the context menu
document.oncontextmenu = function () {
    return true;
}

// Disable zoom by keyboard
document.addEventListener("keydown",
    function (event) {
        if ((event.ctrlKey === true || event.metaKey === true) &&
            (event.which === 61 ||
                event.which === 107 ||
                event.which === 173 ||
                event.which === 109 ||
                event.which === 187 ||
                event.which === 189)) {
            event.preventDefault();
        }
    },
    false
);

// Disable zoom by mouse wheel
document.addEventListener("mousewheel",
    function (event) {
        if (event.ctrlKey === true || event.metaKey) {
            event.preventDefault();
        }
    },
    false
);


    // //Create library view
    const libContainer = libController.createLibraryByElementId("libraryContainerPlaceholder");
    if (refreshLibraryView) {
        refreshLibraryView(libController);
    }

    async function replaceImages() {
        const allimages = document.getElementsByTagName("img");
        for (const element of allimages) {
            let currentImage = element;
            let src = element.src
            if (element.orgSrc != null) {
                src = element.orgSrc;
            }
            //the icon is already set - bail.
            if (src.startsWith("data:image")) {
                continue;
            }
            
            //request the icon from the extension.
            const base64String = await window.chrome.webview.hostObjects.bridgeTwoWay.GetBase64StringFromPath(src);
            if (currentImage != null) {
                currentImage.src = base64String;
            }
        }
    }

    function refreshLibraryView(libraryController) {
        window.chrome.webview.postMessage("RefreshLibrary");
    }

    //set a custom search handler
    libController.searchLibraryItemsHandler = function (text, callback) {
        const encodedText = encodeURIComponent(text);
        //save the callback so we can access from our completion function
        searchCallback = callback;
        window.chrome.webview.postMessage(JSON.stringify({ "func": "performSearch", "data": encodedText }));
        window.chrome.webview.postMessage(JSON.stringify({ "func": "logEventsToInstrumentation", "data": ["Search", encodedText] }));
    }

    // Register event handlers for various events on library controller and package controller.
    libController.on(libController.ItemClickedEventName, function (nodeCreationName) {
        console.log('Library Node Clicked: ' + nodeCreationName);
        window.chrome.webview.postMessage(JSON.stringify({ "func": "createNode", "data": nodeCreationName }));
    });

    //if the user clicks anywhere - reload the images to ensure they are up to date after interactions
    //which update the currently displayed libraryItems.
    document.body.addEventListener('click', function () {
        setTimeout(function () {
            replaceImages();
        }, replaceImageDelayTime);
        setTimeout(function () {
            replaceImages();
        }, replaceImageDelayTime * 5);
    }, true);

    libController.on(libController.ItemMouseEnterEventName, function (arg) {
        window.chrome.webview.postMessage(JSON.stringify({ "func": "showNodeTooltip", "data": [arg.data, arg.rect.top] }));
    });

    libController.on(libController.ItemMouseLeaveEventName, function (arg) {
        window.chrome.webview.postMessage(JSON.stringify({ "func": "closeNodeTooltip", "data": true }));
    });

    libController.on(libController.SectionIconClickedEventName, function (section) {
        console.log("Section clicked: " + section);
        if (section == "Add-ons") {
            window.chrome.webview.postMessage(JSON.stringify({ "func": "importLibrary", "data": "" }));
        }
    });

    libController.on(libController.FilterCategoryEventName, function (item) {
        let categories = [];
        item.forEach(function (elem) {
            const catString = elem.name + ":" + (elem.checked ? "Selected" : "Unselected");
            categories.push(catString);
        });
        
        window.chrome.webview.postMessage(JSON.stringify({ "func": "logEventsToInstrumentation", "data": ["Filter-Categories", categories.join(",")] }));
    });

    //This will call the NextStep() function located in the LibraryViewController
    function nextStepInGuide() {
        window.chrome.webview.postMessage(JSON.stringify({ "func": "NextStep", "data": "" }));
    }



function refreshLibViewFromData(loadedTypes, layoutSpec) {
    const append = false; // Replace existing contents instead of appending.
    libController.setLoadedTypesJson(JSON.parse(loadedTypes), append);
    libController.setLayoutSpecsJson(JSON.parse(layoutSpec), append);
    libController?.refreshLibraryView(); // Refresh library view.

    //update image src properties after dom is updated.
    setTimeout(function () {
        replaceImages();
    }, replaceImageDelayTime);
}

let searchCallback = null;
function completeSearch(searchLoadedTypes) {
    searchCallback(JSON.parse(searchLoadedTypes));
}

function setLibraryFontSize(fontSize) {
    document.getElementsByTagName('html')[0].style.fontSize = fontSize + 'px';
}

//This will find a specific div in the html and then it will apply the glow animation on it
function highlightLibraryItem(itemName, enableHighlight) {
    let found_div = null;
    const libraryItemsText = document.getElementsByClassName("LibraryItemText");
    for (const libraryItem of libraryItemsText) {
        if (libraryItem.textContent == itemName) {
            found_div = libraryItem.parentNode;
            break;
        }
    }
    if (found_div != null) {
        if (enableHighlight) {
            //Validates that the div is not already highlighted
            const currentAttibute = found_div.getAttribute("id");
            if (currentAttibute == null || !currentAttibute.includes("glow_")) {
                glowAnimation(found_div, true);
            }
        }
        else {
            glowAnimation(found_div, false);
        }
    }
}

//This will execute(or stop) the glow animation in a specific <div> based in the enable parameter
function glowAnimation(divElement, enable) {
    if (enable) {
        setIdAttribute(divElement);
        intervalId = window.setInterval(setIdAttribute, 2000, divElement);
    }
    else {
        window.clearInterval(intervalId);
        divElement.setAttribute("id", "");
    }
}

//This will change the id of the div that contains the package name so it will apply a glow effect in the border
function setIdAttribute(divElement) {
    if (divElement.id == "glow_active") {
        divElement.setAttribute("id", "glow_inactive");
    }
    else {
        divElement.setAttribute("id", "glow_active");
    }
}

//This will subscribe a handler to the div.click event, so when is clicked we will be moved to the next Step
function subscribePackageClickedEvent(packageName, enable) {
    const found_div = findPackageDiv(packageName, "LibraryItemText");
    if (found_div == null) {
        return;
    }
    if (enable) {
        found_div.parentNode.parentNode.addEventListener('click', nextStepInGuide);
    }
    else {
        found_div.parentNode.parentNode.removeEventListener('click', nextStepInGuide);
    }
}

//This will find the <div> that contains the package information
function findPackageDiv(packageName, libraryClassName) {
    let found_div = null;
    const libraryItemsText = document.getElementsByClassName(libraryClassName);
    for (const libraryItem of libraryItemsText) {
        if (libraryItem.textContent.toLowerCase() == packageName.toLowerCase()) {
            found_div = libraryItem;
            break;
        }
    }
    return found_div;
}

//This will execute a click over a specific <div> that contains the package content
function expandPackageDiv(packageName, libraryClassName) {
    const found_div = findPackageDiv(packageName, libraryClassName);
    if (found_div == null) {
        return;
    }
    const containerCatDiv = found_div.parentNode.parentNode;
    const itemBodyContainer = containerCatDiv.getElementsByClassName(libraryClassName)[0];
    if (!itemBodyContainer.parentElement.parentElement.className.includes('expanded')) {
        itemBodyContainer.click();
    }
}

function collapsePackageDiv(packageName, libraryClassName) {
    const found_div = findPackageDiv(packageName, libraryClassName);
    if (found_div == null) {
        return;
    }
    const containerCatDiv = found_div.parentNode.parentNode;
    const itemBodyContainer = containerCatDiv.getElementsByClassName(libraryClassName)[0];
    if (itemBodyContainer.parentElement.parentElement.className.includes('expanded')) {
        itemBodyContainer.click();
    }
}



//Set the overlay and the hole
function setOverlay(enable) {
    const tools = document.getElementsByClassName("LibraryItemContainerSection")[0];
    if (tools == null)
        return;
    const addons = document.getElementsByClassName("LibraryItemContainerSection")[1];
    if (addons == null)
        return;
    const searchBar = document.getElementsByClassName("SearchBar")[0];
    if (searchBar == null)
        return;

    const children = addons.childNodes;
    if (children == null || children.lenght == 0)
        return;

    //Apply a specific style for the <div> depending if the parameter enable is true or false.
    if (enable) {
        tools.classList.add("overlay");
        searchBar.classList.add("overlay");
        children[0].classList.add("hole");
        children[1].classList.add("hole");
    }
    else {
        tools.classList.remove("overlay");
        searchBar.classList.remove("overlay");
        children[0].classList.remove("hole");
        children[1].classList.remove("hole");
    }
}

//get information about the current position of a specific div element, if the WebBrowser is resized the values will change
function getDocumentClientRect(divElement) {
    const targetDiv = findPackageDiv(divElement, "LibraryItemText");
    if (targetDiv == null) return;
    const rect = targetDiv.parentNode.getBoundingClientRect();
    const clientRectDiv = {
        "width": rect.width,
        "height": rect.height,
        "top": rect.top,
        "bottom": rect.bottom
    }
    const documentSize = {
        "width": document.body.clientWidth,
        "height": document.body.clientHeight
    }
    const locationInfo = {
        "document": documentSize,
        "client": clientRectDiv
    }
    return JSON.stringify(locationInfo);
}

//scroll down until the bottom of the page so the AddOns always be visible
function scrollToBottom() {
    document.getElementsByClassName("LibraryItemContainer")[0].scroll(0, document.body.scrollHeight)
}

//This method will be executed when the WebBrowser change its size, so we can update the Popup vertical location that is over the library
document.body.onresize = () => {
    window.chrome.webview.postMessage(JSON.stringify({ "func": "ResizedEvent", "data": "" }));
}

//This function will be dispatching javaScript keydown events based on Dynamo keydown events
function eventDispatcher(eventKeyData) {
    const kbEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        ...eventKeyData
    });

    document.dispatchEvent(kbEvent);
}

//This function will show the overlay over the Library when the Preferences/PackageManagerSearch are opened otherwiser is not visible
function fullOverlayVisible(enableOverlay) {
    if (enableOverlay)
        document.getElementById("overlay").style.display = "block";
    else
        document.getElementById("overlay").style.display = "none";
}