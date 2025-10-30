import mongoose from 'mongoose';
import Leads from '../core/models/leads.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const deleteAllLeads = async () => {
    try {
        // Connect to MongoDB using environment variable
        const MONGODB_URI = process.env.MONGODB_URL;
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URL environment variable not set');
            console.log('Please set the MONGODB_URL environment variable before running this script.');
            return;
        }
        
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');

        // Get total count of leads
        const totalLeads = await Leads.countDocuments();
        console.log(`📊 Total leads in database: ${totalLeads}`);

        if (totalLeads === 0) {
            console.log('ℹ️  No leads found in database. Nothing to delete.');
            return;
        }

        // Safety confirmation
        console.log('\n⚠️  WARNING: This will permanently delete ALL leads from the database!');
        console.log('This action cannot be undone.');
        
        const confirmation = await question(`\nAre you sure you want to delete all ${totalLeads} leads? (yes/no): `);
        
        if (confirmation.toLowerCase() !== 'yes') {
            console.log('❌ Operation cancelled by user.');
            return;
        }

        // Double confirmation for safety
        const doubleConfirmation = await question('Type "DELETE ALL LEADS" to confirm: ');
        
        if (doubleConfirmation !== 'DELETE ALL LEADS') {
            console.log('❌ Double confirmation failed. Operation cancelled.');
            return;
        }

        console.log('\n🗑️  Starting deletion process...');
        
        // Delete all leads
        const deleteResult = await Leads.deleteMany({});
        
        console.log(`✅ Successfully deleted ${deleteResult.deletedCount} leads from database`);
        
        // Verify deletion
        const remainingLeads = await Leads.countDocuments();
        console.log(`📊 Remaining leads in database: ${remainingLeads}`);
        
        if (remainingLeads === 0) {
            console.log('🎉 All leads have been successfully deleted!');
        } else {
            console.log('⚠️  Some leads may still exist. Please check manually.');
        }

    } catch (error) {
        console.error('❌ Error during deletion process:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        rl.close();
    }
};

// Run the script
console.log('🚀 Starting lead deletion script...\n');
deleteAllLeads(); 