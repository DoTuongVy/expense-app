'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/DEBTS.CONTROLLER.JS
!=======================================================================================
*/

const { NoModel } = require('../models/debt.model');

const NoController = {
    layTatCa: async (req, res, next) => {
        try {
            const ds = await NoModel.layTatCa(req.query.trangThai || null);
            res.json({ thanhCong: true, duLieu: ds });
        } catch (loi) { next(loi); }
    },

    them: async (req, res, next) => {
        try {
            const { chieuNo, tenNguoi, soTienGoc, hanTra, ghiChu } = req.body;
            if (!tenNguoi)  return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập tên' });
            if (!soTienGoc) return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập số tiền' });
            const no = await NoModel.them({ chieuNo, tenNguoi, soTienGoc: Number(soTienGoc), hanTra, ghiChu });
            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm', id: no._id });
        } catch (loi) { next(loi); }
    },

    capNhatDaTra: async (req, res, next) => {
        try {
            await NoModel.capNhatDaTra(req.params.id, Number(req.body.soTienThemVao));
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật' });
        } catch (loi) { next(loi); }
    },

    xoa: async (req, res, next) => {
        try {
            await NoModel.xoa(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá' });
        } catch (loi) { next(loi); }
    },
};

module.exports = NoController;
