-- SubTrack V7: Track User Subscriptions
ALTER TABLE users ADD COLUMN billing_period VARCHAR(20);
ALTER TABLE users ADD COLUMN plan_expires_at TIMESTAMPTZ;

-- Add index for expiration date for future cleanup/notification tasks
CREATE INDEX idx_users_plan_expires_at ON users(plan_expires_at);
