import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Class } from "../models/class";
import { UserJwtPayload } from "@/lib/auth";
import jwt from "jsonwebtoken";
import Exam from "../models/exam";
import Session from "../models/session";
import Subject from "../models/subject";
import "@/app/api/models/examType";

const getTokenFromRequest = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No auth header or not Bearer");
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify and decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserJwtPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clientOrganizationId = token.clientOrganizationId;
    const data = await request.json();

    // Verify that class exist
    const classExists = await Class.findById(data.classId).where({
      clientOrganizationId,
    });

    const academicYearExists = await Session.findById(
      data.academicYearId
    ).where({
      clientOrganizationId,
    });

    const subjectExists = await Subject.findById(data.subjectId).where({
      clientOrganizationId,
    });

    if (!classExists || !academicYearExists || !subjectExists) {
      return NextResponse.json(
        { error: "Invalid class or academic year or subject" },
        { status: 400 }
      );
    }

    const existingExam = await Exam.findOne({
      examType: data.examType,
      classId: data.classId,
      academicYearId: data.academicYearId,
      examDate: data.examDate,
      isActive: true,
      clientOrganizationId,
    });

    if (existingExam) {
      return NextResponse.json(
        {
          error:
            "An exam of this type is already scheduled for this date and class. Please choose a different date.",
        },
        { status: 409 }
      );
    }

    const exam = await Exam.create({
      examType: data.examType,
      examDate: data.examDate,
      classId: data.classId,
      subjectId: data.subjectId,
      academicYearId: data.academicYearId,
      clientOrganizationId,
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error in POST /api/manage-exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clientOrganizationId = token.clientOrganizationId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const academicYearId = searchParams.get("academicYearId");
    const classId = searchParams.get("classId");
    const examType = searchParams.get("examType");

    if (id && academicYearId && classId && examType) {
      const exam = await Exam.findById(id)
        .where({ isActive: true })
        .where({ clientOrganizationId })
        .where({ academicYearId })
        .where({ classId })
        .where({ examType })
        .populate("classId")
        .populate("subjectId")
        .populate("academicYearId")
        .populate("examType")
        .select("-__v");

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      return NextResponse.json(exam);
    } else if (academicYearId && classId && examType) {
      const exams = await Exam.find({})
        .where({ isActive: true })
        .where({ clientOrganizationId })
        .where({ academicYearId })
        .where({ classId })
        .where({ examType })
        .populate("classId", "_id classNumber")
        .populate("subjectId", "_id subject")
        .populate("examType", "_id type")
        .select("-__v");

      return NextResponse.json(exams);
    } else if (academicYearId && classId) {
      const exams = await Exam.find({})
        .where({ isActive: true })
        .where({ clientOrganizationId })
        .where({ academicYearId })
        .where({ classId })
        .populate("classId", "_id classNumber")
        .populate("subjectId", "_id subject")
        .populate("examType", "_id type")
        .select("-__v");

      return NextResponse.json(exams);
    } else if (academicYearId) {
      const exams = await Exam.find({})
        .where({ isActive: true })
        .where({ clientOrganizationId })
        .where({ academicYearId })
        .populate("classId", "_id classNumber")
        .populate("subjectId", "_id subject")
        .populate("examType", "_id type")
        .select("-__v");

      return NextResponse.json(exams);
    }
  } catch (error) {
    console.error("Error in GET /api/manage-exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clientOrganizationId = token.clientOrganizationId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Find class by its ID
    const classExists = await Class.findById(data.classId).where({
      clientOrganizationId,
    });

    if (!classExists) {
      return NextResponse.json({ error: "Invalid class" }, { status: 400 });
    }

    const course = await Exam.findByIdAndUpdate(
      id,
      {
        examType: data.examType,
        class: data.classId, // Use the ObjectId directly
        modifiedDate: new Date(),
      },
      { new: true }
    )
      .where({ clientOrganizationId })
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
  const token = await getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clientOrganizationId = token.clientOrganizationId;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const course = await Exam.findByIdAndUpdate(id, {
      isActive: false,
    }).where({ clientOrganizationId });
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
