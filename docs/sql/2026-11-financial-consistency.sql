-- Upgrade an existing PostgreSQL database before deploying this release.
-- Stop writes and take a backup first. A duplicate bank id aborts the transaction;
-- investigate duplicates rather than discarding financial records.
BEGIN;
ALTER TABLE charges ADD COLUMN IF NOT EXISTS version bigint NOT NULL DEFAULT 0;
ALTER TABLE charges ADD COLUMN IF NOT EXISTS idempotency_key varchar(128);
ALTER TABLE charges ADD COLUMN IF NOT EXISTS issuance_state varchar(24);
ALTER TABLE charges ADD COLUMN IF NOT EXISTS customer_name_snapshot varchar(255);
ALTER TABLE charges ADD COLUMN IF NOT EXISTS pet_name_snapshot varchar(255);
ALTER TABLE charges ADD COLUMN IF NOT EXISTS service_name_snapshot varchar(255);
UPDATE charges c SET customer_name_snapshot = u.name
FROM customers cu JOIN users u ON u.id = cu.user_id
WHERE cu.id = c.customer_id AND c.customer_name_snapshot IS NULL;
UPDATE charges c SET pet_name_snapshot = p.name
FROM pets p WHERE p.id = c.pet_id AND c.pet_name_snapshot IS NULL;
UPDATE charges c SET service_name_snapshot = s.name
FROM services s WHERE s.id = c.service_id AND c.service_name_snapshot IS NULL;
UPDATE charges SET issuance_state = 'ISSUED'
WHERE c6_bank_slip_id IS NOT NULL AND issuance_state IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_charges_idempotency_key ON charges (idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS ux_charges_bank_slip_id ON charges (c6_bank_slip_id);
COMMIT;
