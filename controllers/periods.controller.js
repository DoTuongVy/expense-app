'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/PERIODS.CONTROLLER.JS
!=======================================================================================
*/

const { KyThangModel }  = require('../models/period.model');
const { GiaoDichModel } = require('../models/transaction.model');

const KyThangController = {

    layTatCa: async (req, res, next) => {
        try {
            const ds = await KyThangModel.layTatCa();
            res.json({ thanhCong: true, duLieu: ds });
        } catch (loi) { next(loi); }
    },

    layHienTai: async (req, res, next) => {
        try {
            const ky = await KyThangModel.layKyHienTai();
            res.json({ thanhCong: true, duLieu: ky });
        } catch (loi) { next(loi); }
    },

    // ! Chốt tháng — user nhập số dư thực tế
    chotThang: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { soduThucTe, ghiChu, danhMucDieuChinhId } = req.body;

            if (soduThucTe === undefined) {
                return res.status(400).json({ thanhCong: false, thongBao: 'Cần nhập số dư thực tế' });
            }

            const ketQua = await KyThangModel.capNhatSoDauKy(id, Number(soduThucTe), ghiChu);

            if (ketQua.chenhLech !== 0 && danhMucDieuChinhId) {
                await GiaoDichModel.themDieuChinh(id, ketQua.chenhLech, danhMucDieuChinhId);
            }

            await KyThangModel.chotThang(id);
            res.json({ thanhCong: true, thongBao: 'Đã chốt tháng', duLieu: ketQua });
        } catch (loi) { next(loi); }
    },
};

module.exports = KyThangController;
