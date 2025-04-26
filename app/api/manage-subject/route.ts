import dbConnect from "@/lib/mongodb";
import Subject from "../models/subject";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/api/models/user";
import { Course } from "../models/course";
import Session from "../models/session";
import { Section } from "../models/section";
import { UserJwtPayload } from "@/lib/auth";
import jwt from "jsonwebtoken";

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

    // Verify that class and section exist
    const courseExists = await Course.findById(data.courseId).where({
      clientOrganizationId,
    });
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

    const sectionIds = Array.isArray(data.sectionIds)
      ? data.sectionIds
      : [data.sectionIds];
    const sectionCount = await Section.countDocuments({
      _id: { $in: sectionIds },
    });

    if (sectionCount !== sectionIds.length) {
      return NextResponse.json(
        { error: "One or more sections not found" },
        { status: 400 }
      );
    }

    const subject = await Subject.create({
      subject: data.subject,
      courseId: data.courseId,
      staffIds: staffIds,
      academicYearId: data.academicYearId,
      sectionIds: sectionIds,
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
    const academicYear = searchParams.get("academicYear");
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    
    if (classId && sectionId) {
      // First, find all courses with the specified class ID
      const courses = await Course.find({
        class: classId,
        isActive: true,
      }).where({ clientOrganizationId });

      // Get the course IDs
      const courseIds = courses.map((course) => course._id);

      // Then find subjects that reference these courses and contain the section ID
      const subjects = await Subject.find({
        courseId: { $in: courseIds },
        sectionIds: { $in: [sectionId] },
        isActive: true,
      })
        .where({ clientOrganizationId })
        .populate("courseId")
        .populate("staffIds")
        .populate("academicYearId")
        .populate("sectionIds")
        .select("-__v");

      return NextResponse.json(subjects);
    } else if (id) {
      const subject = await Subject.findById(id)
        .where({ isActive: true })
        .where({ clientOrganizationId })
        .populate("courseId")
        .populate("staffIds")
        .populate("academicYearId")
        .populate("sectionIds")
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
        .where({ clientOrganizationId })
        .populate("courseId")
        .populate("staffIds")
        .populate("academicYearId")
        .populate("sectionIds")
        .select("-__v");

      return NextResponse.json(subjects);
    } else {
      const subjects = await Subject.find({})
        .where({ isActive: true })
        .where({ clientOrganizationId })
        .populate("courseId")
        .populate("staffIds")
        .populate("academicYearId")
        .populate("sectionIds")
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
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    // Find course by ID
    const courseExists = await Course.findById(data.courseId).where({
      clientOrganizationId,
    });
    const academicYearExists = await Session.findById(data.academicYearId).where({
      clientOrganizationId,
    });

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
    }).where({ clientOrganizationId });

    if (staffCount !== staffIds.length) {
      return NextResponse.json(
        { error: "One or more staff members not found" },
        { status: 400 }
      );
    }

    const sectionIds = Array.isArray(data.sectionIds)
      ? data.sectionIds.map(
          (section: { sectionId: string }) => section.sectionId
        )
      : [data.sectionIds.sectionId];
    const sectionCount = await Section.countDocuments({
      _id: { $in: sectionIds },
    }).where({ clientOrganizationId });

    if (sectionCount !== sectionIds.length) {
      return NextResponse.json(
        { error: "One or more sections not found" },
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
        sectionIds: sectionIds,
        modifiedDate: new Date(),
      },
      { new: true }
    )
      .where({ clientOrganizationId })
      .populate("courseId")
      .populate("staffIds")
      .populate("academicYearId")
      .populate("sectionIds");

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
  const token = await getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clientOrganizationId = token.clientOrganizationId;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const subject = await Subject.findByIdAndUpdate(id, {
      isActive: false,
    }).where({ clientOrganizationId });
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
