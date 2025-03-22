import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        await transporter.sendMail({
            from: `"Ecoland System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        });

        console.log("Email sent successfully to", to);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};

export default sendEmail;
