-- Thin staging view over the final_df output from the Python ingestion script.
select *
from {{ source('raw', 'afl_player_stats') }}
