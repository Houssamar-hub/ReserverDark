import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['client', 'owner', 'admin'], default: 'client' },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserverdark';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const adminEmail = 'admin@reserverdark.com';
  const plainPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  let admin = await User.findOne({ email: adminEmail });

  if (admin) {
    admin.password = hashedPassword;
    admin.role = 'admin';
    admin.isBlocked = false;
    await admin.save();
    console.log(`Updated existing user to admin: ${adminEmail}`);
  } else {
    admin = await User.create({
      name: 'Admin ReserverDark',
      email: adminEmail,
      password: hashedPassword,
      phone: '+212600000000',
      role: 'admin',
      isBlocked: false,
    });
    console.log(`Created new admin: ${adminEmail}`);
  }

  // Also update database_snapshot.json so this admin persists across resets
  const snapshotPath = path.join(__dirname, '../data/database_snapshot.json');
  if (fs.existsSync(snapshotPath)) {
    const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    const existingIndex = (data.users || []).findIndex(u => u.email === adminEmail);
    const adminObj = {
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      password: admin.password,
      phone: admin.phone,
      avatar: admin.avatar || '',
      role: 'admin',
      isBlocked: false,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      __v: 0,
    };

    if (existingIndex >= 0) {
      data.users[existingIndex] = adminObj;
    } else {
      data.users.unshift(adminObj);
    }

    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Updated database_snapshot.json with admin account');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

createAdmin().catch(console.error);
