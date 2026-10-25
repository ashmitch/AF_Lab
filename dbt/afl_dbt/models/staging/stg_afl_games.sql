-- Thin staging view over the games_df output from the Python ingestion script.
select *
from {{ source('raw', 'afl_games') }}
