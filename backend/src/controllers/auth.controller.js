import sendEmail from "../../utils/sendEmail.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const tempUsers = new Map();

async function handleOTP(userData, context = "verification", userId = null) {
  const key = userId ? userId.toString() : userData.email;
  const now = Date.now();

  for (const [key, value] of tempUsers.entries()) {
    if (value.otpExpiry < now) {
      tempUsers.delete(key);
    }
  }

  let existingTemp = tempUsers.get(key);

  if (existingTemp && existingTemp.context !== context) {
    tempUsers.delete(key);
    existingTemp = null;
  }

  const cooldown = 120000;

  if (existingTemp) {
    const lastSent = existingTemp.otpLastSent;
    if (now - lastSent < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastSent)) / 1000);
      return {
        success: false,
        message: `Please wait ${remaining} seconds before requesting a new OTP`,
      };
    }
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = now + 10 * 60 * 1000;

  tempUsers.set(key, {
    ...userData,
    otp,
    otpExpiry,
    otpLastSent: now,
    context,
    userId: userId ? userId.toString() : userData.email,
  });

  let subject, message;
  switch (context) {
    case "signup":
      subject = "Your Clothify Account Verification Code";
      message = `Your signup OTP is: ${otp}. It will expire in 10 minutes.`;
      break;
    case "password-change":
      subject = "Your Password Change Verification Code";
      message = `Your password change OTP is: ${otp}. It will expire in 10 minutes.`;
      break;
    case "email-change":
      subject = "Your Email Change Verification Code";
      message = `Your email change OTP is: ${otp}. It will expire in 10 minutes.`;
      break;
    case "account-deletion":
      subject = "Your Account Deletion Verification Code";
      message = `Your account deletion OTP is: ${otp}. It will expire in 10 minutes.`;
      break;
    case "password-reset":
      subject = "Your Password Reset Verification Code";
      message = `Your password reset OTP is: ${otp}. It will expire in 10 minutes.`;
      break;
    default:
      subject = "Your Clothify Verification Code";
      message = `Your OTP is: ${otp}. It will expire in 10 minutes.`;
  }

  await sendEmail({
    email: userData.email,
    subject,
    message,
  });

  return { success: true };
}
async function signup(req, res) {
  const { email, password, fullName, csrfToken } = req.body;

  try {
    if (!email || !password || !fullName || !csrfToken) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, please use a different one" });
    }

    if (tempUsers.has(email)) {
      const tempUser = tempUsers.get(email);
      if (tempUser.context === "signup" && tempUser.otpExpiry > Date.now()) {
        return res.status(400).json({
          message: "OTP already sent, please verify or wait for expiry",
        });
      }
    }

    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;
    const tempUserData = {
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    };

    const otpResponse = await handleOTP(tempUserData, "signup");
    if (!otpResponse.success) {
      return res.status(429).json({ message: otpResponse.message });
    }

    res.status(201).json({
      success: true,
      message: "OTP sent to email for verification",
      userId: email,
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function verifyOtp(req, res) {
  const { userId, otp } = req.body;

  try {
    const tempUser = tempUsers.get(userId);
    if (!tempUser) {
      return res
        .status(404)
        .json({ message: "User data not found or expired" });
    }

    if (
      !tempUser.otp ||
      tempUser.otp !== otp ||
      tempUser.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (tempUser.context === "signup") {
      const newUser = await User.create({
        email: tempUser.email,
        fullName: tempUser.fullName,
        password: tempUser.password,
        profilePic: tempUser.profilePic,
        isVerified: true,
      });

      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });

      tempUsers.delete(userId);

      res.status(200).json({
        success: true,
        message: "OTP verified successfully, user created and logged in",
        user: {
          _id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          profilePic: newUser.profilePic,
        },
      });
    } else if (
      tempUser.context === "password-reset" ||
      tempUser.context === "password-change"
    ) {
      const user = await User.findById(tempUser.userId);
      if (!user) {
        tempUsers.delete(userId);
        return res.status(404).json({ message: "User not found" });
      }

      user.password = tempUser.newPassword;
      await user.save();

      tempUsers.delete(userId);

      res.status(200).json({
        success: true,
        message:
          tempUser.context === "password-reset"
            ? "Password reset successful"
            : "Password changed successfully",
      });
    } else {
      return res.status(400).json({ message: "Invalid OTP context" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { email, password, csrfToken } = req.body;

    if (!email || !password || !csrfToken) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your email first.",
        userId: user._id,
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

function logout(req, res) {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("jwt", {
    path: "/",
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });
  res.clearCookie("XSRF-TOKEN", {
    path: "/",
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });
  res.status(200).json({ success: true, message: "Logout successful" });
}

async function editProfile(req, res) {
  console.log("editProfile request body:", req.body);
  try {
    const { _id: userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const { newName, newEmail, newPassword, deleteAccount, otp, oldPassword } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sensitiveAction =
      (newEmail && newEmail !== user.email) || newPassword || deleteAccount;

    if (sensitiveAction && !otp) {
      const emailToSendOTP = newEmail ? newEmail : user.email;

      const tempUserData = {
        email: emailToSendOTP,
        newPassword: newPassword || undefined,
        newEmail: newEmail || undefined,
        deleteAccount: deleteAccount || false,
        userId,
      };

      const otpResponse = await handleOTP(
        tempUserData,
        newPassword
          ? "password-change"
          : deleteAccount
          ? "account-deletion"
          : "email-change",
        userId
      );
      if (!otpResponse.success) {
        return res.status(429).json({ message: otpResponse.message });
      }

      return res.status(200).json({
        success: true,
        message: "OTP sent to email. Please verify to continue.",
        otpRequired: true,
        userId,
      });
    }

    if (sensitiveAction && otp) {
      const tempUser = tempUsers.get(userId);
      if (
        !tempUser ||
        tempUser.otp !== otp ||
        tempUser.otpExpiry < Date.now()
      ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      if (tempUser.deleteAccount) {
        await user.deleteOne();
        tempUsers.delete(userId);
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("jwt", {
          path: "/",
          sameSite: isProduction ? "none" : "lax",
          secure: isProduction,
        });
        return res
          .status(200)
          .json({ success: true, message: "Account deleted successfully" });
      }

      if (tempUser.newEmail && tempUser.newEmail !== user.email) {
        const existingUser = await User.findOne({ email: tempUser.newEmail });
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(tempUser.newEmail)) {
          return res.status(400).json({ message: "Invalid email format" });
        }

        user.email = tempUser.newEmail.toLowerCase();
      }

      if (tempUser.newPassword) {
        if (tempUser.newPassword.length < 6) {
          return res
            .status(400)
            .json({ message: "Password must be at least 6 characters" });
        }
        user.password = tempUser.newPassword;
      }

      tempUsers.delete(userId);
    }

    if (newName) {
      user.fullName = newName.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Error in editProfile controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function resendOtp(req, res) {
  const { userId, context } = req.body;

  try {
    let userData;
    if (context === "signup") {
      userData = tempUsers.get(userId);
      if (!userData) {
        return res
          .status(404)
          .json({ message: "User data not found or expired" });
      }
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (context === "signup" && user.isVerified) {
        return res.status(400).json({ message: "User already verified" });
      }
      userData = { email: user.email, userId };
    }

    const otpResponse = await handleOTP(userData, context, userId);
    if (!otpResponse.success) {
      return res.status(429).json({ message: otpResponse.message });
    }

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("OTP resend error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function googleCallback(req, res) {
  try {
    if (!req.user || !req.user._id) {
      throw new Error("No valid user data received from Google");
    }

    const token = jwt.sign(
      {
        userId: req.user._id,
        email: req.user.email,
        role: "user",
        iss: "clothify-auth",
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    const isProduction = process.env.NODE_ENV === "production";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      domain: isProduction ? ".yourdomain.com" : undefined,
    });

    res.setHeader("X-CSRF-Token", req.csrfToken());

    console.log(`Google authentication successful for: ${req.user.email}`);

    res.redirect(`${frontendUrl}/clothify?auth=success&source=google`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const errorMessage = encodeURIComponent(
      error.message || "Authentication failed"
    );

    res.redirect(
      `${frontendUrl}/login?error=true&code=OAUTH_FAILURE&message=${errorMessage}`
    );
  }
}

async function forgotPassword(req, res) {
  const { email, csrfToken } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tempUserData = { email: user.email, userId: user._id };
    const otpResponse = await handleOTP(
      tempUserData,
      "password-reset",
      user._id
    );
    if (!otpResponse.success) {
      return res.status(429).json({ message: otpResponse.message });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent for password reset",
      userId: user._id,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

async function resetPassword(req, res) {
  const { userId, otp, newPassword } = req.body;

  try {
    const tempUser = tempUsers.get(userId);
    if (!tempUser || tempUser.context !== "password-reset") {
      return res
        .status(404)
        .json({ message: "User data not found or invalid context" });
    }

    if (
      !tempUser.otp ||
      tempUser.otp !== otp ||
      tempUser.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      tempUsers.delete(userId);
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    tempUsers.delete(userId);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tempUsers.entries()) {
    if (value.otpExpiry < now) {
      tempUsers.delete(key);
      console.log(`Cleaned up expired OTP for ${key}`);
    }
  }
}, 60 * 60 * 1000);

export {
  signup,
  verifyOtp,
  login,
  logout,
  editProfile,
  resendOtp,
  googleCallback,
  forgotPassword,
  resetPassword,
};
