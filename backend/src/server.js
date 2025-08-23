import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
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

const requiredEnvVars = ["JWT_SECRET_KEY", "FRONTEND_URL", "MONGODB_URI"];
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

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

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

app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60 
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

const csrfProtection = csrf({
  cookie: {
    key: "_csrf",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 86400,
  },
});

)
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


app.use(csrfProtection);

app.use((req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), {
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 86400,
  });
  next();
});

app.use(passport.initialize());
app.use(passport.session());


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", apiLimiter, aiRoutes);
app.use("/api/conversations", apiLimiter, conversationRoutes);
app.use("/api/chat", apiLimiter, chatRoutes);
app.use("/api", apiLimiter, messageRouter);
app.use("/api", apiLimiter, supportRouter);

app.get("/api/health", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  res.status(200).send(healthcheck);
});

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "../frontend/dist"), {
      setHeaders: (res, path) => {
        if (path.endsWith(".html")) {
          res.setHeader(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
          );
        }
      },
    })
  );
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      message: "Invalid CSRF token",
      action: "Please refresh the page and try again",
    });
  }
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

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
