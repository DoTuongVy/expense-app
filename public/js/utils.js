'use strict';

/*
!=======================================================================================
 ! JS/UTILS.JS — Hàm tiện ích dùng chung toàn app
!=======================================================================================
*/

/*
!=======================================================================================
 ! Format số tiền — VD: 1500000 → "1.500.000đ"
!=======================================================================================
*/

const dinhDangTien = (soTien) => {
    if (soTien === null || soTien === undefined) return '0đ';
    return Number(soTien).toLocaleString('vi-VN') + 'đ';
};

/*
!=======================================================================================
 ! Format ngày — VD: "2026-04-18" → "18/04/2026"
!=======================================================================================
*/

const dinhDangNgay = (chuoiNgay) => {
    if (!chuoiNgay) return '';
    const ngay = new Date(chuoiNgay);
    return ngay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/*
!=======================================================================================
 ! Tên tháng — VD: 4 → "Tháng 4"
!=======================================================================================
*/

const tenThang = (so) => `Tháng ${so}`;

/*
!=======================================================================================
 ! Lấy ngày hôm nay dạng YYYY-MM-DD
!=======================================================================================
*/

const homNayISO = () => new Date().toISOString().split('T')[0];

/*
!=======================================================================================
 ! Xác định loại giao dịch → màu & nhóm icon
!=======================================================================================
*/

const loaiGiaoDich = (type) => {
    const bangLoai = {
        income       : { nhom: 'income',  nhan: 'Thu nhập',   mau: 'var(--green)',  ky: '+' },
        expense      : { nhom: 'expense', nhan: 'Chi tiêu',   mau: 'var(--red)',    ky: '-' },
        saving       : { nhom: 'saving',  nhan: 'Tiết kiệm',  mau: 'var(--blue)',   ky: '-' },
        debt_give    : { nhom: 'debt',    nhan: 'Cho vay',    mau: 'var(--purple)', ky: '-' },
        debt_take    : { nhom: 'debt',    nhan: 'Vay',        mau: 'var(--purple)', ky: '+' },
        debt_collect : { nhom: 'debt',    nhan: 'Thu nợ',     mau: 'var(--green)',  ky: '+' },
        debt_pay     : { nhom: 'debt',    nhan: 'Trả nợ',     mau: 'var(--red)',    ky: '-' },
        adjustment   : { nhom: 'expense', nhan: 'Điều chỉnh', mau: 'var(--amber)',  ky: '±' },
    };
    return bangLoai[type] || bangLoai['expense'];
};

/*
!=======================================================================================
 ! Toast thông báo
!=======================================================================================
*/

let _toastTimer = null;

const hienToast = (noiDung, loai = 'ok') => {
    const el = document.getElementById('toast');
    el.textContent = noiDung;
    el.className   = `toast ${loai} show`;

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        el.classList.remove('show');
    }, 2800);
};

/*
!=======================================================================================
 ! Parse số tiền từ input (bỏ dấu chấm, chữ "đ")
!=======================================================================================
*/

const parseTien = (chuoi) => {
    if (!chuoi) return 0;
    return parseInt(chuoi.replace(/[^\d]/g, '')) || 0;
};

/*
!=======================================================================================
 ! Format input số tiền khi gõ
!=======================================================================================
*/

const formatInputTien = (input) => {
    // ? Lưu vị trí cursor trước khi format
    const viTriCursor   = input.selectionStart;
    const giaTriCu      = input.value;

    // ? Chỉ lấy số thuần
    const soThuanTuy    = giaTriCu.replace(/[^\d]/g, '');

    if (!soThuanTuy) {
        input.value = '';
        return;
    }

    // ? Đếm số ký tự số trước cursor trong chuỗi cũ
    const soKyTuSoTruocCursor = giaTriCu.slice(0, viTriCursor).replace(/[^\d]/g, '').length;

    // ? Format mới
    const soFormatted   = parseInt(soThuanTuy).toLocaleString('vi-VN');
    input.value         = soFormatted + 'đ';

    // ? Tính lại vị trí cursor trong chuỗi mới
    let demSo = 0;
    let viTriMoi = 0;
    for (let i = 0; i < soFormatted.length; i++) {
        if (/\d/.test(soFormatted[i])) {
            demSo++;
            if (demSo === soKyTuSoTruocCursor) {
                viTriMoi = i + 1;
                break;
            }
        }
    }

    // ! Nếu không tìm được vị trí thì đặt trước chữ đ
    if (demSo < soKyTuSoTruocCursor) viTriMoi = soFormatted.length;

    // ? Đặt lại cursor đúng chỗ
    input.setSelectionRange(viTriMoi, viTriMoi);
};

/*
!=======================================================================================
 ! Render loading spinner
!=======================================================================================
*/

const htmlLoading = () => `
    <div class="loading">
        <div class="spinner"></div>
        <span>Đang tải...</span>
    </div>
`;

/*
!=======================================================================================
 ! Render empty state
!=======================================================================================
*/

const htmlEmpty = (icon, noiDung) => `
    <div class="empty">
        <div class="empty-icon">${icon}</div>
        <div>${noiDung}</div>
    </div>
`;

/*
!=======================================================================================
 ! Tính % và xác định màu thanh goal
!=======================================================================================
*/

const tinhPhanTramGoal = (thucTe, mucTieu) => {
    if (!mucTieu || mucTieu === 0) return { phanTram: 0, mau: 'ok' };
    const pt  = Math.min((thucTe / mucTieu) * 100, 100);
    let mau   = 'ok';
    if (pt >= 100) mau = 'over';
    else if (pt >= 80) mau = 'warn';
    return { phanTram: pt, mau };
};



/*
!=======================================================================================
 ! Thêm số 0 vào số tiền đang nhập
!=======================================================================================
*/

const themSoZero = (soLuong) => {
    const input     = document.getElementById('fi-sotien');
    const soHienTai = parseTien(input.value);
    if (!soHienTai) return;
    const soMoi     = soHienTai * Math.pow(10, soLuong);
    input.value     = soMoi.toLocaleString('vi-VN') + 'đ';
    input.focus();
};