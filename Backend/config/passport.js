import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as AzureOAuth2Strategy } from "passport-azure-ad-oauth2";
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

        if (!email) return done(null, false);

        let user = await userModel.findOne({ email });

        // block parent login
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
        console.error("Google Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);

/* =====================================================
   MICROSOFT STRATEGY (FIXED VERSION)
   Using passport-azure-ad-oauth2
===================================================== */

passport.use(
  "microsoft",
  new AzureOAuth2Strategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/microsoft/callback`,
      authorizationURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      scope: ["openid", "profile", "email"],
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        // Decode ID token manually
        const decoded = JSON.parse(
          Buffer.from(params.id_token.split(".")[1], "base64").toString()
        );

        const email = decoded.preferred_username;

        if (!email) return done(null, false);

        let user = await userModel.findOne({ email });

        // block parent login
        if (user && user.role === "parent") return done(null, false);

        if (!user) {
          user = await userModel.create({
            name: decoded.name || "Microsoft User",
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

/* =====================================================
   SERIALIZE (Required by passport but not using sessions)
===================================================== */

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;