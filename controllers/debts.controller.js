'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/DEBTS.CONTROLLER.JS — Xử lý theo dõi nợ
!=======================================================================================
*/

const NoModel = require('../models/debt.model');

/*
!======================================================================================================================================
*/

const NoController = {

    layTatCa: async (req, res, next) => {
        try {
            const { trangThai } = req.query;
            const danhSach      = await NoModel.layTatCa(trangThai || null);
            res.json({ thanhCong: true, duLieu: danhSach });
        } catch (loi) { next(loi); }
    },

    them: async (req, res, next) => {
        try {
            const { chieuNo, tenNguoi, soTienGoc, hanTra, ghiChu } = req.body;
            if (!tenNguoi)   return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập tên người' });
            if (!soTienGoc)  return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập số tiền' });

            const idMoi = await NoModel.them({ chieuNo, tenNguoi, soTienGoc, hanTra, ghiChu });
            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm khoản nợ', id: idMoi });
        } catch (loi) { next(loi); }
    },

    /*
    !=======================================================================================
     ? PUT /api/no/:id/tra — Cập nhật số đã trả/thu
    !=======================================================================================
    */
    capNhatDaTra: async (req, res, next) => {
        try {
            const { id }            = req.params;
            const { soTienThemVao } = req.body;
            await NoModel.capNhatDaTra(id, soTienThemVao);
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật' });
        } catch (loi) { next(loi); }
    },

    xoa: async (req, res, next) => {
        try {
            await NoModel.xoa(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá khoản nợ' });
        } catch (loi) { next(loi); }
    },

};

/*
!======================================================================================================================================
*/

module.exports = NoController;
