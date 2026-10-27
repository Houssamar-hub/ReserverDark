/**
 * @file seed100Properties.js
 * @description Idempotent seed script to insert or update 100 realistic Moroccan property listings
 * into MongoDB (accessible via MongoDB Compass) and update the snapshot.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Property from '../models/Property.js';
import { DEMO_OWNERS, DEMO_PROPERTIES } from './demo100PropertiesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserverdark';

export async function seed100Properties() {
  console.log('=====================================================');
  console.log('🚀 ReserverDark — Seeding 100 Realistic Moroccan Listings');
  console.log('=====================================================');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB!');

    // 1. Ensure Demo Owners exist
    console.log('\n👤 Ensuring 5 Moroccan Demo Owners exist...');
    const ownerIdMap = {};
    const defaultHashedPassword = await bcrypt.hash('DemoOwner@2026', 12);

    for (const ownerDef of DEMO_OWNERS) {
      const existing = await User.findOne({ email: ownerDef.email });
      if (!existing) {
        const created = await User.create({
          _id: new mongoose.Types.ObjectId(ownerDef._id),
          name: ownerDef.name,
          email: ownerDef.email,
          password: defaultHashedPassword,
          phone: ownerDef.phone,
          avatar: ownerDef.avatar,
          role: 'owner',
          isBlocked: false,
        });
        ownerIdMap[ownerDef.email] = created._id;
        console.log(`  + Created owner: ${created.name} (${created.email})`);
      } else {
        ownerIdMap[ownerDef.email] = existing._id;
        console.log(`  ✓ Existing owner verified: ${existing.name} (${existing.email})`);
      }
    }

    // 2. Upsert 100 Demo Properties
    console.log('\n🏡 Upserting 100 Demo Properties...');
    let createdCount = 0;
    let updatedCount = 0;
    const typeCounts = {};
    const cityCounts = {};

    for (const propData of DEMO_PROPERTIES) {
      const targetId = new mongoose.Types.ObjectId(propData._id);

      // Check if already exists by _id
      const existing = await Property.findById(targetId);

      const recordData = {
        ...propData,
        _id: targetId,
        owner: new mongoose.Types.ObjectId(propData.owner),
        status: 'approved',
      };

      if (!existing) {
        await Property.create(recordData);
        createdCount++;
      } else {
        await Property.findByIdAndUpdate(targetId, recordData, { runValidators: true });
        updatedCount++;
      }

      // Track statistics
      typeCounts[propData.type] = (typeCounts[propData.type] || 0) + 1;
      cityCounts[propData.city] = (cityCounts[propData.city] || 0) + 1;
    }

    console.log('\n=====================================================');
    console.log('📊 Seeding Summary Results:');
    console.log(`  - Newly created: ${createdCount}`);
    console.log(`  - Updated / refreshed: ${updatedCount}`);
    console.log(`  - Total demo properties verified in DB: ${createdCount + updatedCount}`);
    console.log('-----------------------------------------------------');
    console.log('Distribution by Property Type:');
    for (const [type, count] of Object.entries(typeCounts)) {
      console.log(`  • ${type.padEnd(14)}: ${count}`);
    }
    console.log('-----------------------------------------------------');
    console.log('Distribution by City:');
    for (const [city, count] of Object.entries(cityCounts)) {
      console.log(`  • ${city.padEnd(14)}: ${count}`);
    }
    console.log('=====================================================');

    // 3. Update database_snapshot.json to keep portable data in sync
    console.log('\n💾 Updating database_snapshot.json with demo dataset...');
    const snapshotPath = path.join(__dirname, '..', 'data', 'database_snapshot.json');
    if (fs.existsSync(snapshotPath)) {
      try {
        const raw = fs.readFileSync(snapshotPath, 'utf-8');
        const snapshot = JSON.parse(raw);

        if (!snapshot.users) snapshot.users = [];
        if (!snapshot.properties) snapshot.properties = [];

        // Merge demo owners
        for (const o of DEMO_OWNERS) {
          const idx = snapshot.users.findIndex(u => u._id === o._id || u.email === o.email);
          const userDoc = {
            _id: o._id,
            name: o.name,
            email: o.email,
            password: defaultHashedPassword,
            phone: o.phone,
            avatar: o.avatar,
            role: 'owner',
            isBlocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
          };
          if (idx >= 0) {
            snapshot.users[idx] = { ...snapshot.users[idx], ...userDoc };
          } else {
            snapshot.users.push(userDoc);
          }
        }

        // Merge 100 properties into snapshot
        for (const p of DEMO_PROPERTIES) {
          const idx = snapshot.properties.findIndex(sp => sp._id === p._id || sp.demoKey === p.demoKey);
          const propDoc = {
            ...p,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
          };
          if (idx >= 0) {
            snapshot.properties[idx] = { ...snapshot.properties[idx], ...propDoc };
          } else {
            snapshot.properties.push(propDoc);
          }
        }

        fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
        console.log(` Snapshot updated! Total properties in snapshot: ${snapshot.properties.length}`);
      } catch (snapErr) {
        console.warn('⚠️ Could not update snapshot file:', snapErr.message);
      }
    }

    console.log('\n All 100 listings are now live in MongoDB database "reserverdark"');
    console.log('   You can view them immediately in MongoDB Compass and on the web UI!');
    return { createdCount, updatedCount, total: createdCount + updatedCount, typeCounts, cityCounts };
  } catch (err) {
    console.error('❌ Error seeding properties:', err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log(' Database connection closed.');
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed100Properties.js')) {
  seed100Properties()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
