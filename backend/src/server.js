import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import session from "express-session";
import passport from "passport";
import csrf from "csurf";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";

import "./config/passport.js";
import supportRouter from "./routes/support.route.js";
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import aiRoutes from "./routes/ai.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import messageRouter from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";

// Check env vars
const requiredEnvVars = ["JWT_SECRET_KEY", "FRONTEND_URL"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingEnvVars.length > 0) {
  console.error(`Missing environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// ---------- CORS ----------
app.use(
  cors({
    origin: [
      ...(process.env.FRONTEND_URL || "http://localhost:5173").split(","),
      "https://*.ngrok.io",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "X-CSRF-Token",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
    exposedHeaders: ["set-cookie"],
  })
);

// ---------- Security ----------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          ...(process.env.FRONTEND_URL || "http://localhost:5173").split(","),
          "https://api.dicebear.com",
          "https://*.ngrok.io",
        ],
      },
    },
  })
);

// Private network header
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

// ---------- Middleware ----------
app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());
app.use(express.json());

// ---------- Sessions ----------
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// ---------- Passport ----------
app.use(passport.initialize());
app.use(passport.session());

// ---------- CSRF ----------
const csrfProtection = csrf({ cookie: true });

// Skip CSRF for auth routes (login/logout)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/auth")) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// ---------- Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/support", supportRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/messages", messageRouter);

// Endpoint to fetch CSRF token
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ---------- Error Handling ----------
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      message: "Invalid CSRF Token",
      action: "Please refresh the page and try again",
    });
  }
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

// ---------- Start Server ----------
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
        );
        console.log(
          `CSRF Token Endpoint: http://localhost:${PORT}/api/csrf-token`
        );
      }
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

startServer();
