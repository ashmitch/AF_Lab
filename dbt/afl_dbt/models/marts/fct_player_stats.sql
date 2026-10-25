{{ config(materialized='table') }}

with source_stats as (
    select *
    from {{ ref('stg_afl_player_stats') }}
),
players as (
    select
        player_id,
        regexp_replace(lower(trim(player_name)), '[^a-z0-9]', '', 'g') as player_name_normalised
    from {{ ref('dim_players') }}
),
prepared as (
    select
        s.*,
        regexp_replace(lower(trim("Player"::text)), '[^a-z0-9]', '', 'g') as player_name_normalised,
        trim(team_afl_tables_matches::text) as team_clean,
        nullif(trim("round"::text), '')::integer as round_number,
        trim("Team_Match_ID"::text) as team_match_id
    from source_stats s
),
identified as (
    select
        p.player_id,
        s."Player" as source_player_name,
        s.team_clean as team,
        regexp_replace(lower(trim(s.team_clean)), '[^a-z0-9]', '', 'g') as team_key,
        s.round_number,
        s.round_number as round,
        s.team_match_id,
        nullif(trim(s.disposals::text), '') as disposals_raw,
        nullif(trim(s.kicks::text), '') as kicks_raw,
        nullif(trim(s.marks::text), '') as marks_raw,
        nullif(trim(s.handballs::text), '') as handballs_raw,
        nullif(trim(s.goals::text), '') as goals_raw,
        nullif(trim(s.behinds::text), '') as behinds_raw,
        nullif(trim(s.hitouts::text), '') as hitouts_raw,
        nullif(trim(s.tackles::text), '') as tackles_raw,
        nullif(trim(s.rebound50::text), '') as rebound50_raw,
        nullif(trim(s.inside50::text), '') as inside50_raw,
        nullif(trim(s.clearances::text), '') as clearances_raw,
        nullif(trim(s.clangers::text), '') as clangers_raw,
        nullif(trim(s.frees_for::text), '') as frees_for_raw,
        nullif(trim(s.frees_against::text), '') as frees_against_raw,
        nullif(trim(s.brownlow_votes::text), '') as brownlow_votes_raw,
        nullif(trim(s.cont_possessions::text), '') as cont_possessions_raw,
        nullif(trim(s.uncont_possessions::text), '') as uncont_possessions_raw,
        nullif(trim(s.contested_marks::text), '') as contested_marks_raw,
        nullif(trim(s.marks_inside_50::text), '') as marks_inside_50_raw,
        nullif(trim(s.one_percenters::text), '') as one_percenters_raw,
        nullif(trim(s.bounces::text), '') as bounces_raw,
        nullif(trim(s.goal_assists::text), '') as goal_assists_raw,
        nullif(trim(s."TOG"::text), '') as tog_raw
    from prepared s
    left join players p
      on s.player_name_normalised = p.player_name_normalised
)
select
    i.player_id,
    i.source_player_name,
    i.team,
    i.team_key,
    i.round,
    i.round_number,
    i.team_match_id,
    g.match_id,
    g.game_key,
    g.venue,
    g.home_team,
    g.away_team,
    case when g.home_id = i.team_match_id then 'Home'
         when g.away_id = i.team_match_id then 'Away' end as venue_type,
    case when i.disposals_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.disposals_raw::numeric end as disposals,
    case when i.kicks_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.kicks_raw::numeric end as kicks,
    case when i.marks_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.marks_raw::numeric end as marks,
    case when i.handballs_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.handballs_raw::numeric end as handballs,
    case when i.goals_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.goals_raw::numeric end as goals,
    case when i.behinds_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.behinds_raw::numeric end as behinds,
    case when i.hitouts_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.hitouts_raw::numeric end as hitouts,
    case when i.tackles_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.tackles_raw::numeric end as tackles,
    case when i.rebound50_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.rebound50_raw::numeric end as rebound50,
    case when i.inside50_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.inside50_raw::numeric end as inside50,
    case when i.clearances_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.clearances_raw::numeric end as clearances,
    case when i.clangers_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.clangers_raw::numeric end as clangers,
    case when i.frees_for_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.frees_for_raw::numeric end as frees_for,
    case when i.frees_against_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.frees_against_raw::numeric end as frees_against,
    case when i.brownlow_votes_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.brownlow_votes_raw::numeric end as brownlow_votes,
    case when i.cont_possessions_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.cont_possessions_raw::numeric end as contested_possessions,
    case when i.uncont_possessions_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.uncont_possessions_raw::numeric end as uncontested_possessions,
    case when i.contested_marks_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.contested_marks_raw::numeric end as contested_marks,
    case when i.marks_inside_50_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.marks_inside_50_raw::numeric end as marks_inside_50,
    case when i.one_percenters_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.one_percenters_raw::numeric end as one_percenters,
    case when i.bounces_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.bounces_raw::numeric end as bounces,
    case when i.goal_assists_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.goal_assists_raw::numeric end as goal_assists,
    case when i.tog_raw ~ '^-?[0-9]+(\.[0-9]+)?$' then i.tog_raw::numeric end as tog
from identified i
left join {{ ref('dim_games') }} g
  on g.home_id = i.team_match_id or g.away_id = i.team_match_id