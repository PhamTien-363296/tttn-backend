import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAM } from "../lib/utils/generateTokenAM.js";
import sendEmail from "../lib/utils/sendEmail.js";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import abi from "../abi.js";
import * as dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
const signer = new ethers.Wallet(adminPrivateKey, provider);

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = abi; 
const contract = new ethers.Contract(contractAddress, contractABI, signer);

export const createAdmin = async (req, res) => {
  try {
    const { tenAdmin, email, phanQuyen, address } = req.body;
    const admin = await Admin.findById(req.admin._id)

    if (!admin || !admin.phanQuyen.includes("SUPER_AM")) {
      return res.status(403).json({ message: "Bạn không có quyền tạo admin mới!" });
  }

  console.log("Kiểm tra quyền hạn:", phanQuyen);
  const validRoles = ["CERTIFIER", "INSPECTOR"];
  if (!validRoles.includes(phanQuyen)) {
      console.log("Quyền hạn không hợp lệ");
      return res.status(400).json({ message: "Quyền hạn không hợp lệ!" });
  }


    const existingAdmin = await Admin.findOne({ email });
    console.log("Kiểm tra email đã tồn tại:", existingAdmin);
    if (existingAdmin) {
        console.log("Email này đã tồn tại!");
        return res.status(400).json({ message: "Email này đã tồn tại!" });
    }

    let emailTemplate = "";
    let tx;

    if (phanQuyen === "INSPECTOR") {
     
        const rawPassword = CryptoJS.lib.WordArray.random(8).toString();
        console.log("Mật khẩu ngẫu nhiên:", rawPassword);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

      
        const newAdmin = new Admin({
            tenAdmin,
            email,
            matKhau: hashedPassword,
            phanQuyen: [phanQuyen],
            address,
        });
        await newAdmin.save();
        console.log("Admin INSPECTOR mới đã được lưu vào cơ sở dữ liệu.");

    
        tx = await contract.addInspector(address, tenAdmin);
        await tx.wait();
        console.log(`Đã thêm INSPECTOR vào blockchain:`, tx.hash);

        res.status(201).json({ message: `Admin ${tenAdmin} (${phanQuyen}) đã được tạo và ghi vào blockchain.` });
        emailTemplate = `
                <div class="content">
                    <h2>Xin chào, ${tenAdmin}</h2>
                    <p>Hệ thống của chúng tôi đã cấp lại mật khẩu mới cho bạn.</p>
                    <p>Vui lòng sử dụng mật khẩu sau để đăng nhập:</p>
                    <div class="password-box">${rawPassword}</div>
                    <p>Mời bạn tham gia vào hệ thống quản trị cùng chúng tôi</p>
                </div>
                <div class="footer">
                    <p>Nếu bạn có thắc mắc khác, vui lòng liên hệ để hỗ trợ.</p>
                    <p>&copy; 2025 Ecoland. All rights reserved.</p>
                </div>`;
    } else if (phanQuyen === "CERTIFIER") {
       
        tx = await contract.addCertifier(address, tenAdmin);
        await tx.wait();
        console.log(`Đã thêm CERTIFIER vào blockchain:`, tx.hash);

        emailTemplate = `
        <p>Xin chào, ${tenAdmin}</p>
        <p>Bạn đã được thêm làm CERTIFIER trên hệ thống.</p>
        <p>Vui lòng truy cập <a href="https://eco_manage.com">eco_manage</a> để quản lý.</p>`;
    }

      const newAdmin = new Admin({
        tenAdmin,
        email,
        phanQuyen: [phanQuyen],
        address,
    });
    await newAdmin.save();
    console.log("Admin CERTIFIER đã được lưu vào MongoDB.");

    // Gửi email
    await sendEmail(email, `Tài khoản ${phanQuyen} Ecoland`, emailTemplate);
    console.log("Email đã được gửi.");

    res.status(201).json({ message: `Admin ${tenAdmin} (${phanQuyen}) đã được tạo và ghi vào blockchain.` });
  } catch (error) {
      res.status(500).json({ message: "Đã có lỗi xảy ra.", error: error.message });
  }
};


export const getCertifiers = async (req, res) => {
  try {
      const certifiers = await Admin.find({ phanQuyen: { $in: ["CERTIFIER"] } });
      res.status(200).json(certifiers);
  } catch (error) {
      console.error("Lỗi khi lấy danh sách certifier:", error);
      res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};




export const loginAdmin = async (req, res) => {
  try {
    const { tenAdmin, matKhau } = req.body;

    const admin = await Admin.findOne({ tenAdmin }).lean();

    if (!admin) {
      return res.status(400).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    const kiemTra_matKhau = await bcrypt.compare(matKhau, admin.matKhau);
    if (!kiemTra_matKhau) {
      return res.status(400).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    if (admin.trangThai !== "active") {
      return res.status(403).json({ error: "Tài khoản của bạn đã bị vô hiệu hóa" });
    }

   
    const rolesArray = Array.isArray(admin.phanQuyen) ? admin.phanQuyen : [admin.phanQuyen];


    const formattedRoles = rolesArray.map(role => String(role).toUpperCase());

    console.log("Quyền admin sau khi xử lý:", formattedRoles);

  
    const validAdminRoles = ["SUPER_AM", "CERTIFIER", "INSPECTOR"];

 
    if (!formattedRoles.some(role => validAdminRoles.includes(role))) {
      return res.status(403).json({ error: "Bạn không có quyền truy cập" });
    }

 
    generateTokenAM(admin._id, formattedRoles, res);

    res.status(200).json({
      tenAdmin: admin.tenAdmin,
      phanQuyen: formattedRoles, 
      _id: admin._id,
    });

  } catch (error) {
    console.log("Lỗi loginAdmin:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};


export const loginCertifier = async (req, res) => {
  try {
    const { tenAdmin, address } = req.body;

  
    const admin = await Admin.findOne({ tenAdmin, address }).lean();

    if (!admin) {
      return res.status(400).json({ error: "Tên đăng nhập hoặc địa chỉ không đúng" });
    }

   
    if (admin.trangThai !== "active") {
      return res.status(403).json({ error: "Tài khoản của bạn đã bị vô hiệu hóa" });
    }


    const rolesArray = Array.isArray(admin.phanQuyen) ? admin.phanQuyen : [admin.phanQuyen];
    const formattedRoles = rolesArray.map(role => String(role).toUpperCase());

    console.log("Quyền admin sau khi xử lý:", formattedRoles);


    const validAdminRoles = ["CERTIFIER"];
    if (!formattedRoles.some(role => validAdminRoles.includes(role))) {
      return res.status(403).json({ error: "Bạn không có quyền truy cập" });
    }

    // Sinh token và trả về thông tin
    generateTokenAM(admin._id, formattedRoles, res);

    res.status(200).json({
      tenAdmin: admin.tenAdmin,
      address: admin.address,
      phanQuyen: formattedRoles,
      _id: admin._id,
    });

  } catch (error) {
    console.error("Lỗi loginCertifier:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};


  

export const getMeAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-matKhau");

    if (!admin) {
      return res.status(404).json({ error: "Không tìm thấy admin" });
    }

    console.log("Admin từ DB:", admin);

   
    const validAdminRoles = ["SUPER_AM", "CERTIFIER","INSPECTOR"];

  
    if (!Array.isArray(admin.phanQuyen) || !admin.phanQuyen.some(role => validAdminRoles.includes(role))) {
      return res.status(403).json({ error: "Bạn không có quyền truy cập" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.log("Lỗi getMeAdmin:", error.message);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};


 export const logoutAdmin = async (req,res)=>{
     try{
         res.cookie("jwtAdmin","",{maxAge:0})
         res.status(200).json({ message:"Đăng xuất thành công" })
     } catch (error) {
         console.log("Lỗi dangXuat controller",error.message)
         res.status(500).json({ error: "Lỗi 500"})
     }
 }