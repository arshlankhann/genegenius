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

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ 
        exists: false,
        message: 'User not found' 
      }, { status: 404 });
    }

    const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    
    return NextResponse.json({ 
      exists: true,
      verified: user.verified,
      passwordHashed: isPasswordHashed,
      passwordLength: user.password.length,
      createdAt: user.createdAt
    }, { status: 200 });

  } catch (err) {
    console.error('Check user error:', err);
    return NextResponse.json({ message: 'Error checking user', error: err.message }, { status: 500 });
  }
}