import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await dbConnect();
  try {
    const { manualTime, reset } = await request.json();
    const { id } = await params;

    const updateData = reset
      ? { lastVideoAssignedAt: null }
      : { lastVideoAssignedAt: new Date(manualTime || Date.now()) };

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating user", error },
      { status: 500 }
    );
  }
};
