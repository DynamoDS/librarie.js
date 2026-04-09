import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import * as LibraryEntryPoint from '../src/entry-point';
import { loadedTypesJson, layoutSpecsJson } from './data/mock-data';
import { HostingContextType } from '../src/SharedTypes';

describe("LibraryController", function () {
    let libController: LibraryEntryPoint.LibraryController;

    beforeEach(function () {
        libController = LibraryEntryPoint.CreateLibraryController();
    });

    // ── Event system ──────────────────────────────────────────────────────────

    describe("on / raiseEvent", function () {

        it("fires registered callback with the supplied params", function () {
            const fn = jest.fn();
            libController.on("itemClicked", fn);

            libController.raiseEvent("itemClicked", { node: "A" });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith({ node: "A" });
        });

        it("fires multiple callbacks registered to the same event", function () {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            libController.on("searchTextUpdated", fn1);
            libController.on("searchTextUpdated", fn2);

            libController.raiseEvent("searchTextUpdated", "hello");

            expect(fn1).toHaveBeenCalledWith("hello");
            expect(fn2).toHaveBeenCalledWith("hello");
        });

        it("does not throw when raising an event with no registered listeners", function () {
            expect(() => libController.raiseEvent("nonexistent", "data")).not.toThrow();
        });
    });

    // ── Request handler system ────────────────────────────────────────────────

    describe("registerRequestHandler / request", function () {

        it("invokes the handler and passes its return value to the callback", function () {
            libController.registerRequestHandler("packageState", (_args: any[]) => "active");

            const cb = jest.fn();
            libController.request("packageState", cb);

            expect(cb).toHaveBeenCalledWith("active");
        });

        it("calls callback with null when no handler is registered", function () {
            const cb = jest.fn();
            libController.request("unknownVar", cb);

            expect(cb).toHaveBeenCalledWith(null);
        });

        it("replaces a handler when registerRequestHandler is called twice", function () {
            libController.registerRequestHandler("x", () => "first");
            libController.registerRequestHandler("x", () => "second");

            const cb = jest.fn();
            libController.request("x", cb);

            expect(cb).toHaveBeenCalledWith("second");
        });
    });

    // ── Null-safe handler guards ───────────────────────────────────────────────

    describe("null-safe guards before render", function () {

        it("setLoadedTypesJson does not throw before library is rendered", function () {
            expect(() => libController.setLoadedTypesJson(loadedTypesJson, false)).not.toThrow();
        });

        it("setLayoutSpecsJson does not throw before library is rendered", function () {
            expect(() => libController.setLayoutSpecsJson(layoutSpecsJson, false)).not.toThrow();
        });

        it("refreshLibraryView does not throw before library is rendered", function () {
            expect(() => libController.refreshLibraryView()).not.toThrow();
        });

        it("setHostContext does not throw before library is rendered", function () {
            expect(() => libController.setHostContext(HostingContextType.home)).not.toThrow();
        });
    });

    // ── createLibraryByElementId ──────────────────────────────────────────────

    describe("createLibraryByElementId", function () {

        it("throws a descriptive error when the element ID is not found", function () {
            expect(() => libController.createLibraryByElementId("nonexistent-id"))
                .toThrow(/nonexistent-id/);
        });

        it("mounts without error when the element exists", function () {
            const div = document.createElement("div");
            div.id = "libraryRoot";
            document.body.appendChild(div);

            expect(() => act(() => libController.createLibraryByElementId("#libraryRoot"))).not.toThrow();

            document.body.removeChild(div);
        });

        it("reuses the React root when called twice on the same element (no double-mount crash)", function () {
            const div = document.createElement("div");
            div.id = "libraryRoot2";
            document.body.appendChild(div);

            expect(() => {
                act(() => libController.createLibraryByElementId("#libraryRoot2"));
                act(() => libController.createLibraryByElementId("#libraryRoot2"));
            }).not.toThrow();

            document.body.removeChild(div);
        });
    });

    // ── setHostContext integration ─────────────────────────────────────────────

    describe("setHostContext", function () {

        it("does not throw after library is rendered", function () {
            render(libController.createLibraryContainer());

            act(() => {
                libController.setLoadedTypesJson(loadedTypesJson, false);
                libController.setLayoutSpecsJson(layoutSpecsJson, false);
                libController.refreshLibraryView();
            });

            expect(() => {
                act(() => libController.setHostContext(HostingContextType.home));
            }).not.toThrow();
        });
    });
});
