-- Spending Snapshots
CREATE TABLE spending_snapshots (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    total_cost DECIMAL(19, 2) NOT NULL,
    waste_cost DECIMAL(19, 2) NOT NULL,
    subscription_count INTEGER NOT NULL
);

-- Renewal Reminders
CREATE TABLE renewal_reminders (
    id UUID PRIMARY KEY,
    subscription_id UUID NOT NULL,
    days_before INTEGER NOT NULL DEFAULT 7,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- User Actions
CREATE TABLE user_actions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    subscription_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_subscription_action FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- Waste Reports
CREATE TABLE waste_reports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    total_monthly_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_waste_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    calculation_date DATE NOT NULL,
    breakdown TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_report FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    subscription_id UUID,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_notification FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_subscription_notification FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
