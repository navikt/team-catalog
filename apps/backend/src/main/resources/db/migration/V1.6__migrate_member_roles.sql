with members as (
    select id                                        as teamId,
           jsonb_array_elements(data #> '{members}') as member
    from generic_storage
    where type = 'Team'
)
update generic_storage
set data = jsonb_set(data, '{members}', coalesce(
        (
            select memberArray
            from (select teamId,
                         jsonb_agg(
                                 jsonb_set(
                                     jsonb_set(member, '{description}', (member #> '{role}'))
                                     , '{role}', '["DEVELOPER"]'::jsonb)
                             ) as memberArray
                  from members
                  group by teamId
                 ) as updatedMembers
            where teamId = id
        ), '[]'::jsonb)
    )
where type = 'Team'
