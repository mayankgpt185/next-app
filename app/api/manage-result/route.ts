import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Result from "../models/result";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Check if a result with the same criteria already exists
    const existingResult = await Result.findOne({
      examDate: data.examDate,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
    });

    if (existingResult) {
      return NextResponse.json(
        {
          error:
            "A result for this exam date, class, section, and subject already exists",
        },
        { status: 409 }
      );
    }

    // Create the result document with the proper structure
    const result = await Result.create(data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/manage-result:", error);
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
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const subjectId = searchParams.get("subjectId");

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
    } else if (studentId && classId && sectionId) {
      // Find results for a specific student in a class and section
      const results = await Result.find({
        classId: classId,
        sectionId: sectionId,
        isActive: true,
        "results.studentId": studentId,
      }).select("-__v");

      const formattedResults = results.map((result) => {
        const studentResult = result.results.find(
          (r: any) => r.studentId.toString() === studentId
        );
        return {
          _id: result._id,
          examDate: result.examDate,
          subjectId: result.subjectId,
          totalMarks: result.totalMarks,
          passingMarks: result.passingMarks,
          studentMarks: studentResult?.marks || null,
          percentage: studentResult?.percentage || null,
          grade: studentResult?.grade || null,
          present: studentResult?.present || false,
          staffId: result.staffId,
        };
      });

      return NextResponse.json(formattedResults);
    } else if (classId && sectionId && subjectId) {
      // Find results for a specific subject in a class and section
      const results = await Result.find({
        classId: classId,
        sectionId: sectionId,
        isActive: true,
        subjectId: subjectId,
      })
      .populate({
        path: 'results.studentId',
        model: 'users'
      })
      .select("-__v");

      return NextResponse.json(results);
    }

    // If no specific query parameters are provided
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in GET /api/manage-result:", error);
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
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
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

    const result = await Result.findByIdAndUpdate(id, updateData, {
      new: true,
    });

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
