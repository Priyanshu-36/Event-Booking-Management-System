import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import {
  registerUser,
  loginUser,
  verifyOTP,
} from "../controllers/auth.controller.js";

const router = Router();
// router.post("/register", upload.single("avatar"), registerUser);
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/verifyOTP").post(verifyOTP);

export default router;
