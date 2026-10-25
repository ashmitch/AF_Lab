
import os
import sys

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

TABLES = [
    "dim_games",
    "dim_players",
    "dim_teams",
    "fct_player_stats",
    "mart_home_away_averages",
    "mart_points_distribution",
    "mart_venue_averages",
    "mart_win_loss_averages",
]

SOURCE_SCHEMA = "analytics"
TARGET_SCHEMA = "analytics"


def main():
    source_url = os.environ.get("SOURCE_DATABASE_URL")
    target_url = os.environ.get("NEON_DATABASE_URL")

    if not source_url:
        sys.exit("Missing SOURCE_DATABASE_URL")
    if not target_url:
        sys.exit("Missing NEON_DATABASE_URL")

    source_engine = create_engine(source_url)
    target_engine = create_engine(target_url, pool_pre_ping=True)

    try:
        with source_engine.connect() as source, \
             target_engine.begin() as target:

            target.execute(
                text('CREATE SCHEMA IF NOT EXISTS "analytics"')
            )

            for table in TABLES:
                print(f"Publishing {table}...", flush=True)

                # Read the complete local dbt mart.
                df = pd.read_sql_table(
                    table,
                    source,
                    schema=SOURCE_SCHEMA,
                )

                # Publish the latest snapshot to Neon.
                # This replaces the destination table.
                df.to_sql(
                    table,
                    target,
                    schema=TARGET_SCHEMA,
                    if_exists="replace",
                    index=False,
                    chunksize=5000,
                    method="multi",
                )

                print(
                    f"  Published {len(df):,} rows",
                    flush=True,
                )

        print("All eight tables published successfully.")

    finally:
        source_engine.dispose()
        target_engine.dispose()


if __name__ == "__main__":
    main()
