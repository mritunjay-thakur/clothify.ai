import User from "../models/User.js";
import jwt from "jsonwebtoken";

const tempUsers = new Map();

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

    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;

    const user = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
      isVerified: true,
    });

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

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error);
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

    const { newName, newEmail, newPassword, deleteAccount, oldPassword } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (deleteAccount) {
      await user.deleteOne();
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

    if (newEmail && newEmail !== user.email) {
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      user.email = newEmail.toLowerCase();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      user.password = newPassword;
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

async function resetPassword(req, res) {
  const { userId, newPassword } = req.body;

  try {
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

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

export { signup, login, logout, editProfile, googleCallback, resetPassword };
