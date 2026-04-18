'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/TRANSACTIONS.CONTROLLER.JS — Xử lý logic giao dịch
!=======================================================================================
*/

const GiaoDichModel = require('../models/transaction.model');
const KyThangModel  = require('../models/period.model');

/*
!======================================================================================================================================
*/

const GiaoDichController = {

    /*
    !=======================================================================================
     ? GET /api/giao-dich?thang=4&nam=2026
     ? Lấy danh sách giao dịch theo tháng/năm
    !=======================================================================================
    */
    layDanhSach: async (req, res, next) => {
        try {
            const { thang, nam, loai } = req.query;

            // ? Lấy hoặc tạo kỳ tháng tương ứng
            const kyThang       = await KyThangModel.layHoacTaoKy(
                parseInt(thang),
                parseInt(nam)
            );
            const danhSach      = await GiaoDichModel.layTheoKy(kyThang.id, loai || null);

            res.json({ thanhCong: true, duLieu: danhSach });
        } catch (loi) {
            next(loi);
        }
    },

    /*
    !=======================================================================================
     ! POST /api/giao-dich
     ! Thêm giao dịch mới
    !=======================================================================================
    */
    them: async (req, res, next) => {
        try {
            const { thang, nam, danhMucId, loai, soTien, ngay, ghiChu } = req.body;

            // ! Validate cơ bản
            if (!soTien || soTien <= 0)      return res.status(400).json({ thanhCong: false, thongBao: 'Số tiền không hợp lệ' });
            if (!danhMucId)                  return res.status(400).json({ thanhCong: false, thongBao: 'Chưa chọn danh mục' });
            if (!loai)                       return res.status(400).json({ thanhCong: false, thongBao: 'Chưa chọn loại giao dịch' });

            const kyThang       = await KyThangModel.layHoacTaoKy(
                parseInt(thang),
                parseInt(nam)
            );

            // ! Không cho thêm vào kỳ đã chốt
            if (kyThang.is_closed) {
                return res.status(400).json({ thanhCong: false, thongBao: 'Kỳ tháng này đã chốt, không thể thêm giao dịch' });
            }

            const idMoi = await GiaoDichModel.them({
                kyThangId : kyThang.id,
                danhMucId,
                loai,
                soTien,
                ngay      : ngay || new Date().toISOString().split('T')[0],
                ghiChu,
            });

            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm giao dịch', id: idMoi });
        } catch (loi) {
            next(loi);
        }
    },

    /*
    !=======================================================================================
     ? PUT /api/giao-dich/:id — Sửa giao dịch
    !=======================================================================================
    */
    sua: async (req, res, next) => {
        try {
            const { id }                            = req.params;
            const { danhMucId, loai, soTien, ngay, ghiChu } = req.body;

            const giaoDich  = await GiaoDichModel.layTheoId(id);
            if (!giaoDich)  return res.status(404).json({ thanhCong: false, thongBao: 'Không tìm thấy giao dịch' });

            // ! Kiểm tra kỳ đã chốt chưa
            const kyThang   = await KyThangModel.layHoacTaoKy(
                giaoDich.trans_date.getMonth?.() + 1 || new Date(giaoDich.trans_date).getMonth() + 1,
                new Date(giaoDich.trans_date).getFullYear()
            );
            if (kyThang.is_closed) {
                return res.status(400).json({ thanhCong: false, thongBao: 'Kỳ tháng đã chốt, không thể sửa' });
            }

            await GiaoDichModel.sua(id, { danhMucId, loai, soTien, ngay, ghiChu });
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật giao dịch' });
        } catch (loi) {
            next(loi);
        }
    },

    /*
    !=======================================================================================
     ! DELETE /api/giao-dich/:id — Xoá giao dịch
    !=======================================================================================
    */
    xoa: async (req, res, next) => {
        try {
            const { id }    = req.params;
            const giaoDich  = await GiaoDichModel.layTheoId(id);
            if (!giaoDich)  return res.status(404).json({ thanhCong: false, thongBao: 'Không tìm thấy giao dịch' });

            await GiaoDichModel.xoa(id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá giao dịch' });
        } catch (loi) {
            next(loi);
        }
    },

};

/*
!======================================================================================================================================
*/

module.exports = GiaoDichController;
