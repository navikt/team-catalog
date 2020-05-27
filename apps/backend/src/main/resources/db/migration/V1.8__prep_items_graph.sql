update generic_storage
set data = jsonb_set(data, '{updateSent}', 'false', true)
where (type = 'ProductArea' or type = 'Team')
