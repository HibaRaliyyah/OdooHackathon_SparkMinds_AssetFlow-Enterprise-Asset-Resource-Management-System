import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './src/models/User';
import Department from './src/models/Department';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const admin = await User.findOne({ role: 'admin' });
  const dept = await Department.findOne();
  
  if (!admin) throw new Error('No admin found');
  
  const token = jwt.sign(
    { id: admin._id, role: admin.role, department: admin.department },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  try {
    const res = await fetch('http://localhost:5000/api/audits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Annual IT',
        department: undefined,
        scheduledDate: '2026-07-31'
      })
    });
    
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
