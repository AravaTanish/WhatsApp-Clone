import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,

    userId: {
      type: String,
      unique: true,
      sparse: true,
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    emailOtp: {
      type: String,
      select: false,
      default: null,
    },

    emailOtpExpiry: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    profilePicture: {
      url: String,
      publicId: String,
    },
    about: String,

    lastSeen: Date,

    agreedToTerms: {
      type: Boolean,
      default: false,
    },

    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    friendRequests: {
      sent: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      received: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
