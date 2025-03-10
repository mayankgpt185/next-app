import dbConnect from "@/lib/mongodb";
import Section from "@/app/api/models/section";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const sections = await Section.find().sort({ section: 1 });
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}


