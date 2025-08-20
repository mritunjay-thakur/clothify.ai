// passport.js
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import User from "../models/User.js";
import crypto from "crypto";

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.email);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user id:", id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("Deserialize error:", err);
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
      proxy: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("Google profile received:", profile);

      try {
        const email = profile.emails[0].value;
        const photo = profile.photos[0]?.value;

        if (!email) {
          console.error("No email in Google profile");
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          console.log("Creating new user from Google profile");
          user = await User.create({
            email,
            fullName: profile.displayName || email.split("@")[0],
            googleId: profile.id,
            password: crypto.randomUUID(),
            profilePic:
              photo ||
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
            isVerified: true,
          });
        } else {
          console.log("Updating existing user from Google profile");
          user.fullName =
            profile.displayName || user.fullName || email.split("@")[0];
          user.profilePic =
            photo ||
            user.profilePic ||
            `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;
          user.googleId = profile.id;
          user.isVerified = true;
          await user.save();
        }

        console.log("Google authentication successful for:", email);
        return done(null, user);
      } catch (err) {
        console.error("Google Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);
