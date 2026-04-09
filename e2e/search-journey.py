"""
E2E search journey test for librarie.js.

Run with the webapp-testing helper so the dev server is managed automatically:

    python /path/to/with_server.py --server "npm run serve" --port 3456 \
        -- python e2e/search-journey.py

The script exits with code 0 on success, non-zero on assertion failure.
"""

import sys
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3456"


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # ── 1. Page loads and library sections are rendered ───────────────────
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # At least one library section header should be present
        sections = page.locator(".LibraryItemContainerSection, .LibrarySectionHeader, .LibraryItemText")
        expect(sections.first).to_be_visible(timeout=5000)
        print("PASS  library sections visible on load")

        # ── 2. Search returns results ─────────────────────────────────────────
        search_input = page.get_by_role("textbox")
        expect(search_input).to_be_visible()
        search_input.fill("a")  # broad term to guarantee hits
        page.wait_for_timeout(600)  # debounce is 300 ms

        results = page.locator(".SearchResultItemContainer")
        expect(results.first).to_be_visible(timeout=3000)
        result_count = results.count()
        assert result_count > 0, f"Expected search results, got {result_count}"
        print(f"PASS  search produced {result_count} result(s)")

        # ── 3. Clear button resets to browse mode ─────────────────────────────
        cancel_btn = page.locator(".CancelButton")
        expect(cancel_btn).to_be_visible()
        cancel_btn.click()
        page.wait_for_timeout(300)

        # After clearing, search results should be gone
        assert results.count() == 0, "Expected no results after clearing search"
        print("PASS  clear button removes search results")

        # ── 4. Library sections are visible again after clear ─────────────────
        expect(sections.first).to_be_visible(timeout=3000)
        print("PASS  library sections visible after clear")

        browser.close()
        print("\nAll E2E checks passed.")


if __name__ == "__main__":
    try:
        run()
    except AssertionError as e:
        print(f"FAIL  {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR {e}", file=sys.stderr)
        sys.exit(2)
