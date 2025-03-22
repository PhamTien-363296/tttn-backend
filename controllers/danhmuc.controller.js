import Danhmuc from '../models/danhmuc.model.js'
import {v2 as cloudinary} from 'cloudinary'

export const addDanhMuc = async (req, res) => {
    try {
        const { tenDM, anhDM } = req.body;

        // Kiểm tra nếu danh mục đã tồn tại
        const danhMucTonTai = await Danhmuc.findOne({ tenDM });
        if (danhMucTonTai) {
            return res.status(400).json({ message: "Danh mục đã tồn tại!" });
        }

        let anhDMUrl = anhDM;
        if (anhDM) {
            try {
                const uploadResult = await cloudinary.uploader.upload(anhDM);
                anhDMUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.log("Lỗi upload ảnh:", uploadError.message);
                return res.status(500).json({ error: "Lỗi khi upload ảnh lên Cloudinary" });
            }
        }

        const danhMucMoi = new Danhmuc({ tenDM,anhDM:anhDMUrl });
        await danhMucMoi.save();

        res.status(201).json({ message: "Danh mục đã được tạo!", data: danhMucMoi });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

export const getDanhMuc = async (req, res) => {
    try {
        const danhMucList = await Danhmuc.find();
        //console.log(danhMucList)
        res.status(200).json(danhMucList);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};


export const suaDanhMuc = async (req, res) => {
    const { tenDM , anhDM} = req.body

    try{
        let danhmuc = await Danhmuc.findById(req.params.id)

        if(!danhmuc) return res.status(404).json({ message:"Không tìm thấy danh mục" })

            if (tenDM) danhmuc.tenDM = tenDM;
            
            if (anhDM) {
                let anhDMUrl = anhDM;
    
                try {
                    const uploadResult = await cloudinary.uploader.upload(anhDM);
                    anhDMUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.log("Lỗi upload ảnh:", uploadError.message);
                    return res.status(500).json({ error: "Lỗi khi upload ảnh lên Cloudinary" });
                }
    
                danhmuc.anhDM = anhDMUrl; 
            }

            danhmuc = await danhmuc.save()

            return res.status(200).json({danhmuc})
    } catch (error) {
        console.log("Lỗi suaDanhMuc controller", error.message)
        res.status(500).json({ error: error.message })
    }
}
