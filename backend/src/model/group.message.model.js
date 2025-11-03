import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
    systemMessageType: {
      type: String,
      enum: ["join", "leave", null],
    },
  },
  { timestamps: true }
);

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

export default GroupMessage;
