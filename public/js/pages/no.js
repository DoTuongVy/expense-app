'use strict';

/*
!=======================================================================================
 ! JS/PAGES/NO.JS — Trang theo dõi nợ
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

                <!--
                 ! Tôi nợ người khác
                -->
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

                <!--
                 ? Người khác nợ tôi
                -->
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
        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    _renderItem: (n) => {
        const conLai    = Number(n.conLai || 0);
        const phanTram  = n.original_amount > 0
            ? Math.min((n.paid_amount / n.original_amount) * 100, 100)
            : 0;

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
            <div class="no-bar">
                <div class="no-bar-fill" style="width:${phanTram}%"></div>
            </div>
            ${n.note ? `<div class="no-note">${n.note}</div>` : ''}
            ${n.due_date ? `<div class="no-note">Hạn: ${dinhDangNgay(n.due_date)}</div>` : ''}
            ${n.status === 'active' ? `
            <div style="display:flex;gap:6px;margin-top:4px">
                <button class="btn-secondary" style="flex:1" onclick="trangNo.capNhatDaTra(${n.id})">
                    + Cập nhật đã ${n.direction === 'i_owe' ? 'trả' : 'thu'}
                </button>
                <button class="btn-danger" onclick="trangNo.xoa(${n.id})">Xoá</button>
            </div>` : ''}
        </div>`;
    },

    moModalThem: () => {
        const chieuNo   = prompt('Chiều nợ:\n1 = Tôi nợ người khác\n2 = Người khác nợ tôi\n(Nhập 1 hoặc 2):');
        const direction = chieuNo === '1' ? 'i_owe' : 'they_owe';
        const tenNguoi  = prompt('Tên người:');
        if (!tenNguoi) return;
        const soTienGoc = prompt('Số tiền:');
        if (!soTienGoc) return;
        const ghiChu    = prompt('Ghi chú (bấm Enter để bỏ qua):', '');

        ApiNo.them({ chieuNo: direction, tenNguoi, soTienGoc: parseInt(soTienGoc), ghiChu })
            .then(() => { hienToast('Đã thêm khoản nợ', 'ok'); trangNo.render(); })
            .catch(loi => hienToast(loi.message, 'err'));
    },

    capNhatDaTra: async (id) => {
        const soTien = prompt('Số tiền đã trả/thu thêm:');
        if (!soTien) return;
        try {
            await ApiNo.capNhatDaTra(id, { soTienThemVao: parseInt(soTien) });
            hienToast('Đã cập nhật', 'ok');
            trangNo.render();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    xoa: async (id) => {
        if (!confirm('Xoá khoản nợ này?')) return;
        try {
            await ApiNo.xoa(id);
            hienToast('Đã xoá', 'ok');
            trangNo.render();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },
};
