import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
export const dynamic = "force-dynamic";

/**
 * @method GET
 * @method POST
 * @returns NextResponse
 * @description Find All Prompts and return
 */
export const GET = async () => {
  await dbConnect();
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  await dbConnect();
  try {
    const { name } = await request.json();
    const user = await User.create({ name });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
};
