import mongoose from 'mongoose';
import Leads from '../core/models/leads.js';

const deleteAllLeadsSimple = async () => {
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

        console.log('🗑️  Deleting all leads...');
        
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
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run the script
console.log('🚀 Starting lead deletion script (simple mode)...\n');
deleteAllLeadsSimple(); 