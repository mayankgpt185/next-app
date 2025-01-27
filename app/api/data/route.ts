import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb'; // Adjust the import path as needed
import UserModel from '../models/User'; // Replace with your Mongoose model

// GET API
export async function GET() {
  try {
    await dbConnect(); // Connect to the database
    const data = await UserModel.find({}); // Fetch data from the database
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST API
export async function POST(request: Request) {
  try {
    await dbConnect(); // Connect to the database
    const body = await request.json(); // Parse the request body
    const newData = await UserModel.create(body); // Insert data into the database
    return NextResponse.json(newData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to insert data' },
      { status: 500 }
    );
  }
}