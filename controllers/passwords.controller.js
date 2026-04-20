'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/PASSWORDS.CONTROLLER.JS
!=======================================================================================
*/

const { MatKhauModel } = require('../models/password.model');

const MatKhauController = {

    layTatCa: async (req, res, next) => {
        try {
            const { nhom, q } = req.query;
            const ds = await MatKhauModel.layTatCa(nhom || null, q || null);
            res.json({ thanhCong: true, duLieu: ds });
        } catch (loi) { next(loi); }
    },

    layNhomUnique: async (req, res, next) => {
        try {
            const ds = await MatKhauModel.layNhomUnique();
            res.json({ thanhCong: true, duLieu: ds });
        } catch (loi) { next(loi); }
    },

    layTheoId: async (req, res, next) => {
        try {
            const mk = await MatKhauModel.layTheoId(req.params.id);
            if (!mk) return res.status(404).json({ thanhCong: false, thongBao: 'Không tìm thấy' });
            res.json({ thanhCong: true, duLieu: mk });
        } catch (loi) { next(loi); }
    },

    them: async (req, res, next) => {
        try {
            const { nen_tang, mat_khau } = req.body;
            if (!nen_tang) return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập nền tảng' });
            if (!mat_khau) return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập mật khẩu' });
            const mk = await MatKhauModel.them(req.body);
            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm', duLieu: mk });
        } catch (loi) { next(loi); }
    },

    sua: async (req, res, next) => {
        try {
            const mk = await MatKhauModel.sua(req.params.id, req.body);
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật', duLieu: mk });
        } catch (loi) { next(loi); }
    },

    xoaLichSu: async (req, res, next) => {
        try {
            await MatKhauModel.xoaLichSu(req.params.id, req.params.lichSuId);
            res.json({ thanhCong: true, thongBao: 'Đã xoá lịch sử' });
        } catch (loi) { next(loi); }
    },

    an: async (req, res, next) => {
        try {
            await MatKhauModel.an(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá' });
        } catch (loi) { next(loi); }
    },
};

module.exports = MatKhauController;