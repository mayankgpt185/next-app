import dbConnect from "@/lib/mongodb";
import User from "@/app/api/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "@/lib/auth";
import { UserRole } from "@/lib/role";

// Helper function to get token from request
const getTokenFromRequest = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No auth header or not Bearer");
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify and decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserJwtPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from the request cookies instead of localStorage
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clientOrganizationId = token.clientOrganizationId;

    const body = await request.json();

    // Check if email already exists
    const existingUser = await User.findOne({ email: body.email }).where({
      clientOrganizationId,
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email already exists. Please use a different email address.",
        },
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
      clientOrganizationId: clientOrganizationId,
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

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get the URL object
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clientOrganizationId = token.clientOrganizationId;
    const userRole = token.role;

    if (id) {
      // If ID is provided, fetch a specific staff member
      const staffMember = await User.findById(id)
        .where({ clientOrganizationId })
        .select("-password -__v")
        // .populate({
        //   path: "clientOrganizationId",
        //   populate: [
        //     { path: "clientId", select: "clientName" },
        //     { path: "organizationId", select: "organizationName" },
        //   ],
        // });

      if (!staffMember) {
        return NextResponse.json(
          { error: "Staff member not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(staffMember, { status: 200 });
    } else if (role) {
      // If user has super role, don't filter by clientOrganizationId
      let query = User.find({ role: role, isActive: true });
      
      // Only add clientOrganizationId filter for non-super users
      if (userRole !== UserRole.SUPER) {
        query = query.where({ clientOrganizationId });
      } else {
        // query = query.populate({
        //   path: "clientOrganizationId",
        //   populate: [
        //     { path: "clientId", select: "clientName" },
        //     { path: "organizationId", select: "organizationName" },
        //   ],
        // });
      }
      
      const staffMembers = await query
        .select("-password -__v")
        .sort({ createdAt: -1 });

      return NextResponse.json(staffMembers, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error fetching staff members:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Extract ID from query params (URL)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clientOrganizationId = token.clientOrganizationId;

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
      )
        .where({ clientOrganizationId })
        .select("-password -__v");

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
      )
        .where({ clientOrganizationId })
        .select("-password -__v");

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
      )
        .where({ clientOrganizationId })
        .select("-password -__v");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user, { status: 200 });
    }

    // Check if this is an address update
    if (body.address) {
      const user = await User.findByIdAndUpdate(
        id,
        { address: body.address },
        { new: true }
      )
        .where({ clientOrganizationId })
        .select("-password -__v");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user, { status: 200 });
    }

    // Check if this is an about me update
    if (body.aboutMe) {
      const user = await User.findByIdAndUpdate(
        id,
        { aboutMe: body.aboutMe },
        { new: true }
      )
        .where({ clientOrganizationId })
        .select("-password -__v");

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

    const user = await User.findByIdAndUpdate(id, userData, {
      new: true,
    }).where({ clientOrganizationId });

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
  const token = await getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clientOrganizationId = token.clientOrganizationId;

  if (id && clientOrganizationId) {
    const staffMember = await User.findByIdAndUpdate(id, {
      isActive: false,
    }).where({ clientOrganizationId });
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
