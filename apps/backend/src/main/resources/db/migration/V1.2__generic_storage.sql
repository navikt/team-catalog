CREATE TABLE IF NOT EXISTS GENERIC_STORAGE
(
    ID                 UUID PRIMARY KEY,
    TYPE               TEXT      NOT NULL,
    DATA               JSONB     NOT NULL,
    CREATED_BY         TEXT      NOT NULL,
    CREATED_DATE       TIMESTAMP NOT NULL,
    LAST_MODIFIED_BY   TEXT,
    LAST_MODIFIED_DATE TIMESTAMP
);