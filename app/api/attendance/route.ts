import dbConnect from "@/lib/mongodb";
import Subject from "../models/subject";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/api/models/user";
import { Course } from "../models/course";
import Session from "../models/session";
import Attendance from "../models/attendance";

export async function POST(request: Request) {
  try {
    debugger;
    await dbConnect();
    const data = await request.json();
    debugger;

    // Verify that class and section exist
    const subjectExists = await Subject.findById(data.subjectId);
    const academicYearExists = await Session.findById(data.academicYearId);
    
    if (!subjectExists || !academicYearExists) {
      return NextResponse.json(
        { error: "Invalid subject or academic year" },
        { status: 400 }
      );
    }
    debugger;

    // Verify all staff IDs exist
    const studentIds = Array.isArray(data.studentAttendance)
      ? data.studentAttendance.map((student: { studentId: string }) => student.studentId)
      : [data.studentAttendance.studentId];
    const studentCount = await User.countDocuments({
      _id: { $in: studentIds },
    });

    if (studentCount !== studentIds.length) {
      return NextResponse.json(
        { error: "One or more students not found" },
        { status: 400 }
      );
    }
    debugger;

    const attendance = await Attendance.create({
      academicYearId: data.academicYearId,
      subjectId: data.subjectId,
      staffId: data.staffId,
      studentAttendance: data.studentAttendance,
      attendanceDate: data.attendanceDate,
      isActive: true,
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error in POST /api/attendance:", error);
    return NextResponse.json(
      { error: "Failed to create attendance" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const academicYear = searchParams.get("academicYear");
    if (id) {
      const subject = await Subject.findById(id)
        .where({ isActive: true })
        .populate("courseId")
        .populate("staffIds")
        .populate("academicYearId")
        .select("-__v");

      if (!subject) {
        return NextResponse.json(
          { error: "Subject not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(subject);
    } else if (academicYear) {
      const subjects = await Subject.find({
        academicYearId: academicYear,
        isActive: true,
      })
        .populate("courseId")
        .populate("staffIds")
        .populate("academicYearId")
        .select("-__v");

      return NextResponse.json(subjects);
    } else {
      const subjects = await Subject.find({})
        .where({ isActive: true })
        .populate("courseId")
        .populate("staffIds")
        .populate("academicYearId")
        .select("-__v");

      return NextResponse.json(subjects);
    }
  } catch (error) {
    console.error("Error in GET /api/manage-subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
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
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    // Find course by ID
    const courseExists = await Course.findById(data.courseId);
    const academicYearExists = await Session.findById(data.academicYearId);

    if (!courseExists || !academicYearExists) {
      return NextResponse.json(
        { error: "Invalid course or academic year" },
        { status: 400 }
      );
    }

    // Verify all staff IDs exist
    const staffIds = Array.isArray(data.staffIds)
      ? data.staffIds
      : [data.staffIds];
    const staffCount = await User.countDocuments({
      _id: { $in: staffIds },
    });

    if (staffCount !== staffIds.length) {
      return NextResponse.json(
        { error: "One or more staff members not found" },
        { status: 400 }
      );
    }

    const subject = await Subject.findByIdAndUpdate(
      id,
      {
        subject: data.subject,
        courseId: data.courseId,
        staffIds: staffIds,
        academicYearId: data.academicYearId,
        modifiedDate: new Date(),
      },
      { new: true }
    )
      .populate("courseId")
      .populate("staffIds")
      .populate("academicYearId");

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error in PUT /api/manage-subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const subject = await Subject.findByIdAndUpdate(id, { isActive: false });
    if (subject) {
      return NextResponse.json(subject, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "subject not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
