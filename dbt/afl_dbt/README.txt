Updated dbt models for the three Python DataFrame outputs.

Expected PostgreSQL raw tables:
  raw.af_current_df  <- local_files/af_current_df.csv
  raw.final_df       <- local_files/final_df.csv
  raw.games_df       <- local_files/games_df.csv

The models deliberately read those three source tables through staging views.
The fct_game_stats model has been removed. Player-game joins now use Team_Match_ID
against Home_ID/Away_ID, rather than joining on round alone, which could duplicate
records when multiple games exist in a round.

Important: the Python script exports CSV files; it does not itself create PostgreSQL
tables. Load the three CSVs into the raw schema under the exact names above before
running dbt build. Keep the columns as exported by the script, including capitalisation
(e.g. Match_ID, Team_Match_ID, Home_ID, Away_ID, Player, TOG, ownership.25).

Run from the project root:
  docker compose run --rm --entrypoint bash airflow-worker -c "cd /opt/airflow/dbt/afl_dbt && dbt seed --full-refresh && dbt build"

Ensure the updated files are copied into dbt/afl_dbt/ and team_matching.csv is placed
in dbt/afl_dbt/seeds/. Do not copy profiles.yml from the old archive over your existing
working profiles.yml.
