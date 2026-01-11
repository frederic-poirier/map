# Search Feature Review

## Overview
The search feature enables users to find places by name using Photon geocoding API. It provides real-time search results with keyboard navigation, distance calculations, and integration with saved locations.

## Architecture

### Context: SearchContext
**Location**: `frontend/src/context/SearchContext.jsx`

#### State Management
- **query**: Current search query string
- **selectedIndex**: Currently highlighted result (for keyboard navigation)
- **isSearchFocused**: Focus state of the search input
- **results**: Resource containing search results from backend API

#### Key Features
1. **URL Synchronization**
   - Query is synced to URL parameter `?q=`
   - Enables deep linking and sharing search results
   - Uses debouncing (0ms currently) to prevent excessive updates

2. **Debounced Search**
   - Minimum query length: 3 characters
   - Fetches from `/api/search` endpoint
   - Includes location bias based on current map center
   - `location_bias_scale=0.5` parameter for relevance tuning

3. **Result Selection**
   - Automatically navigates to place detail page
   - Updates map with marker at selected location
   - Creates place object with all metadata (OSM tags, address, etc.)

#### API
```javascript
{
  query, setQuery,
  results,
  isSearchMode,
  selectedIndex, setSelectedIndex,
  isSearchFocused, setIsSearchFocused,
  selectLocation,
  reset
}
```

## Components

### SearchInput
**Location**: `frontend/src/component/search/SearchInput.jsx`

#### Features
1. **Keyboard Navigation**
   - `ArrowDown/ArrowUp`: Navigate results
   - `Tab`: Auto-complete with selected or first result
   - `Enter`: Select highlighted result
   - `Escape`: Clear search or blur input

2. **Visual Feedback**
   - Search icon on left
   - Clear button (X) appears when query exists
   - Rounded, modern design with focus states

3. **Accessibility**
   - Proper focus management
   - Keyboard shortcuts
   - Clear visual hierarchy

### SearchResults
**Location**: `frontend/src/component/search/SearchResults.jsx`

#### Features
1. **Two-Section Display**
   - **Saved Places**: Matches from user's saved locations
   - **Search Results**: Geocoded results from API
   - Clear visual separation with section headers

2. **Rich Result Information**
   - Place name (primary)
   - Street address (secondary)
   - Distance from map center
   - Directional arrow indicating bearing
   - Smooth staggered animations on render

3. **Distance Calculation**
   - Uses `useCoordinates` utility
   - Real-time updates based on map center
   - Haversine formula for accuracy

4. **Interaction**
   - Hover effects with background highlight
   - Click to select and navigate to place page
   - Selected state highlighting

5. **Empty States**
   - "No results found" with reset button
   - Helpful messaging for user guidance

6. **Keyboard Shortcuts Hint**
   - Shows available keyboard commands
   - `↑↓` for navigation
   - `tab` for completion
   - `↵` for selection

## Data Flow

```
User Input
    ↓
SearchInput (setQuery)
    ↓
SearchContext (syncs to URL, debounces)
    ↓
createResource fetches from API
    ↓
SearchResults displays results
    ↓
User Selects
    ↓
PlaceContext stores place data
    ↓
Navigate to /place/:id
```

## Integration Points

### With Map
- Uses `mapCenter` for location biasing
- Calls `flyTo()` on selection
- Calls `addMarker()` to show selected location

### With Places
- Creates place object with full metadata
- Calls `selectPlace()` which returns place ID
- Navigates to place detail page

### With Locations
- Filters saved locations by query
- Shows saved matches in separate section
- Visual distinction with bookmark icon

## API Contract

### Search Endpoint
```
GET /api/search?q={query}&lon={lon}&lat={lat}&location_bias_scale={scale}
```

**Response Format**:
```json
{
  "features": [
    {
      "geometry": {
        "coordinates": [lon, lat]
      },
      "properties": {
        "name": "Place Name",
        "street": "Street Address",
        "city": "City",
        "district": "District",
        "postcode": "Postal Code",
        "housenumber": "123",
        "osm_key": "amenity",
        "osm_value": "restaurant"
      }
    }
  ]
}
```

## Strengths

1. **User Experience**
   - Fast, responsive search with minimal delay
   - Keyboard navigation for power users
   - Clear visual feedback and animations
   - Distance and direction indicators

2. **Integration**
   - Seamless integration with saved locations
   - Smooth navigation to place details
   - Map updates automatically

3. **Performance**
   - Resource-based fetching (built-in caching)
   - URL parameter debouncing
   - Efficient re-renders with Solid.js

## Potential Improvements

1. **Search Quality**
   - Consider adjusting `location_bias_scale` based on zoom level
   - Add search history
   - Implement recent searches

2. **Debouncing**
   - Current `DEBOUNCE_DELAY = 0` might cause excessive API calls
   - Consider 200-300ms for better balance

3. **Results Display**
   - Add category icons based on OSM tags
   - Show opening hours if available
   - Display ratings if integrated with POI database

4. **Keyboard Navigation**
   - Add keyboard shortcut to focus search (currently in Home page only)
   - Consider vim-style navigation (j/k)

5. **Mobile Experience**
   - Optimize touch targets
   - Consider slide-up panel for results on mobile

6. **Error Handling**
   - Show error state if API fails
   - Retry mechanism for failed requests
   - Offline detection

## Performance Considerations

- **Resource Management**: Using SolidJS `createResource` provides automatic caching
- **Animation Performance**: Staggered animations use CSS with calculated delays
- **Re-render Optimization**: Signals ensure minimal re-renders

## Testing Considerations

1. Test keyboard navigation thoroughly
2. Test with empty/no results
3. Test with very long place names
4. Test saved location filtering
5. Test distance calculations at various map positions
6. Test URL synchronization
7. Test navigation flow
