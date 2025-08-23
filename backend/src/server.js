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

const corsOptions = {
  origin: ["https://aiclothify.vercel.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-CSRF-Token", "Authorization", "X-Requested-With"],
  exposedHeaders: ["set-cookie"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://api.dicebear.com"],
        connectSrc: [
          "'self'",
          ...(process.env.FRONTEND_URL || "http://localhost:5173").split(","),
          "https://api.dicebear.com",
          "https://aiclothify.vercel.app"
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET_KEY;
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const csrfProtection = csrf({
  cookie: {
    key: "_csrf",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 86400,
  },
});
app.use((req, res, next) => {
  if (
    req.path === '/api/csrf-token' || 
    req.path === '/api/health' ||
    req.path === '/api/heartbeat' ||
    req.method === 'GET'
  ) {
    return next();
  }
  
  csrfProtection(req, res, next);
});

app.get("/api/csrf-token", (req, res) => {
  const token = req.csrfToken();
  
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "https://aiclothify.vercel.app");
  res.json({ csrfToken: token });
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  skip: (req) => !!req.cookies.jwt,
});

app.use("/api", messageRouter);
app.use("/api/auth", globalLimiter);
app.use("/api/ai", globalLimiter);
app.use("/api/conversations", globalLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", supportRouter);
app.use("/api/ai", aiRoutes);
app.use("/api", conversationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/api/heartbeat", (req, res) => {
  if (req.session) req.session.touch();
  res.json({ status: "alive" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "https://aiclothify.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (err.code === "EBADCSRFTOKEN") {
    console.error("CSRF Token Error Details:", {
      sessionId: req.sessionID,
      url: req.url,
      method: req.method,
      hasSession: !!req.session
    });
    
    return res.status(403).json({
      message: "Invalid CSRF token",
      action: "Please refresh the page and try again",
    });
  }
  
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}, https://aiclothify.vercel.app`);
  if (process.env.NODE_ENV === "development") {
    console.log(`Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    console.log(`CSRF Token Endpoint: http://localhost:${PORT}/api/csrf-token`);
  }
});

connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
