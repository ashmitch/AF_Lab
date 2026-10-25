{{ config(materialized='table') }}

with source_games as (
    select *
    from {{ ref('stg_afl_games') }}
),
typed as (
    select
        nullif(trim("Match_ID"::text), '') as match_id,
        nullif(trim("Home_ID"::text), '') as home_id,
        nullif(trim("Away_ID"::text), '') as away_id,
        "round"::text as round,
        case
            when trim("round"::text) ~ '^[0-9]+$' then trim("round"::text)::integer
            else null
        end as round_number,
        trim(home_team::text) as home_team,
        trim(away_team::text) as away_team,
        nullif(trim(home_score::text), '') as home_score_raw,
        nullif(trim(away_score::text), '') as away_score_raw,
        nullif(trim(home_q1_score::text), '') as home_q1_score_raw,
        nullif(trim(home_q2_score::text), '') as home_q2_score_raw,
        nullif(trim(home_q3_score::text), '') as home_q3_score_raw,
        nullif(trim(home_q4_score::text), '') as home_q4_score_raw,
        nullif(trim(away_q1_score::text), '') as away_q1_score_raw,
        nullif(trim(away_q2_score::text), '') as away_q2_score_raw,
        nullif(trim(away_q3_score::text), '') as away_q3_score_raw,
        nullif(trim(away_q4_score::text), '') as away_q4_score_raw,
        nullif(trim(day::text), '') as day,
        case when nullif(trim(date::text), '') is not null then trim(date::text)::date end as match_date,
        nullif(trim(time::text), '') as match_time,
        case when trim(attendance::text) ~ '^[0-9]+$' then trim(attendance::text)::bigint end as attendance,
        nullif(trim(venue::text), '') as venue
    from source_games
)
select
    md5(coalesce(match_id, concat_ws('|', round, home_team, away_team))) as game_key,
    match_id,
    home_id,
    away_id,
    round,
    round_number,
    home_team,
    away_team,
    case when home_score_raw ~ '^[0-9]+$' then home_score_raw::integer end as home_score,
    case when away_score_raw ~ '^[0-9]+$' then away_score_raw::integer end as away_score,
    case when home_q1_score_raw ~ '^[0-9]+$' then home_q1_score_raw::integer end as home_q1_score,
    case when home_q2_score_raw ~ '^[0-9]+$' then home_q2_score_raw::integer end as home_q2_score,
    case when home_q3_score_raw ~ '^[0-9]+$' then home_q3_score_raw::integer end as home_q3_score,
    case when home_q4_score_raw ~ '^[0-9]+$' then home_q4_score_raw::integer end as home_q4_score,
    case when away_q1_score_raw ~ '^[0-9]+$' then away_q1_score_raw::integer end as away_q1_score,
    case when away_q2_score_raw ~ '^[0-9]+$' then away_q2_score_raw::integer end as away_q2_score,
    case when away_q3_score_raw ~ '^[0-9]+$' then away_q3_score_raw::integer end as away_q3_score,
    case when away_q4_score_raw ~ '^[0-9]+$' then away_q4_score_raw::integer end as away_q4_score,
    day,
    match_date,
    match_time,
    attendance,
    venue,
    case
        when home_score_raw ~ '^[0-9]+$' and away_score_raw ~ '^[0-9]+$' and home_score_raw::integer > away_score_raw::integer then home_team
        when home_score_raw ~ '^[0-9]+$' and away_score_raw ~ '^[0-9]+$' and away_score_raw::integer > home_score_raw::integer then away_team
    end as winning_team,
    case
        when home_score_raw ~ '^[0-9]+$' and away_score_raw ~ '^[0-9]+$' and home_score_raw::integer > away_score_raw::integer then 'Home'
        when home_score_raw ~ '^[0-9]+$' and away_score_raw ~ '^[0-9]+$' and away_score_raw::integer > home_score_raw::integer then 'Away'
    end as winning_team_type,
    case
        when home_score_raw ~ '^[0-9]+$' and away_score_raw ~ '^[0-9]+$' then abs(home_score_raw::integer - away_score_raw::integer)
    end as winning_margin
from typed
where home_score_raw ~ '^[0-9]+$'
  and away_score_raw ~ '^[0-9]+$'
