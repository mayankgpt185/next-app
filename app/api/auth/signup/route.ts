import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb"; // Adjust the import path as needed
import User from "../../models/user"; // Import the User model
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    await dbConnect(); // Connect to the database

    const { firstName, lastName, email, password, tenantId, address, dateJoined, role } = await request.json();

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
    
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      address: address || '',
      role: role,
      dateJoined: dateJoined ? new Date(dateJoined) : new Date(),
      isActive: true
    };
    
    const newUser = new User({
      ...userData,
      ...(tenantId ? { tenantId } : {}),
    });
    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { message: "User created successfully", user: userResponse },
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
