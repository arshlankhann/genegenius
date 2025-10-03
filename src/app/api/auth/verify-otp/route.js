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
  otp: String,
  otpExpires: Date,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Temporary OTP storage schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpires: Date,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 1800 } // Auto delete after 30 minutes
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
    const { email, otp } = body;
    
    console.log('Verify OTP request:', { email, otp: otp ? '***' : 'missing' });
    
    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    // First check temporary OTP storage (for new signups)
    try {
      const tempOTP = await TempOTP.findOne({ email });
      console.log('Temp OTP found:', tempOTP ? 'yes' : 'no');
      
      if (tempOTP) {
        console.log('Checking temp OTP:', { 
          provided: otp, 
          stored: tempOTP.otp, 
          expired: new Date() > tempOTP.otpExpires 
        });
        
        if (tempOTP.otp !== otp || new Date() > tempOTP.otpExpires) {
          return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 401 });
        }
        // OTP is valid for new signup - mark as verified but don't delete
        tempOTP.verified = true;
        tempOTP.otp = undefined; // Clear the OTP for security
        await tempOTP.save();
        console.log('Temp OTP verified and marked as verified');
        return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });
      }
    } catch (tempError) {
      console.error('Error checking temp OTP:', tempError);
      // Continue to check user OTP if temp OTP check fails
    }

    // Check existing user OTP (for existing user verification)
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid OTP or email not found' }, { status: 404 });
    }
    if (user.verified) {
      return NextResponse.json({ message: 'User already verified' }, { status: 200 });
    }
    if (user.otp !== otp || new Date() > user.otpExpires) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 401 });
    }
    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ message: 'Verification failed', error: err.message }, { status: 500 });
  }
}
