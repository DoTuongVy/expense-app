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
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
                    <button class="btn-danger" id="btn-xoa-nhieu-dm" style="display:none;padding:6px 12px;font-size:12px"
                        onclick="trangDanhMuc.anNhieu()">
                        🗑️ Ẩn đã chọn
                    </button>
                    <button class="btn-add" style="margin-left:auto" onclick="trangDanhMuc.moModalThem()">+ Thêm danh mục</button>
                </div>

                ${Object.entries(nhomLabel).map(([type, nhan]) => `
                    <div class="card" style="margin-bottom:14px">
                        <div class="card-hd">
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--text2)">
                                <input type="checkbox" class="chk-nhom" data-nhom="${type}"
                                    onchange="trangDanhMuc.chonNhom('${type}', this.checked)">
                                Chọn tất cả
                            </label>
                            <span class="card-title">${nhan}</span>
                            <span class="badge ${nhomMau[type]}">${(theoNhom[type] || []).length} danh mục</span>
                        </div>
                        <div class="dm-list">
                            ${(theoNhom[type] || []).map(dm => {
                                const dmId = dm._id || dm.id;
                                return `
                                <div class="dm-item">
                                    <input type="checkbox" class="chk-dm" value="${dmId}"
                                        onchange="trangDanhMuc.capNhatNutXoa()"
                                        style="width:15px;height:15px;cursor:pointer;flex-shrink:0">
                                    <div class="dm-ico" style="background:${dm.color}22">${dm.icon || '📁'}</div>
                                    <div class="dm-name">${dm.name}</div>
                                    <span class="dm-type ${dm.type}">${nhan}</span>
                                    <div class="trans-actions" style="opacity:1">
                                        <button class="btn-icon del"
                                            onclick="trangDanhMuc.anDanhMuc('${dmId}', '${dm.name}')">🗑️</button>
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

    /*
    !=======================================================================================
     ? Chọn tất cả trong 1 nhóm
    !=======================================================================================
    */
    chonNhom: (type, checked) => {
        // ? Lấy tất cả checkbox trong card của nhóm đó
        document.querySelectorAll(`.chk-nhom[data-nhom="${type}"]`)
            .forEach(chkNhom => {
                // ? Tìm card cha rồi chọn tất cả chk-dm bên trong
                const card = chkNhom.closest('.card');
                card?.querySelectorAll('.chk-dm').forEach(chk => chk.checked = checked);
            });
        trangDanhMuc.capNhatNutXoa();
    },

    /*
    !=======================================================================================
     ? Cập nhật nút xoá nhiều
    !=======================================================================================
    */
    capNhatNutXoa: () => {
        const soChon = document.querySelectorAll('.chk-dm:checked').length;
        const btn    = document.getElementById('btn-xoa-nhieu-dm');
        if (!btn) return;
        btn.style.display = soChon > 0 ? 'block' : 'none';
        btn.textContent   = `🗑️ Ẩn ${soChon} danh mục đã chọn`;
    },

    moModalThem: () => UI.moModalDanhMuc(),

    _luuDanhMuc: async () => {
        const tenDanhMuc = document.getElementById('fi-dm-ten').value.trim();
        const nhom       = document.getElementById('fi-dm-nhom').value;
        const icon       = document.getElementById('fi-dm-icon-val').value || '📁';
        const mau        = document.getElementById('fi-dm-mau').value;

        if (!tenDanhMuc) { hienToast('Nhập tên danh mục!', 'err'); return; }

        try {
            await ApiDanhMuc.them({ tenDanhMuc, nhom, icon, mau });
            hienToast('Đã thêm danh mục', 'ok');
            UI.dongModal('modal-danhmuc');
            trangDanhMuc.render();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    /*
    !=======================================================================================
     ! Ẩn 1 danh mục
    !=======================================================================================
    */
    anDanhMuc: (id, ten) => {
        UI.xacNhan(`Ẩn danh mục "${ten}"?`, async () => {
            try {
                await ApiDanhMuc.an(id);
                hienToast('Đã ẩn danh mục', 'ok');
                trangDanhMuc.render();
            } catch (loi) { hienToast(loi.message, 'err'); }
        }, '🗂️');
    },

    /*
    !=======================================================================================
     ! Ẩn nhiều danh mục đã chọn
    !=======================================================================================
    */
    anNhieu: () => {
        const cacId = [...document.querySelectorAll('.chk-dm:checked')].map(c => c.value);
        if (!cacId.length) return;

        UI.xacNhan(`Ẩn ${cacId.length} danh mục đã chọn?`, async () => {
            try {
                await Promise.all(cacId.map(id => ApiDanhMuc.an(id)));
                hienToast(`Đã ẩn ${cacId.length} danh mục`, 'ok');
                trangDanhMuc.render();
            } catch (loi) { hienToast(loi.message, 'err'); }
        }, '🗂️');
    },
};