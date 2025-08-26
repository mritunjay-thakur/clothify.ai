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

app.use(
  helmet({
	@@ -63,21 +86,28 @@ app.use(
          ...(process.env.FRONTEND_URL || "http://localhost:5173").split(","),
          "https://api.dicebear.com",
          "https://*.ngrok.io",
        ],
      },
    },
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use(
  session({
	@@ -159,6 +189,14 @@ app.use((err, req, res, next) => {
      action: "Please refresh the page and try again",
    });
  }
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
	@@ -171,6 +209,7 @@ async function startServer() {

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
