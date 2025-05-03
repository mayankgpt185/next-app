import { Room } from "../models/rooms";
import { NextRequest, NextResponse } from "next/server";
import { UserJwtPayload } from "@/lib/auth";
import jwt from "jsonwebtoken";

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

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clientOrganizationId = token.clientOrganizationId;
    const rooms = await Room.find({
      clientOrganizationId: { $in: [clientOrganizationId] }
    }).sort({ room: 1 });
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
