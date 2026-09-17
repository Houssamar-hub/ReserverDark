import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserverdark';

export async function restoreSnapshot(customUri) {
  const uri = customUri || MONGODB_URI;
  try {
    console.log('Connecting to MongoDB for restore at:', uri);
    const conn = await mongoose.connect(uri);

    const snapshotPath = path.join(__dirname, '..', 'data', 'database_snapshot.json');
    if (!fs.existsSync(snapshotPath)) {
      console.log('⚠️ No snapshot file found at:', snapshotPath);
      return;
    }

    const raw = fs.readFileSync(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(raw);

    const db = mongoose.connection.db;

    for (const [colName, docs] of Object.entries(snapshot)) {
      if (!Array.isArray(docs) || docs.length === 0) continue;

      // Transform _id strings to ObjectIds and ISO date strings to Dates if needed
      const transformedDocs = docs.map(doc => {
        const newDoc = { ...doc };
        if (newDoc._id && typeof newDoc._id === 'string' && mongoose.Types.ObjectId.isValid(newDoc._id)) {
          newDoc._id = new mongoose.Types.ObjectId(newDoc._id);
        }
        // Transform reference fields
        ['user', 'owner', 'client', 'property', 'propertyId', 'sender', 'recipient', 'conversation'].forEach(field => {
          if (newDoc[field] && typeof newDoc[field] === 'string' && mongoose.Types.ObjectId.isValid(newDoc[field])) {
            newDoc[field] = new mongoose.Types.ObjectId(newDoc[field]);
          }
        });
        // Transform date fields
        ['createdAt', 'updatedAt', 'checkIn', 'checkOut', 'date'].forEach(field => {
          if (newDoc[field] && typeof newDoc[field] === 'string') {
            newDoc[field] = new Date(newDoc[field]);
          }
        });
        return newDoc;
      });

      const col = db.collection(colName);
      const currentCount = await col.countDocuments();
      if (currentCount === 0) {
        await col.insertMany(transformedDocs);
        console.log(`✅ Restored ${transformedDocs.length} documents into "${colName}"`);
      } else {
        console.log(`ℹ️ Collection "${colName}" already has ${currentCount} documents. Skipping.`);
      }
    }

    console.log('\n🎉 Database restore completed successfully!');
  } catch (error) {
    console.error('Error during snapshot restore:', error);
  }
}

// Execute directly if run via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  restoreSnapshot().then(() => process.exit(0));
}
