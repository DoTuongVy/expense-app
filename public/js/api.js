'use strict';

/*
!=======================================================================================
 ! JS/API.JS — Wrapper gọi API backend Node.js
 ? Tất cả fetch đều qua đây, không gọi trực tiếp trong các trang
!=======================================================================================
*/

const API_BASE = '/api';

/*
!=======================================================================================
 ! Hàm gọi API chung
!=======================================================================================
*/

const goiApi = async (endpoint, tuyChan = {}) => {
    const cauHinh = {
        headers: { 'Content-Type': 'application/json' },
        ...tuyChan,
    };

    if (cauHinh.body && typeof cauHinh.body === 'object') {
        cauHinh.body = JSON.stringify(cauHinh.body);
    }

    const phanhoi   = await fetch(API_BASE + endpoint, cauHinh);
    const duLieu    = await phanhoi.json();

    // ! Nếu server trả về lỗi thì throw để catch ở trên xử lý
    if (!duLieu.thanhCong && phanhoi.status >= 400) {
        throw new Error(duLieu.thongBao || 'Lỗi không xác định');
    }

    return duLieu;
};

/*
!======================================================================================================================================
*/

/*
!=======================================================================================
 ! API KỲ THÁNG
!=======================================================================================
*/

const ApiKyThang = {
    layHienTai : ()          => goiApi('/ky-thang/hien-tai'),
    layTatCa   : ()          => goiApi('/ky-thang'),
    chotThang  : (id, body)  => goiApi(`/ky-thang/${id}/chot`, { method: 'POST', body }),
    huyChot: (id) => goiApi(`/ky-thang/${id}/huy-chot`, { method: 'PUT' }),
};

/*
!=======================================================================================
 ! API GIAO DỊCH
!=======================================================================================
*/

const ApiGiaoDich = {
    layDanhSach : (thang, nam, loai) => {
        let url = `/giao-dich?thang=${thang}&nam=${nam}`;
        if (loai) url += `&loai=${loai}`;
        return goiApi(url);
    },
    them  : (body) => goiApi('/giao-dich',      { method: 'POST',   body }),
    sua   : (id, body) => goiApi(`/giao-dich/${id}`, { method: 'PUT',    body }),
    xoa   : (id)   => goiApi(`/giao-dich/${id}`, { method: 'DELETE' }),
};

/*
!=======================================================================================
 ! API DANH MỤC
!=======================================================================================
*/

const ApiDanhMuc = {
    layTatCa : (nhom) => {
        let url = '/danh-muc';
        if (nhom) url += `?nhom=${nhom}`;
        return goiApi(url);
    },
    them : (body) => goiApi('/danh-muc',       { method: 'POST',   body }),
    sua  : (id, body) => goiApi(`/danh-muc/${id}`, { method: 'PUT',    body }),
    an   : (id)   => goiApi(`/danh-muc/${id}`, { method: 'DELETE' }),
};

/*
!=======================================================================================
 ! API MỤC TIÊU
!=======================================================================================
*/

const ApiMucTieu = {
    layTheoThang : (thang, nam) => goiApi(`/muc-tieu?thang=${thang}&nam=${nam}`),
    datMucTieu   : (body)       => goiApi('/muc-tieu',       { method: 'POST',   body }),
    xoa          : (id)         => goiApi(`/muc-tieu/${id}`, { method: 'DELETE' }),
};

/*
!=======================================================================================
 ! API BÁO CÁO
!=======================================================================================
*/

const ApiBaoCao = {
    baoCaoThang : (thang, nam) => goiApi(`/bao-cao/thang?thang=${thang}&nam=${nam}`),
    baoCaoNam   : (nam)        => goiApi(`/bao-cao/nam?nam=${nam}`),
    chiTheoNgay : (thang, nam) => goiApi(`/bao-cao/chi-theo-ngay?thang=${thang}&nam=${nam}`),
};

/*
!=======================================================================================
 ! API NỢ
!=======================================================================================
*/

const ApiNo = {
    layTatCa      : (trangThai) => {
        let url = '/no';
        if (trangThai) url += `?trangThai=${trangThai}`;
        return goiApi(url);
    },
    them          : (body)        => goiApi('/no',             { method: 'POST',   body }),
    capNhatDaTra  : (id, body)    => goiApi(`/no/${id}/tra`,   { method: 'PUT',    body }),
    xoa           : (id)          => goiApi(`/no/${id}`,       { method: 'DELETE' }),
};
