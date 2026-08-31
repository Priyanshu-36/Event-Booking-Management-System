import mongoose, { Schema } from "mongoose";
const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ["verify", "book"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 300,
  },
});
const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
