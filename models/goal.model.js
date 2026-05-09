'use strict';

/*
!=======================================================================================
 ! MODELS/GOAL.MODEL.JS — Schema mục tiêu (Mongoose)
!=======================================================================================
*/

const mongoose = require('mongoose');

const SchemaMucTieu = new mongoose.Schema({
    period_id     : { type: mongoose.Schema.Types.ObjectId, ref: 'Period',   required: true },
    category_id   : { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    target_amount : { type: Number, required: true, min: 0 },
    note          : { type: String, default: '' },  // ! Ghi chú cho mục tiêu
}, { timestamps: true });

// ? Mỗi danh mục chỉ có 1 mục tiêu/tháng
SchemaMucTieu.index({ period_id: 1, category_id: 1 }, { unique: true });

const MucTieu = mongoose.model('Goal', SchemaMucTieu);

/*
!======================================================================================================================================
*/

const MucTieuModel = {

    layTheoKy: async (kyThangId) => {
        const { GiaoDich } = require('./transaction.model');

        const dsMucTieu = await MucTieu.find({ period_id: kyThangId })
            .populate('category_id', 'name icon color type');

        // ? Tính thực tế đã chi cho từng danh mục
        const ketQua = await Promise.all(dsMucTieu.map(async (mt) => {
            const tongThucTe = await GiaoDich.aggregate([
                { $match: {
                    period_id   : new mongoose.Types.ObjectId(kyThangId),
                    category_id : mt.category_id._id,
                    is_adjustment: false,
                }},
                { $group: { _id: null, tong: { $sum: '$amount' } } },
            ]);

            const soTienThucTe = tongThucTe[0]?.tong || 0;
            return {
                id              : mt._id,
                soTienMucTieu   : mt.target_amount,
                danhMucId       : mt.category_id._id,
                tenDanhMuc      : mt.category_id.name,
                iconDanhMuc     : mt.category_id.icon,
                mauDanhMuc      : mt.category_id.color,
                nhomDanhMuc     : mt.category_id.type,
                soTienThucTe,
                chenhLech       : mt.target_amount - soTienThucTe,
                ghiChu          : mt.note || '',  // ! Thêm ghi chú
            };
        }));

        return ketQua;
    },

    // ! Upsert — đã có thì update, chưa có thì insert
    datMucTieu: async (kyThangId, danhMucId, soTienMucTieu, ghiChu = '') => {
        return MucTieu.findOneAndUpdate(
            { period_id: kyThangId, category_id: danhMucId },
            { 
                target_amount: soTienMucTieu,
                note: ghiChu  // ! Lưu ghi chú
            },
            { upsert: true, new: true }
        );
    },

    xoa: async (id) => MucTieu.findByIdAndDelete(id),
};

module.exports = { MucTieuModel, MucTieu };