update audit_version
set table_name = data ->> 'type'
where table_name = 'GENERIC_STORAGE';
