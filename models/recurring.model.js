'use strict';

/*
!=======================================================================================
 ! MODELS/RECURRING.MODEL.JS — Schema chi tiêu cố định hàng tháng
!=======================================================================================
*/

const mongoose = require('mongoose');

/*
!=======================================================================================
 ! Schema — Mỗi khoản là 1 template tái diễn hàng tháng
!=======================================================================================
*/

const SchemaChiTieuCoDinh = new mongoose.Schema({
    ten          : { type: String, required: true, trim: true },           // VD: "Tiền wifi"
    so_tien      : { type: Number, required: true, min: 0 },               // 180000
    ngay_den_han : { type: Number, required: true, min: 1, max: 31 },      // Ngày trong tháng: 25
    category_id  : { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    ghi_chu      : { type: String, default: '' },
    is_active    : { type: Boolean, default: true },                       // Ẩn/hiện
}, { timestamps: true });

const ChiTieuCoDinh = mongoose.model('Recurring', SchemaChiTieuCoDinh);

/*
!=======================================================================================
 ! Schema trạng thái đã đóng trong từng tháng (mỗi tháng 1 record / khoản)
!=======================================================================================
*/

const SchemaTrangThai = new mongoose.Schema({
    recurring_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Recurring', required: true },
    period_id    : { type: mongoose.Schema.Types.ObjectId, ref: 'Period',    required: true },
    da_dong      : { type: Boolean, default: false },
    ngay_dong    : { type: Date,    default: null },
    ghi_chu      : { type: String,  default: '' },
}, { timestamps: true });

// ? Mỗi khoản chỉ có 1 trạng thái / tháng
SchemaTrangThai.index({ recurring_id: 1, period_id: 1 }, { unique: true });

const TrangThaiCoDinh = mongoose.model('RecurringStatus', SchemaTrangThai);

/*
!=======================================================================================
 ! Model methods
!=======================================================================================
*/

const ChiTieuCoDinhModel = {

    // ? Lấy tất cả khoản cố định đang active
    layTatCa: async () => {
        return ChiTieuCoDinh.find({ is_active: true })
            .populate('category_id', 'name icon color type')
            .sort({ ngay_den_han: 1 });
    },

    // ? Lấy danh sách kèm trạng thái trong tháng
    layTheoKy: async (kyThangId) => {
        const dsKhoan = await ChiTieuCoDinh.find({ is_active: true })
            .populate('category_id', 'name icon color type')
            .sort({ ngay_den_han: 1 });

        if (!dsKhoan.length) return [];

        // ? Lấy trạng thái tháng này
        const dsTrangThai = await TrangThaiCoDinh.find({
            period_id    : kyThangId,
            recurring_id : { $in: dsKhoan.map(k => k._id) },
        });

        const bangTrangThai = {};
        dsTrangThai.forEach(tt => {
            bangTrangThai[tt.recurring_id.toString()] = tt;
        });

        return dsKhoan.map(k => {
            const tt = bangTrangThai[k._id.toString()];
            return {
                id          : k._id,
                ten         : k.ten,
                soTien      : k.so_tien,
                ngayDenHan  : k.ngay_den_han,
                danhMucId   : k.category_id._id,
                tenDanhMuc  : k.category_id.name,
                iconDanhMuc : k.category_id.icon,
                mauDanhMuc  : k.category_id.color,
                ghiChu      : k.ghi_chu,
                daDong      : tt?.da_dong || false,
                ngayDong    : tt?.ngay_dong || null,
                trangThaiId : tt?._id || null,
            };
        });
    },

    them: async ({ ten, soTien, ngayDenHan, danhMucId, ghiChu }) => {
        const khoan = new ChiTieuCoDinh({
            ten,
            so_tien      : soTien,
            ngay_den_han : ngayDenHan,
            category_id  : danhMucId,
            ghi_chu      : ghiChu || '',
        });
        return khoan.save();
    },

    sua: async (id, { ten, soTien, ngayDenHan, danhMucId, ghiChu }) => {
        return ChiTieuCoDinh.findByIdAndUpdate(id, {
            ten,
            so_tien      : soTien,
            ngay_den_han : ngayDenHan,
            category_id  : danhMucId,
            ghi_chu      : ghiChu || '',
        }, { new: true });
    },

    xoa: async (id) => ChiTieuCoDinh.findByIdAndDelete(id),

    // ! Đánh dấu đã đóng / chưa đóng (toggle)
    capNhatTrangThai: async (recurringId, kyThangId, daDong, ghiChu) => {
        return TrangThaiCoDinh.findOneAndUpdate(
            { recurring_id: recurringId, period_id: kyThangId },
            {
                da_dong  : daDong,
                ngay_dong: daDong ? new Date() : null,
                ghi_chu  : ghiChu || '',
            },
            { upsert: true, new: true }
        );
    },
};

module.exports = { ChiTieuCoDinhModel, ChiTieuCoDinh, TrangThaiCoDinh };