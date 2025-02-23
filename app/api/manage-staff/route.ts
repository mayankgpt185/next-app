import dbConnect from "@/lib/mongodb";
import User from "@/app/api/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create new user with hashed password
    const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hashedPassword,
      address: body.address,
      role: body.role,
      dateJoined: body.dateJoined,
    };

    const user = await User.create(userData);
    const userResponse = user.toObject();
    // important to remove password from response
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user", details: error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const staffMember = await User.findById(id).select("-password -__v -role");
    if (staffMember) {
      return NextResponse.json(staffMember, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Staff member not found" },
        { status: 404 }
      );
    }
  } else {
    const role = searchParams.get("role");
    const staffMembers = await User.find({role: role})
      .select("-password -__v -role")
      .sort({ createdAt: -1 });
    return NextResponse.json(staffMembers, { status: 200 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    // Extract ID from query params (URL)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing staff ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if password is being sent in the request
    if (body.password) {
      return NextResponse.json(
        { error: "Password cannot be updated via this endpoint." },
        { status: 400 }
      );
    }

    const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      dateJoined: body.dateJoined,
    };

    const user = await User.findByIdAndUpdate(id, userData, { new: true });

    if (!user) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const staffMember = await User.findByIdAndDelete(id);
    if (staffMember) {
      return NextResponse.json(staffMember, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Staff member not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "No entry selected" },
      { status: 500 }
    );
  }
}
