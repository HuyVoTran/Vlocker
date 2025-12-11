// scripts/seed-lockers.js
// Run with: node scripts/seed-lockers.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Locker from '../models/Locker.js';

dotenv.config({ path: '.env.local' });

async function seedLockers() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not defined in .env.local');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing lockers
    await Locker.deleteMany({});
    console.log('Cleared existing lockers');

    // Sample buildings and blocks
    const buildings = ['A', 'B', 'C'];
    const blocks = ['1', '2', '3'];
    
    const lockers = [];

    for (const building of buildings) {
      for (const block of blocks) {
        for (let i = 1; i <= 5; i++) {
          lockers.push({
            lockerId: `${building}${block}-${String(i).padStart(3, '0')}`,
            building,
            block,
            status: i <= 3 ? 'available' : 'booked', // First 3 are available, rest booked
            isLocked: true,
          });
        }
      }
    }

    const created = await Locker.insertMany(lockers);
    console.log(`✅ Created ${created.length} lockers`);
    console.log('Sample:', created.slice(0, 3));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding lockers:', error);
    process.exit(1);
  }
}

seedLockers();
