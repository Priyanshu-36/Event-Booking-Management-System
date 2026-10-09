import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eventora backend is healthy",
  });
});

//common middleware
app.use(express.json({ limit: "50mb" })); //Parses incoming JSON request body
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public")); //Serves files from public folder
app.use(cookieParser()); // we can acces cookies through req.cookies

//import routes
import authRouter from "./routes/auth.routes.js";
import bookingRouter from "./routes/bookings.routes.js";
import eventRouter from "./routes/events.routes.js";

//routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/events", eventRouter);
export { app };
