import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Result from "../models/result";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    const result = await Result.create({
      staffId: data.staffId,
      studentId: data.studentId,
      subjectId: data.subjectId,
      examDate: data.examDate,
      examType: data.examType,
      marks: data.marks,
      totalMarks: data.totalMarks,
      grade: data.grade,
      percentage: data.percentage,
      resultStatus: data.resultStatus,
      attendanceStatus: data.attendanceStatus,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/result:", error);
    return NextResponse.json(
      { error: "Failed to create result" },
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
      const result = await Result.findById(id)
        .where({ isActive: true })
        .select("-__v");

      if (!result) {
        return NextResponse.json(
          { error: "Result not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(result);
    } else if (approverId) {
      const results = await Result.find({ approverId: approverId })
        .populate("staffId")
        .where({ isActive: true })
        .select("-__v");

      return NextResponse.json(results);
    }
  } catch (error) {
    console.error("Error in GET /api/result:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    if (!id) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    const resultExists = await Result.findById(id);

    if (!resultExists) {
      return NextResponse.json(
        { error: "Invalid result" },
        { status: 400 }
      );
    }

    let updateData: any = {};
    if (status && id) {
        updateData.status = status;
    } else {
      const data = await request.json();

      updateData = {
        approverId: data.approverId,
        examDate: data.examDate,
        examType: data.examType,
        marks: data.marks,
        totalMarks: data.totalMarks,
        grade: data.grade,
        percentage: data.percentage,
        resultStatus: data.resultStatus,
        attendanceStatus: data.attendanceStatus,
        modifiedDate: new Date(),
      };
    }

    const result = await Result.findByIdAndUpdate(id, updateData, { new: true });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PUT /api/result:", error);
    return NextResponse.json(
      { error: "Failed to update result" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const result = await Result.findByIdAndUpdate(id, { isActive: false });
    if (result) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Result not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
