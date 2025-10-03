import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // For JWT, logout is primarily handled client-side by removing the token
    // The server can optionally implement token blacklisting for enhanced security
    
    console.log('User logout request');
    
    // You could add token blacklisting logic here if needed:
    // 1. Extract token from Authorization header
    // 2. Add it to a blacklist database/cache
    // 3. Check blacklist during token verification
    
    return NextResponse.json({ 
      message: 'Logged out successfully',
      success: true 
    }, { status: 200 });
    
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ 
      message: 'Logout failed', 
      error: err.message 
    }, { status: 500 });
  }
}
