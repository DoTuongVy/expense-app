'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/REPORTS.CONTROLLER.JS
!=======================================================================================
*/

const { BaoCaoModel }   = require('../models/report.model');
const { KyThangModel }  = require('../models/period.model');
const { MucTieuModel }  = require('../models/goal.model');
const { GiaoDichModel } = require('../models/transaction.model');

const BaoCaoController = {

    baoCaoThang: async (req, res, next) => {
        try {
            const { thang, nam } = req.query;
            const t = parseInt(thang), n = parseInt(nam);
            const kyThang = await KyThangModel.layHoacTaoKy(t, n);

            // ! Tính opening_balance động từ tháng trước — không đọc từ DB tháng hiện tại
            let thangTruoc = t - 1, namTruoc = n;
            if (thangTruoc < 1) { thangTruoc = 12; namTruoc--; }

            const kyTruoc = await KyThangModel.layHoacTaoKy(thangTruoc, namTruoc);

            let openingDong;
            if (kyTruoc.is_closed) {
                // ? Đã chốt → lấy đúng số tiền túi user xác nhận, không cộng trừ gì thêm
                openingDong = kyTruoc.opening_balance || 0;
            } else {
                // ? Chưa chốt → ước tính từ hệ thống
                const tongHopTruoc = await GiaoDichModel.tinhTongHop(kyTruoc._id);
                openingDong = (kyTruoc.opening_balance || 0)
                            + (tongHopTruoc.total_income  || 0)
                            - (tongHopTruoc.total_expense || 0);
            }

            const tongHop     = await BaoCaoModel.tongHopThang(kyThang._id, openingDong);
            const theoDanhMuc = await BaoCaoModel.chiTietTheoDanhMuc(kyThang._id);
            const mucTieu     = await MucTieuModel.layTheoKy(kyThang._id);

            res.json({ thanhCong: true, duLieu: { kyThang, tongHop, theoDanhMuc, mucTieu } });
        } catch (loi) { next(loi); }
    },

    baoCaoNam: async (req, res, next) => {
        try {
            const { nam }       = req.query;
            const theoThang     = await BaoCaoModel.tongHopNam(parseInt(nam));
            const danhSachNam   = await BaoCaoModel.layDanhSachNam();

            const tongCaNam = theoThang.reduce((tich, t) => ({
                tongThu  : tich.tongThu  + Number(t.tongThu),
                tongChi  : tich.tongChi  + Number(t.tongChi),
                tietKiem : tich.tietKiem + Number(t.tietKiem),
            }), { tongThu: 0, tongChi: 0, tietKiem: 0 });

            res.json({ thanhCong: true, duLieu: { theoThang, tongCaNam, danhSachNam } });
        } catch (loi) { next(loi); }
    },

    chiTheoNgay: async (req, res, next) => {
    try {
        const { thang, nam } = req.query;
        const kyThang = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
        const data    = await BaoCaoModel.chiTheoNgay(kyThang._id);
        res.json({ thanhCong: true, duLieu: data });
    } catch (loi) { next(loi); }
},
};

module.exports = BaoCaoController;