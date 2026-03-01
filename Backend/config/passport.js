import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { OIDCStrategy } from "passport-azure-ad";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

/* ================= GOOGLE ================= */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) return done(null, false);

        let user = await userModel.findOne({ email });

        if (user && user.role === "parent") return done(null, false);

        if (!user) {
          user = await userModel.create({
            name: profile.displayName,
            email,
            role: "student",
            provider: "google",
          });
        }

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return done(null, { token, role: user.role });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* ================= MICROSOFT ================= */
passport.use(
  "microsoft",
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      responseType: "code",
      responseMode: "query",
      redirectUrl: `${process.env.BACKEND_URL}/api/auth/microsoft/callback`,
      scope: ["openid", "profile", "email"],
      validateIssuer: false,
    },

    async (iss, sub, profile, accessToken, refreshToken, done) => {
      try {

        console.log("===== MICROSOFT PROFILE =====");
        console.log(profile);

        if (!profile) {
          console.log("No profile received");
          return done(null, false);
        }

        const email =
          profile?.preferred_username ||
          profile?._json?.preferred_username ||
          profile?._json?.upn ||
          profile?.upn ||
          profile?.email;

        console.log("EMAIL:", email);

        if (!email) {
          console.log("Email not found");
          return done(null, false);
        }

        let user = await userModel.findOne({ email });

        if (!user) {
          user = await userModel.create({
            name: profile.displayName || "Student",
            email,
            role: "student",
            provider: "microsoft",
          });
          console.log("New Microsoft user created");
        }

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        console.log("Microsoft login success");

        return done(null, { token, role: user.role });

      } catch (err) {
        console.log("Microsoft Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);