-- SubTrack V6: Add transfer_content to payment_requests for robustness
ALTER TABLE payment_requests ADD COLUMN transfer_content VARCHAR(255);

-- Update existing records if any (optional but good practice)
-- Since it's a new system, we can just leave it NULL or fill it manually if needed.
