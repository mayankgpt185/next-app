import { Class } from '../models/class';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const classes = await Class.find({}).sort({ classNumber: 1 });
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}


