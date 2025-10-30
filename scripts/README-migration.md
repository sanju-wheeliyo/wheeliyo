# Lead Status Migration Guide

## Problem

Your `get_all` API endpoint is not returning old leads because they don't have the `leadStatus` field, while new leads work fine.

## Solution

Run a migration script to add the `leadStatus` field to all existing leads.

## Step 1: Set Environment Variable

Set your MongoDB connection string:

**Windows (PowerShell):**

```powershell
$env:MONGODB_URL="mongodb://your-connection-string"
```

**Windows (Command Prompt):**

```cmd
set MONGODB_URL=mongodb://your-connection-string
```

**Linux/Mac:**

```bash
export MONGODB_URL="mongodb://your-connection-string"
```

## Step 2: Run Migration

```bash
node scripts/migrate-lead-status.js
```

## What the Migration Does

-   Finds all leads without `leadStatus` field
-   Sets `leadStatus: 'active'` for approved leads
-   Sets `leadStatus: 'pending'` for unapproved leads
-   Updates the database in place

## Expected Output

```
🔗 Connecting to MongoDB...
✅ Connected to MongoDB successfully
📊 Total leads: 150
❌ Leads without leadStatus: 120
🔄 Updating leads...
✅ Updated 120 leads
📈 Leads with leadStatus: 150
🔌 Disconnected from MongoDB
```

## After Migration

Your `get_all` API should now return all leads (both old and new).

## Safety Notes

-   The script only adds missing fields, doesn't delete data
-   Consider backing up your database first
-   Test in a staging environment first if possible
