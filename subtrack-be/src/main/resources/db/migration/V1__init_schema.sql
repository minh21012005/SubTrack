-- SubTrack V1: Initial Schema
-- Using VARCHAR for enum columns for Hibernate compatibility

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    plan_type       VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    reminder_days_before INTEGER  NOT NULL DEFAULT 7,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICE_PRESETS (template services for quick add)
-- ============================================================
CREATE TABLE service_presets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    default_price   DECIMAL(15,2) NOT NULL,
    currency        VARCHAR(10)  NOT NULL DEFAULT 'VND',
    billing_cycle   VARCHAR(20)  NOT NULL DEFAULT 'MONTHLY',
    icon_url        TEXT,
    color           VARCHAR(20),
    website_url     TEXT,
    description     TEXT,
    is_vn_service   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preset_id           UUID         REFERENCES service_presets(id),
    name                VARCHAR(255) NOT NULL,
    price               DECIMAL(15,2) NOT NULL,
    currency            VARCHAR(10)  NOT NULL DEFAULT 'VND',
    billing_cycle       VARCHAR(20)  NOT NULL DEFAULT 'MONTHLY',
    next_billing_date   DATE         NOT NULL,
    category            VARCHAR(100) NOT NULL,
    usage_status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    action_status       VARCHAR(20)  NOT NULL DEFAULT 'NONE',
    icon_url            TEXT,
    color               VARCHAR(20),
    notes               TEXT,
    is_cancelled        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID         REFERENCES subscriptions(id) ON DELETE SET NULL,
    type            VARCHAR(50)  NOT NULL,
    message         TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'UNREAD',
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RENEWAL_REMINDERS
-- ============================================================
CREATE TABLE renewal_reminders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id     UUID         NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    days_before         INTEGER      NOT NULL DEFAULT 7,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER_ACTIONS (audit log)
-- ============================================================
CREATE TABLE user_actions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID         NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    action_type     VARCHAR(30)  NOT NULL,
    note            TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WASTE_REPORTS (daily snapshots)
-- ============================================================
CREATE TABLE waste_reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_monthly_cost  DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_waste_cost    DECIMAL(15,2) NOT NULL DEFAULT 0,
    calculation_date    DATE          NOT NULL,
    breakdown           TEXT,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_subscriptions_user_id       ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing  ON subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_cancelled     ON subscriptions(is_cancelled);
CREATE INDEX idx_notifications_user_id       ON notifications(user_id);
CREATE INDEX idx_notifications_status        ON notifications(status);
CREATE INDEX idx_user_actions_user_id        ON user_actions(user_id);
CREATE INDEX idx_user_actions_sub_id         ON user_actions(subscription_id);
CREATE INDEX idx_waste_reports_user_id       ON waste_reports(user_id);
CREATE INDEX idx_waste_reports_date          ON waste_reports(calculation_date);
CREATE INDEX idx_renewal_reminders_sub_id    ON renewal_reminders(subscription_id);
