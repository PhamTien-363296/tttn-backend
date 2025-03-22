import express from "express"
import {signUp, login, logout, getMe, } from '../controllers/auth.controller.js'
import { protectRoute } from "../middleware/protectRoute.js"
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router()

router.post("/signup",signUp)
router.post("/login",login)
router.post("/logout",logout)
router.get("/getme",protectRoute,getMe)

// Đăng nhập bằng Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback từ Google
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Xác thực Google thất bại" });
  }


  const token = jwt.sign({ idNguoidung: req.user._id }, process.env.JWT_SECRET, { expiresIn: "15d" });


 
  res.cookie("jwt", token, {
    httpOnly: true,  
    secure: true,   
    sameSite: "strict", 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    secure: process.env.NODE_ENV !=="development"
  });

  // Chuyển hướng về frontend
  res.redirect("http://localhost:3000");


});


export default router