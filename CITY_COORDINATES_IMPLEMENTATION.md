# City Coordinates Implementation for Leads

## Overview

The leads controller now supports both direct coordinate input and city name lookup for setting lead coordinates. This provides flexibility for users to either provide exact coordinates or simply specify a city name.

## How It Works

### Lead Creation (`createLeads`)

The system now accepts three ways to set coordinates:

1. **Direct Coordinates**: Provide `latitude` and `longitude` in the form data
2. **City Name**: Provide `city` name, which will be looked up in the cities collection
3. **Hybrid**: If both are provided, direct coordinates take precedence

### Lead Updates (`updateLeadVehicle`)

The same coordinate handling logic is applied to lead updates, allowing users to modify location data using either method.

## Implementation Details

### Helper Function

```javascript
const getCityCoordinates = async (cityName) => {
    try {
        const city = await City.findOne({
            name: { $regex: new RegExp(cityName, 'i') },
        })
        if (city && city.location) {
            return {
                latitude: city.location.coordinates[1], // lat is at index 1
                longitude: city.location.coordinates[0], // lng is at index 0
            }
        }
        return null
    } catch (error) {
        console.error('Error fetching city coordinates:', error)
        return null
    }
}
```

### Coordinate Processing Logic

1. **Priority**: Direct coordinates (`latitude`/`longitude`) take precedence over city name
2. **City Lookup**: If no direct coordinates are provided, the system looks up the city in the cities collection
3. **Case Insensitive**: City name matching is case-insensitive using regex
4. **Error Handling**: If city is not found, coordinates are not set (no error thrown)

### Database Storage

Coordinates are stored in GeoJSON format in the leads collection:

```javascript
coordinates: {
    type: 'Point',
    coordinates: [longitude, latitude], // Note: GeoJSON format is [lng, lat]
}
```

## API Usage Examples

### Creating a Lead with City Name

```javascript
// Form data
const formData = new FormData()
formData.append('vehicle', JSON.stringify(vehicleData))
formData.append('car_type', 'pre-owned')
formData.append('city', 'Mumbai') // City name instead of coordinates
formData.append('notes', 'Some notes')
// ... other fields
```

### Creating a Lead with Direct Coordinates

```javascript
// Form data
const formData = new FormData()
formData.append('vehicle', JSON.stringify(vehicleData))
formData.append('car_type', 'pre-owned')
formData.append('latitude', '19.0760')
formData.append('longitude', '72.8777')
formData.append('notes', 'Some notes')
// ... other fields
```

### Updating a Lead's Location

```javascript
// Form data for update
const formData = new FormData()
formData.append('city', 'Delhi') // Change location to Delhi
// ... other update fields
```

## Benefits

1. **User-Friendly**: Users can simply specify city names instead of finding exact coordinates
2. **Backward Compatible**: Existing direct coordinate functionality remains unchanged
3. **Flexible**: Supports both methods simultaneously
4. **Consistent**: Same logic applied to both creation and updates
5. **Robust**: Includes error handling and logging for debugging

## Database Requirements

The implementation requires:

-   `cities` collection with city names and coordinates
-   `leads` collection with GeoJSON coordinates field
-   Proper indexes on both collections for efficient queries

## Logging

The system includes comprehensive logging for debugging:

-   Request body analysis
-   City lookup results
-   Coordinate processing steps
-   Error conditions

This helps track how coordinates are being processed and identify any issues with city lookups.
