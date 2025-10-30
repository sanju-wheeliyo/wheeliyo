# Cities API - Find Nearest City

## Overview

The `findNearestCity` endpoint has been updated to automatically fetch the user's location from their authentication token instead of requiring latitude and longitude as query parameters.

## 🚀 **Automatic Location Detection**

The system automatically detects user location in the following priority order:

1. **User profile coordinates** (stored from previous location updates)
2. **User profile city** (converted to coordinates via city lookup)

## API Endpoint

```
GET /api/cities/nearest
Authorization: Bearer <token>
```

### Query Parameters

-   `maxDistance` (optional): Maximum distance in kilometers (default: 100km)

### Headers

-   `Authorization: Bearer <token>` (required)

## Usage Examples

### 1. **Basic Usage (Recommended)**

```javascript
// Get nearest city to user's saved location
GET /api/cities/nearest
Authorization: Bearer <user_token>
```

### 2. **With Custom Distance**

```javascript
// Get nearest city within 50km
GET /api/cities/nearest?maxDistance=50
Authorization: Bearer <user_token>
```

## Response Format

### Success Response

```json
{
    "success": true,
    "message": "Nearest city found successfully",
    "data": {
        "name": "Mumbai",
        "distance": 5.2,
        "coordinates": [72.8777, 19.076],
        "userLocation": {
            "latitude": 19.076,
            "longitude": 72.8777,
            "source": "coordinates"
        }
    }
}
```

### Error Responses

#### User Not Authenticated

```json
{
    "success": false,
    "message": "User not authenticated",
    "status": 401
}
```

#### User Not Found

```json
{
    "success": false,
    "message": "User not found",
    "status": 404
}
```

#### Location Not Available

```json
{
    "success": false,
    "message": "User location not available. Please update your location or city in your profile.",
    "status": 400
}
```

#### No Cities Found

```json
{
    "success": false,
    "message": "No cities found within the specified distance",
    "status": 404
}
```

## Location Source Types

-   `coordinates`: Retrieved from user's saved coordinates
-   `city_lookup`: Retrieved from user's saved city (converted to coordinates)

## Prerequisites

### User Location Setup

Before using this endpoint, users must have location data in their profile. This can be set via:

1. **Update Location API**:

    ```
    PUT /api/user/update-location
    {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
    ```

2. **Update Profile API**:
    ```
    PUT /api/user/update-profile
    {
      "city": "Mumbai"
    }
    ```

## Distance Calculation

The system uses the Haversine formula to calculate distances between coordinates:

```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
}
```

## Migration from Previous Version

### Before (Required coordinates as parameters)

```javascript
GET /api/cities/nearest?latitude=19.0760&longitude=72.8777&maxDistance=100
```

### After (Uses user location from token)

```javascript
GET /api/cities/nearest?maxDistance=100
Authorization: Bearer <token>
```

## Benefits

1. **Simplified API**: No need to pass coordinates manually
2. **User-Friendly**: Automatically uses user's saved location
3. **Secure**: Requires authentication token
4. **Fallback Support**: Uses city name if coordinates not available
5. **Consistent**: Follows the same pattern as other location-based APIs in the system

## Error Handling

The system provides clear error messages for different scenarios:

-   **Authentication errors**: When token is missing or invalid
-   **User not found**: When user ID from token doesn't exist
-   **Location unavailable**: When user has no location data
-   **No cities found**: When no cities are within the specified distance

## Integration with Frontend

### JavaScript Example

```javascript
const getNearestCity = async (maxDistance = 100) => {
    try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(
            `/api/cities/nearest?maxDistance=${maxDistance}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        const data = await response.json()

        if (data.success) {
            console.log('Nearest city:', data.data.name)
            console.log('Distance:', data.data.distance, 'km')
            return data.data
        } else {
            console.error('Error:', data.message)
            return null
        }
    } catch (error) {
        console.error('API Error:', error)
        return null
    }
}
```

## Testing

To test the endpoint:

1. **Ensure user has location data**:

    - Update user location via `/api/user/update-location`
    - Or set user city via profile update

2. **Make authenticated request**:

    ```bash
    curl -X GET "http://localhost:3000/api/cities/nearest?maxDistance=50" \
         -H "Authorization: Bearer <your_token>"
    ```

3. **Verify response**:
    - Check that nearest city is returned
    - Verify distance calculation is reasonable
    - Confirm user location source is correct
