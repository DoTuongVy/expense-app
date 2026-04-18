'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/REPORTS.CONTROLLER.JS — Xử lý báo cáo
!=======================================================================================
*/

const BaoCaoModel  = require('../models/report.model');
const KyThangModel = require('../models/period.model');
const MucTieuModel = require('../models/goal.model');

/*
!======================================================================================================================================
*/

const BaoCaoController = {

    /*
    !=======================================================================================
     ? GET /api/bao-cao/thang?thang=4&nam=2026
     ? Báo cáo tháng: tổng hợp + danh mục + so sánh mục tiêu
    !=======================================================================================
    */
    baoCaoThang: async (req, res, next) => {
        try {
            const { thang, nam } = req.query;

            const kyThang        = await KyThangModel.layHoacTaoKy(parseInt(thang), parseInt(nam));
            const tongHop        = await BaoCaoModel.tongHopThang(kyThang.id);
            const theoDanhMuc    = await BaoCaoModel.chiTietTheoDanhMuc(kyThang.id);
            const mucTieu        = await MucTieuModel.layTheoKy(kyThang.id);

            res.json({
                thanhCong : true,
                duLieu    : {
                    kyThang,
                    tongHop,
                    theoDanhMuc,
                    mucTieu,
                },
            });
        } catch (loi) {
            next(loi);
        }
    },

    /*
    !=======================================================================================
     ! GET /api/bao-cao/nam?nam=2026
     ! Báo cáo năm: 12 tháng + tổng kết
    !=======================================================================================
    */
    baoCaoNam: async (req, res, next) => {
        try {
            const { nam }       = req.query;
            const theoThang     = await BaoCaoModel.tongHopNam(parseInt(nam));
            const danhSachNam   = await BaoCaoModel.layDanhSachNam();

            // ? Tính tổng cộng cả năm
            const tongCaNam = theoThang.reduce((tich, thang) => ({
                tongThu     : tich.tongThu  + Number(thang.tongThu),
                tongChi     : tich.tongChi  + Number(thang.tongChi),
                tietKiem    : tich.tietKiem + Number(thang.tietKiem),
            }), { tongThu: 0, tongChi: 0, tietKiem: 0 });

            res.json({
                thanhCong : true,
                duLieu    : { theoThang, tongCaNam, danhSachNam },
            });
        } catch (loi) {
            next(loi);
        }
    },

};

/*
!======================================================================================================================================
*/

module.exports = BaoCaoController;
