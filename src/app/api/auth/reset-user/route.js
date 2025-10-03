import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  verified: { type: Boolean, default: false },
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpires: Date,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 1800 }
});
const TempOTP = mongoose.models.TempOTP || mongoose.model('TempOTP', otpSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Delete user and temp OTP records for this email
    const userDeleted = await User.deleteOne({ email });
    const otpDeleted = await TempOTP.deleteOne({ email });

    return NextResponse.json({ 
      message: 'User data cleared successfully',
      userDeleted: userDeleted.deletedCount > 0,
      otpDeleted: otpDeleted.deletedCount > 0
    }, { status: 200 });

  } catch (err) {
    console.error('Reset user error:', err);
    return NextResponse.json({ message: 'Error resetting user', error: err.message }, { status: 500 });
  }
}