'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/CATEGORIES.CONTROLLER.JS
!=======================================================================================
*/

const { DanhMucModel } = require('../models/category.model');

const DanhMucController = {
    layTatCa: async (req, res, next) => {
        try {
            const ds = await DanhMucModel.layTatCa(req.query.nhom || null);
            res.json({ thanhCong: true, duLieu: ds });
        } catch (loi) { next(loi); }
    },

    them: async (req, res, next) => {
        try {
            const { tenDanhMuc, nhom, icon, mau } = req.body;
            if (!tenDanhMuc) return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập tên' });
            if (!nhom)       return res.status(400).json({ thanhCong: false, thongBao: 'Chưa chọn nhóm' });
            const dm = await DanhMucModel.them({ tenDanhMuc, nhom, icon, mau });
            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm', id: dm._id });
        } catch (loi) { next(loi); }
    },

    sua: async (req, res, next) => {
        try {
            await DanhMucModel.sua(req.params.id, req.body);
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật' });
        } catch (loi) { next(loi); }
    },

    an: async (req, res, next) => {
        try {
            await DanhMucModel.an(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã ẩn danh mục' });
        } catch (loi) { next(loi); }
    },
};

module.exports = DanhMucController;
