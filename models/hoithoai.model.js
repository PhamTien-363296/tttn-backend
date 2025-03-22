import mongoose from "mongoose";

const hoithoaiSchema = new mongoose.Schema(
	{
		nguoiThamGia: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Nguoidung",
			},
		],
		cacTinNhan: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Tinnhan",
				default: [],
			},
		],
	},
	{ timestamps: true }
);

const Hoithoai = mongoose.model("Hoithoai", hoithoaiSchema,"Hoithoai");

export default Hoithoai;