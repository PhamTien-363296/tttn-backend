import mongoose from "mongoose";

const tinnhanSchema = new mongoose.Schema(
	{
		nguoiGuiId: {
			type: mongoose.Schema.Types.ObjectId,
            ref: "Nguoidung",
		},
        nguoiNhanId: {
			type: mongoose.Schema.Types.ObjectId,
            ref: "Nguoidung",
		},
        noiDungTN: {
			type: String,
            required: true,
		},
	},
	{ timestamps: true }
);

const Tinnhan = mongoose.model("Tinnhan", tinnhanSchema,"Tinnhan");

export default Tinnhan;