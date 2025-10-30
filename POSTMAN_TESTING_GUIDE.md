# Postman Testing Guide for Mark as Sold API

This guide will help you test the Mark as Sold API using Postman.

## Prerequisites

1. **Postman installed** on your machine
2. **Your application running** locally (usually on `http://localhost:3000`)
3. **A valid user account** with authentication token
4. **At least one lead/car** in your database

## Step 1: Get Authentication Token

First, you need to get a valid JWT token by logging in.

### Login Request

```
Method: POST
URL: http://localhost:3000/api/auth/login
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

### Response

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "64f8a1b2c3d4e5f6a7b8c9d0",
            "name": "John Doe",
            "email": "your-email@example.com"
        }
    }
}
```

**Copy the token value** - you'll need it for the next requests.

## Step 2: Get a Lead ID

You need a lead ID to test the mark as sold functionality.

### Get Leads Request

```
Method: GET
URL: http://localhost:3000/api/leads
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

### Response

```json
{
    "success": true,
    "data": {
        "data": [
            {
                "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
                "vehicle": {
                    "number": "MH12AB1234",
                    "price": 500000
                },
                "leadStatus": "active",
                "approved": true
            }
        ],
        "count": 1
    }
}
```

**Copy the lead ID** (e.g., `64f8a1b2c3d4e5f6a7b8c9d1`) - you'll need it for the mark as sold request.

## Step 3: Test Mark as Sold API

### Mark as Sold Request

```
Method: PUT
URL: http://localhost:3000/api/lead/mark-sold/64f8a1b2c3d4e5f6a7b8c9d1
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json

Body: (empty - no body required)
```

### Expected Success Response (200)

```json
{
    "success": true,
    "message": "Car marked as sold successfully",
    "data": {
        "leadId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "leadStatus": "sold",
        "soldAt": "2024-01-15T10:30:00.000Z",
        "vehicle": {
            "number": "MH12AB1234",
            "brand_id": "64f8a1b2c3d4e5f6a7b8c9d2",
            "model_id": "64f8a1b2c3d4e5f6a7b8c9d3",
            "price": 500000
        }
    }
}
```

## Step 4: Verify the Change

### Get Updated Lead Request

```
Method: GET
URL: http://localhost:3000/api/lead/64f8a1b2c3d4e5f6a7b8c9d1
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

### Expected Response

```json
{
    "success": true,
    "data": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "leadStatus": "sold",
        "soldAt": "2024-01-15T10:30:00.000Z",
        "vehicle": {
            "number": "MH12AB1234",
            "price": 500000
        }
    }
}
```

## Step 5: Test Error Scenarios

### Test 1: Unauthorized Access (No Token)

```
Method: PUT
URL: http://localhost:3000/api/lead/mark-sold/64f8a1b2c3d4e5f6a7b8c9d1
Headers:
  Content-Type: application/json
```

**Expected Response (401):**

```json
{
    "success": false,
    "message": "Authentication required"
}
```

### Test 2: Invalid Lead ID

```
Method: PUT
URL: http://localhost:3000/api/lead/mark-sold/invalid-id
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

**Expected Response (404):**

```json
{
    "success": false,
    "message": "Lead not found"
}
```

### Test 3: Marking Someone Else's Lead

```
Method: PUT
URL: http://localhost:3000/api/lead/mark-sold/SOMEONE_ELSES_LEAD_ID
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

**Expected Response (403):**

```json
{
    "success": false,
    "message": "Unauthorized: You can only mark your own leads as sold"
}
```

### Test 4: Missing Lead ID

```
Method: PUT
URL: http://localhost:3000/api/lead/mark-sold/
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

**Expected Response (400):**

```json
{
    "success": false,
    "message": "Lead ID is required"
}
```

## Step 6: Test Filtering with Lead Status

### Get All Cars (Active + Sold)

```
Method: GET
URL: http://localhost:3000/api/leads
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

### Get Only Active Cars

```
Method: GET
URL: http://localhost:3000/api/leads?leadStatus=active
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

### Get Only Sold Cars

```
Method: GET
URL: http://localhost:3000/api/leads?leadStatus=sold
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

## Postman Collection Setup

### 1. Create a New Collection

1. Open Postman
2. Click "New" → "Collection"
3. Name it "Mark as Sold API Tests"

### 2. Set Up Environment Variables

1. Click "Environments" → "New"
2. Name it "Local Development"
3. Add these variables:
    - `base_url`: `http://localhost:3000`
    - `auth_token`: (leave empty for now)
    - `lead_id`: (leave empty for now)

### 3. Create Requests

#### Request 1: Login

```
Name: Login
Method: POST
URL: {{base_url}}/api/auth/login
Body:
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Test Script:**

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json()
    pm.environment.set('auth_token', response.data.token)
}
```

#### Request 2: Get Leads

```
Name: Get Leads
Method: GET
URL: {{base_url}}/api/leads
Headers:
  Authorization: Bearer {{auth_token}}
```

**Test Script:**

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json()
    if (response.data.data.length > 0) {
        pm.environment.set('lead_id', response.data.data[0]._id)
    }
}
```

#### Request 3: Mark as Sold

```
Name: Mark as Sold
Method: PUT
URL: {{base_url}}/api/lead/mark-sold/{{lead_id}}
Headers:
  Authorization: Bearer {{auth_token}}
```

**Test Script:**

```javascript
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200)
})

pm.test('Response has success message', function () {
    const response = pm.response.json()
    pm.expect(response.success).to.be.true
    pm.expect(response.message).to.include('Car marked as sold successfully')
})

pm.test('Lead status is sold', function () {
    const response = pm.response.json()
    pm.expect(response.data.leadStatus).to.eql('sold')
})

pm.test('Sold date is present', function () {
    const response = pm.response.json()
    pm.expect(response.data.soldAt).to.not.be.null
})
```

## Quick Test Checklist

-   [ ] Login and get token
-   [ ] Get a lead ID
-   [ ] Mark lead as sold
-   [ ] Verify lead status changed to "sold"
-   [ ] Test unauthorized access
-   [ ] Test invalid lead ID
-   [ ] Test marking someone else's lead
-   [ ] Test filtering by lead status

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Make sure you're using a valid token
2. **404 Not Found**: Check if the lead ID exists
3. **403 Forbidden**: You can only mark your own leads as sold
4. **500 Internal Server Error**: Check server logs for details

### Debug Tips:

1. **Check Network Tab**: Verify the request is being sent correctly
2. **Check Console Logs**: Look for any JavaScript errors
3. **Verify Database**: Check if the lead exists in your database
4. **Check Authentication**: Ensure the user owns the lead

## Environment Setup

Make sure your development environment is properly configured:

1. **Database**: MongoDB should be running
2. **Server**: Your Next.js app should be running on port 3000
3. **Environment Variables**: Check your `.env` file for required variables
4. **Dependencies**: Ensure all npm packages are installed

That's it! You should now be able to thoroughly test the Mark as Sold API using Postman.
