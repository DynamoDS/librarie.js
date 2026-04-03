# React 18 Migration Guide
## librarie.js Component Library

This guide documents the changes made during the React 18 migration and provides guidance for future development.

---

## Overview

The librarie.js library has been upgraded from React 16.14.0 to React 18.3.1. This document explains what changed, why, and how to work with the updated codebase.

---

## What Changed

### 1. React & React-DOM Upgrade

**Before:**
```json
"react": "^16.14.0",
"react-dom": "^16.14.0"
```

**After:**
```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```

---

### 2. Lifecycle Methods

All deprecated `UNSAFE_` lifecycle methods have been replaced with their modern equivalents.

#### LibraryContainer.tsx

**Before:**
```typescript
UNSAFE_componentWillMount() {
    window.addEventListener("keydown", this.handleKeyDown);
}
```

**After:**
```typescript
componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
}
```

**Why?** `componentWillMount` was deprecated because it:
- Caused confusion about when side effects should happen
- Led to memory leaks in async scenarios
- Is incompatible with React's concurrent rendering

---

#### SearchBar.tsx

**Before:**
```typescript
UNSAFE_componentWillReceiveProps(newProps: SearchBarProps) {
    let oldCategoryData = this.categoryData;
    this.categoryData = {};
    
    _.each(newProps.categories, function (name: string) {
        this.categoryData[name] = oldCategoryData[name]
            ? oldCategoryData[name]
            : new CategoryData(name, "CategoryCheckbox");
    }.bind(this));
}
```

**After:**
```typescript
componentDidUpdate(prevProps: SearchBarProps) {
    if (prevProps.categories !== this.props.categories) {
        let oldCategoryData = this.categoryData;
        this.categoryData = {};
        
        _.each(this.props.categories, function (name: string) {
            this.categoryData[name] = oldCategoryData[name]
                ? oldCategoryData[name]
                : new CategoryData(name, "CategoryCheckbox");
        }.bind(this));
    }
}
```

**Why?**
- `componentDidUpdate` runs after the DOM has updated
- Allows proper comparison with previous props
- More predictable behavior
- **Important:** Always check if props actually changed to avoid infinite loops!

---

#### LibraryItem.tsx

**Before:**
```typescript
UNSAFE_componentWillReceiveProps(nextProps: LibraryItemProps) {
    if (nextProps.data.expanded !== this.state.expanded && 
        this.props.libraryContainer.state.shouldOverrideExpandedState) {
        this.setState({ expanded: nextProps.data.expanded });
    }
}
```

**After:**
```typescript
componentDidUpdate(prevProps: LibraryItemProps) {
    if (prevProps.data.expanded !== this.props.data.expanded && 
        this.props.libraryContainer.state.shouldOverrideExpandedState) {
        this.setState({ expanded: this.props.data.expanded });
    }
}
```

**Why?** Same reasons as SearchBar, but note:
- Compare with `prevProps` instead of `nextProps`
- Check current props (`this.props`) against previous props (`prevProps`)

---

### 3. findDOMNode Type Safety

React's `findDOMNode` returns `Element | Text | null`, but we often need `Element` for methods like `getBoundingClientRect()` or `scrollIntoView()`.

**Before:**
```typescript
let rec = ReactDOM.findDOMNode(this).getBoundingClientRect();
// ❌ TypeScript error: Property 'getBoundingClientRect' does not exist on type 'Element | Text'
```

**After:**
```typescript
let domNode = ReactDOM.findDOMNode(this);
if (domNode instanceof Element) {
    let rec = domNode.getBoundingClientRect();
    // ✅ TypeScript knows this is an Element
}
```

**Pattern to Follow:**
```typescript
// Always use type guards when using findDOMNode
const domNode = ReactDOM.findDOMNode(component);
if (domNode instanceof Element) {
    // Safe to use Element methods here
    domNode.getBoundingClientRect();
    domNode.scrollIntoView();
    domNode.querySelector('.something');
}
```

---

### 4. Enzyme Adapter Update

**Before:**
```typescript
import * as Adapter from 'enzyme-adapter-react-16';
configure({adapter: new Adapter()});
```

**After:**
```typescript
import Adapter from '@cfaester/enzyme-adapter-react-18';
configure({adapter: new Adapter()});
```

**Note:** This is a default export, not a namespace export.

---

### 5. TypeScript Configuration

**Before:**
```json
{
  "target": "es5",
  "lib": ["es2015", "dom"]
}
```

**After:**
```json
{
  "target": "es2018",
  "lib": ["es2020", "dom"],
  "esModuleInterop": true,
  "skipLibCheck": true
}
```

**Benefits:**
- Modern JavaScript features (async/await, optional chaining, etc.)
- Better module interoperability
- Faster type checking

---

## Breaking Changes

### None!

All changes are backward compatible. The API remains the same from the consumer's perspective.

### Internal Changes Only:
- Lifecycle method implementations
- Type guard additions
- Test adapter updates

---

## New React 18 Features Available

Now that we're on React 18, we can leverage:

### 1. Automatic Batching
```typescript
// React 18 automatically batches these setState calls
handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ flag: true });
    // Only one re-render! (In React 16, this would be 2)
};
```

### 2. useTransition (for future hooks migration)
```typescript
const [isPending, startTransition] = useTransition();

startTransition(() => {
    // Mark expensive updates as non-urgent
    setSearchResults(hugeDataSet);
});
```

### 3. useDeferredValue
```typescript
const deferredSearchText = useDeferredValue(searchText);
// UI stays responsive while expensive renders happen
```

---

## Development Guidelines

### When Adding New Lifecycle Methods

❌ **DON'T USE:**
- `UNSAFE_componentWillMount`
- `UNSAFE_componentWillReceiveProps`
- `UNSAFE_componentWillUpdate`
- `componentWillMount`
- `componentWillReceiveProps`
- `componentWillUpdate`

✅ **DO USE:**
- `componentDidMount` - for setup after first render
- `componentDidUpdate` - for responding to prop/state changes
- `componentWillUnmount` - for cleanup

### When Using findDOMNode

❌ **BAD:**
```typescript
ReactDOM.findDOMNode(this).scrollIntoView(); // Type error!
```

✅ **GOOD:**
```typescript
const node = ReactDOM.findDOMNode(this);
if (node instanceof Element) {
    node.scrollIntoView();
}
```

⭐ **BEST (for future):**
```typescript
// Use refs instead!
private myRef = React.createRef<HTMLDivElement>();

render() {
    return <div ref={this.myRef}>...</div>;
}

someMethod() {
    this.myRef.current?.scrollIntoView();
}
```

### When Updating Props/State in componentDidUpdate

❌ **INFINITE LOOP:**
```typescript
componentDidUpdate() {
    this.setState({ ... }); // Will cause infinite loop!
}
```

✅ **CORRECT:**
```typescript
componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
        // Only update if props actually changed
        this.setState({ ... });
    }
}
```

---

## Testing Changes

### Running Tests

No changes to test commands:
```bash
npm test          # Run all tests
npm run utiltest  # Run utility tests
```

### Writing New Tests (Phase 3 — React Testing Library)

Use React Testing Library (RTL) for all new component tests:
```typescript
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('my text')).toBeInTheDocument();
});

it('should respond to click', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('clicked!')).toBeInTheDocument();
});
```

---

## Migration Checklist for New Code

When adding new components or modifying existing ones:

- [ ] Use functional components with hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
- [ ] Use `useRef<HTMLDivElement>(null)` instead of `ReactDOM.findDOMNode`
- [ ] Clean up event listeners in `useEffect` return function
- [ ] Use proper TypeScript types (avoid `any`)
- [ ] Write tests with React Testing Library (not Enzyme)

---

## Troubleshooting

### Issue: "Cannot read property 'scrollIntoView' of undefined"

**Cause:** `findDOMNode` returned `null` or a `Text` node

**Solution:**
```typescript
const node = ReactDOM.findDOMNode(this);
if (node instanceof Element) {
    node.scrollIntoView();
}
```

---

### Issue: "setState called in componentDidUpdate causes infinite loop"

**Cause:** Missing prop comparison in `componentDidUpdate`

**Solution:**
```typescript
componentDidUpdate(prevProps) {
    // Always check if props changed!
    if (prevProps.someValue !== this.props.someValue) {
        this.setState({ ... });
    }
}
```

---

### Issue: "Test fails with 'Adapter is not a constructor'"

**Cause:** Using namespace import instead of default import

**Solution:**
```typescript
// ❌ Wrong
import * as Adapter from '@cfaester/enzyme-adapter-react-18';

// ✅ Correct
import Adapter from '@cfaester/enzyme-adapter-react-18';
```

---

### Issue: Build warnings about React 18 in development

**Expected Behavior:** React 18 may show warnings about:
- Legacy context API usage
- Deprecated features

**Action:** These are informational. We'll address them in future phases.

---

## Performance Considerations

### React 18 is Faster

React 18's concurrent rendering and automatic batching mean better performance out of the box.

### Monitor These Areas

1. **Large Lists** - Consider virtualization
2. **Search Results** - May benefit from `useTransition` in future
3. **Frequent Updates** - Automatic batching helps

---

## Phase 2 Changes: Hooks Migration (COMPLETE ✅)

All class components have been converted to functional components. For reference, this is what happened:

```typescript
// Before (Class — Phase 1)
class SearchBar extends React.Component {
    state = { query: '' };
    
    componentDidMount() {
        // setup
    }
    
    render() { ... }
}

// After (Hooks — Phase 2)
function SearchBar() {
    const [query, setQuery] = useState('');
    
    useEffect(() => {
        // setup
    }, []);
    
    return ...;
}
```

---

## Phase 3 Changes: React Testing Library Migration (COMPLETE ✅)

### Overview

All tests have been migrated from Enzyme to React Testing Library (RTL).

### Key Differences

#### Rendering
```typescript
// Before (Enzyme)
import { mount, shallow, configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
configure({ adapter: new Adapter() });

const wrapper = mount(<MyComponent />);
const shallowWrapper = shallow(<MyComponent />);

// After (RTL)
import { render } from '@testing-library/react';

const { container } = render(<MyComponent />);
```

#### Querying Elements
```typescript
// Before (Enzyme)
const header = wrapper.find('div.LibraryItemHeader').at(0);
const searchBar = wrapper.find('SearchBar');
const input = wrapper.find('input.SearchInputText');

// After (RTL)
const header = container.querySelector('.LibraryItemHeader');
const input = screen.getByRole('textbox');
const text = screen.getByText('Parent');
```

#### Firing Events
```typescript
// Before (Enzyme)
header.simulate('click');
input.simulate('change', { target: { value: 'query' } });

// After (RTL)
fireEvent.click(header);
fireEvent.change(input, { target: { value: 'query' } });
```

#### State / Component Instance Assertions
```typescript
// Before (Enzyme) — NOT POSSIBLE WITH FUNCTIONAL COMPONENTS
expect(wrapper.state('expanded')).to.be.true;
expect(wrapper.instance().someMethod).toBeCalled();

// After (RTL) — test DOM behavior instead
expect(container.querySelector('.LibraryItemContainerNone')).toHaveClass('expanded');
```

#### Async Assertions
```typescript
// Before (Enzyme) — unreliable setTimeout approach
setTimeout(() => {
    expect(wrapper.find('SearchResultItem')).to.have.lengthOf(2);
}, 500);

// After (RTL) — reliable waitFor
await waitFor(() => {
    expect(screen.queryByText('Child1')).toBeInTheDocument();
}, { timeout: 1000 });
```

#### Snapshots
```typescript
// Before (Enzyme + enzyme-to-json)
import toJson from 'enzyme-to-json';
const wrapper = mount(<MyComponent />);
expect(toJson(wrapper)).toMatchSnapshot();

// After (RTL)
const { container } = render(<MyComponent />);
expect(container).toMatchSnapshot();
```

### New Testing Patterns

#### Testing with LibraryContainerHandle Mock
When testing `LibraryItem` in isolation (without a full library container):
```typescript
import type { LibraryContainerHandle } from '../src/components/LibraryContainer';
import { HostingContextType } from '../src/SharedTypes';

const mockHandle: LibraryContainerHandle = {
    get state() {
        return {
            inSearchMode: false,
            searchText: '',
            selectedCategories: [],
            structured: false,
            detailed: false,
            showItemSummary: false,
            tooltipContent: { create: '', action: '', query: '' },
            hostingContext: HostingContextType.none,
            shouldOverrideExpandedState: true,
        };
    },
    selectionIndex: 0,
    props: { libraryController: libController },
    setSelection: jest.fn(),
    raiseEvent: jest.fn(),
    scrollToExpandedItem: jest.fn(),
    getContainerElement: jest.fn().mockReturnValue(null),
    setShouldOverrideExpandedState: jest.fn(),
};

render(<LibraryItem libraryContainer={mockHandle} data={data} showItemSummary={false} />);
```

#### Triggering Library Updates (act)
When the library controller triggers state updates:
```typescript
act(() => {
    libController.setLoadedTypesJson(loadedTypesJson, false);
    libController.setLayoutSpecsJson(layoutSpecsJson, false);
    libController.refreshLibraryView();
});
```

### Troubleshooting RTL Tests

**Issue:** `screen.getByText` throws "Unable to find an element"
**Solution:** Check the exact text content. Use `screen.debug()` to print the DOM.

**Issue:** `waitFor` times out on search tests
**Solution:** The search has a 300 ms debounce. Use `timeout: 1000` in `waitFor`.

**Issue:** Snapshot tests fail after changes
**Solution:** Run `npm test -- --updateSnapshot` to regenerate.

---

## Resources

- [React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [React Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [React Hooks Documentation](https://react.dev/reference/react)
- [React Lifecycle Methods Diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
- [React 18 Working Group Discussions](https://github.com/reactwg/react-18/discussions)

---

## Questions?

If you encounter issues not covered in this guide:

1. Check the [TECH_DEBT_ANALYSIS.md](./TECH_DEBT_ANALYSIS.md) for detailed technical debt inventory
2. Review the PR descriptions for implementation details (Phases 1, 2, 3)
3. Consult the React 18 official documentation

---

**Document Version:** 1.2  
**Last Updated:** 2026-04-01  
**Applies To:** librarie.js v1.0.8+
