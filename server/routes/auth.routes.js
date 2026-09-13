import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import {
  registerUser,
  loginUser,
  verifyOTP,
  logoutUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middlewares.js";

const router = Router();
// router.post("/register", upload.single("avatar"), registerUser);
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/verifyOTP").post(verifyOTP);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
