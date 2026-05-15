'use strict';

/*
!=======================================================================================
 ! MODELS/PERIOD.MODEL.JS  - Schema MongoDB cho chốt tháng
!=======================================================================================
*/

const mongoose = require('mongoose');

/*
!=======================================================================================
 ! Schema
!=======================================================================================
*/

const SchemaKyThang = new mongoose.Schema({
    month           : { type: Number, required: true, min: 1, max: 12 },
    year            : { type: Number, required: true },
    opening_balance : { type: Number, default: 0 },   // ! Số dư thực tế user xác nhận
    system_balance  : { type: Number, default: 0 },   // ? Số dư hệ thống tính
    adjustment      : { type: Number, default: 0 },   // ? Chênh lệch
    adjustment_note : { type: String, default: '' },
    is_closed       : { type: Boolean, default: false },
    closed_at       : { type: Date, default: null },
}, { timestamps: true });

// ! Mỗi tháng/năm chỉ có 1 kỳ
SchemaKyThang.index({ month: 1, year: 1 }, { unique: true });

const KyThang = mongoose.model('Period', SchemaKyThang);

/*
!======================================================================================================================================
*/

const KyThangModel = {

    // ? Lấy hoặc tạo kỳ tháng — dùng khi user chọn tháng
    layHoacTaoKy: async (thang, nam) => {
        let ky = await KyThang.findOne({ month: thang, year: nam });
        if (!ky) ky = await KyThang.create({ month: thang, year: nam });
        return ky;
    },

    layKyHienTai: async () => {
        const homNay = new Date();
        return KyThangModel.layHoacTaoKy(homNay.getMonth() + 1, homNay.getFullYear());
    },

    layTatCa: async () => KyThang.find().sort({ year: -1, month: -1 }),

    // ! Cập nhật số dư khi chốt tháng
    capNhatSoDauKy: async (kyThangId, soduThucTe, ghiChu) => {
        const ky            = await KyThang.findById(kyThangId);
        const soduHeThong   = ky?.system_balance || 0;
        const chenhLech     = soduThucTe - soduHeThong;

        await KyThang.findByIdAndUpdate(kyThangId, {
            opening_balance : soduThucTe,
            adjustment      : chenhLech,
            adjustment_note : ghiChu || '',
        });

        return { soduThucTe, soduHeThong, chenhLech };
    },

    chotThang: async (kyThangId) => {
        return KyThang.findByIdAndUpdate(kyThangId, {
            is_closed : true,
            closed_at : new Date(),
        });
    },

    // ? Cập nhật system_balance sau khi tính xong
    capNhatSystemBalance: async (kyThangId, soduHeThong) => {
        return KyThang.findByIdAndUpdate(kyThangId, { system_balance: soduHeThong });
    },
};

module.exports = { KyThangModel, KyThang };
