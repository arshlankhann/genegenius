import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

export async function POST(request) {
  try {
    // Basic auth check (dev): allow missing/any token for now
    const auth = request.headers.get('authorization') || '';
    // In real life, verify Bearer token here

    // Read form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json({ message: 'multipart/form-data required' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData?.get('file');
    if (!file) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }

    // Drain the stream to avoid open handles (we don't store in dev)
    await file.arrayBuffer();

    return NextResponse.json({ message: 'Upload received', name: file.name, size: file.size }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
