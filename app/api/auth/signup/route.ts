import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb"; // Adjust the import path as needed
import User from "../../models/user"; // Import the User model
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    await dbConnect(); // Connect to the database

    const { name, email, password } = await request.json();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    // const newUser = new User({ name, email, password });
    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the user" },
      { status: 500 }
    );
  }
}
