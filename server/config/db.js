import mongoose from 'mongoose';
import { restoreSnapshot } from '../scripts/restoreSnapshot.js';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserverdark';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed/restore snapshot if database is brand new or empty
    try {
      const Property = mongoose.model('Property');
      const count = await Property.countDocuments();
      if (count === 0) {
        console.log('📦 Database is empty. Auto-restoring snapshot data...');
        await restoreSnapshot(uri);
      }
    } catch (err) {
      // Model might not be registered yet, try raw collection
      try {
        const count = await mongoose.connection.db.collection('properties').countDocuments();
        if (count === 0) {
          console.log('📦 Database is empty. Auto-restoring snapshot data...');
          await restoreSnapshot(uri);
        }
      } catch (e) {
        console.log('ℹ️ DB auto-restore check bypassed');
      }
    }

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // Ne pas exit en production
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

export default connectDB;