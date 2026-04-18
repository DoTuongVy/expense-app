/*
=========================================
 ! Đỏ    = QUAN TRỌNG / CẢNH BÁO
 ? Xanh  = GHI CHÚ / GIẢI THÍCH
 todo    = CẦN LÀM SAU
=========================================
*/


/*
!=======================================================================================
 ! DATABASE SETUP
!=======================================================================================
*/

CREATE DATABASE IF NOT EXISTS expense_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expense_management;

/*
!======================================================================================================================================
*/


/*
!=======================================================================================
 ! 1. BẢNG DANH MỤC (categories)
 ? Phân loại giao dịch theo 4 nhóm: income | expense | saving | debt
!=======================================================================================
*/

CREATE TABLE categories (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)    NOT NULL,
  type        ENUM(
                'income',     -- ! Thu nhập
                'expense',    -- ! Chi tiêu
                'saving',     -- ! Tiết kiệm
                'debt'        -- ! Nợ
              )               NOT NULL,
  icon        VARCHAR(50)     DEFAULT NULL,
  color       VARCHAR(20)     DEFAULT '#888888',
  is_active   TINYINT(1)      DEFAULT 1,
  created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/*
!======================================================================================================================================
*/


/*
!=======================================================================================
 ! 2. BẢNG KỲ THÁNG (monthly_periods)
 ? Mỗi tháng/năm là 1 kỳ riêng biệt
 ! opening_balance = số dư thực tế user xác nhận khi chuyển tháng
!=======================================================================================
*/

CREATE TABLE monthly_periods (
  id                    INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  month                 TINYINT         NOT NULL,
  year                  SMALLINT        NOT NULL,
  opening_balance       DECIMAL(15,2)   DEFAULT 0.00,   -- ! Số dư đầu kỳ THỰC TẾ (user xác nhận)
  system_balance        DECIMAL(15,2)   DEFAULT 0.00,   -- ? Số dư hệ thống tự tính (có thể lệch)
  adjustment            DECIMAL(15,2)   DEFAULT 0.00,   -- ? Chênh lệch = opening_balance - system_balance
  adjustment_note       VARCHAR(255)    DEFAULT NULL,
  is_closed             TINYINT(1)      DEFAULT 0,       -- ! 1 = đã chốt tháng
  closed_at             DATETIME        DEFAULT NULL,
  created_at            DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_month_year (month, year)
);

/*
!======================================================================================================================================
*/


/*
!=======================================================================================
 ! 3. BẢNG GIAO DỊCH (transactions)
 ! amount LUÔN là số DƯƠNG — chiều tiền xác định qua cột type
!=======================================================================================
*/

CREATE TABLE transactions (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  period_id     INT UNSIGNED    NOT NULL,
  category_id   INT UNSIGNED    NOT NULL,
  type          ENUM(
                  'income',
                  'expense',
                  'saving',
                  'debt_give',    -- ? Tôi cho người khác vay (tiền ra)
                  'debt_take',    -- ? Tôi vay người khác    (tiền vào)
                  'debt_collect', -- ? Thu nợ về             (tiền vào)
                  'debt_pay',     -- ? Trả nợ                (tiền ra)
                  'adjustment'    -- ! Điều chỉnh chênh lệch khi chốt tháng
                )               NOT NULL,
  amount        DECIMAL(15,2)   NOT NULL,
  trans_date    DATE            NOT NULL,
  note          VARCHAR(500)    DEFAULT NULL,
  is_adjustment TINYINT(1)      DEFAULT 0,               -- ? 1 = dòng điều chỉnh chênh lệch

  -- todo Sau có thể thêm: receipt_image, tags, location

  created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (period_id)   REFERENCES monthly_periods(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id)       ON DELETE RESTRICT
);

/*
!======================================================================================================================================
*/


/*
!=======================================================================================
 ! 4. BẢNG MỤC TIÊU (goals)
 ? Báo cáo so sánh: mục tiêu | thực tế | chênh lệch
!=======================================================================================
*/

CREATE TABLE goals (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  period_id     INT UNSIGNED    NOT NULL,
  category_id   INT UNSIGNED    NOT NULL,
  target_amount DECIMAL(15,2)   NOT NULL,
  created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_goal (period_id, category_id),           -- ? 1 mục tiêu / danh mục / tháng

  FOREIGN KEY (period_id)   REFERENCES monthly_periods(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)       ON DELETE CASCADE
);

/*
!======================================================================================================================================
*/


/*
!=======================================================================================
 ! 5. BẢNG THEO DÕI NỢ (debt_tracking)
 ? Tách riêng khỏi transactions để theo dõi tiến độ trả/thu
!=======================================================================================
*/

CREATE TABLE debt_tracking (
  id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  direction       ENUM(
                    'i_owe',    -- ! Tôi nợ người khác
                    'they_owe'  -- ? Người khác nợ tôi
                  )               NOT NULL,
  person_name     VARCHAR(100)    NOT NULL,
  original_amount DECIMAL(15,2)   NOT NULL,
  paid_amount     DECIMAL(15,2)   DEFAULT 0.00,
  due_date        DATE            DEFAULT NULL,
  status          ENUM(
                    'active',
                    'settled'
                  )               DEFAULT 'active',
  note            VARCHAR(500)    DEFAULT NULL,
  created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/*
!======================================================================================================================================
*/


/*
!=======================================================================================
 ! 6. INDEX — TỐI ƯU QUERY
!=======================================================================================
*/

CREATE INDEX idx_trans_period    ON transactions (period_id);
CREATE INDEX idx_trans_date      ON transactions (trans_date);
CREATE INDEX idx_trans_type      ON transactions (type);
CREATE INDEX idx_trans_category  ON transactions (category_id);
CREATE INDEX idx_debt_status     ON debt_tracking (status);
CREATE INDEX idx_period_my       ON monthly_periods (month, year);

/*
!======================================================================================================================================
*/


/*
!=======================================================================================
 ! 7. VIEW — TÓM TẮT THÁNG (v_monthly_summary)
 ? Dùng cho trang báo cáo
!=======================================================================================
*/

CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
  mp.id                 AS period_id,
  mp.month,
  mp.year,
  mp.opening_balance,

  -- ? Tổng thu
  COALESCE(SUM(CASE
    WHEN t.type IN ('income', 'debt_take', 'debt_collect')
    THEN t.amount ELSE 0
  END), 0) AS total_income,

  -- ! Tổng chi
  COALESCE(SUM(CASE
    WHEN t.type IN ('expense', 'debt_give', 'debt_pay', 'saving')
    THEN t.amount ELSE 0
  END), 0) AS total_expense,

  -- ? Tiết kiệm riêng
  COALESCE(SUM(CASE
    WHEN t.type = 'saving'
    THEN t.amount ELSE 0
  END), 0) AS total_saving,

  -- ! Số dư cuối kỳ hệ thống tính
  mp.opening_balance
    + COALESCE(SUM(CASE
        WHEN t.type IN ('income', 'debt_take', 'debt_collect')
        THEN t.amount ELSE 0
      END), 0)
    - COALESCE(SUM(CASE
        WHEN t.type IN ('expense', 'debt_give', 'debt_pay', 'saving')
        THEN t.amount ELSE 0
      END), 0)
  AS system_closing_balance

FROM monthly_periods mp
LEFT JOIN transactions t
  ON t.period_id = mp.id
  AND t.is_adjustment = 0
GROUP BY mp.id, mp.month, mp.year, mp.opening_balance;

/*
!======================================================================================================================================
*/
