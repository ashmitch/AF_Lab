
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const allowedTables = [
  "player_summary",
  "mart_home_away_averages",
  "mart_win_loss_averages",
  "mart_points_distribution",
  "mart_venue_averages",
  "mart_player_averages_by_venue",
  "mart_team_points_avgs",
  "mart_team_points_against_avgs",
  "fct_player_stats",
  "fct_game_stats",
  "dim_players",
  "dim_games",
] as const;

type AllowedTable = (typeof allowedTables)[number];

export async function GET(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const requestedTable = url.searchParams.get("table");
  const table: AllowedTable =
    requestedTable && allowedTables.includes(requestedTable as AllowedTable)
      ? (requestedTable as AllowedTable)
      : "mart_home_away_averages";

  try {
    const sql = neon(databaseUrl);
    let rows;

    switch (table) {
      case "player_summary":
        rows = await sql`SELECT * FROM analytics.player_summary`;
        break;
      case "mart_home_away_averages":
        rows = await sql`SELECT * FROM analytics.mart_home_away_averages`;
        break;
      case "mart_venue_averages":
        rows = await sql`SELECT * FROM analytics.mart_venue_averages`;
        break;
      case "mart_player_averages_by_venue":
        rows = await sql`SELECT * FROM analytics.mart_player_averages_by_venue`;
        break;
      case "mart_team_points_avgs":
        rows = await sql`SELECT * FROM analytics.mart_team_points_avgs`;
        break;
      case "mart_team_points_against_avgs":
        rows = await sql`SELECT * FROM analytics.mart_team_points_against_avgs`;
        break;
      case "mart_points_distribution":
        rows = await sql`SELECT * FROM analytics.mart_points_distribution`;
        break;
      case "mart_win_loss_averages":
        rows = await sql`SELECT * FROM analytics.mart_win_loss_averages`;
        break;
      case "fct_player_stats":
        rows = await sql`SELECT * FROM analytics.fct_player_stats`;
        break;
      case "fct_game_stats":
        rows = await sql`SELECT * FROM analytics.fct_game_stats`;
        break;
      case "dim_players":
        rows = await sql`SELECT * FROM analytics.dim_players`;
        break;
      case "dim_games":
        rows = await sql`SELECT * FROM analytics.dim_games`;
        break;
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error(`Database query failed for ${table}:`, error);

    return NextResponse.json(
      { error: `Could not load table: ${table}` },
      { status: 500 }
    );
  }
}
