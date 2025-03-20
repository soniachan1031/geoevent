import { Model, model, models } from "mongoose";
import { IUser } from "@/types/user.types";
import userSchema from "../schemas/user/userSchema";

const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
