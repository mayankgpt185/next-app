import dbConnect from "@/lib/mongodb";
import Subject from "../models/subject";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/api/models/user";
import { Course } from "../models/course";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Verify that class and section exist
    const courseExists = await Course.findById(data.courseId);
    const staffExists = await User.findById(data.staffId);

    if (!courseExists || !staffExists) {
      return NextResponse.json(
        { error: "Invalid course or staff" },
        { status: 400 }
      );
    }

    const subject = await Subject.create({
      subject: data.subject,
      courseId: data.courseId,
      staffId: data.staffId
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error in POST /api/manage-subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const subject = await Subject.findById(id)
        .where({ isActive: true })
        .populate('courseId')
        .populate('staffId')
        .select("-__v");

      if (!subject) {
        return NextResponse.json(
            { error: "Subject not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(subject);
    } else {
      const subjects = await Subject.find({})
        .populate('courseId')
        .populate('staffId')
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
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    // Find class and section by their IDs
    const courseExists = await Course.findById(data.courseId);
    const staffExists = await User.findById(data.staffId);

    if (!courseExists || !staffExists) {
      return NextResponse.json(
        { error: "Invalid course or staff" },
        { status: 400 }
      );
    }

    const subject = await Subject.findByIdAndUpdate(
      id,
      {
        subject: data.subject,
        courseId: data.courseId,  // Use the ObjectId directly
        staffId: data.staffId,  // Use the ObjectId directly
        modifiedDate: new Date()
      },
      { new: true }
    ).populate('courseId').populate('staffId');

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
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
