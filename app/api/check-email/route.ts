import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Staff from '../models/staff';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();
    const exists = await Staff.findOne({ email });
    return NextResponse.json(!!exists);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}