import dbConnect from "@/lib/mongodb";
import User from "@/app/api/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Check if email already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists. Please use a different email address." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    let academicYearId = null;
    if (body.academicYearId) {
      academicYearId = body.academicYearId;
    }
    
    // Create new user with hashed password
    const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hashedPassword,
      address: body.address,
      role: body.role,
      dateJoined: body.dateJoined,
      academicYearId: academicYearId,
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
    const staffMember = await User.findById(id)
      // .where({ isActive: true })
      .select("-password -__v -role");
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
    const staffMembers = await User.find({ role: role, isActive: true })
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

    // Check if this is a profile image update
    if (body.imageData) {
      const user = await User.findByIdAndUpdate(
        id, 
        { profileImage: body.imageData },
        { new: true }
      ).select("-password -__v");
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      return NextResponse.json(user, { status: 200 });
    }

    // Check if this is a status message update
    if (body.statusMessage) {
      const user = await User.findByIdAndUpdate(
        id, 
        { statusMessage: body.statusMessage },
        { new: true }
      ).select("-password -__v");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user, { status: 200 });
    }

    // Check if this is a phone update
    if (body.phone) {
      const user = await User.findByIdAndUpdate(
        id, 
        { phone: body.phone },
        { new: true }
      ).select("-password -__v");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user, { status: 200 });
    }

    // Regular profile update
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
    const staffMember = await User.findByIdAndUpdate(id, { isActive: false });
    if (staffMember) {
      return NextResponse.json(staffMember, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Staff member not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
