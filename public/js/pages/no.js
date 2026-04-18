'use strict';

/*
!=======================================================================================
 ! JS/PAGES/NO.JS
!=======================================================================================
*/

const trangNo = {

    render: async () => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQua    = await ApiNo.layTatCa();
            const danhSach  = ketQua.duLieu || [];
            const toiNo     = danhSach.filter(n => n.direction === 'i_owe');
            const hoNo      = danhSach.filter(n => n.direction === 'they_owe');

            content.innerHTML = `
                <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
                    <button class="btn-add" onclick="trangNo.moModalThem()">+ Thêm khoản nợ</button>
                </div>
                <div class="card" style="margin-bottom:14px">
                    <div class="card-hd">
                        <span class="card-title">Tôi nợ người khác</span>
                        <span class="badge red">${toiNo.filter(n=>n.status==='active').length} đang nợ</span>
                    </div>
                    ${!toiNo.length
                        ? htmlEmpty('✅', 'Không có khoản nợ nào')
                        : `<div class="no-grid">${toiNo.map(n => trangNo._renderItem(n)).join('')}</div>`
                    }
                </div>
                <div class="card">
                    <div class="card-hd">
                        <span class="card-title">Người khác nợ tôi</span>
                        <span class="badge green">${hoNo.filter(n=>n.status==='active').length} chưa trả</span>
                    </div>
                    ${!hoNo.length
                        ? htmlEmpty('📋', 'Chưa cho ai vay')
                        : `<div class="no-grid">${hoNo.map(n => trangNo._renderItem(n)).join('')}</div>`
                    }
                </div>
            `;

            trangNo._dangKySuKien();

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    _renderItem: (n) => {
        const noId      = n._id || n.id;
        const phanTram  = n.original_amount > 0
            ? Math.min((n.paid_amount / n.original_amount) * 100, 100) : 0;

        return `
        <div class="no-item">
            <div class="no-hd">
                <div class="no-person">${n.person_name}</div>
                <span class="no-status ${n.status}">${n.status === 'active' ? 'Đang nợ' : 'Đã xong'}</span>
            </div>
            <div class="no-dir">${n.direction === 'i_owe' ? '👆 Tôi nợ' : '👇 Họ nợ tôi'}</div>
            <div class="no-amounts">
                <span class="no-orig">${dinhDangTien(n.original_amount)}</span>
                <span class="no-paid">Đã ${n.direction === 'i_owe' ? 'trả' : 'thu'}: ${dinhDangTien(n.paid_amount)}</span>
            </div>
            <div class="no-bar"><div class="no-bar-fill" style="width:${phanTram}%"></div></div>
            ${n.note ? `<div class="no-note">${n.note}</div>` : ''}
            ${n.due_date ? `<div class="no-note">Hạn: ${dinhDangNgay(n.due_date)}</div>` : ''}
            ${n.status === 'active' ? `
            <div style="display:flex;gap:6px;margin-top:4px">
                <button class="btn-secondary" style="flex:1;font-size:12px"
                    onclick="trangNo.moModalTraNo('${noId}', '${n.person_name}', '${n.direction}')">
                    + Cập nhật đã ${n.direction === 'i_owe' ? 'trả' : 'thu'}
                </button>
                <button class="btn-danger" onclick="trangNo.xoa('${noId}', '${n.person_name}')">Xoá</button>
            </div>` : ''}
        </div>`;
    },

    _dangKySuKien: () => {
        const btnLuuNo = document.getElementById('btn-luu-no');
        if (btnLuuNo) {
            const btnMoi = btnLuuNo.cloneNode(true);
            btnLuuNo.replaceWith(btnMoi);
            btnMoi.addEventListener('click', trangNo._luuNo);
        }
        const btnTraNo = document.getElementById('btn-luu-tra-no');
        if (btnTraNo) {
            const btnMoi = btnTraNo.cloneNode(true);
            btnTraNo.replaceWith(btnMoi);
            btnMoi.addEventListener('click', trangNo._luuTraNo);
        }
    },

    moModalThem    : ()                        => UI.moModalNo(),
    moModalTraNo   : (id, tenNguoi, chieuNo)   => UI.moModalTraNo(id, tenNguoi, chieuNo),

    _luuNo: async () => {
        const chieuNo   = document.getElementById('fi-no-chieu').value;
        const tenNguoi  = document.getElementById('fi-no-ten').value.trim();
        const soTienGoc = parseTien(document.getElementById('fi-no-sotien').value);
        const hanTra    = document.getElementById('fi-no-han').value;
        const ghiChu    = document.getElementById('fi-no-ghichu').value;

        if (!tenNguoi)  { hienToast('Nhập tên người!', 'err'); return; }
        if (!soTienGoc) { hienToast('Nhập số tiền!', 'err');   return; }

        try {
            await ApiNo.them({ chieuNo, tenNguoi, soTienGoc, hanTra, ghiChu });
            hienToast('Đã thêm khoản nợ', 'ok');
            UI.dongModal('modal-no');
            trangNo.render();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    _luuTraNo: async () => {
        const id     = document.getElementById('fi-tra-no-id').value;
        const soTien = parseTien(document.getElementById('fi-tra-sotien').value);
        if (!soTien) { hienToast('Nhập số tiền!', 'err'); return; }

        try {
            await ApiNo.capNhatDaTra(id, { soTienThemVao: soTien });
            hienToast('Đã cập nhật', 'ok');
            UI.dongModal('modal-tra-no');
            trangNo.render();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    xoa: (id, ten) => {
        UI.xacNhan(`Xoá khoản nợ của "${ten}"?`, async () => {
            try {
                await ApiNo.xoa(id);
                hienToast('Đã xoá', 'ok');
                trangNo.render();
            } catch (loi) { hienToast(loi.message, 'err'); }
        });
    },
};