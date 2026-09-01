import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middleware/auth.middlewares.js";
import {
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
  sendBookingOTP,
} from "../controllers/booking.controller.js";

const router = Router();

router.route("/send-otp").post(verifyJWT, sendBookingOTP);//generates an OTP and sends it to the user's email.
router.route("/book").post(verifyJWT, bookEvent);//server verifies the OTP and creates a pending booking.
router.route("/:id/confirm").post(verifyJWT, verifyAdmin, confirmBooking);//only an authenticated admin can confirm a booking.
router.route("/my-bookings").get(verifyJWT, getMyBookings);//Logged-in users can see their bookings.Admins see all bookings.
router.route("/cancel/:id").delete(verifyJWT, cancelBooking);//Logged-in user can cancel their own booking.Admin can cancel any booking.

export default router;
