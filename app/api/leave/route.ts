import dbConnect from "@/lib/mongodb";
import Leave from "../models/leave";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    const leave = await Leave.create({
      staffId: data.staffId,
      approverId: data.approverId,
      leaveFromDate: data.leaveFromDate,
      leaveToDate: data.leaveToDate,
      reason: data.reason,
    });

    return NextResponse.json(leave);
  } catch (error) {
    console.error("Error in POST /api/leave:", error);
    return NextResponse.json(
      { error: "Failed to create leave" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const approverId = searchParams.get("approverId");
    if (id) {
      const leave = await Leave.findById(id)
        .where({ isActive: true })
        .select("-__v");

      if (!leave) {
        return NextResponse.json(
          { error: "Leave not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(leave);
    } else if (approverId) {
      const leaves = await Leave.find({ approverId: approverId })
        .populate("staffId")
        .where({ isActive: true })
        .select("-__v");

      return NextResponse.json(leaves);
    }
  } catch (error) {
    console.error("Error in GET /api/leave:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaves" },
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
        { error: "Leave ID is required" },
        { status: 400 }
      );
    }

    // Find class by its ID
    const leaveExists = await Leave.findById(data.leaveId);

    if (!leaveExists) {
      return NextResponse.json(
        { error: "Invalid leave" },
        { status: 400 }
      );
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      {
        staffId: data.staffId,
        approverId: data.approverId,
        leaveDate: data.leaveDate,
        reason: data.reason,
        modifiedDate: new Date(),
      },
      { new: true }
    );

    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    return NextResponse.json(leave);
  } catch (error) {
    console.error("Error in PUT /api/leave:", error);
    return NextResponse.json(
      { error: "Failed to update leave" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const leave = await Leave.findByIdAndUpdate(id, { isActive: false });
    if (leave) {
      return NextResponse.json(leave, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Leave not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
