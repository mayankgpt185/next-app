import dbConnect from "@/lib/mongodb";
import Course from "../models/course";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Class } from "../models/class";
import Section from "../models/section";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Verify that class and section exist
    const classExists = await Class.findById(data.classId);
    const sectionExists = await Section.findById(data.sectionId);

    if (!classExists || !sectionExists) {
      return NextResponse.json(
        { error: "Invalid class or section" },
        { status: 400 }
      );
    }

    const course = await Course.create({
      name: data.name,
      class: data.classId,
      section: data.sectionId
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
    const id = searchParams.get('id');

    if (id) {
      const course = await Course.findById(id)
        .populate('class')
        .populate('section')
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
        .populate('class')
        .populate('section')
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
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Find class and section by their IDs
    const classExists = await Class.findById(data.classId);
    const sectionExists = await Section.findById(data.sectionId);

    if (!classExists || !sectionExists) {
      return NextResponse.json(
        { error: "Invalid class or section" },
        { status: 400 }
      );
    }

    const course = await Course.findByIdAndUpdate(
      id,
      {
        name: data.name,
        class: data.classId,  // Use the ObjectId directly
        section: data.sectionId,  // Use the ObjectId directly
        modifiedDate: new Date()
      },
      { new: true }
    ).populate('class').populate('section');

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
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
    const course = await Course.findByIdAndDelete(id);
    if (course) {
      return NextResponse.json(course, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "course not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
