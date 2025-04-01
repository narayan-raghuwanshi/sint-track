import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

interface Context {
  params: { id: string }; // Define the expected structure
}

export async function PUT(request: Request, context: Context) {
  await dbConnect();
  try {
    const { manualTime, reset } = await request.json();
    const { id } = await context.params; // No need to await this, it's an object

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
}
