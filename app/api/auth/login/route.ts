import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "../../../../lib/mongodb"; // Adjust the import path as needed
import User from "../../models/user";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    await dbConnect(); // Connect to the database

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      id: existingUser._id.toString(),
      email: existingUser.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);      

    // Set cookie
    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    const { password: _, ...userWithoutPassword } = existingUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the user" },
      { status: 500 }
    );
  }
}
