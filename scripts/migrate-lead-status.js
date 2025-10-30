import mongoose from 'mongoose';
import Leads from '../core/models/leads.js';

const migrateLeadStatus = async () => {
    try {
        const MONGODB_URI = "mongodb://localhost:27017/wheelio";
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URL environment variable not set');
            return;
        }
        
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');

        const totalLeads = await Leads.countDocuments();
        console.log(`📊 Total leads: ${totalLeads}`);

        const leadsWithoutStatus = await Leads.countDocuments({ leadStatus: { $exists: false } });
        console.log(`❌ Leads without leadStatus: ${leadsWithoutStatus}`);

        if (leadsWithoutStatus === 0) {
            console.log('✅ All leads already have leadStatus field.');
            return;
        }

        console.log('🔄 Updating leads...');
        
        const updateResult = await Leads.updateMany(
            { leadStatus: { $exists: false } },
            [
                {
                    $set: {
                        leadStatus: {
                            $cond: {
                                if: { $eq: ['$approved', true] },
                                then: 'active',
                                else: 'pending'
                            }
                        }
                    }
                }
            ]
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} leads`);
        
        const leadsWithStatusAfter = await Leads.countDocuments({ leadStatus: { $exists: true } });
        console.log(`📈 Leads with leadStatus: ${leadsWithStatusAfter}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

migrateLeadStatus(); 