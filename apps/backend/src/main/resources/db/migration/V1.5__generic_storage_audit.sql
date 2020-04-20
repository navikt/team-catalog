update audit_version
set table_name = data ->> 'type'
where data ->> 'type' = 'GENERIC_STORAGE';
