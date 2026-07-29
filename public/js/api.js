'use strict';

/*
!=======================================================================================
 ! JS/API.JS — Wrapper gọi API backend Node.js
 ? Tất cả fetch đều qua đây, không gọi trực tiếp trong các trang
!=======================================================================================
*/

const API_BASE = '/api/proxy';
/*
!=======================================================================================
 ! Hàm gọi API chung
!=======================================================================================
*/

const goiApi = async (endpoint, tuyChan = {}) => {
    const method = (tuyChan.method || 'GET').toUpperCase();

    const [duongDan, queryString] = endpoint.replace(/^\//, '').split('?');
    const extraParams = new URLSearchParams(queryString || '');
    const params = new URLSearchParams();
    params.set('path', duongDan);
    extraParams.forEach((v, k) => params.set(k, v));

    if (method !== 'GET') {
        let body = tuyChan.body || {};
        if (typeof body === 'string') body = JSON.parse(body);
        body._method = method;
        params.set('_body',   JSON.stringify(body));
        params.set('_method', method);
    }

    const url = API_BASE + '?' + params.toString();

    const phanhoi = await fetch(url, { method: 'GET' });
    const duLieu  = await phanhoi.json();

    if (!duLieu.thanhCong && duLieu.thongBao) {
        throw new Error(duLieu.thongBao);
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
    layHienTai  : ()          => goiApi('/ky-thang-hien-tai'),
    layTatCa    : ()          => goiApi('/ky-thang'),
    chotThang   : (id, body)  => goiApi('/ky-thang-chot',        { method: 'POST', body: { id, ...body } }),
    capNhatSoDu : (id, body)  => goiApi('/ky-thang-cap-nhat-sodu', { method: 'PUT', body: { id, ...body } }),
    huyChot     : (id)        => goiApi('/ky-thang-huy-chot',    { method: 'PUT',  body: { id } }),
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
    them : (body)     => goiApi('/giao-dich', { method: 'POST',   body }),
    sua  : (id, body) => goiApi('/giao-dich', { method: 'PUT',    body: { id, ...body } }),
    xoa  : (id)       => goiApi('/giao-dich', { method: 'DELETE', body: { id } }),
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
    them : (body)     => goiApi('/danh-muc', { method: 'POST',   body }),
    sua  : (id, body) => goiApi('/danh-muc', { method: 'PUT',    body: { id, ...body } }),
    an   : (id)       => goiApi('/danh-muc', { method: 'DELETE', body: { id } }),
};


/*
!=======================================================================================
 ! API MỤC TIÊU
!=======================================================================================
*/

const ApiMucTieu = {
    layTheoThang : (thang, nam) => goiApi(`/muc-tieu?thang=${thang}&nam=${nam}`),
    datMucTieu   : (body)       => goiApi('/muc-tieu',  { method: 'POST',   body }),
    xoa          : (id)         => goiApi('/muc-tieu',  { method: 'DELETE', body: { id } }),
};

/*
!=======================================================================================
 ! API BÁO CÁO
!=======================================================================================
*/

const ApiBaoCao = {
    baoCaoThang : (thang, nam) => goiApi(`/bao-cao-thang?thang=${thang}&nam=${nam}`),
    baoCaoNam   : (nam)        => goiApi(`/bao-cao-nam?nam=${nam}`),
    chiTheoNgay : (thang, nam) => goiApi(`/bao-cao-thang?thang=${thang}&nam=${nam}`),
};

/*
!=======================================================================================
 ! API NỢ
!=======================================================================================
*/

const ApiNo = {
    layTatCa     : (trangThai) => {
        let url = '/no';
        if (trangThai) url += `?trangThai=${trangThai}`;
        return goiApi(url);
    },
    them         : (body)      => goiApi('/no', { method: 'POST',   body }),
    capNhatDaTra : (id, body)  => goiApi('/no', { method: 'PUT',    body: { id, ...body } }),
    xoa          : (id)        => goiApi('/no', { method: 'DELETE', body: { id } }),
};

/*
!=======================================================================================
 ! API MẬT KHẨU
!=======================================================================================
*/

const ApiMatKhau = {
    layTatCa  : (nhom, q) => goiApi(`/mat-khau?${new URLSearchParams({ nhom: nhom||'', q: q||'' })}`),
    layNhom   : ()        => goiApi('/mat-khau/nhom'),
    layTheoId : (id)      => goiApi(`/mat-khau?id=${id}`),
    them      : (body)    => goiApi('/mat-khau', { method: 'POST',   body }),
    sua       : (id, body)=> goiApi('/mat-khau', { method: 'PUT',    body: { id, ...body } }),
    xoaLichSu : (id, lsId)=> goiApi('/mat-khau', { method: 'PUT',   body: { id, xoaLichSuId: lsId } }),
    xoa       : (id)      => goiApi('/mat-khau', { method: 'DELETE', body: { id } }),
};

/*
!=======================================================================================
 ! API CHI TIÊU CỐ ĐỊNH — MỚI
!=======================================================================================
*/

const ApiChiTieuCoDinh = {
    layTheoThang     : (thang, nam) => goiApi(`/chi-tieu-co-dinh?thang=${thang}&nam=${nam}`),
    them             : (body)       => goiApi('/chi-tieu-co-dinh',       { method: 'POST',   body }),
    sua              : (id, body)   => goiApi('/chi-tieu-co-dinh',       { method: 'PUT',    body: { id, ...body } }),
    xoa              : (id)         => goiApi('/chi-tieu-co-dinh',       { method: 'DELETE', body: { id } }),
capNhatTrangThai : (id, body)   => goiApi('/ctcd-dong',  { method: 'POST', body: { recurringId: id, ...body } }),
};