import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Nguoidung from "../models/nguoidung.model.js";
import * as dotenv from "dotenv";
dotenv.config();


passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await Nguoidung.findOne({ email });

     
      if (user && user.matKhau) {
        return done(null, false, { message: "Email này đã đăng ký bằng mật khẩu" });
      }

     
      if (!user) {
        user = await Nguoidung.create({
          googleId: profile.id,
          tenNguoiDung: profile.displayName,
          email,
          anhND: profile.photos[0].value,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await Nguoidung.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
