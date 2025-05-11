import dbConnect from "@/lib/mongodb";
import Course from "../models/course";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Class } from "../models/class";
import { UserJwtPayload } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { UserRole } from "@/lib/role";
import StudentClass from "../models/studentClass";
import toast from "react-hot-toast";
import Exam from "../models/exam";
import SeatingArrangement from "../models/seatingArrangement";
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    // Verify that class exist
    const examExists = await Exam.findById(data.examId);

    if (!examExists) {
      return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    }

    const seatingArrangement = await SeatingArrangement.create({
      examId: data.examId,
      sectionId: data.sectionId,
      venue: data.venue,
      isActive: true,
      addedDate: new Date()
    });

    return NextResponse.json(seatingArrangement);
  } catch (error) {
    console.error("Error in POST /api/seating-arrangement:", error);
    return NextResponse.json(
      { error: "Failed to create seating arrangement" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const studentId = searchParams.get("studentId");
    const role = searchParams.get("role");
    if(role === UserRole.STUDENT && studentId){
      const studentClass = await StudentClass.findOne({ studentId: studentId })
        .populate("class", "_id classNumber")
      if (studentClass) {
        const courses = await Course.find({
          class: studentClass.class,
        })
          .where({ isActive: true })
          .where({ class: studentClass.class._id })
        //   .where({ clientOrganizationId })
          .populate("class")
          .select("-__v");

        return NextResponse.json(courses);
      }
    }
    else if (id) {
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
    toast.error("Failed to fetch courses");
    console.error("Error in GET /api/manage-course:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const classExists = await Class.findById(data.classId).where({
    //   clientOrganizationId,
    });

    if (!classExists) {
      return NextResponse.json({ error: "Invalid class" }, { status: 400 });
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
    //   .where({ clientOrganizationId })
      .populate("class");

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    toast.error("Failed to update course");
    console.error("Error in PUT /api/manage-course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
//   const token = await getTokenFromRequest(req);
//   if (!token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   const clientOrganizationId = token.clientOrganizationId;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const course = await Course.findByIdAndUpdate(id, {
      isActive: false,
    });
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
