'use strict';

/*
!=======================================================================================
 ! MODELS/TRANSACTION.MODEL.JS — Schema giao dịch (Mongoose)
!=======================================================================================
*/

const mongoose = require('mongoose');

/*
!=======================================================================================
 ! Schema
!=======================================================================================
*/

const SchemaGiaoDich = new mongoose.Schema({
    period_id     : { type: mongoose.Schema.Types.ObjectId, ref: 'Period',   required: true },
    category_id   : { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    type          : {
        type: String,
        enum: ['income','expense','saving','debt_give','debt_take','debt_collect','debt_pay','adjustment'],
        required: true,
    },
    amount        : { type: Number, required: true, min: 0 },
    trans_date    : { type: Date, required: true },
    note          : { type: String, default: '' },
    note2 : { type: String, default: '' },
    is_adjustment : { type: Boolean, default: false },
}, { timestamps: true });

SchemaGiaoDich.index({ period_id: 1, trans_date: -1 });
SchemaGiaoDich.index({ period_id: 1, type: 1 });

const GiaoDich = mongoose.model('Transaction', SchemaGiaoDich);

/*
!======================================================================================================================================
*/

const GiaoDichModel = {

    layTheoKy: async (kyThangId, loai = null) => {
        const boLoc = { period_id: kyThangId };
        if (loai) boLoc.type = loai;
        return GiaoDich.find(boLoc)
            .populate('category_id', 'name icon color type')
            .sort({ trans_date: -1, createdAt: -1 });
    },

    layTheoId: async (id) => {
        return GiaoDich.findById(id).populate('category_id', 'name icon color');
    },

    them: async ({ kyThangId, danhMucId, loai, soTien, ngay, ghiChu, ghiChu2 }) => {
        const gd = new GiaoDich({
            period_id   : kyThangId,
            category_id : danhMucId,
            type        : loai,
            amount      : soTien,
            trans_date  : new Date(ngay),
            note        : ghiChu || '',
            note2       : ghiChu2 || '',
        });
        return gd.save();
    },

    sua: async (id, { danhMucId, loai, soTien, ngay, ghiChu, ghiChu2 }) => {
        return GiaoDich.findByIdAndUpdate(id, {
            category_id : danhMucId,
            type        : loai,
            amount      : soTien,
            trans_date  : new Date(ngay),
            note        : ghiChu || '',
            note2       : ghiChu2 || '',
        });
    },

    xoa: async (id) => GiaoDich.findByIdAndDelete(id),

    // ! Thêm dòng điều chỉnh chênh lệch cuối tháng
    themDieuChinh: async (kyThangId, soTienChenhLech, danhMucId) => {
        const loai = soTienChenhLech >= 0 ? 'income' : 'expense';
        return GiaoDich.create({
            period_id     : kyThangId,
            category_id   : danhMucId,
            type          : loai,
            amount        : Math.abs(soTienChenhLech),
            trans_date    : new Date(),
            note          : 'Điều chỉnh chênh lệch cuối tháng',
            is_adjustment : true,
        });
    },

    // ? Tính tổng hợp cho 1 kỳ (thay thế view MySQL)
    tinhTongHop: async (kyThangId) => {
        const ketQua = await GiaoDich.aggregate([
            { $match: { period_id: new mongoose.Types.ObjectId(kyThangId), is_adjustment: false } },
            { $group: {
                _id         : null,
                total_income  : { $sum: { $cond: [{ $in: ['$type', ['income','debt_take','debt_collect']] }, '$amount', 0] } },
                total_expense : { $sum: { $cond: [{ $in: ['$type', ['expense','debt_give','debt_pay','saving']] }, '$amount', 0] } },
                total_saving  : { $sum: { $cond: [{ $eq: ['$type', 'saving'] }, '$amount', 0] } },
            }},
        ]);
        return ketQua[0] || { total_income: 0, total_expense: 0, total_saving: 0 };
    },

    // ? Tổng hợp theo danh mục
    tinhTheoCategory: async (kyThangId) => {
        return GiaoDich.aggregate([
            { $match: { period_id: new mongoose.Types.ObjectId(kyThangId), is_adjustment: false } },
            { $group: {
                _id           : '$category_id',
                tongTien      : { $sum: '$amount' },
                soGiaoDich    : { $count: {} },
            }},
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'danhMuc' } },
            { $unwind: '$danhMuc' },
            { $project: {
                danhMucId   : '$_id',
                tenDanhMuc  : '$danhMuc.name',
                iconDanhMuc : '$danhMuc.icon',
                mauDanhMuc  : '$danhMuc.color',
                nhom        : '$danhMuc.type',
                tongTien    : 1,
                soGiaoDich  : 1,
            }},
            { $sort: { tongTien: -1 } },
        ]);
    },
};

module.exports = { GiaoDichModel, GiaoDich };
