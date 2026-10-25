-- Thin staging view over the af_current_df output from the Python ingestion script.
select *
from {{ source('raw', 'fantasy_players') }}
