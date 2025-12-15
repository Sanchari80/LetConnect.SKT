const mongoose = require("mongoose");

const advertiseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    link: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "advertisements" }
);

module.exports = mongoose.model("Advertise", advertiseSchema);