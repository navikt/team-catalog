update generic_storage
set data = jsonb_insert(data, '{"teamOwnershipType"}', data #> '{teamType}')
where type in ('Team')
and data ->> 'teamOwnershipType' is null
and data ->> 'teamType' is not null;