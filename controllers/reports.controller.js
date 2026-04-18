'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/REPORTS.CONTROLLER.JS
!=======================================================================================
*/

const { BaoCaoModel }  = require('../models/report.model');
const { KyThangModel } = require('../models/period.model');
const { MucTieuModel } = require('../models/goal.model');

const BaoCaoController = {

    baoCaoThang: async (req, res, next) => {
        try {
            const { thang, nam } = req.query;
            const kyThang       = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            const tongHop       = await BaoCaoModel.tongHopThang(kyThang._id, kyThang.opening_balance);
            const theoDanhMuc   = await BaoCaoModel.chiTietTheoDanhMuc(kyThang._id);
            const mucTieu       = await MucTieuModel.layTheoKy(kyThang._id);

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
};

module.exports = BaoCaoController;
