update generic_storage
set data = jsonb_insert(data, '{qaTime}',
                        case
                            when data -> 'teamLeadQA' = 'true'::jsonb
                                then to_jsonb(last_modified_date)
                            else 'null'::jsonb
                            end)
    - 'teamLeadQA'
where type = 'Team';

update audit_version
set data = jsonb_insert(data, '{data,qaTime}',
                        case
                            when data #> '{data,teamLeadQA}' = 'true'::jsonb
                                then data #> '{lastModifiedDate}'
                            else 'null'::jsonb
                            end)
    - '{data,teamLeadQA}'
where table_name = 'Team'
