import dbConnect from "@/lib/mongodb";
import StudentClass from "../models/studentClass";
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

    const studentClass = await StudentClass.create({
      studentId: data.studentId,
      class: data.classId,
      section: data.sectionId,
    });

    return NextResponse.json(studentClass);
  } catch (error) {
    console.error("Error in POST /api/student-class:", error);
    return NextResponse.json(
      { error: "Failed to create student class" },
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
    if (id) {
      const studentClass = await StudentClass.findById(id)
        .where({ isActive: true })
        .populate("class")
        .populate("section")
        .select("-__v");

      if (!studentClass) {
        return NextResponse.json(
          { error: "Student class not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(studentClass);
    } else if (studentId) {
      const studentClass = await StudentClass.findOne({ studentId })
        .where({ isActive: true })
        .populate("class")
        .populate("section")
        .select("-__v");

      return NextResponse.json(studentClass);
    } else if (classId && sectionId) {
      const studentClass = await StudentClass.find({
        class: classId,
        section: sectionId,
      })
        .where({ isActive: true })
        .populate("class")
        .populate("section")
        .select("-__v");

      return NextResponse.json(studentClass);
    } else {
      const studentClasses = await StudentClass.find({})
        .where({ isActive: true })
        .populate("class")
        .populate("section")
        .select("-__v");

      return NextResponse.json(studentClasses);
    }
  } catch (error) {
    console.error("Error in GET /api/student-class:", error);
    return NextResponse.json(
      { error: "Failed to fetch student classes" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const studentId = searchParams.get("studentId");
    const data = await request.json();

    if (!id && !studentId) {
      return NextResponse.json(
        { error: "Either student class ID or studentId is required" },
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

    if (id) {
      const studentClass = await StudentClass.findByIdAndUpdate(
        id,
        {
          studentId: data.studentId,
          class: data.classId, // Use the ObjectId directly
          section: data.sectionId, // Use the ObjectId directly
          modifiedDate: new Date(),
        },
        { new: true }
      )
        .populate("class")
        .populate("section");

      if (!studentClass) {
        return NextResponse.json(
          { error: "Student class not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(studentClass);
    } else if (studentId) {
      const studentClass = await StudentClass.findOneAndUpdate(
        { studentId },
        {
          class: data.classId,
          section: data.sectionId,
          modifiedDate: new Date(),
        },
        { new: true }
      )
        .populate("class")
        .populate("section");

      if (!studentClass) {
        return NextResponse.json(
          { error: "Student class not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(studentClass);
    }
  } catch (error) {
    console.error("Error in PUT /api/student-class:", error);
    return NextResponse.json(
      { error: "Failed to update student class" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const studentClass = await StudentClass.findByIdAndUpdate(id, {
      isActive: false,
    });
    if (studentClass) {
      return NextResponse.json(studentClass, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "student class not found to delete" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json({ error: "No entry selected" }, { status: 500 });
  }
}
