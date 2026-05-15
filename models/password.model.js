'use strict';

/*
!=======================================================================================
 ! MODELS/PASSWORD.MODEL.JS - Schema MongoDB cho lưu mật khẩu cá nhân
!=======================================================================================
*/

const mongoose = require('mongoose');

/*
!=======================================================================================
 ! Schema lịch sử đổi mật khẩu
!=======================================================================================
*/

const SchemaSuaMK = new mongoose.Schema({
    matKhau  : { type: String, required: true },
    ghiChu   : { type: String, default: '' },
    ngaySua  : { type: Date, default: Date.now },
}, { _id: true });

/*
!=======================================================================================
 ! Schema chính
!=======================================================================================
*/

const SchemaMK = new mongoose.Schema({
    nen_tang    : { type: String, required: true },           // tên nền tảng: Facebook, Gmail...
    url         : { type: String, default: '' },              // link trang web
    nhom        : { type: String, default: 'Khác' },          // Mạng xã hội, Email, Ngân hàng...
    ten_dn      : { type: String, default: '' },              // tên đăng nhập / email
    mat_khau    : { type: String, required: true },           // mật khẩu hiện tại
    ghiChu      : { type: String, default: '' },              // ghi chú 1
    ghiChu2     : { type: String, default: '' },              // ghi chú 2
    quan_trong  : { type: Boolean, default: false },          // đánh dấu quan trọng
    an           : { type: Boolean, default: false },         // ẩn khỏi danh sách
    icon_emoji  : { type: String, default: '' },              // emoji icon tuỳ chọn
    lich_su_mk  : { type: [SchemaSuaMK], default: [] },       // lịch sử đổi mật khẩu
    ngay_doi_mk  : { type: Date, default: null },             // ngày đổi mật khẩu gần nhất
}, { timestamps: true });

SchemaMK.index({ nen_tang: 'text', ten_dn: 'text' });
SchemaMK.index({ nhom: 1 });
SchemaMK.index({ an: 1 });

const MatKhau = mongoose.model('Password', SchemaMK);

/*
!=======================================================================================
 ! Model Methods
!=======================================================================================
*/

const MatKhauModel = {

    layTatCa: async (nhom = null, tuKhoa = null) => {
        const boLoc = { an: false };
        if (nhom && nhom !== 'all') boLoc.nhom = nhom;
        if (tuKhoa) {
            boLoc.$or = [
                { nen_tang: { $regex: tuKhoa, $options: 'i' } },
                { ten_dn:   { $regex: tuKhoa, $options: 'i' } },
            ];
        }
        return MatKhau.find(boLoc).sort({ quan_trong: -1, nen_tang: 1 });
    },

    layTheoId: async (id) => MatKhau.findById(id),

    them: async (data) => {
        const mk = new MatKhau(data);
        return mk.save();
    },

    sua: async (id, data) => {
        const banGhi = await MatKhau.findById(id);
        if (!banGhi) throw new Error('Không tìm thấy');

        // ? Nếu mật khẩu thay đổi → lưu vào lịch sử
        if (data.mat_khau && data.mat_khau !== banGhi.mat_khau) {
            banGhi.lich_su_mk.push({
                matKhau : banGhi.mat_khau,
                ghiChu  : `Đổi sang mật khẩu mới`,
                ngaySua : new Date(),
            });
            banGhi.ngay_doi_mk = new Date();
        }

        Object.assign(banGhi, data);
        return banGhi.save();
    },

    xoaLichSu: async (id, lichSuId) => {
        return MatKhau.findByIdAndUpdate(id, {
            $pull: { lich_su_mk: { _id: lichSuId } },
        });
    },

    an: async (id) => MatKhau.findByIdAndUpdate(id, { an: true }),

    layNhomUnique: async () => {
        return MatKhau.distinct('nhom', { an: false });
    },
};

module.exports = { MatKhauModel, MatKhau };