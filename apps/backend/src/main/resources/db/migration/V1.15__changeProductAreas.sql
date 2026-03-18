-- extract custom owner group `old_owner_group` (not NOM-derived) from previous jsonb structure
-- reinserting `old_owner_group` into the new jsonb field
with areas as (
    select
       id as areaid,
       data as old_area_data,
       coalesce(data::jsonb->'productAreaOwnerGroup'->'ownerGroupMemberNavIdList','[]'::jsonb) as old_owner_group
    from generic_storage where type='ProductArea'
), areas_to_update as (
    select
        areaid as to_update_id,
        old_area_data || jsonb_build_object('ownerGroupNavidentList', old_owner_group) as data
    from areas
)
update generic_storage
    set data = areas_to_update.data from areas_to_update
        where generic_storage.id = areas_to_update.to_update_id;
