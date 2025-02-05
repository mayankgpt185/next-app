import { NextResponse } from 'next/server';
import Staff from '../models/staff';
import dbConnect from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const staff = await Staff.create(body);
    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 400 }
    );
  }
}