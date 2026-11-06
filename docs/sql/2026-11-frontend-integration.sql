BEGIN;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS sex varchar(30);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS weight numeric(8,2);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS notes varchar(2000);
CREATE TABLE IF NOT EXISTS charge_lines (
    charge_id bigint NOT NULL REFERENCES charges(id),
    line_number integer NOT NULL,
    service_id bigint,
    name varchar(255),
    quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 100),
    unit_price numeric(10,2),
    PRIMARY KEY (charge_id,line_number)
);
COMMIT;
