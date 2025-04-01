import { Schema, model, models } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  lastVideoAssignedAt: Date | null;
  createdAt: Date;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  lastVideoAssignedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || model("User", userSchema);
