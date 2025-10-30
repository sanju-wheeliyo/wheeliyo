# Database Scripts

This directory contains utility scripts for database operations.

## Lead Deletion Scripts

### ⚠️ IMPORTANT WARNING

These scripts will **permanently delete** all leads from your database. This action cannot be undone. Make sure you have proper backups before running these scripts.

### Available Scripts

#### 1. `delete-all-leads.js` (Interactive)

-   **Purpose**: Delete all leads with interactive confirmation prompts
-   **Features**:
    -   Double confirmation prompts for safety
    -   Shows total count before deletion
    -   Verifies deletion was successful
    -   User-friendly interface with emojis

#### 2. `delete-all-leads-simple.js` (Non-interactive)

-   **Purpose**: Delete all leads without prompts (for automated testing)
-   **Features**:
    -   No user interaction required
    -   Suitable for CI/CD pipelines
    -   Exits with error code 1 if deletion fails

### How to Run

#### Prerequisites

1. Make sure your `MONGODB_URL` environment variable is set
2. Ensure you have proper database backups
3. Run from the project root directory

#### Running the Interactive Script

```bash
# From project root
node scripts/delete-all-leads.js
```

The script will:

1. Connect to your MongoDB database
2. Show the total number of leads
3. Ask for confirmation (type "yes")
4. Ask for double confirmation (type "DELETE ALL LEADS")
5. Delete all leads
6. Verify the deletion

#### Running the Simple Script

```bash
# From project root
node scripts/delete-all-leads-simple.js
```

The script will:

1. Connect to your MongoDB database
2. Show the total number of leads
3. Delete all leads immediately
4. Verify the deletion

### Environment Variables

Make sure you have the following environment variable set:

-   `MONGODB_URL`: Your MongoDB connection string

### Safety Features

Both scripts include:

-   ✅ Connection validation
-   ✅ Lead count verification before deletion
-   ✅ Deletion verification after completion
-   ✅ Proper error handling
-   ✅ Database disconnection
-   ✅ Clear console output with status indicators

### Use Cases

-   **Testing**: Clean slate for testing lead creation flows
-   **Development**: Reset database state during development
-   **Staging**: Clear test data from staging environments
-   **Debugging**: Remove problematic data for troubleshooting

### Backup Recommendation

Before running these scripts, consider creating a backup:

```bash
# Using mongodump (if you have MongoDB tools installed)
mongodump --uri="your_mongodb_connection_string" --collection=leads --db=your_database_name

# Or export to JSON
mongoexport --uri="your_mongodb_connection_string" --collection=leads --db=your_database_name --out=leads_backup.json
```

### Related Scripts

-   `test-lead-creation.js`: Test lead creation functionality
-   `fix-vehicle-number-null.js`: Fix leads with null vehicle numbers
-   `insertFuelTypes.cjs`: Insert fuel types into database
