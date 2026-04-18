'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/TRANSACTIONS.CONTROLLER.JS
!=======================================================================================
*/

const { GiaoDichModel } = require('../models/transaction.model');
const { KyThangModel }  = require('../models/period.model');

/*
!======================================================================================================================================
*/

const GiaoDichController = {

    layDanhSach: async (req, res, next) => {
        try {
            const { thang, nam, loai } = req.query;
            const kyThang   = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            const danhSach  = await GiaoDichModel.layTheoKy(kyThang._id, loai || null);

            // ? Chuẩn hoá output cho frontend
            const chuanHoa = danhSach.map(gd => ({
                id          : gd._id,
                period_id   : gd.period_id,
                category_id : gd.category_id?._id,
                tenDanhMuc  : gd.category_id?.name,
                iconDanhMuc : gd.category_id?.icon,
                mauDanhMuc  : gd.category_id?.color,
                type        : gd.type,
                amount      : gd.amount,
                trans_date  : gd.trans_date,
                note        : gd.note,
            }));

            res.json({ thanhCong: true, duLieu: chuanHoa });
        } catch (loi) { next(loi); }
    },

    them: async (req, res, next) => {
        try {
            const { thang, nam, danhMucId, loai, soTien, ngay, ghiChu } = req.body;

            if (!soTien || soTien <= 0) return res.status(400).json({ thanhCong: false, thongBao: 'Số tiền không hợp lệ' });
            if (!danhMucId)            return res.status(400).json({ thanhCong: false, thongBao: 'Chưa chọn danh mục' });
            if (!loai)                 return res.status(400).json({ thanhCong: false, thongBao: 'Chưa chọn loại' });

            const kyThang = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));

            if (kyThang.is_closed) {
                return res.status(400).json({ thanhCong: false, thongBao: 'Kỳ tháng đã chốt' });
            }

            const gdMoi = await GiaoDichModel.them({
                kyThangId : kyThang._id,
                danhMucId,
                loai,
                soTien    : Number(soTien),
                ngay      : ngay || new Date().toISOString().split('T')[0],
                ghiChu,
            });

            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm giao dịch', id: gdMoi._id });
        } catch (loi) { next(loi); }
    },

    sua: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { danhMucId, loai, soTien, ngay, ghiChu } = req.body;

            const gd = await GiaoDichModel.layTheoId(id);
            if (!gd) return res.status(404).json({ thanhCong: false, thongBao: 'Không tìm thấy' });

            await GiaoDichModel.sua(id, { danhMucId, loai, soTien: Number(soTien), ngay, ghiChu });
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật' });
        } catch (loi) { next(loi); }
    },

    xoa: async (req, res, next) => {
        try {
            const gd = await GiaoDichModel.layTheoId(req.params.id);
            if (!gd) return res.status(404).json({ thanhCong: false, thongBao: 'Không tìm thấy' });
            await GiaoDichModel.xoa(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã xoá' });
        } catch (loi) { next(loi); }
    },
};

module.exports = GiaoDichController;
