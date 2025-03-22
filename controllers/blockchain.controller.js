import { ethers } from "ethers";
import abi from "../abi.js";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = abi;
const contract = new ethers.Contract(contractAddress, contractABI, provider);

export const getAllAdmin = async (req, res) => {
    try {
        const admins = await contract.getAdmins();
        console.log("Danh sách tất cả các admin", admins);
        res.status(201).json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu admin" });
    }
};

export const getAllInspector = async (req, res) => {
    try {
        const inspectors = await contract.getInspectors();
        const result = inspectors.map(inspector => {
            return convertBigIntToString(inspector);
        });
        console.log("Danh sách tất cả các kiểm duyệt", result);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu inspector" });
    }
};

export const getAllStore = async (req, res) => {
    try {
        const stores = await contract.getAllStores();
        const result = stores.map(store => {
            return convertBigIntToString(store);
        });
        console.log("Danh sách tất cả các cửa hàng", result);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu store" });
    }
};

export const getAllProduct = async (req, res) => {
    try {
        const allProducts = await contract.getAllProducts();
        console.log("Danh sách tất cả các sản phẩm:", allProducts);
        res.status(201).json(allProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu product" });
    }
};

export const getAllProductById = async (req, res) => {
    const { productId } = req.params;
    try {
        const productDetails = await contract.methods.getProductDetails(productId).call();
        console.log("Thông tin sản phẩm", productDetails);
        res.status(201).json(productDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

function convertBigIntToString(obj) {
    if (typeof obj === 'bigint') {
        return obj.toString();
    }

    if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
    }

    if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = convertBigIntToString(obj[key]);
            }
        }
        return newObj;
    }

    return obj;
}
