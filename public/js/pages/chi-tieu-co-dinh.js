'use strict';

/*
!=======================================================================================
 ! JS/PAGES/CHI-TIEU-CO-DINH.JS — Trang chi tiêu cố định hàng tháng
!=======================================================================================
*/

const trangChiTieuCoDinh = {

    _thang : null,
    _nam   : null,

    render: async (thang, nam) => {
        trangChiTieuCoDinh._thang = thang;
        trangChiTieuCoDinh._nam   = nam;

        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQua = await ApiChiTieuCoDinh.layTheoThang(thang, nam);
            const ds     = ketQua.duLieu || [];

            const tongTien     = ds.reduce((t, k) => t + k.soTien, 0);
            const tongDaDong   = ds.filter(k => k.daDong).reduce((t, k) => t + k.soTien, 0);
            const tongChuaDong = tongTien - tongDaDong;
            const soDaDong     = ds.filter(k => k.daDong).length;

            // ? Tìm khoản sắp đến hạn (trong 5 ngày tới) chưa đóng
            const homNay      = new Date();
const thangThat   = homNay.getMonth() + 1;
const namThat     = homNay.getFullYear();
const ngayHienTai = homNay.getDate();

// ? Chỉ so sánh ngày thực nếu đang xem đúng tháng/năm hiện tại
// ? Tháng tương lai: không có gì quá hạn, chưa đến hạn hết
// ? Tháng quá khứ: tất cả chưa đóng đều là quá hạn
const dangXemThangNay = (thang === thangThat && nam === namThat);
const dangXemTuongLai = (nam > namThat) || (nam === namThat && thang > thangThat);

const ngayDocLap = dangXemThangNay ? ngayHienTai : dangXemTuongLai ? 0 : 32;

const sapDenHan = ds.filter(k =>
    !k.daDong &&
    dangXemThangNay &&
    k.ngayDenHan >= ngayHienTai &&
    k.ngayDenHan <= ngayHienTai + 5
);

            content.innerHTML = `
                ${sapDenHan.length ? `
                <div class="ctcd-alert">
                    ⏰ <strong>${sapDenHan.length} khoản</strong> sắp đến hạn:
                    ${sapDenHan.map(k => `<span class="ctcd-alert-item">${k.iconDanhMuc || ''} ${k.ten} — ${dinhDangTien(k.soTien)} (ngày ${k.ngayDenHan})</span>`).join('')}
                </div>` : ''}

                <!-- Tổng quan -->
                <div class="ctcd-summary">
                    <div class="ctcd-sum-card">
                        <div class="ctcd-sum-label">📋 Tổng khoản</div>
                        <div class="ctcd-sum-val">${ds.length} khoản</div>
                        <div class="ctcd-sum-sub">${dinhDangTien(tongTien)}/tháng</div>
                    </div>
                    <div class="ctcd-sum-card ok">
                        <div class="ctcd-sum-label">✅ Đã đóng</div>
                        <div class="ctcd-sum-val" style="color:var(--green)">${soDaDong} khoản</div>
                        <div class="ctcd-sum-sub">${dinhDangTien(tongDaDong)}</div>
                    </div>
                    <div class="ctcd-sum-card warn">
                        <div class="ctcd-sum-label">⏳ Chưa đóng</div>
                        <div class="ctcd-sum-val" style="color:var(--amber)">${ds.length - soDaDong} khoản</div>
                        <div class="ctcd-sum-sub">${dinhDangTien(tongChuaDong)}</div>
                    </div>
                    <div class="ctcd-sum-card">
                        <div class="ctcd-sum-label">📊 Tiến độ</div>
                        <div class="ctcd-sum-val">${ds.length ? Math.round(soDaDong / ds.length * 100) : 0}%</div>
                        <div style="margin-top:6px">
                            <div class="ctcd-progress-bar">
                                <div class="ctcd-progress-fill" style="width:${ds.length ? Math.round(soDaDong / ds.length * 100) : 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bảng danh sách -->
                <div class="card">
                    <div class="card-hd">
                        <span class="card-title">Chi tiêu cố định — Tháng ${thang}/${nam}</span>
                        <button class="btn-add" onclick="trangChiTieuCoDinh.moModalThem()">+ Thêm khoản</button>
                    </div>

                    ${!ds.length
                        ? htmlEmpty('📅', 'Chưa có khoản cố định — bấm "+ Thêm khoản" để thêm vào')
                        : `<table class="bc-table ctcd-table">
                            <thead>
                                <tr>
                                    <th style="width:36px"></th>
                                    <th>Tên khoản</th>
                                    <th>Danh mục</th>
                                    <th style="text-align:center">Đến hạn</th>
                                    <th style="text-align:right">Số tiền</th>
                                    <th style="text-align:center">Trạng thái</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ds.map(k => trangChiTieuCoDinh._renderDong(k, ngayDocLap)).join('')}
                            </tbody>
                        </table>`
                    }
                </div>
            `;

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    _renderDong: (k, ngayHienTai) => {
        const id        = k.id || k._id;
        const quaHan    = !k.daDong && k.ngayDenHan < ngayHienTai;
        const sapHan    = !k.daDong && k.ngayDenHan >= ngayHienTai && k.ngayDenHan <= ngayHienTai + 5;
        const rowClass  = k.daDong ? 'ctcd-row-done' : quaHan ? 'ctcd-row-overdue' : sapHan ? 'ctcd-row-soon' : '';

        const badgeHan  = quaHan
            ? `<span class="ctcd-badge overdue">Quá hạn</span>`
            : sapHan
            ? `<span class="ctcd-badge soon">Sắp hạn</span>`
            : '';

        return `<tr class="${rowClass}" id="row-${id}">
            <td style="text-align:center;font-size:18px">${k.iconDanhMuc || '💸'}</td>
            <td>
                <div style="font-weight:600;font-size:13.5px;${k.daDong ? 'text-decoration:line-through;opacity:.55' : ''}">${k.ten}</div>
                ${k.ghiChu ? `<div style="font-size:11px;color:var(--text3);margin-top:1px">${k.ghiChu}</div>` : ''}
            </td>
            <td style="font-size:12px;color:var(--text2)">${k.tenDanhMuc}</td>
            <td style="text-align:center">
                <span class="ctcd-ngay-han">Ngày ${k.ngayDenHan}</span>
                ${badgeHan}
            </td>
            <td class="num" style="${k.daDong ? 'opacity:.5' : 'color:var(--red);font-weight:700'}">${dinhDangTien(k.soTien)}</td>
            <td style="text-align:center">
                ${k.daDong
                    ? `<button class="ctcd-btn-trang-thai done" onclick="trangChiTieuCoDinh.toggleTrangThai('${id}', false)">
                           ✅ Đã đóng
                       </button>`
                    : `<button class="ctcd-btn-trang-thai pending" onclick="trangChiTieuCoDinh.toggleTrangThai('${id}', true)">
                           ⭕ Chưa đóng
                       </button>`
                }
            </td>
            <td style="display:flex;gap:4px;align-items:center;justify-content:flex-end">
<button class="btn-icon" onclick="trangChiTieuCoDinh.moModalSua('${id}', '${k.ten.replace(/'/g,"\\'")}', ${k.soTien}, ${k.ngayDenHan}, '${k.danhMucId}', '${(k.ghiChu||'').replace(/'/g,"\\'")}', '${k.thangApDung||''}')">✏️</button>
                <button class="btn-icon del" onclick="trangChiTieuCoDinh.xoa('${id}', '${k.ten.replace(/'/g,"\\'")}')">🗑️</button>
            </td>
        </tr>`;
    },

    // ! Toggle trạng thái đã đóng / chưa đóng
    toggleTrangThai: async (id, daDong) => {
        try {
            await ApiChiTieuCoDinh.capNhatTrangThai(id, {
                thang  : trangChiTieuCoDinh._thang,
                nam    : trangChiTieuCoDinh._nam,
                daDong,
            });
            hienToast(daDong ? '✅ Đã đánh dấu đã đóng!' : '↩️ Đã bỏ đánh dấu', 'ok');
            trangChiTieuCoDinh.render(trangChiTieuCoDinh._thang, trangChiTieuCoDinh._nam);
        } catch (loi) {
            hienToast(loi.message, 'err');
        }
    },

    // ? Modal thêm mới
    moModalThem: async () => {
        await trangChiTieuCoDinh._loadDanhMucVaoModal();
        document.getElementById('fi-ctcd-id').value      = '';
        document.getElementById('fi-ctcd-ten').value     = '';
        document.getElementById('fi-ctcd-sotien').value  = '';
        document.getElementById('fi-ctcd-ngay').value    = '';
        document.getElementById('fi-ctcd-ghichu').value  = '';
        document.getElementById('modal-ctcd-title').textContent = 'Thêm khoản cố định';
        UI.moModal('modal-ctcd');
        setTimeout(() => document.getElementById('fi-ctcd-ten').focus(), 100);
    },

    // ? Modal sửa
   moModalSua: async (id, ten, soTien, ngay, danhMucId, ghiChu, thangApDung) => {
        await trangChiTieuCoDinh._loadDanhMucVaoModal();
        document.getElementById('fi-ctcd-id').value             = id;
        document.getElementById('fi-ctcd-ten').value            = ten;
        document.getElementById('fi-ctcd-sotien').value         = soTien.toLocaleString('vi-VN');
        document.getElementById('fi-ctcd-ngay').value           = ngay;
        document.getElementById('fi-ctcd-ghichu').value         = ghiChu;
        document.getElementById('fi-ctcd-danhmuc').value        = danhMucId;
        document.getElementById('fi-ctcd-thang-ap-dung').value  = thangApDung || '';
        document.getElementById('modal-ctcd-title').textContent = 'Sửa khoản cố định';
        UI.moModal('modal-ctcd');
        setTimeout(() => document.getElementById('fi-ctcd-ten').focus(), 100);
    },

    _loadDanhMucVaoModal: async () => {
        const ketQua = await ApiDanhMuc.layTatCa('expense').catch(() => ({ duLieu: [] }));
        const sel    = document.getElementById('fi-ctcd-danhmuc');
        sel.innerHTML = ketQua.duLieu.map(dm =>
            `<option value="${dm._id || dm.id}">${dm.icon || ''} ${dm.name}</option>`
        ).join('');

        // ? Đăng ký sự kiện lưu (clone để tránh duplicate listener)
        const btnLuu  = document.getElementById('btn-luu-ctcd');
        const btnMoi  = btnLuu.cloneNode(true);
        btnLuu.replaceWith(btnMoi);
        btnMoi.addEventListener('click', trangChiTieuCoDinh._luu);
    },

    _luu: async () => {
        const id        = document.getElementById('fi-ctcd-id').value;
        const ten       = document.getElementById('fi-ctcd-ten').value.trim();
        const soTien    = parseTien(document.getElementById('fi-ctcd-sotien').value);
        const ngayDenHan= parseInt(document.getElementById('fi-ctcd-ngay').value);
        const danhMucId = document.getElementById('fi-ctcd-danhmuc').value;
const ghiChu        = document.getElementById('fi-ctcd-ghichu').value.trim();
        const thangApDung   = document.getElementById('fi-ctcd-thang-ap-dung').value.trim();

        if (!ten)                          { hienToast('Nhập tên khoản!', 'err'); return; }
        if (!soTien || soTien <= 0)        { hienToast('Nhập số tiền!', 'err'); return; }
        if (!ngayDenHan || ngayDenHan < 1 || ngayDenHan > 31) {
            hienToast('Ngày đến hạn phải từ 1-31!', 'err'); return;
        }

        try {
            if (id) {
await ApiChiTieuCoDinh.sua(id, { ten, soTien, ngayDenHan, danhMucId, ghiChu, thangApDung });
                hienToast('Đã cập nhật khoản cố định', 'ok');
            } else {
await ApiChiTieuCoDinh.them({ ten, soTien, ngayDenHan, danhMucId, ghiChu, thangApDung });
                hienToast('Đã thêm khoản cố định', 'ok');
            }
            UI.dongModal('modal-ctcd');
            trangChiTieuCoDinh.render(trangChiTieuCoDinh._thang, trangChiTieuCoDinh._nam);
        } catch (loi) {
            hienToast(loi.message, 'err');
        }
    },

    xoa: (id, ten) => {
        UI.xacNhan(`Xoá khoản "${ten}"?`, async () => {
            try {
                await ApiChiTieuCoDinh.xoa(id);
                hienToast('Đã xoá khoản cố định', 'ok');
                trangChiTieuCoDinh.render(trangChiTieuCoDinh._thang, trangChiTieuCoDinh._nam);
            } catch (loi) { hienToast(loi.message, 'err'); }
        }, '📅');
    },
};