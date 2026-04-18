'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/PERIODS.CONTROLLER.JS — Xử lý logic kỳ tháng
!=======================================================================================
*/

const KyThangModel  = require('../models/period.model');
const GiaoDichModel = require('../models/transaction.model');

/*
!======================================================================================================================================
*/

const KyThangController = {

    /*
    !=======================================================================================
     ? GET /api/ky-thang — Lấy tất cả kỳ tháng (cho dropdown)
    !=======================================================================================
    */
    layTatCa: async (req, res, next) => {
        try {
            const danhSach = await KyThangModel.layTatCa();
            res.json({ thanhCong: true, duLieu: danhSach });
        } catch (loi) {
            next(loi);
        }
    },

    /*
    !=======================================================================================
     ? GET /api/ky-thang/hien-tai — Lấy kỳ tháng hiện tại
    !=======================================================================================
    */
    layHienTai: async (req, res, next) => {
        try {
            const kyThang = await KyThangModel.layKyHienTai();
            res.json({ thanhCong: true, duLieu: kyThang });
        } catch (loi) {
            next(loi);
        }
    },

    /*
    !=======================================================================================
     ! POST /api/ky-thang/:id/chot — Chốt tháng
     ? Flow: user nhập số dư thực tế → hệ thống tính chênh lệch → tạo dòng điều chỉnh → chốt
    !=======================================================================================
    */
    chotThang: async (req, res, next) => {
        try {
            const { id }                        = req.params;
            const { soduThucTe, ghiChu, danhMucDieuChinhId } = req.body;

            if (soduThucTe === undefined || soduThucTe === null) {
                return res.status(400).json({ thanhCong: false, thongBao: 'Cần nhập số dư thực tế' });
            }

            // ? Cập nhật số dư + tính chênh lệch
            const ketQua = await KyThangModel.capNhatSoDauKy(id, soduThucTe, ghiChu);

            // ! Nếu có chênh lệch → thêm dòng điều chỉnh
            if (ketQua.chenhLech !== 0 && danhMucDieuChinhId) {
                await GiaoDichModel.themDieuChinh(id, ketQua.chenhLech, danhMucDieuChinhId);
            }

            // ? Đánh dấu đã chốt
            await KyThangModel.chotThang(id);

            res.json({
                thanhCong   : true,
                thongBao    : 'Đã chốt tháng thành công',
                duLieu      : ketQua,
            });
        } catch (loi) {
            next(loi);
        }
    },

};

/*
!======================================================================================================================================
*/

module.exports = KyThangController;
