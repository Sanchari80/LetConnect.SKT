const mongoose = require("mongoose");

const cvSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ File info
    FileName: {
      type: String,
      required: true,
    },
    FileType: {
      type: String,
      default: "",
    },
    FileSize: {
      type: Number,
      default: 0,
    },
    UploadedAt: {
      type: Date,
      default: Date.now,
    },

    // ✅ CV details
    Name: {
      type: String,
      trim: true,
    },
    Email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    Education: {
      type: String,
      trim: true,
    },
    Experience: {
      type: String,
      trim: true,
    },
    Skills: [
      {
        type: String,
        trim: true,
      },
    ],
    CoverLetter: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, collection: "cvs" }
);

module.exports = mongoose.model("CV", cvSchema);