
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
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    console.log('User found, checking password...');
    console.log('User verified status:', user.verified);
    console.log('Stored password type:', typeof user.password);

    // Check if password is hashed or plain text
    let isPasswordValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Password is hashed
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (for backward compatibility)
      isPasswordValid = user.password === password;
    }

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.verified) {
      console.log('User not verified:', email);
      return NextResponse.json({ message: 'Please verify your email before logging in' }, { status: 403 });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      verified: user.verified
    };

    console.log('Login successful for user:', email);
    return NextResponse.json({ token, user: userResponse }, { status: 200 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Unexpected error', error: err.message }, { status: 500 });
  }
}
