'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/RECURRINGS.CONTROLLER.JS — Xử lý chi tiêu cố định
!=======================================================================================
*/

const { ChiTieuCoDinhModel } = require('../models/recurring.model');
const { KyThangModel }       = require('../models/period.model');

const ChiTieuCoDinhController = {

    // ? GET /api/chi-tieu-co-dinh?thang=5&nam=2026
    layTheoThang: async (req, res, next) => {
        try {
            const { thang, nam } = req.query;
            const ky  = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            const ds  = await ChiTieuCoDinhModel.layTheoKy(ky._id);
            res.json({ thanhCong: true, duLieu: ds });
        } catch (loi) { next(loi); }
    },

    // ! POST /api/chi-tieu-co-dinh — Thêm khoản cố định mới
    them: async (req, res, next) => {
        try {
            const { ten, soTien, ngayDenHan, danhMucId, ghiChu } = req.body;

            if (!ten?.trim())             return res.status(400).json({ thanhCong: false, thongBao: 'Cần nhập tên khoản' });
            if (!soTien || soTien <= 0)   return res.status(400).json({ thanhCong: false, thongBao: 'Số tiền không hợp lệ' });
            if (!ngayDenHan || ngayDenHan < 1 || ngayDenHan > 31)
                                          return res.status(400).json({ thanhCong: false, thongBao: 'Ngày đến hạn không hợp lệ (1-31)' });
            if (!danhMucId)               return res.status(400).json({ thanhCong: false, thongBao: 'Chưa chọn danh mục' });

            const khoan = await ChiTieuCoDinhModel.them({
                ten,
                soTien     : Number(soTien),
                ngayDenHan : Number(ngayDenHan),
                danhMucId,
                ghiChu,
            });
            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm khoản cố định', id: khoan._id });
        } catch (loi) { next(loi); }
    },

    // ? PUT /api/chi-tieu-co-dinh/:id — Cập nhật
    sua: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { ten, soTien, ngayDenHan, danhMucId, ghiChu } = req.body;

            if (!ten?.trim())             return res.status(400).json({ thanhCong: false, thongBao: 'Cần nhập tên khoản' });
            if (!soTien || soTien <= 0)   return res.status(400).json({ thanhCong: false, thongBao: 'Số tiền không hợp lệ' });

            await ChiTieuCoDinhModel.sua(id, {
                ten,
                soTien     : Number(soTien),
                ngayDenHan : Number(ngayDenHan),
                danhMucId,
                ghiChu,
            });
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật' });
        } catch (loi) { next(loi); }
    },

    // ! DELETE /api/chi-tieu-co-dinh/:id — Xoá
    xoa: async (req, res, next) => {
        try {
            await ChiTieuCoDinhModel.xoa(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá khoản cố định' });
        } catch (loi) { next(loi); }
    },

    // ? PUT /api/chi-tieu-co-dinh/:id/trang-thai — Toggle đã đóng
    capNhatTrangThai: async (req, res, next) => {
        try {
            const { id }                   = req.params;
            const { thang, nam, daDong, ghiChu } = req.body;

            const ky = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            await ChiTieuCoDinhModel.capNhatTrangThai(id, ky._id, Boolean(daDong), ghiChu);
            res.json({ thanhCong: true, thongBao: daDong ? 'Đã đánh dấu đã đóng' : 'Đã bỏ đánh dấu' });
        } catch (loi) { next(loi); }
    },
};

module.exports = ChiTieuCoDinhController;