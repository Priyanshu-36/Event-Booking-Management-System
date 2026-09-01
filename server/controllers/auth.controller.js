import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { sendBookingEmail, sendOTPEmail } from "../utils/email.js";
import Otp from "../models/otp.model.js";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if ([name, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    email,
  });
  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }
  const avatarLocalPath = req.file?.path;

  // console.log("Avatar path:", avatarLocalPath);
  // console.log(avatarLocalPath);
  let avatar;
  let avatarPublicId;
  try {
    const result = await uploadOnCloudinary(avatarLocalPath);
    avatar = result.url;
    avatarPublicId = result.public_id;
    console.log("Uploaded Avatar");
  } catch (error) {
    console.log("Error uploading avatar", error);
    throw new ApiError(500, "Failed to upload avater");
  }
  try {
    const user = await User.create({
      name,
      email,
      password,
      avatar,
      avatarPublicId,
    });
    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }
    const otp = generateOTP();
    console.log(`OTP for ${email} is ${otp}`);

    await Otp.create({
      email,
      otp,
      action: "verify",
    });
    await sendOTPEmail(email, otp, "account_verification");

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdUser,
          "User registered Successfully. Please check your email for OTP to verify your account",
        ),
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while registering user",
    );
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const GenerateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found"); //Because ApiError is a class, and new creates an object (instance) of that class.
    }
    const accessToken = user.generateAccessToken(); //Used for API requests
    const refreshToken = user.generateRefreshToken(); //Used to generate new access tokens
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message || "Token generation failed");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User not found ,Register First");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  if (!user.isVerified && user.role !== "admin") {
    const otp = generateOTP();
    await Otp.findOneAndDelete({ email, action: "verify" });
    await Otp.create({
      email,
      otp,
      action: "verify",
    });
    await sendOTPEmail(email, otp, "account_verification");

    throw new ApiError(
      400,
      "Your account is not verified. Please check your email for OTP to verify your account",
    );
  }

  const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(
    user._id,
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in user");
  }
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const validOtp = await Otp.findOne({ email, otp, action: "verify" });
    if (!validOtp) {
      throw new ApiError(400, "Invalid OTP or expired OTP");
    }
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { returnDocument: "after" },
    );
    await Otp.deleteOne({ _id: validOtp._id });
    const verifiedUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
    res
      .status(200)
      .json(new ApiResponse(200, verifiedUser, "User verified successfully"));
  } catch (error) {}
};

export {
  registerUser,
  loginUser,
  verifyOTP,
  GenerateAccessAndRefreshToken,
  generateOTP,
};
