# Mark Car as Sold API

This API allows users to mark their cars as sold.

## API Endpoint

```
PUT /api/lead/mark-sold/{leadId}
```

## Authentication

This endpoint requires authentication. Include the user's JWT token in the Authorization header:

```
Authorization: Bearer <user_token>
```

## Parameters

### Path Parameters

-   `leadId` (string, required): The ID of the lead to mark as sold

### Request Body

No request body required.

## Response

### Success Response (200)

```json
{
    "success": true,
    "message": "Car marked as sold successfully",
    "data": {
        "leadId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "leadStatus": "sold",
        "soldAt": "2024-01-15T10:30:00.000Z",
        "vehicle": {
            "number": "MH12AB1234",
            "brand_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "model_id": "64f8a1b2c3d4e5f6a7b8c9d2",
            "price": 500000
            // ... other vehicle details
        }
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Lead ID is required"
}
```

#### 401 Unauthorized

```json
{
    "success": false,
    "message": "Authentication required"
}
```

#### 403 Forbidden

```json
{
    "success": false,
    "message": "Unauthorized: You can only mark your own leads as sold"
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Lead not found"
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error"
}
```

## Usage Examples

### JavaScript/Node.js

```javascript
import carServices from 'lib/services/car.services'

// Mark a car as sold
const markAsSold = async (leadId) => {
    try {
        const response = await carServices.markAsSold(leadId)
        console.log('Car marked as sold:', response.data)
    } catch (error) {
        console.error('Error marking car as sold:', error)
    }
}
```

### cURL

```bash
curl -X PUT \
  http://localhost:3000/api/lead/mark-sold/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H 'Authorization: Bearer YOUR_USER_TOKEN' \
  -H 'Content-Type: application/json'
```

## Database Changes

### New Fields Added to Leads Model

1. **leadStatus** (String, enum)

    - Values: `['active', 'sold', 'withdrawn', 'expired']`
    - Default: `'active'`
    - Purpose: Track the overall status of the lead

2. **soldAt** (Date)
    - Purpose: Record when the car was marked as sold
    - Set automatically when leadStatus is changed to 'sold'

### New Indexes Added

-   `leadStatus` - For efficient filtering by lead status
-   `approved + leadStatus` - Compound index for approved and status queries

## Filtering Behavior

By default, the leads listing API now includes both active and sold leads to build trust and demonstrate platform success. You can control the filtering behavior:

1. **Default behavior** (no leadStatus parameter): Shows active and sold leads
2. Pass `leadStatus: 'active'` to show only active leads (exclude sold, withdrawn, expired)
3. Pass `leadStatus: 'sold'` to show only sold leads
4. Pass `leadStatus: 'all'` to show all leads regardless of status
5. Pass `leadStatus: 'withdrawn'` or `leadStatus: 'expired'` for specific statuses

This approach helps build user trust by showing successful sales while still allowing users to filter if needed.

## Frontend Components

### Example Components

I've created example components to help you implement the sold car display:

1. **SoldCarIndicator** (`components/examples/SoldCarIndicator.jsx`)

    - Displays cars with visual indicators for sold status
    - Includes sold badges, date stamps, and status indicators
    - Helps build trust by showing successful sales

2. **LeadStatusFilter** (`components/examples/LeadStatusFilter.jsx`)
    - Filter component to toggle between active, sold, and all cars
    - Includes trust-building messaging
    - Responsive design for mobile and desktop

### Usage Example

```javascript
import React, { useState } from 'react'
import { useApi } from 'lib/hooks/useApi'
import carServices from 'lib/services/car.services'
import SoldCarIndicator from 'components/examples/SoldCarIndicator'
import LeadStatusFilter from 'components/examples/LeadStatusFilter'

const CarListingPage = () => {
    const [leadStatusFilter, setLeadStatusFilter] = useState('all')
    const [leads, setLeads] = useState([])

    const getLeadsApi = useApi(carServices.getLeads)

    const fetchLeads = async (statusFilter) => {
        try {
            const response = await getLeadsApi.request({
                leadStatus: statusFilter === 'all' ? undefined : statusFilter,
                // ... other filter parameters
            })
            setLeads(response.data)
        } catch (error) {
            console.error('Error fetching leads:', error)
        }
    }

    const handleStatusFilterChange = (filter) => {
        setLeadStatusFilter(filter)
        fetchLeads(filter)
    }

    return (
        <div className="car-listing-page">
            <LeadStatusFilter
                onFilterChange={handleStatusFilterChange}
                currentFilter={leadStatusFilter}
            />

            <div className="leads-grid">
                {leads.map((lead) => (
                    <SoldCarIndicator key={lead._id} lead={lead} />
                ))}
            </div>
        </div>
    )
}
```

## Security

-   Only the lead owner can mark their own leads as sold
-   Authentication is required
-   The API validates lead ownership before allowing the status change

## Frontend Integration

The API is integrated with the existing car services. You can use it in your React components like this:

```javascript
import { useApi } from 'lib/hooks/useApi'
import carServices from 'lib/services/car.services'

const MarkAsSoldButton = ({ leadId }) => {
    const markAsSoldApi = useApi(carServices.markAsSold)

    const handleMarkAsSold = async () => {
        try {
            await markAsSoldApi.request(leadId)
            // Handle success (e.g., show success message, refresh data)
        } catch (error) {
            // Handle error (e.g., show error message)
        }
    }

    return (
        <button onClick={handleMarkAsSold} disabled={markAsSoldApi.loading}>
            {markAsSoldApi.loading ? 'Marking as Sold...' : 'Mark as Sold'}
        </button>
    )
}
```
