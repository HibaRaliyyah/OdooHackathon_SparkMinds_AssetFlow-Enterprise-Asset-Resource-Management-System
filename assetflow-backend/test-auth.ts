import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const testPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB');

    const admin = await User.findOne({ email: 'admin@assetflow.com' });
    if (!admin) {
      console.log('Admin not found!');
      process.exit(1);
    }

    console.log('Admin found:', admin.email);
    console.log('Hashed Password in DB:', admin.password);
    
    const isMatch = await admin.comparePassword('Admin@123');
    console.log('Does Admin@123 match?', isMatch);

    const isMatchDouble = await bcrypt.compare('Admin@123', admin.password);
    console.log('Direct bcrypt.compare Admin@123:', isMatchDouble);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testPassword();
