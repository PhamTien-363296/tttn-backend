import SanPham from "../models/sanpham.model.js";
import {v2 as cloudinary} from 'cloudinary'
import DanhMuc from "../models/danhmuc.model.js";
import NguoiDung from "../models/nguoidung.model.js";
import CuaHang from "../models/cuahang.model.js";
import mongoose from "mongoose";
import moment from 'moment';
import axios from "axios";
import FormData from "form-data";
import Cuahang from "../models/cuahang.model.js";
import Admin from "../models/admin.model.js";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import abi from "../abi.js";
import dotenv from "dotenv";
import Sanpham from "../models/sanpham.model.js";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
console.log("Contract Address:", process.env.CONTRACT_ADDRESS);

const contractABI = abi; 

export const duyetSanPhamTrenBlockChain = async (req, res) => {
    try {
        const { privateKey } = req.body;
        const { productId } = req.params;

        // Kiểm tra quyền duyệt sản phẩm
        // const admin = await Admin.findById(req.admin._id);
        // if (!admin || !admin.phanQuyen.includes("CERTIFIER")) {
        //     return res.status(403).json({ message: "Bạn không có quyền duyệt sản phẩm" });
        // }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await SanPham.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }

        if (!privateKey || privateKey.trim() === "") {
            return res.status(400).json({ message: "Private Key không hợp lệ hoặc trống!" });
        }

        let signer;
        try {
            signer = new ethers.Wallet(privateKey, provider);
        } catch (error) {
            return res.status(400).json({ message: "Private Key không hợp lệ!" });
        }

        console.log("Signer address:", signer.address);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        try {
            console.log("Đang gửi giao dịch duyệt sản phẩm lên Blockchain...");

            const tx = await contract.certifyProduct(productId.toString());
            console.log("Giao dịch đã gửi:", tx.hash);
            await tx.wait();
            console.log("Duyệt sản phẩm thành công trên blockchain!");

       
            product.trangThai = "approved";
            await product.save();

            return res.json({ message: "Sản phẩm đã được duyệt!", txHash: tx.hash });
        } catch (err) {
            console.error("Lỗi khi gửi giao dịch:", err);
            return res.status(500).json({ message: "Lỗi khi duyệt sản phẩm trên blockchain", error: err.message });
        }
    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};


export const themSanPhamVaoBlockChain = async (req, res) => {
    try {
        const { trangThai, nguyenNhanTC, privateKey } = req.body;
        const { productId } = req.params;
          const admin = await Admin.findById(req.admin._id)


        
            if (!admin || !admin.phanQuyen.includes("INSPECTOR")) {
              return res.status(403).json({ message: "Bạn không có quyền duyệt sản phẩm" });
          }
        
        const product = await SanPham.findById(productId).populate("idDM");
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }
        
        if (!privateKey || privateKey.trim() === "") {
            return res.status(403).json({ message: "Private Key không hợp lệ hoặc trống!" });
        }
        
        let signer;
        try {
            signer = new ethers.Wallet(privateKey, provider);
        } catch (error) {
            return res.status(403).json({ message: "Private Key không hợp lệ!" });
        }
        
        console.log("Signer address:", signer.address);
        
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log(contractAddress)
        
        if (trangThai === "Chờ duyệt") {
            try {
                console.log("Đang gửi giao dịch tạo sản phẩm lên Blockchain...");

                const tx = await contract.createProduct(
                    productId.toString(),
                    product.tenSP || "Unknown_Product_Name",
                    product.idCH ? product.idCH.toString() : "Unknown_Store",
                    product.loaiTrong || "Unknown_Store",
                    product.ngaySX ? new Date(product.ngaySX).toISOString().split("T")[0] : "Unknown_Sowing_Date",
                    product.ngayTH ? new Date(product.ngayTH).toISOString().split("T")[0] : "Unknown_Harvest_Date",
                    product.ngayDG ? new Date(product.ngayDG).toISOString().split("T")[0] : "Unknown_Packaging_Date",
                    product.hanSX ? new Date(product.hanSX).toISOString().split("T")[0] : "Unknown_Expiration_Date",
                    product.certifier || "unknown",
                    product.certify_image  || "Unknown_Image_Name",

                );
                
                
                console.log("Giao dịch đã gửi:", tx.hash);
                await tx.wait();
                console.log("Giao dịch hoàn tất trên blockchain!");
            } catch (err) {
                console.error("Lỗi khi gửi giao dịch:", err);
                return res.status(500).json({ message: "Lỗi khi gửi giao dịch lên blockchain", error: err.message });
            }
        }
        
        if (trangThai === "Từ chối" && nguyenNhanTC) {
            product.nguyenNhanTC = nguyenNhanTC;
        }
        
        product.trangThai = trangThai;
        await product.save();

        return res.json({ message: "Cập nhật trạng thái thành công!", product });
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};



export const themQuyenDuyetSP = async (req, res) => {
    const { addressNguoiDuyet, idNguoiDuyet, matKhau } = req.body;
    const adminId = req.admin._id;
    const { productId } = req.params;

    try {
        const product = await SanPham.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(403).json({ message: "Không tìm thấy admin!" });
        }

        let privateKey;
        try {
            privateKey = CryptoJS.AES.decrypt(admin.encryptedPrivateKey, matKhau).toString(CryptoJS.enc.Utf8);
        } catch (error) {
            return res.status(403).json({ message: "Mật khẩu không hợp lệ!" });
        }

        if (!privateKey || privateKey.trim() === "") {
            return res.status(403).json({ message: "Private Key không hợp lệ hoặc trống!" });
        }

        console.log("Signer được khởi tạo:", signer.address);
        console.log("Contract được khởi tạo tại:", contractAddress);

        const Tx = await contract.setInspectorForProduct(productId, addressNguoiDuyet, {
            gasLimit: 3000000,
        });
        await Tx.wait();
        console.log(`Sản phẩm ${productId} đã được duyệt`);

        product.idNguoiDuyet = idNguoiDuyet;
        product.addressNguoiDuyet = addressNguoiDuyet;
        
        await product.save();
        return res.status(200).json({ message: "Cập nhật người duyệt sản phẩm thành công!" });
    } catch (error) {
        console.error("Lỗi trong quá trình xử lý người duyệt:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý cập nhật", error: error.message });
    }
};

export const capNhatTrangThaiSanPham = async (req, res) => {
    const { loaiKiemDinh, matKhau } = req.body;
    const adminId = req.admin._id;
    const { productId } = req.params;

    try {
        const product = await SanPham.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }

        // Kiểm tra admin hoặc inspector có quyền duyệt sản phẩm
        // if (product.idNguoiDuyet !== adminId) {
        //     return res.status(403).json({ message: "Bạn không có quyền duyệt sản phẩm!" });
        // }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(403).json({ message: "Không tìm thấy admin!" });
        }

        let privateKey;
        try {
            privateKey = CryptoJS.AES.decrypt(admin.encryptedPrivateKey, matKhau).toString(CryptoJS.enc.Utf8);
        } catch (error) {
            return res.status(403).json({ message: "Mật khẩu không hợp lệ!" });
        }

        if (!privateKey || privateKey.trim() === "") {
            return res.status(403).json({ message: "Private Key không hợp lệ hoặc trống!" });
        }

        console.log("Signer được khởi tạo:", signer.address);
        console.log("Contract được khởi tạo tại:", contractAddress);

        if (loaiKiemDinh === "Kiểm định hạt") {
            const ngaySX = moment(product.ngaySX).format('YYYY-MM-DD');
            const approveTx = await contract.approveProduct(productId, admin.address, product.loaiTrong, ngaySX);
            await approveTx.wait();
            console.log(`Sản phẩm ${productId} đã được duyệt`);
            product.trangThai = "Đã duyệt";
        } else if (loaiKiemDinh === "Kiểm định sản phẩm") {
            const ngayTH = moment(product.ngayTH).format('YYYY-MM-DD');

            const qualityCheckTx = await contract.checkProductQuality(productId, ngayTH, product.VatTuHTCT, admin.address);
            await qualityCheckTx.wait();
            console.log(`Chất lượng sản phẩm ${productId} đã được kiểm tra`);
            product.trangThai = "Đã kiểm tra chất lượng";
        } else if (loaiKiemDinh === "Kiểm định đóng gói") {
            const ngayDG = moment(product.ngayDG).format('YYYY-MM-DD');
            const hanSX = moment(product.hanSX).format('YYYY-MM-DD');
            
            const availableTx = await contract.makeProductAvailable(productId, ngayDG, hanSX, admin.address);
            await availableTx.wait();
            console.log(`Sản phẩm ${productId} đã được đưa lên bán`);
            product.trangThai = "Đã kiểm tra đóng gói";
        }
        await product.save();

        return res.status(200).json({ message: "Sản phẩm đã được duyệt, kiểm tra chất lượng và đưa lên bán thành công!" });
    } catch (error) {
        console.error("Lỗi trong quá trình xử lý sản phẩm:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý sản phẩm", error: error.message });
    }
};

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



export const addSanPham = async (req, res) => {
    try {
        const idND = req.nguoidung._id.toString();
        const { 
            tenSP, moTaSP, idDM, nguonGoc, phanLoai, image, certify_image,
            ngaySX, ngayTH, batchId,loaiTrong,ngayDG,hanSX,certifier
        } = req.body;

        if (!tenSP || !moTaSP || !idDM || !nguonGoc || !phanLoai || !ngaySX || !ngayTH || !batchId|| !certifier) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        let anhSPUrl = image;

        if (image) {
            try {
                const uploadResult = await cloudinary.uploader.upload(image);
                anhSPUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.log("Lỗi upload ảnh sản phẩm:", uploadError.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh sản phẩm lên Cloudinary" });
            }
        }

        let cidChungNhan = "";
        if (certify_image) {
            try {
                cidChungNhan = await uploadToPinata(certify_image); // Hàm này trả về CID
            } catch (error) {
                console.error("Lỗi upload ảnh chứng nhận:", error.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh chứng nhận lên Pinata" });
            }
        }


        const cuaHang = await CuaHang.findOne({ idNguoiDung: idND });
        if (!cuaHang) {
            return res.status(404).json({ error: "Không tìm thấy cửa hàng!" });
        }

        const sanPhamMoi = new SanPham({
            tenSP,
            moTaSP,
            idDM,
            idCH: cuaHang._id,
            nguonGoc,
            phanLoai,
            dsAnhSP: anhSPUrl,
            ngaySX,
            ngayTH,
            batchId,
            loaiTrong,
            hanSX,
            ngayDG,
            certify_image: cidChungNhan,
            certifier
        });

        const danhMuc = await DanhMuc.findById(idDM);
        if (!danhMuc) {
            return res.status(404).json({ error: "Không tìm thấy danh mục" });
        }
        danhMuc.dsSanPham.push(sanPhamMoi._id); 
        await danhMuc.save();

        cuaHang.dsSanPham.push(sanPhamMoi._id); 
        await cuaHang.save();

        await sanPhamMoi.save();
        res.status(201).json({ message: "Thêm sản phẩm thành công!", sanPham: sanPhamMoi });

    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};



export const getTatCaSanPham = async (req, res) => {
    try {
        const products = await SanPham.find({ trangThai: 'Đang bán' }).populate("idCH");

        res.status(200).json(products);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const getTatCaSanPhamDM = async (req, res) => {
    try {
        const {sort, page, limit, minStar=0, maxStar=0, locations=''} = req.query;
        const result = await sapxepSanPham({sort, page, limit, minStar, maxStar,locations });
        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const getSanPhamById = async (req, res) => {
    try {
        const { id } = req.params;
        const idND = req.nguoidung._id; 
        const product = await SanPham.findById(id)
        .populate("idDM")
        .populate({
            path: "idCH",
            select: "_id tenCH anhCH dsSanPham createdAt idNguoiDung",
            populate: [
                {
                    path: "idNguoiDung",
                    select: "dsNguoiTheoDoi"
                },
                {
                    path: "dsSanPham",
                    select: "dsDanhGia",
                    populate: {
                        path: "dsDanhGia",
                        select: "_id"
                    }
                }
            ]
        })
        .populate({
            path: "dsDanhGia",
            select: "soSao noiDung createdAt tenLoai khachHangId",
            populate: {
                path: "khachHangId",
                select: "tenNguoiDung anhND"
            },
        });
        //console.log(product);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        let isFavorite = false;
        if (idND) {
            isFavorite = await NguoiDung.exists({
                _id: idND,
                dsYeuThich: id,
            });
        }

        res.status(200).json({ product, isFavorite });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


export const goiYTimKiem = async (req, res) => {
    const { search, danhmuc } = req.query;
    
    if (!search) {
        return res.status(400).json({ message: 'Vui lòng nhập từ tìm kiếm' });
    }

    try {
        const goiY = await SanPham.find({
            tenSP: { $regex: search, $options: 'i' },
            ...(danhmuc && { idDM: danhmuc })  // Chỉ thêm điều kiện idDM nếu danhmuc có giá trị
        }).limit(5);

        const goiYCuaHang = await Cuahang.find({
            tenCH: { $regex: search, $options: 'i' },
            trangThaiCH: "Mở cửa"
        }).limit(5);

        res.json({ goiY, goiYCuaHang }); // Trả về cả hai kết quả
    } catch (err) {
        console.error('Lỗi trả về gợi ý:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
export const getSanPhamByIdDM = async (req, res) => { 
    try {
        const {sort, page, limit, danhmuc, minStar=0, maxStar=0, locations=''} = req.query;
        const result = await sapxepSanPham({sort, page, limit, danhmuc, minStar, maxStar,locations });
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Lỗi 500" });
        console.log("Lỗi getSanPhamByIdDM controller", error.message);
    }
};

export const getSanPhamByIdCH = async (req, res) => { 
    try {
        const {sort, page, limit, cuahang} = req.query;
        const result = await sapxepSanPham({sort, page, limit, cuahang });
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Lỗi 500" });
        console.log("Lỗi getSanPhamByIdCH controller", error.message);
    }
};

export const timKiem = async (req, res) => { 
    try {
        const { search, sort, page, limit, danhmuc='', minStar=0, maxStar=0, locations='' } = req.query;
        const result = await sapxepSanPham({ search, sort, page, limit, danhmuc, minStar, maxStar,locations });
        const timKiemCH = await Cuahang.find({
            tenCH: { $regex: search, $options: 'i' },
            trangThaiCH: "Mở cửa"
        });
        return res.status(200).json({ result, timKiemCH });
    } catch (error) {
        res.status(500).json({ error: "Lỗi 500" });
        console.log("Lỗi tim kiem controller", error.message);
    }
};

export const sapxepSanPham = async ({ search = '', sort = "phobien", page = 1, limit = 1, danhmuc, minStar=0, maxStar=0, locations='', cuahang='' }) => {
    const pageSize = parseInt(limit);
    const skip = (page - 1) * pageSize;

    const matchStage = { trangThai: 'Đang bán' };

    // Chỉ thêm điều kiện tìm kiếm khi search có giá trị
    if (search.trim()) {
        matchStage.tenSP = { $regex: search, $options: 'i' };
    }
    
    // Chỉ lọc theo danh mục nếu có danh mục được truyền vào
    if (danhmuc) {
        matchStage.idDM = new mongoose.Types.ObjectId(danhmuc);
    }

    // Chỉ lọc theo cửa hàng nếu có cửa hàng được truyền vào
    if (cuahang) {
        matchStage.idCH = new mongoose.Types.ObjectId(cuahang);
    }

    const min = Number(minStar);
    const max = Number(maxStar);

    if (min && max !== '0') {
        matchStage.$expr = {
            $and: [
                { $gt: ["$tongSoDanhGia", 0] }, 
                { $gte: [{ $divide: ["$tongSoSao", "$tongSoDanhGia"] }, min] },
                { $lte: [{ $divide: ["$tongSoSao", "$tongSoDanhGia"] }, max] }
            ]
        };
    }    

    if (locations !== '') {
        const locationsArray = locations.split(",");
        matchStage.nguonGoc = { $in: locationsArray };
    }
    
    const tong = await SanPham.countDocuments(matchStage);
    const tongPage = Math.ceil(tong / pageSize);

    let sortStage = { luotXem: -1 };
    if (sort === "moinhat") {
        sortStage = { createdAt: -1 };
    } else if (sort === "nhieunguoidat") {
        sortStage = { daBan: -1 };
    } else if (sort === "giatang" || sort === "giagiam") {
        sortStage = { giaSauGiam: sort === "giatang" ? 1 : -1 };
    }

    const sp = await SanPham.aggregate([
        { $match: matchStage },
        {
            $addFields: {
                giaSauGiam: {
                    $subtract: [
                        { $arrayElemAt: ["$phanLoai.giaLoai", 0] },
                        {
                            $multiply: [
                                { $arrayElemAt: ["$phanLoai.giaLoai", 0] },
                                { $divide: [{ $arrayElemAt: ["$phanLoai.khuyenMai", 0] }, 100] }
                            ]
                        }
                    ]
                }
            }
        },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: pageSize },
        {
            $lookup: {
                from: "Cuahang",  // Collection
                localField: "idCH",
                foreignField: "_id",
                as: "idCH"
            }
        },
        { $unwind: { path: "$idCH", preserveNullAndEmptyArrays: true } }
    ]);

    return { tong, sp, tongPage };
};

export const capNhatLuotXem = async (req, res) => {
    const { id } = req.params; 
    try {   
        const sp = await  SanPham.updateOne({ _id: id }, { $inc: { luotXem: 1 } });
        if (!sp) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại" });
        }
        res.status(200).json({ message: "Cập nhật lượt xem thành công", luotXem: sp.luotXem });
    } catch (error) {
        console.error("Lỗi cập nhật lượt xem controller:", error.message);
        res.status(500).json({ error: "Lỗi 500" });
    }
};

export const laySanPhamvoiIdCuaHang = async (req, res) => {
    try {
        const idND = req.nguoidung?._id?.toString();
        if (!idND) return res.status(401).json({ error: "Không xác thực được người dùng!" });
        const cuaHang = await CuaHang.findOne({ idNguoiDung: idND });
        console.log("Cửa hàng tìm thấy:", cuaHang);
        if (!cuaHang) return res.status(404).json({ error: "Không tìm thấy cửa hàng!" });
        const danhSachSanPham = await SanPham.find({ idCH: cuaHang._id });
        console.log("Sản phẩm tìm thấy:", danhSachSanPham);
        res.status(200).json({ products: danhSachSanPham });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau!" });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params; 
    const { tenSP, phanLoai, batchId, trangThai, dsAnhSP } = req.body;
    try {
        let product = await SanPham.findById(id); 
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        if (tenSP !== undefined) product.tenSP = tenSP;
        if (phanLoai !== undefined) product.phanLoai = phanLoai;
        if (batchId !== undefined) product.batchId = batchId;
        if (trangThai !== undefined) product.trangThai = trangThai;
        if (dsAnhSP) {
            try {
                const uploadResult = await cloudinary.uploader.upload(dsAnhSP);
                product.dsAnhSP = uploadResult.secure_url; 
            } catch (uploadError) {
                console.log("Lỗi upload ảnh:", uploadError.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh lên Cloudinary" });
            }
        }
        await product.save();
        const allProducts = await SanPham.find();
        return res.status(200).json({ products: allProducts });
    } catch (error) {
        console.log("Lỗi khi cập nhật sản phẩm", error.message);
        return res.status(500).json({ error: error.message });
    }
};

export const getPendingProduct = async (req, res) => {
    try {
        const sanPhams = await SanPham.find({ trangThai: "Chờ xác nhận" })
            .populate({ path: "idCH", select: "tenCH idNguoiDung" })
            .populate({ path: "idDM", select: "tenDM" })
            .lean();
            const formatDate = (date) => {
                if (!date) return null;
                return new Date(date).toLocaleDateString("vi-VN"); 
            };

           

        const results = await Promise.all(
            sanPhams.map(async (sp) => {
                const seller = sp.idCH?.idNguoiDung
                    ? await NguoiDung.findById(sp.idCH.idNguoiDung).select("tenNguoiDung").lean()
                    : null;
                const certifierInfo = sp.certifier
                    ? await Admin.findOne({ address: sp.certifier }).select("tenAdmin").lean()
                    : null;
                return {
                    _id: sp._id.toString(), 
                    tenNguoiDung: seller?.tenNguoiDung || "Không xác định",
                    tenCuaHang: sp.idCH?.tenCH || "Không xác định",
                    tenSP: sp.tenSP,
                    nguonGoc: sp.nguonGoc,
                    trangThai: sp.trangThai,
                    ngaySX: formatDate(sp.ngaySX),
                    dsAnhSP: sp.dsAnhSP,
                    certify_image: sp.certify_image,
                    certifier: certifierInfo?.tenAdmin || "Không xác định", 
                    ngayTH: formatDate(sp.ngayTH),
                    batchId: sp.batchId,
                    tenDM: sp.idDM?.tenDM || "Không xác định",
                    phanLoai: sp.phanLoai?.map(pl => ({
                        idPL: pl.idPL,
                        tenLoai: pl.tenLoai,
                        giaLoai: pl.giaLoai,
                        donVi: pl.donVi,
                        khuyenMai: pl.khuyenMai,
                        khoHang: pl.khoHang
                    })) || []
                };
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm chờ duyệt:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};




const contract = new ethers.Contract(contractAddress, abi, provider);

export const getPendingProductFromCertifier = async (req, res) => {
    try {
        const { certifierAddress } = req.params;
        console.log("Received certifierAddress:", certifierAddress);

        if (!certifierAddress ||  !ethers.isAddress(certifierAddress)) {
            return res.status(400).json({ message: "Địa chỉ certifier không hợp lệ" });
        }

        // Gọi smart contract để lấy danh sách sản phẩm pending
        const productDetails = await contract.getProductsByCertifier(certifierAddress);

        if (!productDetails.length) {
            return res.status(200).json([]);
        }

        // Chuyển đổi dữ liệu sang định dạng mong muốn
        const results = productDetails.map((p) => ({
            _id: p.productId,
            tenSP: p.productName,
            tenCuaHang: p.storeName || "Không xác định",
            nguonGoc: p.seedType || "Không xác định",
            trangThai: p.isCertified ? "Đã xác nhận" : "Chờ xác nhận",
            ngaySX: formatDate(p.sowingDate),
            ngayTH: formatDate(p.harvestingDate),
            dsAnhSP: [], // Blockchain có lưu ảnh không? Nếu có, cần truy xuất
            certify_image: null,
            certifier: p.certifierName,
            batchId: p.productId, // Giả sử productId cũng là batchId
            tenDM: "Không xác định", // Không có thông tin danh mục trong contract
            phanLoai: [] // Blockchain có hỗ trợ phân loại không? Nếu có, cần xử lý
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm pending từ blockchain:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};



// Hàm định dạng ngày
function formatDate(dateStr) {
    if (!dateStr) return "Không xác định";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
}

export const updateProductStatus = async (req, res) => {
    try {
        const { productId } = req.params; 
        const { trangThai, nguyenNhanTC } = req.body;

        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await SanPham.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }
        product.trangThai = trangThai;
        if (trangThai === "Từ chối" && nguyenNhanTC) {
            product.nguyenNhanTC = nguyenNhanTC;
        }

        await product.save();

            res.json({ message: "Cập nhật trạng thái thành công!", product });
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
        }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await SanPham.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }
        if (product.trangThai !== "Từ chối") {
            return res.status(400).json({ message: "Chỉ có thể xoá sản phẩm bị từ chối!" });
        }

        await SanPham.findByIdAndDelete(id);
        res.status(200).json({ message: "Xoá sản phẩm thành công!" });

    } catch (error) {
        console.error("Lỗi xoá sản phẩm:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

export const getProductInfo = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin từ blockchain
        const productDetail = await contract.getProductDetails(id);

        if (!productDetail || !productDetail.productId) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trên blockchain!" });
        }

        // Định dạng dữ liệu phản hồi
        const productInfo = {
            productId: productDetail.productId,
            productName: productDetail.productName,
            storeName: productDetail.storeName,
            seedType: productDetail.seedType,
            sowingDate: productDetail.sowingDate,
            harvestingDate: productDetail.harvestingDate,
            packagingDate: productDetail.packagingDate,
            expirationDate: productDetail.expirationDate,
            inspectorName: productDetail.inspectorName,
            isCertified: productDetail.isCertified,
            certifierName: productDetail.certifierName,
            certifierImageCid: productDetail.certifierImageCid,
        };

        res.json({ product: productInfo });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ blockchain:", error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        
    
        const category = await DanhMuc.findById(categoryId).populate('dsSanPham');
        
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }
        
        return res.status(200).json({
            message: 'Lấy sản phẩm thành công',
            data: category.dsSanPham
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi server', error });
    }
};


export const getTopDeal = async (req, res) => {
    try {
        const topDeals1 = await Sanpham.aggregate([
            { 
                $match: {
                    trangThai: "Đang bán"
                }
            },
            { $unwind: "$phanLoai" }, // Tách từng loại sản phẩm
            { 
                $addFields: { 
                    giaSauKhuyenMai: {
                        $subtract: ["$phanLoai.giaLoai", 
                        { $multiply: ["$phanLoai.giaLoai", { $divide: ["$phanLoai.khuyenMai", 100] }] }]
                    }
                }
            },
            { 
                $sort: { 
                    "giaSauKhuyenMai": 1,    // Giá rẻ nhất sau giảm giá
                    "phanLoai.khuyenMai": -1, // Giảm giá cao nhất
                    "tongSoSao": -1,         // Ưu tiên sản phẩm có nhiều sao
                    "tongSoDanhGia": -1      // Ưu tiên sản phẩm có nhiều đánh giá
                }
            },
            { 
                $group: {
                    _id: "$_id" ,
                    tenSP: { $first: "$tenSP" },
                    idCH: { $first: "$idCH" },
                    dsAnhSP: { $first: "$dsAnhSP" },
                    phanLoai: { 
                        $push: {
                            idPL: "$phanLoai.idPL",
                            tenLoai: "$phanLoai.tenLoai",
                            giaLoai: "$phanLoai.giaLoai",
                            khuyenMai: "$phanLoai.khuyenMai"
                        }
                    },
                    nguonGoc: { $first: "$nguonGoc" },
                    tongSoSao: { $first: "$tongSoSao" },
                    tongSoDanhGia: { $first: "$tongSoDanhGia" },
                }
            },
            { 
                $sort: { 
                    "giaSauKhuyenMai": 1,  // Giá rẻ nhất sau giảm giá
                    "khuyenMai": -1, // Giảm giá cao nhất
                    "tongSoSao": -1,  // Ưu tiên sản phẩm có nhiều sao
                    "tongSoDanhGia": -1  // Ưu tiên sản phẩm có nhiều đánh giá
                }
            },
            { 
                $limit: 15
            },
            { 
                $project: { _id: 1, idCH: 1, dsAnhSP: 1, phanLoai: 1, tenSP: 1, nguonGoc: 1, tongSoSao: 1, tongSoDanhGia: 1 }                
            }
        ]);

        const topDeals = await Sanpham.populate(topDeals1, {
            path: 'idCH',
            select: 'tenCH'
        });

        res.status(200).json({
            success: true,
            message: "Top Deal - Sản phẩm giá rẻ và sale nhiều",
            data: topDeals
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách Top Deal:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách Top Deal"
        });
    }
};

export const getTopSelling = async (req, res) => {
    try {
        const topSelling = await Sanpham.aggregate([
            { 
                $match: {
                    trangThai: "Đang bán"
                }
            },
            { 
                $lookup: {
                    from: "Donhang",
                    localField: "_id",
                    foreignField: "dsSanPham.idSP",
                    as: "donhang"
                }
            },
            { 
                $unwind: "$donhang" 
            },
            { 
                $unwind: "$donhang.dsSanPham"
            },
            { 
                $group: {
                    _id: "$_id",
                    tenSP: { $first: "$tenSP" },
                    idCH: { $first: "$idCH" },
                    phanLoai: { $first: "$phanLoai" },
                    nguonGoc: { $first: "$nguonGoc" },
                    dsAnhSP: { $first: "$dsAnhSP" },
                    soLuongDonHang: { $sum: "$donhang.dsSanPham.soLuong" },
                    tongSoSao: { $sum: { $ifNull: ["$donhang.idDanhGia.soSao", 0] } },
                    tongSoDanhGia: { $sum: { $ifNull: ["$donhang.idDanhGia.soDanhGia", 0] } }
                }
            },
            { 
                $sort: { soLuongDonHang: -1, tongSoSao: -1, tongSoDanhGia: -1 }
            },
            { 
                $limit: 15 
            },
            { 
                $project: { 
                    _id: 1, tenSP: 1, idCH: 1, phanLoai: 1, nguonGoc: 1, dsAnhSP: 1, 
                    soLuongDonHang: 1, tongSoSao: 1, tongSoDanhGia: 1 
                }
            }
        ]);

        const topSellingFinal = await Sanpham.populate(topSelling, {
            path: 'idCH',
            select: 'tenCH'
        });

        res.status(200).json({
            success: true,
            message: "Top Bán Chạy - Sản phẩm bán chạy và đánh giá tốt",
            data: topSellingFinal
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách Top Bán Chạy:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách Top Bán Chạy"
        });
    }
};

export const getProductSuggestions = async (req, res) => {
    try {
        const suggestions = await Sanpham.aggregate([
            {
                $match: {
                    trangThai: "Đang bán",
                }
            },
            {
                $lookup: {
                    from: "Nguoidung",  // Kết nối với collection Nguoidung
                    localField: "_id",   // Liên kết với trường _id của sản phẩm
                    foreignField: "dsYeuThich", // Liên kết với dsYeuThich trong Nguoidung
                    as: "yeuThichBy"    // Tạo mảng để lưu thông tin người dùng yêu thích
                }
            },
            {
                $addFields: {
                    totalLikes: { $size: "$yeuThichBy" },  // Đếm số người dùng yêu thích sản phẩm
                }
            },
            {
                $sample: { size: 15 }  // Lấy 15 sản phẩm ngẫu nhiên
            },
            {
                $project: { 
                    _id: 1, tenSP: 1, idCH: 1, phanLoai: 1, nguonGoc: 1, dsAnhSP: 1, 
                    soLuongDonHang: 1, tongSoSao: 1, tongSoDanhGia: 1 
                }
            }
        ]);

        const suggestions1 = await Sanpham.populate(suggestions, {
            path: 'idCH',
            select: 'tenCH'
        });

        return res.status(200).json({
            success: true,
            message: "Gợi ý sản phẩm thành công",
            data: suggestions1
        });
        
    } catch (error) {
        console.error("Lỗi khi lấy gợi ý sản phẩm:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy gợi ý sản phẩm"
        });
    }
};

export const getProducTrelated = async (req, res) => {
    try {
        const { idCH } = req.params;
        
        const sanPhams = await SanPham.find({ 
            trangThai: 'Đang bán', 
            idCH: idCH 
        }).select("tenSP idCH phanLoai nguonGoc dsAnhSP soLuongDonHang tongSoSao tongSoDanhGia").populate("idCH", "tenCH");


        if (sanPhams.length === 0) {
            return res.status(404).json({ message: 'Không có sản phẩm nào đang bán trong cửa hàng này.' });
        }

        const randomSanPhams = sanPhams.sort(() => Math.random() - 0.5);

        const randomProducts = randomSanPhams.slice(0, 10); 

        res.status(200).json(randomProducts);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Có lỗi xảy ra khi lấy sản phẩm." });
    }
};

