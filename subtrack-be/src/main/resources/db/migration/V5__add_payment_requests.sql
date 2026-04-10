-- SubTrack V5: Payment Requests (Manual Bank Transfer)

CREATE TABLE payment_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type       VARCHAR(20)  NOT NULL DEFAULT 'PREMIUM',
    billing_period  VARCHAR(20)  NOT NULL, -- MONTHLY | YEARLY
    amount          DECIMAL(15,2) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED
    notes           TEXT,
    verified_at     TIMESTAMPTZ,
    verified_by     UUID         REFERENCES users(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status  ON payment_requests(status);
