import moment from 'moment';
import config from 'config';
import querystring from 'qs';
import crypto from 'crypto';
import Axios from 'axios';
import mongoose from "mongoose";


export const themThanhtoan = async (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnpUrl = config.get('vnp_Url');
    let returnUrl = config.get('vnp_ReturnUrl');
    let orderId = moment(date).format('DDHHmmss');
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;
    let donhangId = req.body.donhangId;
    
    let locale = req.body.language;
    if (locale === null || locale === '') {
        locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `${orderId},${donhangId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    
    // GỬI VỀ URL ĐỂ FRONTEND CHUYỂN HƯỚNG ĐẾN VNPAY
    res.send(vnpUrl);
};

export const layThanhtoan = async (req, res, next) => {
    let vnp_Params = req.query; 
    let secureHash = vnp_Params['vnp_SecureHash']; 
    delete vnp_Params['vnp_SecureHash']; 
    delete vnp_Params['vnp_SecureHashType']; 
    vnp_Params = sortObject(vnp_Params); 
    let tmnCode = config.get('vnp_TmnCode'); 
    let secretKey = config.get('vnp_HashSecret'); 
    let orderStatus = vnp_Params['vnp_TransactionStatus'];
    let signData = querystring.stringify(vnp_Params, { encode: false }); 
    let hmac = crypto.createHmac("sha512", secretKey); 
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    let orderInfo = vnp_Params['vnp_OrderInfo'];
    let loaiThe = vnp_Params['vnp_BankCode'];
    let loaiGiaoDich = vnp_Params['vnp_CardType'];
    
    if (secureHash === signed) {
        let orderParts = orderInfo.split("%2C");

        let orderId, donhangId;
        if (orderParts.length === 2) {
            orderId = orderParts[0].trim();
            donhangId = orderParts[1].trim();
            console.log('orderId:',orderId,'donhangId:',donhangId);
        } else {
            console.error('Invalid orderInfo format:', orderInfo);
            return res.status(400).send('Invalid orderInfo format');
        }

        const thongTinGiaoDich = {
            maGiaoDich: orderId,
            trangThaiThanhToan: orderStatus === '00' ? 'Thành công' : 'Thất bại',
            loaiThanhToan: 'VNPay',
            loaiThe: loaiThe,
            loaiGiaoDich: loaiGiaoDich,
            soTien: vnp_Params['vnp_Amount'] / 100,
        };

        //console.log('GiaoDich:', giaoDich);

        try {
            const addResponse = await Axios.post(`http://localhost:5000/api/giaodich/them`,{
                idDonHang: donhangId,
                soTien: vnp_Params['vnp_Amount'] / 100,
                dongTien: 'Cộng',
                loaiGiaoDich: 'Thanh toán',
                thongTinGiaoDich
            });

            if (addResponse.status === 201) {
                const giaoDichId = addResponse.data.giaoDichId;

                res.cookie('giaodichId', giaoDichId, {
                    secure: false,
                    sameSite: 'Strict',
                    maxAge: 30 * 1000 
                });
            
                //console.log('Cookie đã được thiết lập:', donhangId);
                res.redirect(`http://localhost:3000/payment-result`);
            } else {
                console.error('Lỗi thêm giao dịch:', updateResponse.data);
                res.redirect(`http://localhost:3000/payment-result`);
            }
        } catch (error) {
            console.error('Lỗi khi THÊM giao dịch:', error);
            res.redirect(`http://localhost:3000/payment-result?status=error`);
        }
    } else {
        res.status(400).send('Invalid signature');
    }
};

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
};
