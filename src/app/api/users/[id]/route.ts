import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const { manualTime } = await request.json();
    const updateData = manualTime
      ? { lastVideoAssignedAt: new Date(manualTime) }
      : { lastVideoAssignedAt: new Date() };

    const user = await User.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
}
