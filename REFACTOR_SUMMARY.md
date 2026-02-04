# Search Architecture Refactoring Summary

## Changes Made

### 1. Modified `useSearchPlace` Hook
**File:** `frontend/src/hooks/useSearchPlace.js`

**New API:**
```javascript
const search = useSearchPlace({ debounce: 300 });

// Returns:
{
  // Core signals
  query,              // Current input value
  setQuery,           // Setter (with built-in debounce)
  debouncedQuery,     // Debounced value for API calls
  bias,               // Map camera bias
  setBias,            // Setter for bias
  
  // Results
  results,            // Array of place objects
  refetch,            // Manual refetch function
  
  // State machine
  state,              // 'idle' | 'typing' | 'loading' | 'empty' | 'results'
  isIdle,             // Boolean helpers
  isTyping,
  isLoading,
  isEmpty,
  hasResults,
  
  // Actions
  clear               // Reset search
}
```

**Key Changes:**
- Added debouncing built-in (configurable)
- Added state machine with 5 clear states
- Added boolean helper functions
- Added `clear()` method
- Exposed `debouncedQuery` for transparency

### 2. Refactored `SearchPlaces` Components
**File:** `frontend/src/components/SearchPlaces.jsx`

**New API:**

#### `SearchPlaceInput` - Simplified
```jsx
<SearchPlaceInput
  value={search.query()}
  onInput={(e) => search.setQuery(e.target.value)}
  onClear={search.clear}
  placeholder="Search..."
  icon={true}
/>
```

#### `SearchPlaceResults` - Handles All States
```jsx
<SearchPlaceResults
  search={search}              // Pass the entire search instance
  onSelect={handleSelect}
  emptyTitle="No results"      // Customizable
  emptyText="Try again"
  idleTitle="Find your way"    // Customizable
  idleText="Search for places"
/>
```

**States Handled Automatically:**
1. **idle** - Shows placeholder message
2. **typing** - Shows "Keep typing..."
3. **loading** - Shows skeleton loaders
4. **empty** - Shows "No results" message
5. **results** - Shows the list

### 3. Updated `Home` Page
**File:** `frontend/src/pages/Home.jsx`

**Before:**
- Manual debouncing with `setTimeout`
- Manual `draft` signal management
- Manual state checking (`hasResults()`)
- Separate fallback handling

**After:**
- Clean, declarative API
- Just pass `search` to `SearchPlaceResults`
- Handles all states automatically

### 4. Updated `Direction` Page
**File:** `frontend/src/pages/Direction.jsx`

**Before:**
- Complex parent-child prop drilling
- Manual `createEffect` wiring
- Confusing result passing

**After:**
- Each field has its own `useSearchPlace` instance
- No manual wiring needed
- Clean separation of concerns

## Migration Guide

### For Simple Search (like Home)

**Before:**
```jsx
const [draft, setDraft] = createSignal("");
const search = useSearchPlace();

// Manual debouncing
let timeoutId;
function handleInput(e) {
  setDraft(e.target.value);
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    search.setQuery(draft());
  }, 300);
}

// Manual state checking
const hasResults = () => search.results()?.length > 0;

<Show when={hasResults()} fallback={<State ... />}>
  <SearchPlaceResults results={search.results} ... />
</Show>
```

**After:**
```jsx
const search = useSearchPlace({ debounce: 300 });

<SearchPlaceInput
  value={search.query()}
  onInput={(e) => search.setQuery(e.target.value)}
  onClear={search.clear}
/>

<SearchPlaceResults search={search} ... />
```

### For Multiple Searches (like Direction)

**Before:**
```jsx
const [result, setResult] = createSignal();

<DirectionSearch
  onResult={setResult}
  changeFocusState={setFocusSection}
/>

function DirectionSearch(props) {
  const search = useSearchPlace();
  createEffect(() => props.onResult(search.results));
  // ...
}

<Show when={focusSection()}>
  <SearchPlaceResults results={result()} ... />
</Show>
```

**After:**
```jsx
const fromSearch = useSearchPlace({ debounce: 300 });
const toSearch = useSearchPlace({ debounce: 300 });

<SearchPlaceInput
  value={fromSearch.query()}
  onInput={(e) => fromSearch.setQuery(e.target.value)}
/>

<Show when={activeField() === 'from'}>
  <SearchPlaceResults search={fromSearch} ... />
</Show>
```

## Benefits

1. **Clear States**: Always know if search is idle, typing, loading, empty, or has results
2. **No Manual Wiring**: Each search instance is self-contained
3. **Built-in Debouncing**: Just pass `debounce: 300` option
4. **Consistent API**: Works the same in Home, Direction, or any other page
5. **Simpler Components**: `SearchPlaceResults` handles all UI states internally
6. **Type Safety**: Easy to know what state you're in with boolean helpers

## File Changes

- ✅ `frontend/src/hooks/useSearchPlace.js` - Modified
- ✅ `frontend/src/components/SearchPlaces.jsx` - Refactored
- ✅ `frontend/src/pages/Home.jsx` - Updated
- ✅ `frontend/src/pages/Direction.jsx` - Updated

## Testing Checklist

- [ ] Type in search box - should debounce (300ms)
- [ ] Type less than 3 chars - should stay idle
- [ ] Type 3+ chars - should show loading, then results
- [ ] Clear search - should return to idle
- [ ] Search with no results - should show empty state
- [ ] Click result - should navigate to place
- [ ] Direction page - both fields work independently
- [ ] Direction page - switching fields shows correct results
