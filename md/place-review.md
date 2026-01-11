# Place Feature Review

## Overview
The place feature provides detailed information about a selected location, including its type, address, coordinates, and actions like saving or getting directions. It acts as a central hub for location-based actions.

## Architecture

### Context: PlaceContext
**Location**: `frontend/src/context/PlaceContext.jsx`

#### State Management
- **selectedPlace**: Currently active place object
- **placeCache**: Dictionary of all places accessed in current session

#### Key Features
1. **ID Generation**
   - Creates deterministic IDs from coordinates: `{lat}_{lon}`
   - Replaces decimal points with hyphens for URL safety
   - Fixed precision: 6 decimal places (~11cm accuracy)
   - Format example: `45-501700_-73-567300`

2. **ID Parsing**
   - Reverse function `parsePlaceId()` extracts coordinates from ID
   - Enables deep linking to any coordinate pair
   - Fallback for places not in cache

3. **Place Caching**
   - Stores place metadata in memory during session
   - Prevents data loss during navigation
   - Enables fast lookups by ID
   - Survives route changes

4. **Type Safety**
   - Ensures coordinates are numbers (handles string inputs)
   - Prevents NaN errors in calculations

#### Data Model
```javascript
{
  id: string,              // Generated from coordinates
  name: string,            // Display name
  latitude: number,        // Decimal degrees
  longitude: number,       // Decimal degrees
  
  // Optional address components
  address: string,
  street: string,
  city: string,
  district: string,
  postcode: string,
  housenumber: string,
  
  // OSM metadata
  osmKey: string,          // e.g., "amenity"
  osmValue: string,        // e.g., "restaurant"
  
  // Source tracking
  type: "search" | "saved" | "location"
}
```

#### API
```javascript
{
  selectedPlace,           // Signal
  selectPlace,            // (place) => id
  clearPlace,             // () => void
  getPlaceById,           // (id) => place | null
  generatePlaceId         // (lat, lon) => id
}
```

## Components

### PlaceDetail
**Location**: `frontend/src/component/place/PlaceDetail.jsx`

#### Features
1. **Smart Icon System**
   - Maps OSM tags to appropriate icons (50+ categories)
   - Hierarchical matching: specific → generic → fallback
   - Color-coded by category
   - Extensive coverage of POI types

2. **Category Mappings**
   - **Amenities**: Restaurants, cafes, schools, hospitals, banks
   - **Shops**: Supermarkets, malls, clothing stores
   - **Transport**: Train/metro/bus stations
   - **Leisure**: Parks, museums, attractions
   - **Buildings**: Residential, commercial, offices
   - **Generic fallbacks** for unknown types

3. **Information Display**
   - **Header**: Icon, name, and address
   - **Type Badge**: Categorized POI type with color
   - **Location**: District and city
   - **Coordinates**: 5 decimal places precision
   - **Postcode**: If available

4. **Visual Hierarchy**
   - Large, clear place name
   - Secondary information in muted colors
   - Icon with background for brand recognition
   - Badge system for quick identification

5. **Responsive Design**
   - Handles missing data gracefully
   - Truncates long text
   - Adapts to different place types

### Place Page
**Location**: `frontend/src/pages/Place.jsx`

#### Features
1. **Data Loading**
   - Attempts to load from cache first
   - Falls back to coordinate parsing from URL
   - Creates minimal place object if needed

2. **Map Integration**
   - Centers map on place load
   - Adds marker automatically
   - Runs on mount

3. **Action Buttons**
   - **Get Directions**: Navigate to directions with pre-filled destination
   - **Save Location**: Open modal to save with custom name

4. **Error Handling**
   - "Place not found" fallback
   - Handles invalid IDs gracefully

### ItineraryButton
**Location**: `frontend/src/component/itinerary/ItineraryButton.jsx`

#### Features
- Primary action button
- Route icon with "Get Directions" text
- Blue accent color (call-to-action)
- Navigates to directions page with place as destination

### SaveLocationButton
**Location**: `frontend/src/component/place/SaveLocationButton.jsx`

#### Features
- Secondary action button
- Bookmark icon with state changes
- Modal for custom name entry
- Duplicate detection (within 11m radius)
- Loading and saved states
- (See location-review.md for full details)

## Icon Mapping System

### Hierarchy
1. **Specific Match**: `{key}:{value}` (e.g., `amenity:restaurant`)
2. **Generic Match**: `{key}` only (e.g., `amenity`)
3. **Fallback**: Default map pin

### Example Mappings
```javascript
"amenity:restaurant" → Utensils icon, orange
"amenity:cafe" → Coffee icon, amber
"shop:supermarket" → ShoppingBag icon, green
"railway:station" → Train icon, orange
"leisure:park" → TreePine icon, green
```

### Color Coding
- **Blue**: Transport, generic amenities
- **Orange**: Food, rail stations
- **Green**: Parks, health, nature
- **Red**: Emergency services
- **Purple**: Entertainment, religious
- **Amber**: Culture, education
- **Gray**: Buildings, infrastructure

## Data Flow

### Search → Place
```
User selects from search results
    ↓
SearchContext.selectLocation()
    ↓
PlaceContext.selectPlace()
    ↓
Generate place ID from coordinates
    ↓
Cache place data
    ↓
Navigate to /place/:id
    ↓
Place page loads
    ↓
Map centers and adds marker
    ↓
PlaceDetail renders with cached data
```

### Saved Location → Place
```
User clicks saved location
    ↓
PlaceContext.selectPlace()
    ↓
Navigate to /place/:id
    ↓
Place page loads from cache
    ↓
PlaceDetail renders
```

### Direct URL Access
```
User visits /place/:id directly
    ↓
Place page attempts cache lookup
    ↓
If not cached, parse ID to coordinates
    ↓
Create minimal place object
    ↓
Map centers on coordinates
    ↓
PlaceDetail renders with available data
```

## Integration Points

### With Search
- Search results create place objects
- Full metadata preserved
- Seamless navigation

### With Map
- Auto-centers on place
- Adds marker at location
- Visual confirmation

### With Locations
- Save button on detail page
- Saved locations reopenable
- Consistent data model

### With Directions
- Place can be set as destination
- Pre-fills destination field
- Passes full place metadata

## Strengths

1. **URL Design**
   - Deterministic IDs enable deep linking
   - Share exact coordinates via URL
   - Bookmarkable places

2. **Data Persistence**
   - Cache survives navigation
   - No data loss during session
   - Fast re-access

3. **Icon System**
   - Comprehensive POI coverage
   - Clear visual communication
   - Color-coded categories

4. **Graceful Degradation**
   - Works with minimal data
   - Handles missing fields
   - Fallback for unknown types

5. **Type Flexibility**
   - Handles saved, searched, and direct locations
   - Unified interface
   - Extensible data model

## Potential Improvements

1. **Data Enhancement**
   - Fetch additional details from OSM API
   - Show opening hours
   - Display phone numbers/websites
   - Show photos from external sources
   - Reviews/ratings integration

2. **Icon System**
   - Add more specific icons
   - Use brand icons for chains
   - Dynamic icon loading
   - Custom user icons

3. **Information Display**
   - Show distance from user
   - Nearby places
   - Alternative names
   - Wikipedia links
   - Historical data

4. **Persistence**
   - Save cache to localStorage
   - Persist across sessions
   - Recent places list
   - Place history

5. **Sharing**
   - Copy link button
   - Share to social media
   - Generate QR code
   - Export to different formats

6. **Accessibility**
   - Better ARIA labels
   - Screen reader descriptions
   - Keyboard shortcuts
   - Focus management

7. **Mobile**
   - Bottom sheet design
   - Swipe gestures
   - Native share API
   - Call/navigate external apps

8. **Actions**
   - Multiple photos
   - Street view integration
   - Report incorrect info
   - Add notes
   - Set reminders

## Edge Cases Handled

1. **Missing Data**
   - No address: Shows coordinates only
   - No OSM tags: Uses generic icon
   - No name: Shows "Selected Location"

2. **Invalid IDs**
   - Non-parseable ID: Returns null
   - Invalid coordinates: Handled by parser

3. **Coordinate Precision**
   - Fixed 6 decimals prevents floating point issues
   - Consistent ID generation

4. **Type Coercion**
   - Converts string coordinates to numbers
   - Prevents calculation errors

## Performance Considerations

- **Memory**: Cache grows unbounded in session
  - Consider LRU eviction for long sessions
  - Typical usage unlikely to cause issues

- **Rendering**: Minimal re-renders with signals
  - Only selectedPlace changes trigger updates
  - Cache updates don't affect UI

- **Icon Loading**: All icons imported statically
  - No dynamic imports needed
  - Bundle size consideration

## Security Considerations

1. **URL Safety**
   - IDs contain only numbers and separators
   - No injection risks
   - Safe for URLs

2. **Data Validation**
   - Coordinates bounds checking could be added
   - Name sanitization in SaveLocationButton

3. **XSS Prevention**
   - All user input escaped by framework
   - OSM data treated as untrusted

## Testing Considerations

1. **ID Generation**
   - Test coordinate precision
   - Verify URL safety
   - Test reverse parsing

2. **Cache Management**
   - Test retrieval by ID
   - Test missing entries
   - Test cache growth

3. **Icon Mapping**
   - Test all OSM tag combinations
   - Verify fallbacks
   - Test color assignments

4. **Navigation**
   - Direct URL access
   - Navigation from search
   - Navigation from saved locations

5. **Data Handling**
   - Missing fields
   - Invalid coordinates
   - Unknown POI types

6. **Integration**
   - Save location flow
   - Get directions flow
   - Map centering
