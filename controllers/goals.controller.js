'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/GOALS.CONTROLLER.JS — Xử lý mục tiêu
!=======================================================================================
*/

const MucTieuModel  = require('../models/goal.model');
const KyThangModel  = require('../models/period.model');

/*
!======================================================================================================================================
*/

const MucTieuController = {

    /*
    !=======================================================================================
     ? GET /api/muc-tieu?thang=4&nam=2026
    !=======================================================================================
    */
    layTheoThang: async (req, res, next) => {
        try {
            const { thang, nam }    = req.query;
            const kyThang           = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            const danhSach          = await MucTieuModel.layTheoKy(kyThang.id);
            res.json({ thanhCong: true, duLieu: danhSach });
        } catch (loi) { next(loi); }
    },

    /*
    !=======================================================================================
     ! POST /api/muc-tieu — Đặt hoặc cập nhật mục tiêu
    !=======================================================================================
    */
    datMucTieu: async (req, res, next) => {
        try {
            const { thang, nam, danhMucId, soTienMucTieu } = req.body;
            if (!soTienMucTieu || soTienMucTieu <= 0) {
                return res.status(400).json({ thanhCong: false, thongBao: 'Số tiền mục tiêu không hợp lệ' });
            }
            const kyThang = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            await MucTieuModel.datMucTieu(kyThang.id, danhMucId, soTienMucTieu);
            res.json({ thanhCong: true, thongBao: 'Đã lưu mục tiêu' });
        } catch (loi) { next(loi); }
    },

    /*
    !=======================================================================================
     ? DELETE /api/muc-tieu/:id
    !=======================================================================================
    */
    xoa: async (req, res, next) => {
        try {
            await MucTieuModel.xoa(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá mục tiêu' });
        } catch (loi) { next(loi); }
    },

};

/*
!======================================================================================================================================
*/

module.exports = MucTieuController;
