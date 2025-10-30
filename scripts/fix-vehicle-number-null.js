import mongoose from 'mongoose';
import Leads from '../core/models/leads.js';

const fixVehicleNumberNull = async () => {
    try {
        // Connect to MongoDB using environment variable
        const MONGODB_URI = process.env.MONGODB_URL;
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URL environment variable not set');
            return;
        }
        
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all leads with null vehicle_number
        const leadsWithNullVehicleNumber = await Leads.find({ 
            vehicle_number: { $exists: false } 
        });

        console.log(`Found ${leadsWithNullVehicleNumber.length} leads with missing vehicle_number`);

        if (leadsWithNullVehicleNumber.length === 0) {
            console.log('No leads with null vehicle_number found. Exiting...');
            return;
        }

        // Update each lead to use vehicle.number if available
        for (const lead of leadsWithNullVehicleNumber) {
            if (lead.vehicle && lead.vehicle.number) {
                await Leads.updateOne(
                    { _id: lead._id },
                    { vehicle_number: lead.vehicle.number.trim() }
                );
                console.log(`Updated lead ${lead._id} with vehicle number: ${lead.vehicle.number}`);
            } else {
                console.log(`Lead ${lead._id} has no vehicle number in vehicle object. Manual review needed.`);
            }
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the migration
fixVehicleNumberNull(); 