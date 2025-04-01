import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  { params }: { params: { id: string } },
  request: NextRequest
) => {
  await dbConnect();
  try {
    const { manualTime, reset } = await request.json();
    const { id } = await params; // `params` is now correctly typed

    let updateData;
    if (reset) {
      updateData = { lastVideoAssignedAt: null };
    } else if (manualTime) {
      updateData = { lastVideoAssignedAt: new Date(manualTime) };
    } else {
      updateData = { lastVideoAssignedAt: new Date() };
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating user", error: error },
      { status: 500 }
    );
  }
};
