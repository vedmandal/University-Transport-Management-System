import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { OIDCStrategy } from "passport-azure-ad";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

/* =====================================================
   GOOGLE STRATEGY
===================================================== */

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
        const email = profile?.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Email not found in Google profile"), null);
        }

        let user = await userModel.findOne({ email });

        // Prevent parent login via Google
        if (user && user.role === "parent") {
          return done(null, false);
        }

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

      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

/* =====================================================
   MICROSOFT STRATEGY (AZURE OIDC)
===================================================== */
passport.use(
  "microsoft",
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0/.well-known/openid-configuration`,

      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`,

      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,

      responseType: "code",
      responseMode: "query",

      redirectUrl: `${process.env.BACKEND_URL}/api/auth/microsoft/callback`,

      allowHttpForRedirectUrl: false,   // 🔥 IMPORTANT
      validateIssuer: true,            // 🔥 IMPORTANT

      scope: ["openid", "profile", "email"],

      passReqToCallback: false,
      loggingLevel: "info",
    },

    async (iss, sub, profile, accessToken, refreshToken, done) => {
      try {
        if (!profile) {
          return done(new Error("No profile received from Microsoft"), null);
        }

        const email =
          profile?.preferred_username ||
          profile?.upn ||
          profile?.email ||
          profile?._json?.preferred_username ||
          profile?._json?.upn ||
          profile?._json?.email;

        if (!email) {
          return done(new Error("Email not found in Microsoft profile"), null);
        }

        let user = await userModel.findOne({ email });

        if (user && user.role === "parent") {
          return done(null, false);
        }

        if (!user) {
          user = await userModel.create({
            name: profile.displayName || "Microsoft User",
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

      } catch (error) {
        console.error("Microsoft Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);