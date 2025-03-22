import jwt from "jsonwebtoken";

export const generateTokenAM = (idAdmin, phanQuyen, res) => {
    const token = jwt.sign(
        { idAdmin, phanQuyen }, 
        process.env.JWT_SECRET_ADMIN,
        { expiresIn: "15d" }
    );

  
    

    res.cookie("jwtAdmin", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, 
        httpOnly: true, 
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development", 
    });

 
};
