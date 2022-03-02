update generic_storage
set data = jsonb_insert(data, '{"status"}', '"ACTIVE"')
where type in ('Team', 'ProductArea', 'Cluster');