'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/GOALS.CONTROLLER.JS
!=======================================================================================
*/

const { MucTieuModel } = require('../models/goal.model');
const { KyThangModel } = require('../models/period.model');

const MucTieuController = {
    layTheoThang: async (req, res, next) => {
        try {
            const { thang, nam } = req.query;
            const ky    = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            const ds    = await MucTieuModel.layTheoKy(ky._id);
            res.json({ thanhCong: true, duLieu: ds });
        } catch (loi) { next(loi); }
    },

    datMucTieu: async (req, res, next) => {
        try {
            const { thang, nam, danhMucId, soTienMucTieu } = req.body;
            if (!soTienMucTieu || soTienMucTieu <= 0) {
                return res.status(400).json({ thanhCong: false, thongBao: 'Số tiền không hợp lệ' });
            }
            const ky = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            await MucTieuModel.datMucTieu(ky._id, danhMucId, Number(soTienMucTieu));
            res.json({ thanhCong: true, thongBao: 'Đã lưu mục tiêu' });
        } catch (loi) { next(loi); }
    },

    xoa: async (req, res, next) => {
        try {
            await MucTieuModel.xoa(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá mục tiêu' });
        } catch (loi) { next(loi); }
    },
};

module.exports = MucTieuController;
