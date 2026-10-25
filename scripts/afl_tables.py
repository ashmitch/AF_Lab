#%%
import requests
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
#%%
import requests
import pandas as pd
import numpy as np

url = "https://fantasy.afl.com.au/json/fantasy/players.json"

response = requests.get(url, timeout=60)
response.raise_for_status()

data = response.json()

af_current_df = pd.json_normalize(data)
#%%
url = "https://afltables.com/afl/seas/2026.html"

tables = pd.read_html(url)

# define list of teams
teams = ['Carlton', 'Richmond','Essendon','Hawthorn', 'Western Bulldogs', 
         'Greater Western Sydney', 'Geelong', 'Fremantle', 'Sydney', 'Brisbane Lions', 
         'Collingwood' , 'Adelaide', 'North Melbourne', 'Port Adelaide','Melbourne', 
         'St Kilda', 'Gold Coast', 'West Coast']

days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
round = "Round 0"
rows = []
#%%
for i, table in enumerate(tables):
    first_word = table.iloc[0,0]
    if "Round" in first_word or "Final" in first_word:
        round = first_word
    if first_word in teams:
        try:
            home_team = table.iloc[0,0]
            home_qtr_score = table.iloc[0,1]
            home_score = table.iloc[0,2]
            date_time_attendance = table.iloc[0,3]
        except:
            pass
        try:
            away_team = table.iloc[1,0]
            away_qtr_score = table.iloc[1,1]
            away_score = table.iloc[1,2]
        except:
            pass

        new_row = [round, home_team, away_team, home_score, away_score, 
                 home_qtr_score, away_qtr_score, 
                 date_time_attendance]
        rows.append(new_row)

games_df = pd.DataFrame(
    rows,
    columns=[
        "round",
        "home_team",
        "away_team",
        "home_score",
        "away_score",
        "home_qtr_score",
        "away_qtr_score",
        "date_time_attendance"
    ]
)
#%%
import pandas as pd
import re

# --------------------------------------------------
# Parse quarter scores
# --------------------------------------------------

def parse_quarter_scores(value, prefix):
    """
    Convert a string like:
        '0.3 2.6 14.9 20.12'

    into:
        q1_score = 3
        q2_score = 14
        q3_score = 93
        q4_score = 132

    AFL score format is goals.behinds.
    """

    if pd.isna(value) or value == "Bye":
        return {
            f"{prefix}_q1_score": None,
            f"{prefix}_q2_score": None,
            f"{prefix}_q3_score": None,
            f"{prefix}_q4_score": None,
        }

    quarters = str(value).split()

    scores = {}

    for i, quarter in enumerate(quarters[:4], start=1):
        goals, behinds = quarter.split(".")

        score = int(goals) * 6 + int(behinds)

        scores[f"{prefix}_q{i}_score"] = score

    # Make sure all four columns exist
    for i in range(len(quarters) + 1, 5):
        scores[f"{prefix}_q{i}_score"] = None

    return scores


home_scores = games_df["home_qtr_score"].apply(
    lambda x: parse_quarter_scores(x, "home")
)

away_scores = games_df["away_qtr_score"].apply(
    lambda x: parse_quarter_scores(x, "away")
)

home_scores_df = pd.DataFrame(home_scores.tolist())
away_scores_df = pd.DataFrame(away_scores.tolist())

games_df = pd.concat(
    [games_df, home_scores_df, away_scores_df],
    axis=1
)


# --------------------------------------------------
# Parse date / time / attendance / venue
# --------------------------------------------------

def parse_game_details(value):

    if pd.isna(value) or value == "Bye":
        return {
            "day": None,
            "date": None,
            "time": None,
            "attendance": None,
            "venue": None,
        }

    value = str(value)

    # Example:
    # Thu 05-Mar-2026 7:30 PM (6:30 PM) Att: 40,372 Venue: S.C.G.

    # Day
    day_match = re.search(r"^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)", value)

    # Date
    date_match = re.search(
        r"(\d{2}-[A-Za-z]{3}-\d{4})",
        value
    )

    # Time
    time_match = re.search(
        r"\b(\d{1,2}:\d{2}\s*[AP]M)",
        value
    )

    # Attendance
    attendance_match = re.search(
        r"Att:\s*([\d,]+)",
        value
    )

    # Venue
    venue_match = re.search(
        r"Venue:\s*(.*)$",
        value
    )

    return {
        "day": day_match.group(1) if day_match else None,

        "date": (
            pd.to_datetime(
                date_match.group(1),
                format="%d-%b-%Y"
            ).date()
            if date_match
            else None
        ),

        "time": time_match.group(1) if time_match else None,

        "attendance": (
            int(attendance_match.group(1).replace(",", ""))
            if attendance_match
            else None
        ),

        "venue": (
            venue_match.group(1).strip()
            if venue_match
            else None
        ),
    }


game_details = games_df["date_time_attendance"].apply(
    parse_game_details
)

game_details_df = pd.DataFrame(game_details.tolist())

games_df = pd.concat(
    [games_df, game_details_df],
    axis=1
)


# --------------------------------------------------
# Remove the original combined columns
# --------------------------------------------------

games_df = games_df.drop(
    columns=[
        "home_qtr_score",
        "away_qtr_score",
        "date_time_attendance"
    ]
)

#%%
url_team_names = ['carlton', 'richmond','essendon','hawthorn', 'bullldogs', 
         'gws', 'geelong', 'fremantle', 'swans', 'brisbanel', 
         'collingwood' , 'adelaide', 'kangaroos', 'padelaide','melbourne', 
         'stkilda', 'goldcoast', 'westcoast']

stat_names = [
    "disposals",
    "kicks",
    "marks",
    "handballs",
    "goals",
    "behinds",
    "hitouts",
    "tackles",
    "rebound50",
    "inside50",
    "clearances",
    "clangers",
    "frees_for",
    "frees_against",
    "brownlow_votes",
    "cont_possessions",
    "uncont_possessions",
    "contested_marks",
    "marks_inside_50",
    "one_percenters",
    "bounces",
    "goal_assists",
    "TOG"
]

all_tables = {stat: [] for stat in stat_names}

for team in url_team_names:

    url = f"https://afltables.com/afl/stats/teams/{team}/2026_gbg.html"

    tables = pd.read_html(url)

    for j, table in enumerate(tables):

        # Ignore any tables that aren't player statistics
        if j >= len(stat_names):
            continue

        stat = stat_names[j]

        table["team"] = team

        all_tables[stat].append(table)

#%%
combined_tables = {}

#%%
for stat in stat_names:

    combined = pd.concat(
        all_tables[stat],
        ignore_index=True,
        sort=False
    )

    # Flatten AFL Tables' MultiIndex columns
    combined.columns = [
    col[0] if col[0] == "team" else col[1]
    if isinstance(col, tuple)
    else col
    for col in combined.columns
]

    combined_tables[stat] = combined

#%%
long_tables = {}

for stat in stat_names:

    df = combined_tables[stat].copy()

    # Only keep round columns
    round_columns = [
        col for col in df.columns
        if str(col).startswith("R")
    ]

    df = df.melt(
        id_vars=["Player", "team"],
        value_vars=round_columns,
        var_name="round",
        value_name=stat
    )

    long_tables[stat] = df

final_df = long_tables["disposals"]

for stat in stat_names[1:]:

    final_df = final_df.merge(
        long_tables[stat],
        on=["Player", "team", "round"],
        how="outer"
    )
#%%

# Count non-null disposals by player
print(
    final_df.groupby(["Player", "team"])["disposals"]
    .count()
    .sort_values(ascending=False)
    .head(20)
)
#%%

# Remove players with no TOG
# Convert numeric columns
for stat in stat_names:
    final_df[stat] = pd.to_numeric(
        final_df[stat],
        errors="coerce"
    )

# Keep rows where the player actually recorded a stat
# Disposals is a good indicator for whether they played
final_df = final_df[final_df["disposals"].notna()]

final_df = final_df.fillna(0)
#%%
team_matching = pd.read_csv(
    "/opt/airflow/dbt/afl_dbt/seeds/team_matching.csv"
)
print(team_matching.columns)
#%%
games_df["round"] = games_df["round"].apply(
    lambda x: "Finals" if "Final" in x else int(x.split("Round ")[1].split()[0])
)
#%%

af_current_df = pd.merge(af_current_df,team_matching,how = "left", left_on = "squadId",right_on = "afl_fantasy_squad_id" )

#%%
final_df = pd.merge(final_df,team_matching,how = "left", left_on = "team",right_on = "team_afl_tables_players" )

games_df['Match_ID'] = games_df["round"].astype(str)+"-"+games_df["home_team"].astype(str)+"-"+games_df["away_team"].astype(str)
games_df['Home_ID'] = games_df["round"].astype(str)+"-"+games_df["home_team"].astype(str)
games_df['Away_ID'] = games_df["round"].astype(str)+"-"+games_df["away_team"].astype(str)

final_df["round"] = final_df["round"].str.extract(r"R(\d+)").astype(int)
final_df["Team_Match_ID"] = final_df["round"].astype(str)+"-"+final_df["team_afl_tables_matches"].astype(str)

af_current_df["player_name"] = af_current_df["lastName"]+", "+af_current_df["firstName"]

# %%
# Convert NumPy scalar values to native Python values
def convert_numpy_values(df):
    return df.map(
        lambda x: x.item() if isinstance(x, np.generic) else x
    )

af_current_df = convert_numpy_values(af_current_df)
games_df = convert_numpy_values(games_df)
final_df = convert_numpy_values(final_df)

games_df = games_df.astype(object).where(pd.notna(games_df), None)

games_df.to_csv(
    "/opt/airflow/scripts/games_df.csv",
    index=False
)

af_current_df.to_csv(
    "/opt/airflow/scripts/af_current_df.csv",
    index=False
)

final_df.to_csv(
    "/opt/airflow/scripts/final_df.csv",
    index=False
)


# %%

# %%


from sqlalchemy import create_engine, text

engine = create_engine(
    "postgresql+psycopg2://airflow:airflow@postgres:5432/airflow"
)


with engine.connect() as connection:
    print(connection.execute(text("SELECT version()")).scalar())
with engine.begin() as connection:
    connection.execute(text("CREATE SCHEMA IF NOT EXISTS raw"))

print("Raw schema is ready!")
# Convert NumPy scalar values to native Python values
def convert_numpy_values(df):
    return df.map(
        lambda x: x.item() if isinstance(x, np.generic) else x
    )

af_current_df = convert_numpy_values(af_current_df)
games_df = convert_numpy_values(games_df)
final_df = convert_numpy_values(final_df)

from sqlalchemy import text

with engine.begin() as connection:
    # Clear existing data while preserving tables and dependent views
    connection.execute(text("""
        TRUNCATE TABLE
            raw.fantasy_players,
            raw.afl_games,
            raw.afl_player_stats
    """))

# Reload refreshed data into the existing tables
af_current_df.to_sql(
    "fantasy_players",
    engine,
    schema="raw",
    if_exists="append",
    index=False
)

games_df = games_df.astype(object).where(pd.notna(games_df), None)

games_df.to_sql(
    "afl_games",
    engine,
    schema="raw",
    if_exists="append",
    index=False
)

final_df.to_sql(
    "afl_player_stats",
    engine,
    schema="raw",
    if_exists="append",
    index=False
)

print("All raw tables refreshed successfully!")

# %%
from sqlalchemy import inspect

inspector = inspect(engine)

print("Tables in raw schema:")
print(inspector.get_table_names(schema="raw"))
# %%
