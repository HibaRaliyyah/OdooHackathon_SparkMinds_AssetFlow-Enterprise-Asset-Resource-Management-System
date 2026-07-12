import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; // NextJS/Node 18+ has fetch natively, but we'll try native fetch
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'assetflow-backend', '.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Department = mongoose.model('Department', new mongoose.Schema({}, { strict: false }));

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw new Error('No admin found');
  console.log('Admin:', admin._id);

  const dept = await Department.findOne();
  if (!dept) throw new Error('No department found');
  console.log('Department:', dept._id);

  const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

  const res = await fetch('http://localhost:5000/api/v1/audits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Annual IT',
      department: dept._id.toString(),
      scheduledDate: '2026-07-31'
    })
  });

  const json = await res.json();
  console.log('Response:', res.status, json);

  mongoose.disconnect();
}

run().catch(console.error);
