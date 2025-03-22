import dbConnect from "@/lib/mongodb";
import Course from "../models/course";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Class } from "../models/class";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Verify that class exist
    const classExists = await Class.findById(data.classId);

    if (!classExists) {
      return NextResponse.json(
        { error: "Invalid class" },
        { status: 400 }
      );
    }

    const course = await Course.create({
      name: data.name,
      class: data.classId,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error in POST /api/manage-course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
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
      const course = await Course.findById(id)
        .where({ isActive: true })
        .populate("class")
        .select("-__v");

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(course);
    } else {
      const courses = await Course.find({})
        .where({ isActive: true })
        .populate("class")
        .select("-__v");

      return NextResponse.json(courses);
    }
  } catch (error) {
    console.error("Error in GET /api/manage-course:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
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
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Find class by its ID
    const classExists = await Class.findById(data.classId);

    if (!classExists) {
      return NextResponse.json(
        { error: "Invalid class" },
        { status: 400 }
      );
    }

    const course = await Course.findByIdAndUpdate(
      id,
      {
        name: data.name,
        class: data.classId, // Use the ObjectId directly
        modifiedDate: new Date(),
      },
      { new: true }
    )
      .populate("class");

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error in PUT /api/manage-course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const course = await Course.findByIdAndUpdate(id, { isActive: false });
    if (course) {
      return NextResponse.json(course, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Course not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
