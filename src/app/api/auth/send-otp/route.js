import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

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

async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: 'GeneGenius OTP Verification',
    html: `<p>Your GeneGenius verification code is: <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`
  });
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = body;

    console.log('Send OTP request for email:', email);

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP:', otp, 'Expires:', otpExpires);

    // Store or update OTP for this email
    const tempOTPRecord = await TempOTP.findOneAndUpdate(
      { email },
      { otp, otpExpires, verified: false }, // Reset verified to false when new OTP is sent
      { upsert: true, new: true }
    );

    console.log('Stored temp OTP record:', tempOTPRecord);

    try {
      await sendOTPEmail(email, otp);
      console.log('OTP email sent successfully');
    } catch (mailErr) {
      console.error('Nodemailer sendOTPEmail error:', mailErr);
      return NextResponse.json({ message: 'Email sending error', error: mailErr.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully to your email.' }, { status: 200 });
  } catch (err) {
    console.error('Send OTP API error:', err);
    return NextResponse.json({ message: 'Unexpected error', error: err.message }, { status: 500 });
  }
}