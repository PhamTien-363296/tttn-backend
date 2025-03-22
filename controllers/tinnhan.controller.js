import  Hoithoai from "../models/hoithoai.model.js";
import Tinnhan from "../models/tinnhan.model.js";
import { getReceiverSocketId,io } from "../socket/socket.js";


export const guiTinNhan = async (req, res) => {
	try {
		const { noiDungTN } = req.body;
		const { id: nguoiNhanId } = req.params;
		const nguoiGuiId = req.nguoidung._id;

		let hoithoai = await Hoithoai.findOne({
			nguoiThamGia: { $all: [nguoiGuiId,  nguoiNhanId] },
		});

		if (!hoithoai) {
			hoithoai = await Hoithoai.create({
				nguoiThamGia: [nguoiGuiId,  nguoiNhanId],
			});
		}

		const tinNhanMoi = new Tinnhan({
			nguoiGuiId,
			nguoiNhanId,
			noiDungTN,
		});

		if (tinNhanMoi) {
			hoithoai.cacTinNhan.push(tinNhanMoi._id);
		}

		await Promise.all([hoithoai.save(),tinNhanMoi.save()]);

		const receiverSocketId = getReceiverSocketId(nguoiNhanId)

		if(receiverSocketId){
			io.to(receiverSocketId).emit("tinNhanMoi",tinNhanMoi)
		}

		res.status(201).json(tinNhanMoi);
	} catch (error) {
		console.log("Lỗi guiTinNhan controller: ", error.message);
		res.status(500).json({ error: "Lỗi 500" });
	}
};

export const layTinNhan = async (req, res) => {
	try {
		const { id: nguoiDeChat } = req.params;
		const nguoiGuiId = req.nguoidung._id;

		const hoithoai = await Hoithoai.findOne({
			nguoiThamGia: { $all: [nguoiGuiId, nguoiDeChat] },
		}).populate("cacTinNhan"); 

		if (!hoithoai) return res.status(200).json([]);

		const cacTinNhan = hoithoai.cacTinNhan;

		res.status(200).json(cacTinNhan);
	} catch (error) {
		console.log("Lỗi layTinNhan controller: ", error.message);
		res.status(500).json({ error: "Lỗi 500" });
	}
};