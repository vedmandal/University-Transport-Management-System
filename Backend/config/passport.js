import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { OIDCStrategy } from "passport-azure-ad";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

/* =========================
   GOOGLE STRATEGY
========================= */

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);

        let user = await userModel.findOne({ email });

        if (user) {
          if (user.role === "parent") {
            return done(null, false);
          }
        } else {
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
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

/* =========================
   MICROSOFT STRATEGY
========================= */
passport.use(
  "microsoft",
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      responseType: "code",
      responseMode: "query",
      redirectUrl: `${process.env.BACKEND_URL}/api/auth/microsoft/callback`,
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      scope: ["profile", "email", "openid"],

      // 🔥 ADD THESE (IMPORTANT FOR PRODUCTION)
      validateIssuer: false,
      passReqToCallback: false,
      loggingLevel: "info",
    },
    async (iss, sub, profile, accessToken, refreshToken, done) => {
      try {
        // 🔥 Safe email extraction (avoid crash)
        const email =
          profile?.preferred_username ||
          profile?.email ||
          profile?._json?.preferred_username ||
          profile?._json?.email;

        if (!email) {
          return done(null, false);
        }

       

        let user = await userModel.findOne({ email });

        if (user) {
          if (user.role === "parent") {
            return done(null, false);
          }
        } else {
          user = await userModel.create({
            name: profile.displayName,
            email,
            role: "student",
            provider: "microsoft",
          });
        }

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return done(null, { token, role: user.role });
      } catch (err) {
        console.error("Microsoft Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);