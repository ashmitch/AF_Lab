{{ config(materialized='table') }}

with mapping as (
    select
        afl_fantasy_squad_id::integer as squad_id,
        trim(team_afl_tables_matches::text) as team_name,
        trim(team_afl_tables_matches::text) as match_team_name,
        trim(team_afl_tables_players::text) as player_team_alias
    from {{ ref('team_matching') }}
),
aliases as (
    select squad_id, team_name, match_team_name as team_alias from mapping
    union all
    select squad_id, team_name, player_team_alias as team_alias from mapping
    union all
    select squad_id, team_name, team_name as team_alias from mapping
)
select distinct
    squad_id,
    team_name,
    team_alias,
    regexp_replace(lower(trim(team_alias)), '[^a-z0-9]', '', 'g') as team_alias_normalised
from aliases
where coalesce(team_alias, '') <> ''
