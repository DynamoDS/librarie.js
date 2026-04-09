import { Searcher } from '../src/Searcher';
import { ItemData } from '../src/LibraryUtilities';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeItem(
    text: string,
    opts: Partial<{
        visible: boolean;
        itemType: string;
        weight: number;
        children: ItemData[];
    }> = {}
): ItemData {
    const item = new ItemData("");
    item.text = text;
    item.visible = opts.visible ?? true;
    item.itemType = (opts.itemType ?? "none") as any;
    item.weight = opts.weight ?? 0;
    (opts.children ?? []).forEach(c => item.appendChild(c));
    return item;
}

function makeSearcher(
    sections: ItemData[],
    categories: string[] = []
): Searcher {
    const s = new Searcher();
    s.sections = sections;
    s.initializeCategories(categories);
    return s;
}

// ── generateListItems ─────────────────────────────────────────────────────────

describe("Searcher.generateListItems", function () {

    it("returns leaf items from a flat section", function () {
        const leaf = makeItem("Leaf");
        const section = makeItem("Section", { children: [leaf] });
        const searcher = makeSearcher([section]);

        const results = searcher.generateListItems();

        expect(results).toHaveLength(1);
        expect(results[0].text).toBe("Leaf");
    });

    it("skips invisible items", function () {
        const visible = makeItem("Visible");
        const hidden = makeItem("Hidden", { visible: false });
        const section = makeItem("Section", { children: [visible, hidden] });
        const searcher = makeSearcher([section]);

        const results = searcher.generateListItems();

        expect(results.map(r => r.text)).toEqual(["Visible"]);
    });

    it("skips items whose category is not in the filter list", function () {
        const leaf1 = makeItem("InFilter");
        const leaf2 = makeItem("OutOfFilter");
        const cat1 = makeItem("CatA", { itemType: "category", children: [leaf1] });
        const cat2 = makeItem("CatB", { itemType: "category", children: [leaf2] });
        const section = makeItem("Section", { children: [cat1, cat2] });
        const searcher = makeSearcher([section], ["CatA"]); // only CatA selected

        const results = searcher.generateListItems();

        expect(results.map(r => r.text)).toEqual(["InFilter"]);
    });

    it("still adds filtered-out categories to displayedCategories", function () {
        const cat1 = makeItem("CatA", { itemType: "category", children: [makeItem("L1")] });
        const cat2 = makeItem("CatB", { itemType: "category", children: [makeItem("L2")] });
        const section = makeItem("Section", { children: [cat1, cat2] });
        const searcher = makeSearcher([section], ["CatA"]); // CatB filtered out

        searcher.generateListItems();

        expect(searcher.getDisplayedCategories()).toContain("CatA");
        expect(searcher.getDisplayedCategories()).toContain("CatB");
    });

    it("sets pathToItem on returned leaf items", function () {
        const leaf = makeItem("Leaf");
        const parent = makeItem("Parent", { children: [leaf] });
        const section = makeItem("Section", { children: [parent] });
        const searcher = makeSearcher([section]);

        const results = searcher.generateListItems();

        expect(results[0].pathToItem.map(i => i.text)).toEqual(["Section", "Parent", "Leaf"]);
    });

    it("sorts results by weight ascending", function () {
        const heavy = makeItem("Heavy", { weight: 10 });
        const light = makeItem("Light", { weight: 1 });
        const mid   = makeItem("Mid",   { weight: 5 });
        const section = makeItem("Section", { children: [heavy, light, mid] });
        const searcher = makeSearcher([section]);

        const results = searcher.generateListItems();

        expect(results.map(r => r.text)).toEqual(["Light", "Mid", "Heavy"]);
    });

    it("handles deep nesting and returns only leaf items", function () {
        const leaf = makeItem("DeepLeaf");
        const mid = makeItem("Mid", { children: [leaf] });
        const top = makeItem("Top", { children: [mid] });
        const section = makeItem("Section", { children: [top] });
        const searcher = makeSearcher([section]);

        const results = searcher.generateListItems();

        expect(results).toHaveLength(1);
        expect(results[0].text).toBe("DeepLeaf");
    });

    it("returns empty array when all items are invisible", function () {
        const hidden = makeItem("H", { visible: false });
        const section = makeItem("Section", { children: [hidden] });
        const searcher = makeSearcher([section]);

        expect(searcher.generateListItems()).toHaveLength(0);
    });
});

// ── generateStructuredItems ───────────────────────────────────────────────────

describe("Searcher.generateStructuredItems", function () {

    it("returns visible category items that are in the filter list", function () {
        const catA = makeItem("CatA", { itemType: "category" });
        const catB = makeItem("CatB", { itemType: "category" });
        const section = makeItem("Section", { children: [catA, catB] });
        const searcher = makeSearcher([section], ["CatA"]);

        const results = searcher.generateStructuredItems();

        expect(results.map(r => r.text)).toEqual(["CatA"]);
    });

    it("excludes invisible category items from results and displayedCategories", function () {
        const catVisible = makeItem("Visible", { itemType: "category" });
        const catHidden  = makeItem("Hidden",  { itemType: "category", visible: false });
        const section = makeItem("Section", { children: [catVisible, catHidden] });
        const searcher = makeSearcher([section], ["Visible", "Hidden"]);

        const results = searcher.generateStructuredItems();

        expect(results.map(r => r.text)).toEqual(["Visible"]);
        expect(searcher.getDisplayedCategories()).not.toContain("Hidden");
    });

    it("populates displayedCategories from all visible categories, even those not in filter", function () {
        const catA = makeItem("CatA", { itemType: "category" });
        const catB = makeItem("CatB", { itemType: "category" });
        const section = makeItem("Section", { children: [catA, catB] });
        const searcher = makeSearcher([section], ["CatA"]); // CatB not in filter

        searcher.generateStructuredItems();

        expect(searcher.getDisplayedCategories()).toContain("CatA");
        expect(searcher.getDisplayedCategories()).toContain("CatB");
    });

    it("returns empty array when no categories match the filter", function () {
        const cat = makeItem("CatA", { itemType: "category" });
        const section = makeItem("Section", { children: [cat] });
        const searcher = makeSearcher([section], ["CatX"]); // no match

        expect(searcher.generateStructuredItems()).toHaveLength(0);
    });

    it("returns empty array for empty sections", function () {
        const searcher = makeSearcher([]);
        expect(searcher.generateStructuredItems()).toHaveLength(0);
    });
});

// ── initializeCategories / getDisplayedCategories ─────────────────────────────

describe("Searcher.initializeCategories", function () {

    it("sets both categories and displayedCategories to the provided list", function () {
        const searcher = new Searcher();
        searcher.initializeCategories(["A", "B", "C"]);

        expect(searcher.categories).toEqual(["A", "B", "C"]);
        expect(searcher.getDisplayedCategories()).toEqual(["A", "B", "C"]);
    });
});
