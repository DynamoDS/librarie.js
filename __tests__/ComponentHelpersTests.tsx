import * as React from 'react';
import '@testing-library/jest-dom';
import { render, act, fireEvent } from '@testing-library/react';
import { raiseItemMouseLeave, raiseItemMouseEnter, handleImageLoadFail, useStableWindowListener } from '../src/components/componentHelpers';
import { ItemData } from '../src/LibraryUtilities';
import type { LibraryContainerHandle } from '../src/components/LibraryContainer';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeLeafItem(): ItemData {
    const item = new ItemData("");
    item.text = "leaf";
    item.contextData = "ctx";
    // no children → leaf
    return item;
}

function makeParentItem(): ItemData {
    const parent = new ItemData("");
    parent.text = "parent";
    const child = new ItemData("");
    child.text = "child";
    parent.appendChild(child);
    return parent;
}

function makeMockHandle(eventCapture: { name: string; params: any }[]): LibraryContainerHandle {
    const mockController = {
        ItemMouseLeaveEventName: "itemMouseLeave",
        ItemMouseEnterEventName: "itemMouseEnter",
    };
    return {
        get state() { return null as any; },
        get selectionIndex() { return 0; },
        get props() { return { libraryController: mockController as any, defaultSectionString: 'default', miscSectionString: 'Misc' }; },
        setSelection() {},
        raiseEvent(name: string, params?: any) { eventCapture.push({ name, params }); },
        scrollToExpandedItem() {},
        getContainerElement() { return null; },
        setShouldOverrideExpandedState() {},
    } as unknown as LibraryContainerHandle;
}

// ── raiseItemMouseLeave ───────────────────────────────────────────────────────

describe("raiseItemMouseLeave", function () {

    it("raises ItemMouseLeaveEventName for leaf items", function () {
        const captured: any[] = [];
        const handle = makeMockHandle(captured);
        const leaf = makeLeafItem();

        raiseItemMouseLeave(leaf, handle);

        expect(captured).toHaveLength(1);
        expect(captured[0].name).toBe("itemMouseLeave");
        expect(captured[0].params).toEqual({ data: leaf.contextData });
    });

    it("does NOT raise an event for non-leaf (parent) items", function () {
        const captured: any[] = [];
        const handle = makeMockHandle(captured);
        const parent = makeParentItem();

        raiseItemMouseLeave(parent, handle);

        expect(captured).toHaveLength(0);
    });
});

// ── raiseItemMouseEnter ───────────────────────────────────────────────────────

describe("raiseItemMouseEnter", function () {

    it("raises ItemMouseEnterEventName with rect and element for leaf items", function () {
        const captured: any[] = [];
        const handle = makeMockHandle(captured);
        const leaf = makeLeafItem();

        const el = document.createElement("div");
        document.body.appendChild(el);

        raiseItemMouseEnter(leaf, handle, el);

        expect(captured).toHaveLength(1);
        expect(captured[0].name).toBe("itemMouseEnter");
        expect(captured[0].params.data).toBe(leaf.contextData);
        expect(captured[0].params.element).toBe(el);
        expect(captured[0].params.rect).toBeDefined();

        document.body.removeChild(el);
    });

    it("does NOT raise an event for parent items", function () {
        const captured: any[] = [];
        const handle = makeMockHandle(captured);
        const parent = makeParentItem();

        const el = document.createElement("div");
        raiseItemMouseEnter(parent, handle, el);

        expect(captured).toHaveLength(0);
    });

    it("does NOT raise an event when containerEl is null", function () {
        const captured: any[] = [];
        const handle = makeMockHandle(captured);
        const leaf = makeLeafItem();

        raiseItemMouseEnter(leaf, handle, null);

        expect(captured).toHaveLength(0);
    });
});

// ── handleImageLoadFail ───────────────────────────────────────────────────────

describe("handleImageLoadFail", function () {

    it("saves original src to orgSrc and replaces src with fallback icon", function () {
        const img = document.createElement("img");
        img.src = "http://example.com/missing.png";

        const syntheticEvent = { target: img } as unknown as React.SyntheticEvent<HTMLImageElement>;
        handleImageLoadFail(syntheticEvent);

        expect((img as any).orgSrc).toBe("http://example.com/missing.png");
        // The fallback src should reference the default icon (mocked as 'test-file-stub' by fileMock)
        expect(img.src).toContain('test-file-stub');
    });
});

// ── useStableWindowListener ───────────────────────────────────────────────────

describe("useStableWindowListener", function () {

    it("registers the listener only once even when the handler identity changes", function () {
        const addSpy = jest.spyOn(window, "addEventListener");

        function TestComponent() {
            const [count, setCount] = React.useState(0);
            useStableWindowListener("click", () => { void count; });
            return <button onClick={() => setCount(c => c + 1)}>click</button>;
        }

        const { getByText } = render(<TestComponent />);
        const clicksBefore = addSpy.mock.calls.filter(([t]) => t === "click").length;

        act(() => { fireEvent.click(getByText("click")); });
        act(() => { fireEvent.click(getByText("click")); });

        const clicksAfter = addSpy.mock.calls.filter(([t]) => t === "click").length;
        // No additional addEventListener calls for "click" after mount
        expect(clicksAfter).toBe(clicksBefore);

        addSpy.mockRestore();
    });

    it("removes the listener on unmount", function () {
        const removeSpy = jest.spyOn(window, "removeEventListener");

        function TestComponent() {
            useStableWindowListener("resize", () => {});
            return <div />;
        }

        const { unmount } = render(<TestComponent />);
        act(() => { unmount(); });

        const removed = removeSpy.mock.calls.some(([t]) => t === "resize");
        expect(removed).toBe(true);

        removeSpy.mockRestore();
    });
});
