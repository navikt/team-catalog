ALTER TABLE AUTH
    ADD COLUMN LAST_ACTIVE TIMESTAMP;

UPDATE AUTH
SET LAST_ACTIVE = now() - INTERVAL '3 DAYS'
WHERE LAST_ACTIVE IS NULL;

ALTER TABLE AUTH
    ALTER COLUMN LAST_ACTIVE SET NOT NULL;