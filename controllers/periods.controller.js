'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/PERIODS.CONTROLLER.JS - Xử lý chốt tháng
!=======================================================================================
*/

const { KyThangModel, KyThang } = require('../models/period.model');
const { GiaoDichModel }         = require('../models/transaction.model');

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

    // ! Cập nhật số dư — KHÔNG chốt tháng
// ! Cập nhật số dư — tính ngược opening_balance
capNhatSoDu: async (req, res, next) => {
    try {
        const { id } = req.params;
        const { soduThucTe, ghiChu } = req.body;

        if (soduThucTe === undefined) {
            return res.status(400).json({ thanhCong: false, thongBao: 'Cần nhập số dư thực tế' });
        }

        // Tính tổng thu chi của kỳ này
        const tongHop = await GiaoDichModel.tinhTongHop(id);
        
        // Tính ngược opening_balance để ra đúng số dư mong muốn
        // soduThucTe = opening_balance + thu - chi
        // => opening_balance = soduThucTe - thu + chi
        const openingBalance = Number(soduThucTe) - tongHop.total_income + tongHop.total_expense;

        // ✅ CẬP NHẬT CẢ opening_balance VÀ system_balance
        await KyThang.findByIdAndUpdate(id, {
            opening_balance: openingBalance,
            system_balance: Number(soduThucTe),  // ✅ THÊM DÒNG NÀY
            adjustment_note: ghiChu || `Cập nhật số dư thành ${Number(soduThucTe).toLocaleString('vi-VN')}đ`
        });

        res.json({ 
            thanhCong: true, 
            thongBao: 'Đã cập nhật số dư',
            duLieu: { 
                soduThucTe: Number(soduThucTe),
                openingBalance: openingBalance
            }
        });
    } catch (loi) { next(loi); }
},

    // ! Chốt tháng — user nhập số tiền thực tế đang có trong túi
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

    // ? Huỷ chốt tháng — mở lại để chỉnh sửa
    huyChot: async (req, res, next) => {
        try {
            const { id } = req.params;
            await KyThang.findByIdAndUpdate(id, {
                is_closed : false,
                closed_at : null,
            });
            res.json({ thanhCong: true, thongBao: 'Đã huỷ chốt tháng' });
        } catch (loi) { next(loi); }
    },

};

module.exports = KyThangController;