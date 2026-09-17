import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserverdark';

async function exportSnapshot() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const snapshot = {};

    for (const col of collections) {
      const name = col.name;
      if (name.startsWith('system.')) continue;
      const docs = await mongoose.connection.db.collection(name).find({}).toArray();
      snapshot[name] = docs;
      console.log(`Exported ${docs.length} documents from "${name}"`);
    }

    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'database_snapshot.json');
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log(`\n🎉 Successfully saved database snapshot to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error exporting snapshot:', error);
    process.exit(1);
  }
}

exportSnapshot();
