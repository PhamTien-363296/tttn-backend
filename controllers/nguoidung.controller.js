import Nguoidung from "../models/nguoidung.model.js"
import {v2 as cloudinary} from 'cloudinary'
import Sanpham from "../models/sanpham.model.js";

export const yeuThich = async (req, res) => {
    try {   
        const idSP = req.params.id; 
        const idND = req.nguoidung._id;
        const nguoiDung = await Nguoidung.findById(idND);
        if (!nguoiDung) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const index = nguoiDung.dsYeuThich.indexOf(idSP);
        let incrementValue = 0;

        if (index === -1) {
            nguoiDung.dsYeuThich.push(idSP);
            incrementValue = 1;  // Tăng khi thêm vào yêu thích
        } else {
            nguoiDung.dsYeuThich.splice(index, 1);
            incrementValue = -1; // Giảm khi bỏ yêu thích
        }
        await nguoiDung.save();

        await Sanpham.updateOne({ _id: idSP }, { $inc: { yeuThich: incrementValue } });

        return res.status(200).json({
            message: index === -1 ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích",
            yeuThichSP: nguoiDung.dsYeuThich,
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi 500" });
        console.log("Lỗi yêu thích controller", error.message);
    }
};

export const updateThongTinGiaoHang = async (req, res) => {
    try {
        const { hoVaTen, sdt, diaChi } = req.body;
        const idND = req.nguoidung._id;

        if (!hoVaTen || !sdt || !diaChi) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        const updated = await Nguoidung.findByIdAndUpdate(
            idND,
            { thongTinGiaoHang: { hoVaTen, sdt, diaChi } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        res.status(200).json({ message: "Cập nhật thành công", nguoidung: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};




export const layNguoiDungTN = async (req, res) => {
	try {
		const nguoidung = req.nguoidung._id;

		const nguoidungdaloc = await Nguoidung.find({ _id: { $ne: nguoidung } })
        .select("-matKhau")
        .populate("anhND")
    

		res.status(200).json(nguoidungdaloc);
	} catch (error) {
		console.error("Lỗi layNguoiDungTN controller: ", error.message);
		res.status(500).json({ error: "Lỗi 500" });
	}
};


export const capNhat = async (req, res) => {
    let {  anhND} = req.body; 

    const id = req.nguoidung._id;
    try {
        let nguoidung = await Nguoidung.findById(id);
        if (!nguoidung) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        if (anhND) {
        
            if (nguoidung.anhND) {
                await cloudinary.uploader.destroy(nguoidung.anhND.split("/").pop().split(".")[0]);
            }
        
            const uploadedResponse = await cloudinary.uploader.upload(anhND);
            anhND = uploadedResponse.secure_url;
        }

        nguoidung.anhND = anhND|| nguoidung.anhND;

        nguoidung = await nguoidung.save();

        return res.status(200).json({ nguoidung });
    } catch (error) {
        console.log("Lỗi capNhat controller:", error.message);
        res.status(500).json({ error: error.message });
    }
};


export const layNguoiDungQuaId = async (req, res) => {
    try {
        const { id } = req.params;
        const nguoidung = await Nguoidung.findById(id).select("-matKhau");
        if (!nguoidung) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json({ nguoidung });
    } catch (error) {
        console.error("Lỗi layNguoiDungQuaId controller:", error.message);
        return res.status(500).json({ message: "Lỗi 500" });
    }
};

export const layYeuThich = async (req, res) => {
    try {
        const id = req.nguoidung._id;
        const { sort = "createdAt", page = 1, limit = 12 } = req.query;
        
        const nguoidung = await Nguoidung.findById(id)
            .populate({
                path: "dsYeuThich",
                select: "_id idCH dsAnhSP phanLoai tenSP nguonGoc tongSoSao tongSoDanhGia",
                populate: {
                    path: "idCH",
                    select: "tenCH",
                },
                options: {
                    sort: { [sort]: -1 }, // Sắp xếp mặc định giảm dần theo `createdAt`
                    skip: (page - 1) * limit, // Bỏ qua số lượng sản phẩm
                    limit: parseInt(limit), // Giới hạn số sản phẩm trả về
                },
            });

        if (!nguoidung) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const tong = nguoidung.dsYeuThich.length;
        const tongPage = Math.ceil(tong / limit);

        return res.status(200).json({ 
            dsYeuThich: nguoidung.dsYeuThich, 
            tong, 
            tongPage, 
            currentPage: parseInt(page) 
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách yêu thích:", error.message);
        return res.status(500).json({ message: "Lỗi 500 - Server Error" });
    }
};
