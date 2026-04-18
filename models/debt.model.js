'use strict';

/*
!=======================================================================================
 ! MODELS/DEBT.MODEL.JS — Schema theo dõi nợ (Mongoose)
!=======================================================================================
*/

const mongoose = require('mongoose');

const SchemaNo = new mongoose.Schema({
    direction       : { type: String, enum: ['i_owe','they_owe'], required: true },
    person_name     : { type: String, required: true },
    original_amount : { type: Number, required: true, min: 0 },
    paid_amount     : { type: Number, default: 0 },
    due_date        : { type: Date, default: null },
    status          : { type: String, enum: ['active','settled'], default: 'active' },
    note            : { type: String, default: '' },
}, { timestamps: true });

const No = mongoose.model('Debt', SchemaNo);

/*
!======================================================================================================================================
*/

const NoModel = {

    layTatCa: async (trangThai = null) => {
        const boLoc = {};
        if (trangThai) boLoc.status = trangThai;
        const danhSach = await No.find(boLoc).sort({ status: 1, createdAt: -1 });
        // ? Thêm trường conLai
        return danhSach.map(n => ({
            ...n.toObject(),
            conLai: n.original_amount - n.paid_amount,
        }));
    },

    them: async ({ chieuNo, tenNguoi, soTienGoc, hanTra, ghiChu }) => {
        return No.create({
            direction       : chieuNo,
            person_name     : tenNguoi,
            original_amount : soTienGoc,
            due_date        : hanTra || null,
            note            : ghiChu || '',
        });
    },

    // ! Tự chuyển settled nếu đã trả đủ
    capNhatDaTra: async (id, soTienThemVao) => {
        const no = await No.findById(id);
        if (!no) return;
        const paidMoi = no.paid_amount + soTienThemVao;
        return No.findByIdAndUpdate(id, {
            paid_amount : paidMoi,
            status      : paidMoi >= no.original_amount ? 'settled' : 'active',
        });
    },

    xoa: async (id) => No.findByIdAndDelete(id),
};

module.exports = { NoModel, No };
