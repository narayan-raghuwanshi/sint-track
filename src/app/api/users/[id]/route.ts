import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (request: NextRequest) => {
  await dbConnect();

  try {
    // Get the user ID from the request URL
    const id = request.nextUrl.pathname.split("/").pop(); // Assumes the URL is of the form `/api/users/[id]`

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const { manualTime, reset } = await request.json();

    let updateData;
    if (reset) {
      updateData = { lastVideoAssignedAt: null };
    } else if (manualTime) {
      updateData = { lastVideoAssignedAt: new Date(manualTime) };
    } else {
      updateData = { lastVideoAssignedAt: new Date() };
    }

    // Update the user in the database
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the updated user object as a JSON response
    return NextResponse.json(user);
  } catch (error) {
    // Catch errors and return an error response
    return NextResponse.json(
      { message: "Error updating user", error: error },
      { status: 500 }
    );
  }
};
