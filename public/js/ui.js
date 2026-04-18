'use strict';

/*
=========================================
 ! Đỏ    = QUAN TRỌNG / CẢNH BÁO
 ? Xanh  = GHI CHÚ / GIẢI THÍCH
 todo    = CẦN LÀM SAU
=========================================
*/

/*
!=======================================================================================
 ! JS/UI.JS — Quản lý modal, confirm, form dùng chung
 ? Thay thế toàn bộ alert(), confirm(), prompt() bằng UI đẹp
!=======================================================================================
*/

const UI = {

    /*
    !=======================================================================================
     ! Modal xác nhận xoá — thay confirm()
     ? Dùng: UI.xacNhan('Xoá giao dịch?', callback)
    !=======================================================================================
    */
    xacNhan: (noiDung, callback, icon = '🗑️') => {
        document.getElementById('xacnhan-icon').textContent  = icon;
        document.getElementById('xacnhan-title').textContent = noiDung;
        document.getElementById('xacnhan-desc').textContent  = 'Hành động này không thể hoàn tác.';

        const overlay   = document.getElementById('modal-xacnhan');
        const btnOk     = document.getElementById('btn-xacnhan-ok');
        const btnHuy    = document.getElementById('btn-xacnhan-huy');

        overlay.classList.add('open');

        // ? Clone để xoá event cũ
        const btnOkMoi  = btnOk.cloneNode(true);
        const btnHuyMoi = btnHuy.cloneNode(true);
        btnOk.replaceWith(btnOkMoi);
        btnHuy.replaceWith(btnHuyMoi);

        btnOkMoi.addEventListener('click', () => {
            overlay.classList.remove('open');
            callback();
        });

        btnHuyMoi.addEventListener('click', () => {
            overlay.classList.remove('open');
        });

        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        };
    },

    /*
    !=======================================================================================
     ? Mở / đóng modal bất kỳ theo ID
    !=======================================================================================
    */
    moModal: (id) => {
        document.getElementById(id)?.classList.add('open');
    },

    dongModal: (id) => {
        document.getElementById(id)?.classList.remove('open');
    },

    /*
    !=======================================================================================
     ! Modal thêm danh mục
    !=======================================================================================
    */
    moModalDanhMuc: () => {
        document.getElementById('fi-dm-ten').value  = '';
        document.getElementById('fi-dm-icon').value = '📁';
        document.getElementById('fi-dm-mau').value  = '#3b82f6';
        UI.moModal('modal-danhmuc');
        setTimeout(() => document.getElementById('fi-dm-ten').focus(), 100);
    },

    /*
    !=======================================================================================
     ! Modal đặt mục tiêu — load danh mục vào select
    !=======================================================================================
    */
    moModalMucTieu: async () => {
        const ketQua    = await ApiDanhMuc.layTatCa().catch(() => ({ duLieu: [] }));
        const sel       = document.getElementById('fi-mt-danhmuc');
        sel.innerHTML   = ketQua.duLieu.map(dm =>
            `<option value="${dm._id || dm.id}">${dm.icon || ''} ${dm.name}</option>`
        ).join('');
        document.getElementById('fi-mt-sotien').value = '';
        UI.moModal('modal-muctieu');
        setTimeout(() => document.getElementById('fi-mt-sotien').focus(), 100);
    },

    /*
    !=======================================================================================
     ! Modal thêm khoản nợ
    !=======================================================================================
    */
    moModalNo: () => {
        document.getElementById('fi-no-ten').value    = '';
        document.getElementById('fi-no-sotien').value = '';
        document.getElementById('fi-no-han').value    = '';
        document.getElementById('fi-no-ghichu').value = '';
        UI.moModal('modal-no');
        setTimeout(() => document.getElementById('fi-no-ten').focus(), 100);
    },

    /*
    !=======================================================================================
     ! Modal cập nhật đã trả nợ
    !=======================================================================================
    */
    moModalTraNo: (id, tenNguoi, chieuNo) => {
        const title = chieuNo === 'i_owe' ? `Trả nợ cho ${tenNguoi}` : `Thu nợ từ ${tenNguoi}`;
        document.getElementById('modal-tra-no-title').textContent = title;
        document.getElementById('fi-tra-sotien').value = '';
        document.getElementById('fi-tra-no-id').value  = id;
        UI.moModal('modal-tra-no');
        setTimeout(() => document.getElementById('fi-tra-sotien').focus(), 100);
    },
};