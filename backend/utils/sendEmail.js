import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createLogger, format, transports } from "winston";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const logger = createLogger({
  transports: [new transports.Console()],
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
});

const validateEnv = () => {
  const required = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS"];
  const missing = required.filter((field) => !process.env[field]);
  if (missing.length) {
    throw new Error(`Missing email config: ${missing.join(", ")}`);
  }
};

const sendEmail = async (options) => {
  try {
    validateEnv();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
      connectionTimeout: 10000,
    });

    const mailOptions = {
      from: `"Clothify 👕" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "ClothifyMailer",
      },
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(
      `✅ Email sent to ${options.email} | Subject: ${options.subject}`
    );

    if (process.env.NODE_ENV === "development") {
      logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    logger.error(`❌ Email send failed: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv[1] === __filename) {
  (async () => {
    try {
      await sendEmail({
        email: process.env.TEST_EMAIL || "test@example.com",
        subject: "Clothify Email Service Test",
        message: "This is a test of the Clothify email system",
        html: "<strong>This is a test of the Clothify email system</strong>",
      });
      process.exit(0);
    } catch (error) {
      console.error("❌ Email test failed:", error);
      process.exit(1);
    }
  })();
}

export default sendEmail;
