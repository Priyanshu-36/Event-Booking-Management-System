import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middleware/auth.middlewares.js";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEventById,
} from "../controllers/events.controller.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();

router.route("/").get(verifyJWT, getAllEvents);
router.route("/:id").get(verifyJWT, getEventById);
router
  .route("/")
  .post(upload.single("image"), verifyJWT, verifyAdmin, createEvent);
router
  .route("/:id")
  .put(upload.single("image"), verifyJWT, verifyAdmin, updateEvent);
router.route("/:id").delete(verifyJWT, verifyAdmin, deleteEventById);

export default router;
