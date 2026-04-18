'use strict';

/*
!=======================================================================================
 ! JS/PAGES/DANH-MUC.JS
!=======================================================================================
*/

const trangDanhMuc = {

    render: async () => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQua    = await ApiDanhMuc.layTatCa();
            const danhSach  = ketQua.duLieu || [];

            const nhomLabel = { income: 'Thu nhập', expense: 'Chi tiêu', saving: 'Tiết kiệm', debt: 'Nợ' };
            const nhomMau   = { income: 'green', expense: 'red', saving: 'blue', debt: 'purple' };

            const theoNhom = {};
            danhSach.forEach(dm => {
                if (!theoNhom[dm.type]) theoNhom[dm.type] = [];
                theoNhom[dm.type].push(dm);
            });

            content.innerHTML = `
                <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
                    <button class="btn-add" onclick="trangDanhMuc.moModalThem()">+ Thêm danh mục</button>
                </div>
                ${Object.entries(nhomLabel).map(([type, nhan]) => `
                    <div class="card" style="margin-bottom:14px">
                        <div class="card-hd">
                            <span class="card-title">${nhan}</span>
                            <span class="badge ${nhomMau[type]}">${(theoNhom[type] || []).length} danh mục</span>
                        </div>
                        <div class="dm-list">
                            ${(theoNhom[type] || []).map(dm => {
                                const dmId = dm._id || dm.id;
                                return `
                                <div class="dm-item">
                                    <div class="dm-ico" style="background:${dm.color}22">${dm.icon || '📁'}</div>
                                    <div class="dm-name">${dm.name}</div>
                                    <span class="dm-type ${dm.type}">${nhan}</span>
                                    <div class="trans-actions" style="opacity:1">
                                        <button class="btn-icon del" onclick="trangDanhMuc.anDanhMuc('${dmId}', '${dm.name}')">🗑️</button>
                                    </div>
                                </div>`;
                            }).join('')}
                            ${!(theoNhom[type] || []).length
                                ? `<div style="font-size:12px;color:var(--text3);padding:8px">Chưa có danh mục</div>`
                                : ''}
                        </div>
                    </div>
                `).join('')}
            `;

            trangDanhMuc._dangKySuKien();

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    _dangKySuKien: () => {
        const btnLuu = document.getElementById('btn-luu-danhmuc');
        if (!btnLuu) return;
        const btnMoi = btnLuu.cloneNode(true);
        btnLuu.replaceWith(btnMoi);
        btnMoi.addEventListener('click', trangDanhMuc._luuDanhMuc);
    },

    moModalThem: () => UI.moModalDanhMuc(),

    _luuDanhMuc: async () => {
        const tenDanhMuc = document.getElementById('fi-dm-ten').value.trim();
        const nhom       = document.getElementById('fi-dm-nhom').value;
        const icon       = document.getElementById('fi-dm-icon').value.trim() || '📁';
        const mau        = document.getElementById('fi-dm-mau').value;

        if (!tenDanhMuc) { hienToast('Nhập tên danh mục!', 'err'); return; }

        try {
            await ApiDanhMuc.them({ tenDanhMuc, nhom, icon, mau });
            hienToast('Đã thêm danh mục', 'ok');
            UI.dongModal('modal-danhmuc');
            trangDanhMuc.render();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    anDanhMuc: (id, ten) => {
        UI.xacNhan(`Ẩn danh mục "${ten}"?`, async () => {
            try {
                await ApiDanhMuc.an(id);
                hienToast('Đã ẩn danh mục', 'ok');
                trangDanhMuc.render();
            } catch (loi) { hienToast(loi.message, 'err'); }
        }, '🗂️');
    },
};