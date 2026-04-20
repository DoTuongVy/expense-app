'use strict';

/*
!=======================================================================================
 ! JS/PAGES/MAT-KHAU.JS — Trang quản lý mật khẩu cá nhân
 ? Tính năng: CRUD, tìm kiếm, lọc nhóm, copy, lịch sử đổi MK, đánh dấu quan trọng
!=======================================================================================
*/

const trangMatKhau = {

    _nhomActive : 'all',
    _tuKhoa     : '',
    _hienMK     : {},         // { id: true/false } — trạng thái hiện/ẩn MK từng dòng

    /*
    !=======================================================================================
     ! RENDER CHÍNH
    !=======================================================================================
    */
    render: async () => {
        const el = document.getElementById('content');
        el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--text3)">Đang tải...</div>`;

        try {
            const [dsMK, dsNhom] = await Promise.all([
                ApiMatKhau.layTatCa(),
                ApiMatKhau.layNhom(),
            ]);

            const danhSach = dsMK.duLieu || [];
            const nhomList = ['all', ...( dsNhom.duLieu || [])];

            trangMatKhau._render(danhSach, nhomList);
        } catch (loi) {
            el.innerHTML = `<div class="empty-state"><p>Lỗi tải dữ liệu: ${loi.message}</p></div>`;
        }
    },

    _render: (danhSach, nhomList) => {
        const el = document.getElementById('content');
        const nhomActive = trangMatKhau._nhomActive;
        const tuKhoa = trangMatKhau._tuKhoa;

        // ? Lọc client-side cho nhanh
        let ds = danhSach;
        if (nhomActive !== 'all') ds = ds.filter(m => m.nhom === nhomActive);
        if (tuKhoa) {
            const kw = tuKhoa.toLowerCase();
            ds = ds.filter(m =>
                m.nen_tang.toLowerCase().includes(kw) ||
                (m.ten_dn || '').toLowerCase().includes(kw)
            );
        }

        const nhomTabsHtml = nhomList.map(n => `
            <button class="mk-tab ${n === nhomActive ? 'active' : ''}" data-nhom="${n}">
                ${n === 'all' ? 'Tất cả' : n}
                <span class="mk-tab-count">${n === 'all' ? danhSach.length : danhSach.filter(m=>m.nhom===n).length}</span>
            </button>
        `).join('');

        const dsHtml = ds.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">🔐</div>
                <p>${tuKhoa ? 'Không tìm thấy kết quả' : 'Chưa có mật khẩu nào. Nhấn + Thêm để bắt đầu.'}</p>
            </div>
        ` : ds.map(m => trangMatKhau._renderCard(m)).join('');

        el.innerHTML = `
<div class="mk-wrap">

  <!-- Header controls -->
  <div class="mk-header">
    <div class="mk-search-wrap">
      <svg class="mk-search-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
      <input class="mk-search" id="mk-search" type="text" placeholder="Tìm theo tên nền tảng, tên đăng nhập..." value="${tuKhoa}">
      ${tuKhoa ? `<button class="mk-search-clear" id="mk-clear">✕</button>` : ''}
    </div>
    <button class="btn-add" id="btn-them-mk">+ Thêm</button>
  </div>

  <!-- Nhóm tabs -->
  <div class="mk-tabs" id="mk-tabs">
    ${nhomTabsHtml}
  </div>

  <!-- Danh sách -->
  <div class="mk-list" id="mk-list">
    ${dsHtml}
  </div>

</div>
`;
        trangMatKhau._bindEvents(danhSach, nhomList);
    },

    _renderCard: (m) => {
        const anMK = !trangMatKhau._hienMK[m._id];
        const mkHien = anMK ? '••••••••••' : m.mat_khau;
        const eyeIcon = anMK
            ? `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>`
            : `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>`;

        const ngayDoi = m.ngay_doi_mk ? new Date(m.ngay_doi_mk).toLocaleDateString('vi-VN') : null;
        const lichSuCount = (m.lich_su_mk || []).length;
        const icon = m.icon_emoji || trangMatKhau._iconNhom(m.nhom);

        return `
<div class="mk-card ${m.quan_trong ? 'important' : ''}" data-id="${m._id}">
  <div class="mk-card-left">
    <div class="mk-platform-icon">${icon}</div>
  </div>
  <div class="mk-card-body">
    <div class="mk-top-row">
      <span class="mk-platform">${m.nen_tang}</span>
      ${m.quan_trong ? `<span class="mk-badge important">★ Quan trọng</span>` : ''}
      <span class="mk-badge nhom">${m.nhom || 'Khác'}</span>
    </div>
    <div class="mk-row">
      <span class="mk-label">Tên đăng nhập</span>
      <div class="mk-value-row">
        <span class="mk-value">${m.ten_dn || '—'}</span>
        ${m.ten_dn ? `<button class="mk-copy-btn" data-copy="${m.ten_dn}" title="Copy">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>
        </button>` : ''}
      </div>
    </div>
    <div class="mk-row">
      <span class="mk-label">Mật khẩu</span>
      <div class="mk-value-row">
        <span class="mk-value mono mk-pw-text" data-id="${m._id}">${mkHien}</span>
        <button class="mk-eye-btn" data-id="${m._id}" title="${anMK?'Hiện':'Ẩn'}">${eyeIcon}</button>
        <button class="mk-copy-btn" data-copy="${m.mat_khau}" title="Copy mật khẩu">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>
        </button>
      </div>
    </div>
    ${m.ghiChu ? `<div class="mk-note">${m.ghiChu}</div>` : ''}
    ${m.ghiChu2 ? `<div class="mk-note mk-note2">${m.ghiChu2}</div>` : ''}
    <div class="mk-footer-row">
      ${ngayDoi ? `<span class="mk-meta">Đổi MK: ${ngayDoi}</span>` : ''}
      ${lichSuCount > 0 ? `<button class="mk-ls-btn" data-id="${m._id}">Lịch sử (${lichSuCount})</button>` : ''}
      ${m.url ? `<a class="mk-link" href="${m.url}" target="_blank">🔗 Mở trang</a>` : ''}
    </div>
  </div>
  <div class="mk-card-actions">
    <button class="mk-action-btn edit" data-id="${m._id}" title="Chỉnh sửa">
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
    </button>
    <button class="mk-action-btn star ${m.quan_trong?'active':''}" data-id="${m._id}" title="Quan trọng">
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    </button>
    <button class="mk-action-btn del" data-id="${m._id}" title="Xoá">
      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
    </button>
  </div>
</div>
`;
    },

    _iconNhom: (nhom) => {
        const map = {
            'Mạng xã hội' : '📱',
            'Email'        : '📧',
            'Ngân hàng'    : '🏦',
            'Công việc'    : '💼',
            'Mua sắm'      : '🛒',
            'Giải trí'     : '🎮',
            'Khác'         : '🔐',
        };
        return map[nhom] || '🔐';
    },

    /*
    !=======================================================================================
     ! BIND EVENTS
    !=======================================================================================
    */
    _bindEvents: (danhSach, nhomList) => {
        // ? Search
        const searchEl = document.getElementById('mk-search');
        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                trangMatKhau._tuKhoa = e.target.value;
                trangMatKhau._render(danhSach, nhomList);
            });
        }
        const clearEl = document.getElementById('mk-clear');
        if (clearEl) clearEl.addEventListener('click', () => {
            trangMatKhau._tuKhoa = '';
            trangMatKhau.render();
        });

        // ? Tabs nhóm
        document.getElementById('mk-tabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.mk-tab');
            if (!btn) return;
            trangMatKhau._nhomActive = btn.dataset.nhom;
            trangMatKhau._render(danhSach, nhomList);
        });

        // ? Nút thêm
        document.getElementById('btn-them-mk')?.addEventListener('click', () => {
            trangMatKhau.moModal(null);
        });

        // ? Copy buttons
        document.querySelectorAll('.mk-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.copy).then(() => {
                    hienToast('Đã copy!');
                }).catch(() => hienToast('Không thể copy', 'err'));
            });
        });

        // ? Hiện/ẩn mật khẩu
        document.querySelectorAll('.mk-eye-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                trangMatKhau._hienMK[id] = !trangMatKhau._hienMK[id];
                // Re-render chỉ card đó
                const item = danhSach.find(m => m._id === id);
                if (!item) return;
                const card = document.querySelector(`.mk-card[data-id="${id}"]`);
                if (card) card.outerHTML = trangMatKhau._renderCard(item);
                trangMatKhau._bindEvents(danhSach, nhomList);
            });
        });

        // ? Lịch sử
        document.querySelectorAll('.mk-ls-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const item = danhSach.find(m => m._id === id);
                if (item) trangMatKhau.moModalLichSu(item);
            });
        });

        // ? Sửa
        document.querySelectorAll('.mk-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const item = danhSach.find(m => m._id === btn.dataset.id);
                if (item) trangMatKhau.moModal(item);
            });
        });

        // ? Star / bỏ quan trọng
        document.querySelectorAll('.mk-action-btn.star').forEach(btn => {
            btn.addEventListener('click', async () => {
                const item = danhSach.find(m => m._id === btn.dataset.id);
                if (!item) return;
                try {
                    await ApiMatKhau.sua(item._id, { quan_trong: !item.quan_trong });
                    trangMatKhau.render();
                } catch (loi) { hienToast('Lỗi: ' + loi.message, 'err'); }
            });
        });

        // ? Xoá
        document.querySelectorAll('.mk-action-btn.del').forEach(btn => {
            btn.addEventListener('click', async () => {
                UI.xacNhan(`Xoá "${danhSach.find(m=>m._id===btn.dataset.id)?.nen_tang}"?`, async () => {
                    try {
                        await ApiMatKhau.xoa(btn.dataset.id);
                        hienToast('Đã xoá');
                        trangMatKhau.render();
                    } catch (loi) { hienToast('Lỗi: ' + loi.message, 'err'); }
                });
            });
        });
    },

    /*
    !=======================================================================================
     ! MODAL THÊM / SỬA
    !=======================================================================================
    */
    moModal: (item) => {
        const laSua = !!item;
        const nhomOptions = ['Mạng xã hội','Email','Ngân hàng','Công việc','Mua sắm','Giải trí','Khác']
            .map(n => `<option value="${n}" ${item?.nhom===n?'selected':''}>${n}</option>`).join('');

        const html = `
<div class="modal-overlay open" id="modal-mk">
  <div class="modal" style="max-width:480px">
    <div class="modal-hd">
      <span class="modal-title">${laSua ? 'Cập nhật mật khẩu' : 'Thêm mật khẩu mới'}</span>
      <button class="modal-close" id="mk-modal-close">✕</button>
    </div>
    <form class="form-body" id="mk-form" autocomplete="off" onsubmit="return false">
      <input type="hidden" id="mk-fi-id" value="${item?._id || ''}">

      <div class="form-row">
        <div class="fg">
          <label class="fl">Nền tảng <span style="color:var(--red)">*</span></label>
          <input class="fi" id="mk-fi-nentang" type="text" placeholder="Facebook, Gmail, Vietcombank..." value="${item?.nen_tang||''}">
        </div>
        <div class="fg">
          <label class="fl">Nhóm</label>
          <select class="fi" id="mk-fi-nhom">${nhomOptions}</select>
        </div>
      </div>

      <div class="fg">
        <label class="fl">URL trang web</label>
        <input class="fi" id="mk-fi-url" type="url" placeholder="https://..." value="${item?.url||''}">
      </div>

      <div class="fg">
        <label class="fl">Tên đăng nhập / Email</label>
        <input class="fi" id="mk-fi-tendn" type="text" placeholder="user@email.com hoặc số điện thoại..." value="${item?.ten_dn||''}" autocomplete="username">
      </div>

      <div class="fg">
        <label class="fl">Mật khẩu <span style="color:var(--red)">*</span></label>
        <div style="position:relative">
          <input class="fi" id="mk-fi-mk" type="password" placeholder="Nhập mật khẩu..." value="${item?.mat_khau||''}" autocomplete="new-password" style="padding-right:80px">
          <div style="position:absolute;right:6px;top:50%;transform:translateY(-50%);display:flex;gap:4px">
            <button type="button" class="mk-fi-eye" id="mk-fi-eye" title="Hiện/ẩn">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
            </button>
            <button type="button" class="mk-fi-gen" id="mk-fi-gen" title="Tạo MK ngẫu nhiên">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>
        <div id="mk-pw-strength" style="margin-top:4px;font-size:11px"></div>
      </div>

      <div class="fg">
        <label class="fl">Icon (emoji, tuỳ chọn)</label>
        <input class="fi" id="mk-fi-icon" type="text" placeholder="🔐 hoặc để trống" maxlength="4" value="${item?.icon_emoji||''}">
      </div>

      <div class="form-row">
        <div class="fg">
          <label class="fl">Ghi chú</label>
          <input class="fi" id="mk-fi-ghichu" type="text" placeholder="Tài khoản chính..." value="${item?.ghiChu||''}">
        </div>
        <div class="fg">
          <label class="fl">Ghi chú 2</label>
          <input class="fi" id="mk-fi-ghichu2" type="text" placeholder="Câu hỏi bảo mật..." value="${item?.ghiChu2||''}">
        </div>
      </div>

      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text2);margin-bottom:12px">
        <input type="checkbox" id="mk-fi-qt" ${item?.quan_trong?'checked':''}>
        Đánh dấu quan trọng
      </label>

      <button class="btn-submit" id="btn-luu-mk">${laSua ? 'Cập nhật' : 'Lưu mật khẩu'}</button>
    </form>
  </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', html);

        // Eye toggle
        document.getElementById('mk-fi-eye').addEventListener('click', () => {
            const inp = document.getElementById('mk-fi-mk');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        });

        // Password strength
        document.getElementById('mk-fi-mk').addEventListener('input', (e) => {
            document.getElementById('mk-pw-strength').innerHTML = trangMatKhau._doPhanMK(e.target.value);
        });
        if (item?.mat_khau) document.getElementById('mk-pw-strength').innerHTML = trangMatKhau._doPhanMK(item.mat_khau);

        // Generate password
        document.getElementById('mk-fi-gen').addEventListener('click', () => {
            const mk = trangMatKhau._taoMKNgauNhien();
            document.getElementById('mk-fi-mk').value = mk;
            document.getElementById('mk-fi-mk').type = 'text';
            document.getElementById('mk-pw-strength').innerHTML = trangMatKhau._doPhanMK(mk);
            navigator.clipboard.writeText(mk).then(() => hienToast('Đã tạo & copy MK!'));
        });

        // Close
        document.getElementById('mk-modal-close').addEventListener('click', () => {
            document.getElementById('modal-mk').remove();
        });
        document.getElementById('modal-mk').addEventListener('click', (e) => {
            if (e.target.id === 'modal-mk') document.getElementById('modal-mk').remove();
        });

        // Save
        document.getElementById('btn-luu-mk').addEventListener('click', async () => {
            const nen_tang  = document.getElementById('mk-fi-nentang').value.trim();
            const mat_khau  = document.getElementById('mk-fi-mk').value.trim();
            if (!nen_tang) return hienToast('Vui lòng nhập tên nền tảng', 'err');
            if (!mat_khau) return hienToast('Vui lòng nhập mật khẩu', 'err');

            const payload = {
                nen_tang,
                nhom        : document.getElementById('mk-fi-nhom').value,
                url         : document.getElementById('mk-fi-url').value.trim(),
                ten_dn      : document.getElementById('mk-fi-tendn').value.trim(),
                mat_khau,
                icon_emoji  : document.getElementById('mk-fi-icon').value.trim(),
                ghiChu      : document.getElementById('mk-fi-ghichu').value.trim(),
                ghiChu2     : document.getElementById('mk-fi-ghichu2').value.trim(),
                quan_trong  : document.getElementById('mk-fi-qt').checked,
            };

            try {
                const id = document.getElementById('mk-fi-id').value;
                if (id) {
                    await ApiMatKhau.sua(id, payload);
                    hienToast('Đã cập nhật!');
                } else {
                    await ApiMatKhau.them(payload);
                    hienToast('Đã thêm mật khẩu!');
                }
                document.getElementById('modal-mk').remove();
                trangMatKhau.render();
            } catch (loi) { hienToast('Lỗi: ' + loi.message, 'err'); }
        });
    },

    /*
    !=======================================================================================
     ! MODAL LỊCH SỬ ĐỔI MẬT KHẨU
    !=======================================================================================
    */
    moModalLichSu: (item) => {
        const lsHtml = (item.lich_su_mk || []).length === 0 ? '<p style="color:var(--text3);text-align:center;padding:16px">Chưa có lịch sử</p>' :
            [...item.lich_su_mk].reverse().map(ls => `
<div class="mk-ls-item">
  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
    <span class="mk-value mono" style="font-size:13px">••••••••••</span>
    <span style="font-size:11px;color:var(--text3)">${new Date(ls.ngaySua).toLocaleString('vi-VN')}</span>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
    <span style="font-size:11px;color:var(--text3)">${ls.ghiChu||''}</span>
    <div style="display:flex;gap:6px">
      <button class="mk-copy-btn" data-copy="${ls.matKhau}" title="Copy MK cũ">
        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>
      </button>
      <button class="mk-action-btn del mk-del-ls" data-id="${item._id}" data-lsid="${ls._id}" style="padding:4px" title="Xoá lịch sử này">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
      </button>
    </div>
  </div>
</div>
`).join('');

        const html = `
<div class="modal-overlay open" id="modal-mk-ls">
  <div class="modal" style="max-width:420px">
    <div class="modal-hd">
      <span class="modal-title">Lịch sử mật khẩu — ${item.nen_tang}</span>
      <button class="modal-close" id="mk-ls-close">✕</button>
    </div>
    <div class="form-body">
      ${lsHtml}
    </div>
  </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', html);

        document.getElementById('mk-ls-close').addEventListener('click', () => document.getElementById('modal-mk-ls').remove());
        document.getElementById('modal-mk-ls').addEventListener('click', (e) => {
            if (e.target.id === 'modal-mk-ls') document.getElementById('modal-mk-ls').remove();
        });

        document.querySelectorAll('.mk-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.copy).then(() => hienToast('Đã copy!'));
            });
        });

        document.querySelectorAll('.mk-del-ls').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await ApiMatKhau.xoaLichSu(btn.dataset.id, btn.dataset.lsid);
                    hienToast('Đã xoá');
                    document.getElementById('modal-mk-ls').remove();
                    trangMatKhau.render();
                } catch (loi) { hienToast('Lỗi: ' + loi.message, 'err'); }
            });
        });
    },

    /*
    !=======================================================================================
     ! TIỆN ÍCH
    !=======================================================================================
    */
    _taoMKNgauNhien: (doXa = 16) => {
        const ky = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        let mk = '';
        for (let i = 0; i < doXa; i++) mk += ky[Math.floor(Math.random() * ky.length)];
        return mk;
    },

    _doPhanMK: (mk) => {
        if (!mk) return '';
        let diem = 0;
        if (mk.length >= 8)  diem++;
        if (mk.length >= 12) diem++;
        if (/[A-Z]/.test(mk)) diem++;
        if (/[0-9]/.test(mk)) diem++;
        if (/[^A-Za-z0-9]/.test(mk)) diem++;
        const label = ['Rất yếu','Yếu','Trung bình','Mạnh','Rất mạnh'][Math.min(diem, 4)];
        const mau   = ['var(--red)','var(--red)','orange','var(--green)','var(--green)'][Math.min(diem, 4)];
        const phan  = Math.round((diem / 5) * 100);
        return `<div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:4px;background:var(--border);border-radius:2px">
                <div style="width:${phan}%;height:100%;background:${mau};border-radius:2px;transition:width .3s"></div>
            </div>
            <span style="color:${mau};font-size:11px;font-weight:600;min-width:60px">${label}</span>
        </div>`;
    },
};