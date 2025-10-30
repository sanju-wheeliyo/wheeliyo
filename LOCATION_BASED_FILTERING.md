# Location-Based Car Filtering (Backend API)

This document explains how to use the location-based filtering feature in the `getLeads` API endpoint.

## Overview

The `getLeads` endpoint now supports **automatic location-based filtering** to show cars near the user's location. The system automatically fetches the user's location from their profile and sorts cars by distance (nearest first).

## 🚀 **Automatic Location Detection**

The system automatically detects user location in the following priority order:

1. **Manual coordinates** (if provided in API call)
2. **Manual city name** (if provided in API call)
3. **User profile coordinates** (stored from previous location updates)
4. **User profile city** (converted to coordinates)

## API Parameters

### Location Parameters (Optional - for manual override)

-   `user_latitude`: User's latitude coordinate (decimal degrees)
-   `user_longitude`: User's longitude coordinate (decimal degrees)
-   `user_city`: User's city name (used if coordinates not provided)
-   `max_distance_km`: Maximum distance in kilometers (default: 50km, max: 1000km)

## Usage Examples

### 1. **Automatic Location (Recommended)**

```javascript
// Get cars near user's saved location automatically
GET / api / leads
```

### 2. **Manual Override with Coordinates**

```javascript
// Override with specific coordinates
GET /api/leads?user_latitude=19.0760&user_longitude=72.8777&max_distance_km=25
```

### 3. **Manual Override with City**

```javascript
// Override with specific city
GET /api/leads?user_city=Delhi&max_distance_km=50
```

### 4. **Combined with Other Filters**

```javascript
// Get Honda cars near user's location
GET /api/leads?brand_id=507f1f77bcf86cd799439011
```

## Update User Location API

### Update User Location Endpoint

```javascript
PUT /api/user/update-location
Content-Type: application/json
Authorization: Bearer <token>

// Update with coordinates
{
  "latitude": 19.0760,
  "longitude": 72.8777
}

// Update with city
{
  "city": "Mumbai"
}
```

### Response

```json
{
    "success": true,
    "message": "User location updated successfully",
    "data": {
        "latitude": 19.076,
        "longitude": 72.8777,
        "city": "Mumbai"
    }
}
```

## Response Format

When location filtering is applied, the response includes additional metadata:

```json
{
  "success": true,
  "message": "leads fetched successfully",
  "data": [
    {
      "_id": "...",
      "vehicle": { ... },
      "distance": 5.2, // Distance in kilometers (only if location filtering is active)
      "coordinates": {
        "type": "Point",
        "coordinates": [72.8777, 19.0760]
      },
      // ... other fields
    }
  ],
  "meta": {
    "page": 1,
    "size": 10,
    "totalPages": 5,
    "totalCount": 50,
    "locationFilter": {
      "userLatitude": 19.0760,
      "userLongitude": 72.8777,
      "maxDistanceKm": 25,
      "userCity": null,
      "hasLocationData": true,
      "locationSource": "user_profile" // manual_coordinates, manual_city, user_profile, user_city
    }
  }
}
```

## Location Source Types

-   `manual_coordinates`: User provided lat/lng in API call
-   `manual_city`: User provided city in API call
-   `user_profile`: Retrieved from user's saved coordinates
-   `user_city`: Retrieved from user's saved city (converted to coordinates)

## Sorting Behavior

### With Location Data

1. **Primary**: Distance (nearest first)
2. **Secondary**: Approval date (newest first)
3. **Tertiary**: Cars without coordinates are sorted last

### Without Location Data

1. **Primary**: Approval date (newest first)

## Distance Calculation

The system uses the Haversine formula to calculate distances between coordinates:

```javascript
distance =
    acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lng1 - lng2)) *
    6371 // Earth's radius in kilometers
```

## Error Handling

-   **Invalid coordinates**: Returns 400 error for coordinates outside valid ranges
-   **Invalid distance**: Returns 400 error for distances ≤ 0 or > 1000km
-   **City not found**: Logs warning and tries user profile location
-   **No location data**: Falls back to default sorting (no location filtering)

## Performance Considerations

-   Location filtering adds computational overhead due to distance calculations
-   Consider using smaller `max_distance_km` values for better performance
-   The system includes leads without coordinates to ensure no data is lost
-   User location is cached in profile to avoid repeated requests

## Implementation Details

### Controller Changes (`core/controllers/leads.controller.js`)

-   Added automatic location detection from user profile
-   Added location parameter validation
-   Added city-to-coordinates lookup
-   Added location metadata to response

### Service Changes (`core/services/leads.services.js`)

-   Added distance calculation using MongoDB aggregation
-   Added location-based sorting
-   Added distance filtering

### New API Endpoints

-   `PUT /api/user/update-location`: Update user location

### Database Requirements

-   Users must have `location` field with GeoJSON Point format
-   Leads must have `coordinates` field with GeoJSON Point format
-   Cities collection must have location data for city lookup
