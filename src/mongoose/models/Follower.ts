import { Model, model, models } from "mongoose";
import { IFollower } from "@/types/user.types";
import followerSchema from "../schemas/followerSchema";

const Follower =
  (models.Follower as Model<IFollower>) ||
  model<IFollower>("Follower", followerSchema);

export default Follower;
