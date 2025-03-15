import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Session from "../models/session";
export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    const session = await Session.create({
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
      addedDate: new Date(),
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error saving session", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const session = await Session.findById(id)
        .where({ isActive: true })
        .select("-__v");

      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(session);
    } else {
      const sessions = await Session.find({})
        .where({ isActive: true })
        .select("-__v");

      return NextResponse.json(sessions);
    }
  } catch (error) {
    console.error("Error in GET /api/session:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await Session.findByIdAndUpdate(
      id,
      {
        startDate: data.startDate,
        endDate: data.endDate,
        modifiedDate: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error in PUT /api/session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const session = await Session.findByIdAndUpdate(id, { isActive: false });
    if (session) {
      return NextResponse.json(session, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "session not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
