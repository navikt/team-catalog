update generic_storage
set data = jsonb_set(data, '{teamType}', '"UNKNOWN"', true)
where type in ('Team')
