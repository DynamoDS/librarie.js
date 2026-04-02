import type { LibraryContainerHandle } from '../../src/components/LibraryContainer';
import { HostingContextType } from '../../src/SharedTypes';
import * as LibraryEntryPoint from '../../src/entry-point';

/**
 * Creates a minimal LibraryContainerHandle mock for isolated component tests.
 * Accepts an optional libController so callers can inject the same controller
 * they are testing; falls back to a fresh one when not needed.
 */
export function createMockHandle(
  libController: LibraryEntryPoint.LibraryController = LibraryEntryPoint.CreateLibraryController()
): LibraryContainerHandle {
  return {
    get state() {
      return {
        inSearchMode: false,
        searchText: '',
        selectedCategories: [] as string[],
        structured: false,
        detailed: false,
        showItemSummary: false,
        tooltipContent: { create: '', action: '', query: '' },
        hostingContext: HostingContextType.none,
        shouldOverrideExpandedState: true,
      };
    },
    get selectionIndex() { return 0; },
    get props() {
      return {
        libraryController: libController,
        defaultSectionString: 'default',
        miscSectionString: 'Miscellaneous',
      };
    },
    setSelection(_index: number) {},
    raiseEvent(_name: string, _params?: any) {},
    scrollToExpandedItem(_element: HTMLElement | null) {},
    getContainerElement() { return null; },
    setShouldOverrideExpandedState(_value: boolean) {},
  };
}

export const loadedTypesJson: any = {
  "loadedTypes": [
    {
      "fullyQualifiedName": "Child1",
      "iconUrl": "",
      "contextData": "Input",
      "itemType": "action",
      "description": "First item",
      "keywords": ""
    },
    {
      "fullyQualifiedName": "Child2",
      "iconUrl": "",
      "contextData": "",
      "itemType": "action",
      "description": "Second item",
      "keywords": ""
    },
    {
      "fullyQualifiedName": "pkg://Clockwork.Core.Math.+1",
      "iconUrl": "/src/resources/icons/ba8cd7c7-346a-45c6-857e-e47800b80818.png",
      "contextData": "+1",
      "parameters": null,
      "itemType": "action",
      "keywords": "",
      "weight": 0,
      "description": null
    },
  ]
};

export const layoutSpecsJson: any = {
  "sections": [
    {
      "text": "default",
      "iconUrl": "",
      "elementType": "section",
      "showHeader": false,
      "include": [],
      "childElements": [
        {
          "text": "Parent",
          "iconUrl": "",
          "elementType": "category",
          "include": [],
          "childElements": [{
            "text": "Core",
            "iconUrl": "",
            "elementType": "group",
            "include": [{"path": "Child1" }, { "path": "Child2" }],
            "childElements":[]
          }]
        }
      ]
    },
    {
      "text": "Miscellaneous",
      "iconUrl": "",
      "elementType": "section",
      "showHeader": true,
      "include": [],
      "childElements": []
    },
    {
      "text": "Add-ons",
      "iconUrl": "",
      "elementType": "section",
      "showHeader": true,
      "include": [
        {
          "path": "pkg://"
        }
      ],
      "childElements": []
    }
  ]
};
