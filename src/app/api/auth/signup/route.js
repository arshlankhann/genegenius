
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  verified: { type: Boolean, default: false },
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Temporary OTP storage schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpires: Date,
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto delete after 10 minutes
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
    const { name, email, password } = body;

    console.log('Signup attempt for email:', email);

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists:', email);
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    // Check if OTP was verified for this email
    const tempOTP = await TempOTP.findOne({ email });
    if (!tempOTP || !tempOTP.verified) {
      console.log('No verified OTP found for email:', email);
      return NextResponse.json({ message: 'Please verify your email with OTP first' }, { status: 400 });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Creating user with hashed password...');

    // Create the user account
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      avatar: '/vercel.svg', 
      verified: true // Since OTP was already verified
    });

    // Clean up the temporary OTP record
    await TempOTP.deleteOne({ email });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      verified: user.verified
    };

    console.log('User created successfully:', email);
    return NextResponse.json({ 
      message: 'Account created successfully! You can now log in.', 
      user: userResponse 
    }, { status: 201 });

  } catch (err) {
    console.error('Signup API error:', err);
    return NextResponse.json({ message: 'Unexpected error', error: err.message }, { status: 500 });
  }
}
