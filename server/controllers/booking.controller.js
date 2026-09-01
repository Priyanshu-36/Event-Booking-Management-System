// import User from "../models/User.model";
import Booking from "../models/booking.model.js";
import Otp from "../models/otp.model.js";
import Event from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendOTPEmail, sendBookingEmail } from "../utils/email.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendBookingOTP = async (req, res) => {
  try {
    const otp = generateOTP();
    await Otp.findOneAndDelete({ email: req.user.email, action: "book" });
    await Otp.create({
      email: req.user.email,
      otp,
      action: "book",
    });
    await sendOTPEmail(req.user.email, otp, "booking");
    res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to send OTP");
  }
};

const bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;
    const validOTP = await Otp.findOne({
      email: req.user.email,
      otp,
      action: "book",
    });
    if (!validOTP) {
      throw new ApiError(400, "Invalid OTP or expired OTP");
    }
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(400, "Event not found");
    }
    if (event.availableTickets <= 0) {
      throw new ApiError(400, "No tickets available");
    }
    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId: eventId,
    });
    if (existingBooking && existingBooking.status !== "rejected") {
      throw new ApiError(400, "You have already booked this event");
    }
    const booking = await Booking.create({
      userId: req.user._id,
      eventId: eventId,
      status: "pending",
      paymentStatus: "not_paid",
      amount: event.ticketPrice,
    });
    await Otp.deleteOne({ _id: validOTP._id });
    res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking request submitted"));
    // await event.updateOne({ $inc: { availableTickets: -1 } });
    // await sendBookingEmail(req.user.email, event, booking);
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to book event");
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate("eventId")
      .populate("userId");
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }
    if (booking.status === "approved") {
      throw new ApiError(400, "Booking already confirmed");
    }
    const event = await Event.findById(booking.eventId._id);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    if (event.availableTickets <= 0) {
      throw new ApiError(400, "No tickets available");
    }
    booking.status = "approved";
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    await booking.save();

    event.availableTickets -= 1;
    await event.save();
    await sendBookingEmail(
      booking.userId.email,
      booking.userId.name,
      booking.eventId.title,
    );
    res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking confirmed successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to confirm booking");
  }
};

const getMyBookings = async (req, res) => {
  try {
    const booking =
      req.user.role === "admin"
        ? await Booking.find()
            .populate("eventId")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
        : await Booking.find({ userId: req.user._id })
            .populate("eventId")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
    res
      .status(200)
      .json(new ApiResponse(200, booking, "Bookings fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch bookings");
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(403, "You are not authorized to cancel this booking");
    }
    if (booking.status === "cancelled") {
      throw new ApiError(400, "Booking already cancelled");
    }
    const wasConfirmed = booking.status === "confirmed";
    booking.status = "cancelled";
    await booking.save();
    if (wasConfirmed) {
      const event = await Event.findById(booking.eventId);
      event.availableTickets += 1;
      await event.save();
    }
    res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to cancel booking");
  }
};

export {
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
  sendBookingOTP,
};
