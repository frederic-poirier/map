# Directions/Itinerary Feature Review

## Overview
The directions feature provides comprehensive transit routing using OpenTripPlanner (OTP). It supports multi-modal transportation (walking, bus, metro, rail) with detailed turn-by-turn instructions, time estimates, and route visualization.

## Architecture

### Context: ItineraryContext
**Location**: `frontend/src/context/ItineraryContext.jsx`

#### State Management
- **origin**: Starting point place object
- **destination**: Ending point place object
- **itinerary**: Array of route options from OTP
- **isLoading**: Planning operation in progress
- **error**: Error message from failed planning

#### Key Features
1. **Trip Planning**
   - Sends origin/destination coordinates to OTP API
   - Supports optional time/date parameters
   - Configurable number of itineraries (default: 5)
   - Validates coordinates (handles string/number types)

2. **State Management**
   - Clears itinerary when origin/destination changes
   - Automatic error state management
   - Loading state during API calls

3. **Swap Functionality**
   - One-click origin/destination swap
   - Preserves all place metadata
   - Clears previous itinerary

4. **Error Handling**
   - "No routes found" for impossible trips
   - Network error handling
   - User-friendly error messages

#### API
```javascript
{
  // State
  origin,
  destination,
  itinerary,
  isLoading,
  error,
  
  // Actions
  setOriginPlace,
  setDestinationPlace,
  swapOriginDestination,
  clearItinerary,
  planTrip,
  setItinerary,  // Direct setter
  setIsLoading,  // Direct setter
  setError       // Direct setter
}
```

## Components

### DirectionsForm
**Location**: `frontend/src/component/directions/DirectionsForm.jsx`

#### Features
1. **Dual Input System**
   - **Origin Input**: Green indicator, "Current Location" option
   - **Destination Input**: Red indicator
   - Both support search and saved locations
   - Visual color coding for clarity

2. **Search Integration**
   - Debounced search (300ms)
   - Minimum 2 characters to trigger
   - Fetches from `/api/search` endpoint
   - Real-time results dropdown

3. **Saved Locations Integration**
   - Shows saved locations in dropdowns
   - Displays all when field is empty/short query
   - Filters by query when typing
   - Distinct bookmark icon

4. **Geolocation**
   - "Use my location" button for origin
   - Uses navigator.geolocation API
   - High accuracy mode enabled
   - 10 second timeout
   - Loading spinner during location fetch

5. **Swap Button**
   - Centered between inputs
   - Arrow up-down icon
   - Swaps origin and destination
   - Updates input fields

6. **Dropdown Results**
   - Absolute positioning below inputs
   - Sections: "Saved" and "Results"
   - Hover effects
   - Click to select
   - Blur timeout to allow clicks (200ms)

7. **Clear Functionality**
   - X button appears when input has value
   - Clears selection and results
   - Maintains focus on input

8. **Plan Trip Button**
   - Disabled until both fields filled
   - Shows loading spinner during planning
   - Blue accent color
   - "Get Directions" text

9. **Validation**
   - Prevents planning without both locations
   - Visual disabled state
   - Clear error messaging

#### User Experience
- Input fields auto-populate from context
- Dropdown stays open during interaction
- Keyboard accessible
- Mobile-friendly touch targets
- Clear visual hierarchy

### ItineraryList
**Location**: `frontend/src/component/directions/ItineraryList.jsx`

#### Features
1. **Multiple Route Options**
   - Shows all returned itineraries
   - Default: 5 options
   - Count displayed in header
   - Selectable via click

2. **Summary Cards**
   - **Duration**: Total trip time
   - **Time Range**: Start and end times
   - **Transit Icons**: Visual mode summary
   - **Route Numbers**: Bus/train line numbers
   - **Walking Distance**: For walk segments

3. **Selected Route**
   - Border highlight (accent color)
   - Background tint
   - Expanded leg details
   - Automatically displays on map

4. **Route Visualization**
   - Transit mode icons (walk, bus, metro, train)
   - Color-coded by mode
   - Route number badges
   - Walking distance display
   - Sequential flow with separators

5. **Detailed Leg Information**
   - **Timeline**: Vertical line connecting segments
   - **Timeline Dots**: Start/end markers
   - **Departure Time**: For each leg
   - **Location Names**: Stations and stops
   - **Mode Details**: Type, route number, destination
   - **Intermediate Stops**: Expandable stop list

6. **Stop Expansion**
   - Click to show/hide intermediate stops
   - Chevron indicates state
   - Smooth transitions
   - Stop-propagation to prevent route selection

7. **Color System**
   - **Walk**: Gray, dashed line
   - **Bus**: Blue
   - **Metro**: Orange
   - **Rail/Tram**: Green
   - Custom colors from OTP if provided

8. **Time Formatting**
   - Duration: "X min" or "Xh Ym"
   - Time: 12-hour format with AM/PM
   - Distance: Meters or kilometers

9. **Map Integration**
   - Selecting itinerary updates map
   - Calls `displayRoute()` from MapContext
   - Automatic on first load

### Directions Page
**Location**: `frontend/src/pages/Directions.jsx`

#### Features
1. **URL Parameter Handling**
   - Supports `?to=` parameter
   - Pre-fills destination from URL
   - Enables deep linking to directions
   - Centers map on destination

2. **Place Resolution**
   - Tries cache first
   - Falls back to coordinate parsing
   - Creates place object if needed

3. **State Display**
   - Error message box (red background)
   - Loading spinner during planning
   - Empty state message
   - Itinerary list when routes found

4. **Navigation**
   - Back button clears itinerary
   - Returns to previous page
   - Clean state management

## Data Flow

### Planning Flow
```
User fills origin/destination
    ↓
DirectionsForm validates
    ↓
Click "Get Directions"
    ↓
ItineraryContext.planTrip()
    ↓
POST /api/otp/plan with coordinates, options
    ↓
OpenTripPlanner calculates routes
    ↓
Backend returns itineraries
    ↓
ItineraryList displays options
    ↓
User selects route
    ↓
MapContext.displayRoute()
    ↓
Map shows route with markers and polylines
```

### Swap Flow
```
User clicks swap button
    ↓
DirectionsForm.handleSwap()
    ↓
ItineraryContext.swapOriginDestination()
    ↓
Input queries swap
    ↓
Previous itinerary cleared
    ↓
User can plan new route
```

### Geolocation Flow
```
User clicks "Use my location"
    ↓
navigator.geolocation.getCurrentPosition()
    ↓
Loading spinner shown
    ↓
Position acquired
    ↓
Create place with "Current Location"
    ↓
Set as origin
    ↓
Update input field
    ↓
Close dropdown
```

## Integration Points

### With Map
- Route polylines drawn on map
- Color-coded by transit mode
- Origin marker (green)
- Destination marker (red)
- Automatic bounds fitting
- Custom line styling

### With Search
- Reuses search API endpoint
- Same result format
- Consistent UX
- Shared place model

### With Locations
- Saved locations in dropdowns
- Quick selection
- Common trip shortcuts
- Unified data access

### With Places
- Places passed as origin/destination
- Full metadata preserved
- URL integration via place IDs
- Deep linking support

## API Contract

### Plan Trip Endpoint
```
POST /api/otp/plan
Content-Type: application/json
Credentials: include

Body:
{
  "from": { "lat": 45.5017, "lon": -73.5673 },
  "to": { "lat": 45.5085, "lon": -73.5535 },
  "time": "10:30",          // Optional
  "date": "2024-01-15",     // Optional
  "numItineraries": 5       // Optional
}
```

### Response Format
```json
{
  "itineraries": [
    {
      "duration": 1200,           // seconds
      "startTime": 1705329000000, // timestamp
      "endTime": 1705329200000,   // timestamp
      "walkDistance": 500.5,      // meters
      "legs": [
        {
          "mode": "WALK" | "BUS" | "SUBWAY" | "RAIL" | "TRAM",
          "startTime": 1705329000000,
          "endTime": 1705329200000,
          "duration": 200,
          "distance": 150.5,
          "from": {
            "name": "Origin",
            "lat": 45.5017,
            "lon": -73.5673
          },
          "to": {
            "name": "Destination", 
            "lat": 45.5018,
            "lon": -73.5675
          },
          "legGeometry": {
            "points": "encodedPolyline"  // Google Polyline format
          },
          "route": {              // For transit legs
            "shortName": "24",
            "color": "00985F"     // Hex color without #
          },
          "intermediateStops": [  // For transit legs
            { "name": "Stop 1" },
            { "name": "Stop 2" }
          ]
        }
      ]
    }
  ]
}
```

## Strengths

1. **Comprehensive Transit Support**
   - Multi-modal routing
   - Real transit schedules
   - Accurate time estimates
   - Walking segments

2. **User Experience**
   - Multiple route options
   - Clear visual hierarchy
   - Color-coded modes
   - Expandable details

3. **Visual Clarity**
   - Timeline visualization
   - Mode icons
   - Route badges
   - Distance information

4. **Flexibility**
   - Swap functionality
   - Current location support
   - Saved location integration
   - URL parameters

5. **Error Handling**
   - Clear error messages
   - Validation feedback
   - Loading states
   - Empty states

## Potential Improvements

1. **Route Preferences**
   - Minimize walking
   - Prefer specific modes (bus only, metro only)
   - Wheelchair accessible routes
   - Fastest vs. fewest transfers

2. **Time Options**
   - Depart at / Arrive by toggle
   - Date/time picker in UI
   - "Leave now" quick option
   - Recurring trip planning

3. **Alternative Routes**
   - Show more than 5 options
   - Real-time updates
   - Compare routes side-by-side
   - Save favorite routes

4. **Detail Enhancements**
   - Step-by-step walking directions
   - Fare information
   - Real-time delays
   - Crowding information
   - Accessibility info per leg

5. **Map Integration**
   - Show alternate routes on map
   - Toggle route visibility
   - 3D route preview
   - Street view for walking segments

6. **Mobile Optimization**
   - Bottom sheet design
   - Swipe between routes
   - Larger touch targets
   - Turn-by-turn navigation mode

7. **Sharing & Export**
   - Share route via link
   - Add to calendar
   - SMS directions
   - Print-friendly view

8. **Smart Features**
   - Suggest next trip based on time
   - Learn preferences
   - Notify of delays
   - Alternative if route unavailable

9. **Bookmarking**
   - Save frequent routes
   - Name routes (e.g., "Home to Work")
   - Quick access to saved routes

10. **Performance**
    - Cache recent routes
    - Prefetch likely routes
    - Background route updates

## Edge Cases Handled

1. **No Routes Found**
   - Clear error message
   - Suggests adjusting locations

2. **API Failure**
   - Network error handling
   - User-friendly message
   - No app crash

3. **Missing Data**
   - Handles routes without colors
   - Default colors by mode
   - Missing stop names

4. **Long Route Names**
   - Text truncation
   - Tooltip on hover (could add)

5. **Many Stops**
   - Expandable list
   - Prevents UI overflow
   - Smooth scroll

## Performance Considerations

- **Polyline Decoding**: Efficient Google Polyline algorithm
- **Rendering**: Only selected route details shown
- **Map Updates**: Single route displayed at once
- **API Calls**: Only on user action, not automatic
- **State Management**: Minimal re-renders with signals

## Accessibility Considerations

1. **Keyboard Navigation**
   - All buttons keyboard accessible
   - Tab order logical
   - Enter to submit

2. **Screen Readers**
   - Semantic HTML
   - Time information readable
   - Mode announcements
   - ARIA labels needed

3. **Visual Design**
   - Color not sole indicator
   - Icons supplement color
   - Sufficient contrast
   - Clear focus states

4. **Mobile**
   - Large touch targets
   - No hover-only interactions
   - Pinch zoom support

## Testing Considerations

1. **Unit Tests**
   - Coordinate validation
   - Time formatting
   - Distance calculation
   - Swap functionality

2. **Integration Tests**
   - Search → select → plan flow
   - Saved location selection
   - Geolocation flow
   - Route selection → map update

3. **API Tests**
   - Valid trip planning
   - No routes scenario
   - Network failure
   - Invalid coordinates

4. **UI Tests**
   - Dropdown interactions
   - Stop expansion
   - Route selection
   - Error display

5. **Edge Cases**
   - Very short trips
   - Very long trips
   - Many transfers
   - Walking-only routes
   - Transit-only (no walk)

6. **User Flows**
   - Complete trip planning
   - URL parameter handling
   - Swap mid-planning
   - Clear and restart
