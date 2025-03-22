import CuaHang from "../models/cuahang.model.js";
import {v2 as cloudinary} from 'cloudinary'
import SanPham from "../models/sanpham.model.js";
import mongoose from "mongoose";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import abi from "../abi.js";
import Admin from "../models/admin.model.js";
import Nguoidung from "../models/nguoidung.model.js";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = abi; 

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

const uploadToPinata = async (imageBase64) => {
    try {
        if (typeof imageBase64 !== "string") {
            throw new Error("Dữ liệu ảnh không hợp lệ! Cần dạng chuỗi Base64.");
        }

        const formData = new FormData();
        const base64Data = imageBase64.split(",")[1];
        const imageBuffer = Buffer.from(base64Data, "base64");

        formData.append("file", imageBuffer, { filename: "certify_image.png" });

        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });

        const cid = response.data.IpfsHash; // Chỉ lấy CID
        return cid; // Lưu CID vào MongoDB
    } catch (error) {
        console.error("Lỗi upload Pinata:", error.message);
        throw new Error("Không thể upload ảnh lên Pinata.");
    }
};

export const addCuaHang = async (req, res) => {
    try {
        const idND = req.nguoidung._id;
        const { tenCH, diaChiCH, emailCH, soDienThoaiCH, thongTinThue, thongTinDinhDanh, cidChungNhan } = req.body;
        //console.log(req.body)

        //console.log(req.body);

        if (!tenCH || !diaChiCH || !emailCH || !soDienThoaiCH || !thongTinThue || !thongTinDinhDanh) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        let hinhDinhDanhUrl = thongTinDinhDanh.hinhChup; 

        if (thongTinDinhDanh.hinhChup) {
            try {
                const uploadResult = await cloudinary.uploader.upload(thongTinDinhDanh.hinhChup);
                hinhDinhDanhUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.log("Lỗi upload ảnh định danh (cũng là ảnh cửa hàng):", uploadError.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh định danh lên Cloudinary" });
            }
        }

        let cidChungNhan2 = "";
        if (cidChungNhan) {
            try {
                cidChungNhan2 = await uploadToPinata(cidChungNhan); // Hàm này trả về CID
            } catch (error) {
                console.error("Lỗi upload ảnh chứng nhận:", error.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh chứng nhận lên Pinata" });
            }
        }

        const newCuaHang = new CuaHang({
            tenCH,
            idNguoiDung: idND,
            diaChiCH,
            emailCH,
            soDienThoaiCH,
            thongTinThue,
            thongTinDinhDanh: {
                ...thongTinDinhDanh,
                hinhChup: hinhDinhDanhUrl, 
            },
            cidChungNhan: cidChungNhan2
        });

        await newCuaHang.save();
        res.status(201).json({ message: "Thêm cửa hàng thành công!", cuaHang: newCuaHang });

    } catch (error) {
        console.error("Lỗi khi thêm cửa hàng:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const duyetCuaHang = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const { trangThai, nguyenNhanTC, matKhau } = req.body;
        const { idCuaHang } = req.params;

        const cuaHang = await CuaHang.findById(idCuaHang);
        if (!cuaHang) {
            return res.status(404).json({ message: "Cửa hàng không tồn tại!" });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(405).json({ message: "Không tìm thấy admin!" });
        }
        if (!admin.phanQuyen.includes("INSPECTOR") && ["Đã xác nhận", "Từ chối"].includes(trangThai)) {
            return res.status(403).json({ message: `Bạn không có quyền thay đổi trạng thái thành ${trangThai}!` });
        }        

        const signer = new ethers.Wallet(matKhau, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        if (trangThai === "Đã xác nhận") {
            try {
                console.log("Đang gửi giao dịch tạo cửa hàng lên Blockchain...");
                const tx = await contract.createStore(
                    idCuaHang.toString(),
                    cuaHang.tenCH,
                    cuaHang.cidChungNhan,
                    cuaHang.diaChiCH
                );
                console.log("Giao dịch đã gửi:", tx.hash);
                await tx.wait();
                console.log("Giao dịch hoàn tất trên blockchain!");                
            } catch (err) {
                console.error("Lỗi khi gửi giao dịch:", err);
                return res.status(500).json({ message: "Lỗi khi gửi giao dịch lên blockchain", error: err.message });
            }
        }

        cuaHang.trangThaiCH = trangThai;
        cuaHang.nguyenNhanTC = trangThai === "Từ chối" ? nguyenNhanTC : "Không";
        await cuaHang.save();

        return res.json({ message: "Cập nhật trạng thái thành công!", cuaHang });
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

export const getAllCuaHang = async (req, res) => {
    try {
        const cuaHangs = await CuaHang.find({ trangThaiCH: 'Mở cửa' })
            .select("tenCH dsQuangCao diaChiCH")
            .populate({ path: "idNguoiDung", select: "dsNguoiTheoDoi" })
            .lean();

        for (let cuaHang of cuaHangs) {
            const sanPhams = await SanPham.find({ idCH: cuaHang._id });
            
            let tongSoSao = 0;
            let tongSoDanhGia = 0;
            let tongSanPham = sanPhams.length;
            
            sanPhams.forEach(sp => {
                tongSoSao += sp.tongSoSao;
                tongSoDanhGia += sp.tongSoDanhGia;
            });
            
            cuaHang.tongSanPham = tongSanPham;
            cuaHang.tongSoDanhGia = tongSoDanhGia;
            cuaHang.trungBinhSao = tongSoDanhGia > 0 ? (tongSoSao / tongSoDanhGia).toFixed(2) : 0;
        }

        res.status(200).json(cuaHangs);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


export const getCuaHangById = async (req, res) => {
    try {
        const { id } = req.params;
        const idND = req.nguoidung._id;

        const cuaHang = await CuaHang.findOne({ _id: id })
            .select("tenCH dsQuangCao diaChiCH createdAt anhCH")
            .populate({ path: "idNguoiDung", select: "dsNguoiTheoDoi" })
            .lean();

        if (!cuaHang) {
            return res.status(404).json({ success: false, message: "Cửa hàng không tồn tại hoặc đã đóng cửa." });
        }

        const sanPhams = await SanPham.find({ idCH: cuaHang._id });

        let tongSoSao = 0;
        let tongSoDanhGia = 0;
        let tongSanPham = sanPhams.length;

        sanPhams.forEach(sp => {
            tongSoSao += sp.tongSoSao;
            tongSoDanhGia += sp.tongSoDanhGia;
        });

        cuaHang.tongSanPham = tongSanPham;
        cuaHang.tongSoDanhGia = tongSoDanhGia;
        cuaHang.trungBinhSao = tongSoDanhGia > 0 ? (tongSoSao / tongSoDanhGia).toFixed(2) : 0;

        let daTheoDoi = false;
        const nguoiDung = await Nguoidung.findById(cuaHang.idNguoiDung).select("dsNguoiTheoDoi");
        if (nguoiDung) {
            daTheoDoi = nguoiDung.dsNguoiTheoDoi.includes(idND.toString());
        }

        res.status(200).json({ ...cuaHang, daTheoDoi });
    } catch (error) {
        console.error("Lỗi khi lấy cửa hàng theo ID:", error);
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};

export const theoDoi = async (req, res) => {
    try {
        const { id } = req.params; 
        const idND = req.nguoidung._id;

        const cuaHang = await CuaHang.findById(id);
        if (!cuaHang) {
            return res.status(404).json({ success: false, message: "Cửa hàng không tồn tại hoặc đã đóng cửa." });
        }

        const nguoiDungCH = await Nguoidung.findById(cuaHang.idNguoiDung);
        if (!nguoiDungCH) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chủ cửa hàng." });
        }

        const nguoiDung = await Nguoidung.findById(idND);
        if (!nguoiDung) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        if (!nguoiDungCH.dsNguoiTheoDoi) nguoiDungCH.dsNguoiTheoDoi = [];
        if (!nguoiDung.dsTheoDoi) nguoiDung.dsTheoDoi = [];

        const daTheoDoi = nguoiDung.dsTheoDoi.includes(cuaHang.idNguoiDung);

        if (daTheoDoi) {
            nguoiDungCH.dsNguoiTheoDoi = nguoiDungCH.dsNguoiTheoDoi.filter(userId => userId.toString() !== idND.toString());
            nguoiDung.dsTheoDoi = nguoiDung.dsTheoDoi.filter(shopId => shopId.toString() !== cuaHang.idNguoiDung.toString());
        } else {
            nguoiDungCH.dsNguoiTheoDoi.push(idND);
            nguoiDung.dsTheoDoi.push(cuaHang.idNguoiDung);
        }

        await nguoiDungCH.save();
        await nguoiDung.save();

        res.status(200).json({ 
            success: true, 
            message: daTheoDoi ? "Đã bỏ theo dõi" : "Đã theo dõi", 
            nguoiDung
        });
    } catch (error) {
        console.error("Lỗi khi theo dõi cửa hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};

export const capNhat = async (req, res) => {
    let {anhCH} = req.body; 
    const id = req.nguoidung._id;
    try {
        let cuaHang = await CuaHang.findOne({idNguoiDung: id});
        if (!cuaHang) return res.status(404).json({ message: "Không tìm thấy cửa hàng" });

        if (anhCH) {
        
            if (cuaHang.anhCH) {
                await cloudinary.uploader.destroy(cuaHang.anhCH.split("/").pop().split(".")[0]);
            }
        
            const uploadedResponse = await cloudinary.uploader.upload(anhCH);
            anhCH = uploadedResponse.secure_url;
        }

        cuaHang.anhCH = anhCH|| cuaHang.anhCH;

        cuaHang = await cuaHang.save();

        return res.status(200).json(cuaHang.anhCH);
    } catch (error) {
        console.log("Lỗi capNhat controller:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getAnhCH = async (req, res) => {
    try {
        const idND = req.nguoidung._id;

        const cuaHang = await CuaHang.findOne({ idNguoiDung: idND });

        if (!cuaHang) {
            return res.status(404).json({ success: false, message: "Cửa hàng không tồn tại hoặc đã đóng cửa." });
        }

        res.status(200).json(cuaHang.anhCH);
    } catch (error) {
        console.error("Lỗi khi lấy cửa hàng theo ID:", error);
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};

export const getPopularShops = async (req, res) => {
    try {
        const users = await Nguoidung.aggregate([
            {
                $project: {
                    soTheoDoi: { $size: "$dsNguoiTheoDoi" }
                }
            },
            {
                $sort: { soTheoDoi: -1 } 
            },
            {
                $limit: 9 
            }
        ]);
    
        const usersWithStores = [];

        for (const user of users) {
            const cuaHangs = await CuaHang.find({ idNguoiDung: user._id, trangThaiCH: 'Mở cửa' })
                .select("anhCH tenCH diaChiCH")
                .populate({ path: "idNguoiDung", select: "dsNguoiTheoDoi" })
                .lean();

            for (let cuaHang of cuaHangs) {
                const sanPhams = await SanPham.find({ idCH: cuaHang._id });
                
                let tongSoSao = 0;
                let tongSoDanhGia = 0;
                let tongSanPham = sanPhams.length;
                
                sanPhams.forEach(sp => {
                    tongSoSao += sp.tongSoSao;
                    tongSoDanhGia += sp.tongSoDanhGia;
                });
                
                cuaHang.tongSanPham = tongSanPham;
                cuaHang.tongSoDanhGia = tongSoDanhGia;
                cuaHang.trungBinhSao = tongSoDanhGia > 0 ? (tongSoSao / tongSoDanhGia).toFixed(2) : 0;

                usersWithStores.push({ cuaHang });
            }
        }

        res.status(200).json({ usersWithStores });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Có lỗi xảy ra khi lấy dữ liệu." });
    }
};

export const getCuaHangChoXacNhan = async (req, res) => {
    try {
        const cuaHang = await CuaHang.find({ trangThaiCH: "Chờ xác nhận" });
        if (!cuaHang) {
            return res.status(404).json({ success: false, message: "Cửa hàng không tồn tại hoặc đã đóng cửa." });
        }

        res.status(200).json(cuaHang);
    } catch (error) {
        console.error("Lỗi khi lấy cửa hàng theo ID:", error);
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};

export const getTatCaCuaHang = async (req, res) => {
    try {
        const cuaHang = await CuaHang.find();
        if (!cuaHang) {
            return res.status(404).json({ success: false, message: "Cửa hàng không tồn tại hoặc đã đóng cửa." });
        }

        res.status(200).json(cuaHang);
    } catch (error) {
        console.error("Lỗi khi lấy cửa hàng theo ID:", error);
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};

