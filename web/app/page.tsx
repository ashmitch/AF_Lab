"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import SiteFooter from "./components/SiteFooter";
import AdSlot from "./components/AdSlot";


type DataRow = Record<string, unknown>;
type Section = { label: string; table: string; description: string };

const sections: Section[] = [
  { label: "Player Summary", table: "player_summary", description: "The key numbers for every player, in one place." },
  { label: "Home vs Away Avg", table: "mart_home_away_averages", description: "Compare player output at home and away." },
  { label: "Win vs Loss Avg", table: "mart_win_loss_averages", description: "Compare player averages across results and winning or losing margins." },
  { label: "Points Distribution", table: "mart_points_distribution", description: "Understand which stats contribute to each player's fantasy output." },
  { label: "Position Averages by Result", table: "mart_position_averages_by_result", description: "Compare average position scores across match result categories." },
  { label: "Team Averages", table: "mart_team_points_avgs", description: "Compare each team's average fantasy points by game situation and position." },
  { label: "Team Averages Against", table: "mart_team_points_against_avgs", description: "Compare the fantasy points teams allow their opponents to score." },
  { label: "Team Averages by Result", table: "mart_team_position_averages_by_result", description: "Compare each team's position scores by winning or losing margin." },
  { label: "Venue Averages", table: "mart_venue_averages", description: "Compare match statistics across AFL venues." },
  { label: "Player Venue Averages", table: "mart_player_averages_by_venue", description: "Compare individual player averages by venue." },
];
const sectionGroups = [
  { label: "Player Stats", tables: sections.slice(0, 5) },
  { label: "Team Stats", tables: sections.slice(5, 8) },
  { label: "Venue Stats", tables: sections.slice(8) },
];

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b705]";
const fieldClass = `min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm disabled:bg-slate-100 ${focusRing}`;
const outlineButton = `rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0d2b52] hover:text-[#0d2b52] ${focusRing}`;

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
function normalise(value: unknown): string { return displayValue(value).replace(/[{}]/g, "").trim(); }
function prettyName(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function findColumn(columns: string[], candidates: string[]) {
  return columns.find((column) => candidates.includes(column.toLowerCase()));
}
function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  const an = asNumber(a), bn = asNumber(b);
  if (an !== null && bn !== null) return an - bn;
  return normalise(a).localeCompare(normalise(b), undefined, { numeric: true, sensitivity: "base" });
}
function isPriceColumn(column: string) {
  return /(^price$|price$|price change|cash gen)/i.test(column) && !/pct|percent/i.test(column);
}
function formatCurrency(value: unknown): string {
  const n = asNumber(value);
  if (n === null) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
function formatNumber(value: unknown): string {
  const n = asNumber(value);
  if (n === null) return displayValue(value);
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  return n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}
function formatCell(column: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (/^(pos|position|player_position)$/i.test(column)) {
    return displayValue(value).replace(/[{}]/g, "").split(/[,/|+]/).map((part) => part.trim()).filter(Boolean).join(", ");
  }
  if (isPriceColumn(column)) return formatCurrency(value);
  const n = asNumber(value);
  return n === null ? displayValue(value) : formatNumber(n);
}
function rowPlayerId(row: DataRow): string | null {
  const key = Object.keys(row).find((k) => ["player id", "player_id"].includes(k.toLowerCase()));
  return key && row[key] != null ? String(row[key]) : null;
}
function rowPlayerName(row: DataRow): string {
  const key = Object.keys(row).find((k) => ["player name", "player", "player_name", "source_player_name"].includes(k.toLowerCase()));
  return key ? displayValue(row[key]) : "Player profile";
}


function fantasyScore(row: DataRow): number {
  const n = (key: string) => asNumber(row[key]) ?? 0;
  return n("goals") * 6 + n("tackles") * 4 + n("kicks") * 3 + n("marks") * 3 +
    n("handballs") * 2 + n("hitouts") + n("behinds") + n("frees_for") - n("frees_against") * 3;
}
function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}
function firstValue(row: DataRow, keys: string[]): unknown {
  const key = Object.keys(row).find((candidate) => keys.some((wanted) => candidate.toLowerCase() === wanted.toLowerCase()));
  return key ? row[key] : undefined;
}
function makeTogFilteredRows(table: string, originalRows: DataRow[], matchRows: DataRow[], summaryRows: DataRow[], gameRows: DataRow[]): DataRow[] {
  const eligible = matchRows.filter((row) => {
    const tog = asNumber(row.tog);
    return tog !== null && tog >= 50;
  });
  const gameByKey = new Map<string, DataRow>();
  gameRows.forEach((game) => {
    [game.game_key, game.match_id].filter((v) => v != null).forEach((key) => gameByKey.set(String(key), game));
  });
  const gameFor = (row: DataRow) => gameByKey.get(String(row.game_key ?? "")) ?? gameByKey.get(String(row.match_id ?? "")) ?? {};
  const isHome = (row: DataRow) => {
    const game = gameFor(row);
    const team = normalise(row.team).toLowerCase();
    const home = normalise(row.home_team ?? game.home_team).toLowerCase();
    return !!team && !!home && team === home;
  };
  const won = (row: DataRow) => {
    const game = gameFor(row);
    const winningTeam = normalise(game.winning_team ?? game.winner ?? row.winning_team).toLowerCase();
    return winningTeam !== "" && winningTeam !== "—" && winningTeam === normalise(row.team).toLowerCase();
  };
  const groupByPlayer = new Map<string, DataRow[]>();
  eligible.forEach((row) => {
    const id = rowPlayerId(row);
    if (!id) return;
    if (!groupByPlayer.has(id)) groupByPlayer.set(id, []);
    groupByPlayer.get(id)!.push(row);
  });
  const summaryById = new Map(summaryRows.map((row) => [rowPlayerId(row), row]).filter((entry): entry is [string, DataRow] => Boolean(entry[0])));
  const roundScores = new Map<string, number[]>();
  groupByPlayer.forEach((games, id) => roundScores.set(id, games.map(fantasyScore)));
  const playerName = (row: DataRow) => normalise(firstValue(row, ["Player Name", "player", "player_name", "source_player_name"]));
  const teamName = (row: DataRow) => normalise(firstValue(row, ["Team", "team"]));
  const posName = (row: DataRow) => normalise(firstValue(row, ["Position", "pos", "position"]));

  if (table === "player_summary") {
    return originalRows.map((row) => {
      const id = rowPlayerId(row) ?? "";
      const games = groupByPlayer.get(id) ?? [];
      const scores = games.map(fantasyScore);
      const homeScores = games.filter(isHome).map(fantasyScore);
      const awayScores = games.filter((g) => !isHome(g)).map(fantasyScore);
      const wins = games.filter(won).map(fantasyScore);
      const losses = games.filter((g) => !won(g)).map(fantasyScore);
      const max = scores.length ? Math.max(...scores) : null;
      const min = scores.length ? Math.min(...scores) : null;
      return {
        ...row,
        "Season Avg Fantasy": average(scores),
        "Season Avg Fantasy (TOG Adjusted)": average(scores),
        "Difference Home to Away": average(homeScores) === null || average(awayScores) === null ? null : (average(homeScores)! - average(awayScores)!),
        "Difference Wins vs Losses": average(wins) === null || average(losses) === null ? null : (average(wins)! - average(losses)!),
        "Highest Score": max,
        "Lowest Score": min,
        "High-to-Low Spread": max === null || min === null ? null : max - min,
        "Games Played": games.length,
      };
    });
  }

  if (table === "mart_home_away_averages") {
    return originalRows.map((row) => {
      const games = groupByPlayer.get(rowPlayerId(row) ?? "") ?? [];
      const home = games.filter(isHome).map(fantasyScore), away = games.filter((g) => !isHome(g)).map(fantasyScore);
      const all = games.map(fantasyScore);
      return { ...row, home_avg: average(home), away_avg: average(away), "Gap from Home to Away": average(home) === null || average(away) === null ? null : average(home)! - average(away)!, total_avg: average(all), home_games: home.length, away_games: away.length, total_games: all.length };
    });
  }

  if (table === "mart_win_loss_averages") {
    return originalRows.map((row) => {
      const games = groupByPlayer.get(rowPlayerId(row) ?? "") ?? [];
      const wins = games.filter(won).map(fantasyScore), losses = games.filter((g) => !won(g)).map(fantasyScore);
      return { ...row, win_avg: average(wins), loss_avg: average(losses), wins_played: wins.length, losses_played: losses.length };
    });
  }

  if (table === "mart_points_distribution") {
    return originalRows.map((row) => {
      const games = groupByPlayer.get(rowPlayerId(row) ?? "") ?? [];
      const scoreAvg = average(games.map(fantasyScore));
      const contribution: Record<string, (g: DataRow) => number> = {
        pct_avg_from_goals: (g) => (asNumber(g.goals) ?? 0) * 6,
        pct_avg_from_behinds: (g) => asNumber(g.behinds) ?? 0,
        pct_avg_from_kicks: (g) => (asNumber(g.kicks) ?? 0) * 3,
        pct_avg_from_handballs: (g) => (asNumber(g.handballs) ?? 0) * 2,
        pct_avg_from_marks: (g) => (asNumber(g.marks) ?? 0) * 3,
        pct_avg_from_tackles: (g) => (asNumber(g.tackles) ?? 0) * 4,
        pct_avg_from_hitouts: (g) => asNumber(g.hitouts) ?? 0,
        pct_avg_from_frees_for: (g) => asNumber(g.frees_for) ?? 0,
        pct_avg_from_frees_against: (g) => -3 * (asNumber(g.frees_against) ?? 0),
        pct_avg_from_frees_net: (g) => (asNumber(g.frees_for) ?? 0) - 3 * (asNumber(g.frees_against) ?? 0),
      };
      const updated: DataRow = { ...row, avg_points: scoreAvg };
      Object.entries(contribution).forEach(([key, fn]) => {
        const avgContribution = average(games.map(fn));
        updated[key] = scoreAvg && avgContribution !== null ? avgContribution / scoreAvg * 100 : null;
      });
      return updated;
    });
  }

  if (table === "mart_venue_averages") {
    const venues = new Map<string, DataRow[]>();
    eligible.forEach((row) => {
      const venue = normalise(row.venue);
      if (!venues.has(venue)) venues.set(venue, []);
      venues.get(venue)!.push(row);
    });
    return originalRows.map((row) => {
      const venue = normalise(row.venue);
      const games = venues.get(venue) ?? [];
      const updated: DataRow = { ...row, team_matches: new Set(games.map((g) => String(g.game_key ?? g.match_id ?? ""))).size };
      Object.keys(row).forEach((column) => {
        if (!column.toLowerCase().startsWith("avg_")) return;
        const stat = column.slice(4);
        updated[column] = average(games.map((g) => asNumber(g[stat]) ?? 0));
      });
      return updated;
    });
  }

  if (table === "mart_player_averages_by_venue") {
    return originalRows.map((row) => {
      const games = groupByPlayer.get(rowPlayerId(row) ?? "") ?? [];
      const updated: DataRow = { ...row };
      Object.keys(row).forEach((column) => {
        if (column.toLowerCase().endsWith("_avg")) {
          const venue = column.slice(0, -4).replaceAll("_", " ").toLowerCase();
          const matching = games.filter((g) => normalise(g.venue).replaceAll("_", " ").toLowerCase() === venue);
          updated[column] = average(matching.map(fantasyScore));
        } else if (column.toLowerCase().endsWith("_gp")) {
          const venue = column.slice(0, -3).replaceAll("_", " ").toLowerCase();
          updated[column] = games.filter((g) => normalise(g.venue).replaceAll("_", " ").toLowerCase() === venue).length;
        }
      });
      return updated;
    });
  }
  return originalRows;
}

const distributionStats = [
  { key: "pct_avg_from_goals", label: "Goals" },
  { key: "pct_avg_from_behinds", label: "Behinds" },
  { key: "pct_avg_from_kicks", label: "Kicks" },
  { key: "pct_avg_from_handballs", label: "Handballs" },
  { key: "pct_avg_from_marks", label: "Marks" },
  { key: "pct_avg_from_tackles", label: "Tackles" },
  { key: "pct_avg_from_hitouts", label: "Hitouts" },
  { key: "pct_avg_from_frees_for", label: "Free kicks for" },
  { key: "pct_avg_from_frees_against", label: "Free kicks against" },
] as const;

function DistributionChart({ row }: { row: DataRow | null }) {
  const values = distributionStats.map((stat) => ({ ...stat, pct: Math.max(0, asNumber(row?.[stat.key]) ?? 0) }));
  const colors = ["#0d2b52", "#176b87", "#2f8f9d", "#58a77a", "#9cab36", "#d6a817", "#e27b35", "#b74b52", "#7756a5"];
  const total = values.reduce((sum, value) => sum + value.pct, 0);
  const segments = values.map((value, index) => {
    const start = values.slice(0, index).reduce((sum, previous) => sum + (total ? previous.pct / total * 100 : 0), 0);
    const end = start + (total ? value.pct / total * 100 : 0);
    return `${colors[index]} ${start}% ${end}%`;
  });
  return <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="mb-1 flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Fantasy points distribution</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Positive point share</span></div>
    <p className="mb-3 text-sm text-slate-500">Positive scoring categories make up the slices. Free kicks against are shown separately as a deduction.</p>
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div role="img" aria-label="Pie chart of positive fantasy points by statistic" className="h-52 w-52 shrink-0 rounded-full border border-white shadow-inner" style={{ background: `conic-gradient(${segments.join(", ")})` }} />
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2 sm:w-auto sm:grid-cols-1">{values.map((value, index) => <div key={value.key} className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colors[index] }} /><span className="text-slate-500">{value.label}</span><strong className="ml-auto tabular-nums text-slate-800">{(total ? value.pct / total * 100 : 0).toFixed(1)}%</strong></div>)}</div>
    </div>
    <p className="mt-3 text-xs text-slate-500">Free kicks against: {formatNumber(row?.pct_avg_from_frees_against)}% (negative contribution)</p>
  </div>;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>(sections[0]);
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDescending, setSortDescending] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<DataRow | null>(null);
  const [profileSummary, setProfileSummary] = useState<DataRow | null>(null);
  const [profileDistribution, setProfileDistribution] = useState<DataRow | null>(null);
  const [profileGames, setProfileGames] = useState<DataRow[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [dppOnly, setDppOnly] = useState(false);
  const [gpOnly, setGpOnly] = useState(false);
  const [excludeLowTog, setExcludeLowTog] = useState(false);
  const [summaryLookup, setSummaryLookup] = useState<DataRow[]>([]);
  const [filterWarning, setFilterWarning] = useState("");

  const fetchTable = useCallback(async (table: string): Promise<DataRow[]> => {
    const response = await fetch(`/api/home-away?table=${encodeURIComponent(table)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${table} (${response.status}).`);
    const result: unknown = await response.json();
    if (!Array.isArray(result)) throw new Error(`Unexpected response for ${table}.`);
    return result as DataRow[];
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true); setError("");
      setSearch(""); setTeamFilter("all"); setPositionFilter("all"); setSortColumn(""); setSortDescending(true);
      try {
        if (excludeLowTog) {
          const [originalRows, matchRows, summaryRows, gameRows] = await Promise.all([
            fetchTable(activeSection.table),
            fetchTable("fct_player_stats"),
            fetchTable("player_summary"),
            fetchTable("dim_games"),
          ]);
          const result = makeTogFilteredRows(activeSection.table, originalRows, matchRows, summaryRows, gameRows);
          if (!cancelled) setData(result);
        } else {
          const result = await fetchTable(activeSection.table);
          if (!cancelled) setData(result);
        }
      } catch (err) {
        if (!cancelled) { setData([]); setError(err instanceof Error ? err.message : "Could not load the data."); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadData();
    return () => { cancelled = true; };
  }, [activeSection, reloadKey, fetchTable, excludeLowTog]);

  const openPlayer = useCallback(async (row: DataRow) => {
    const id = rowPlayerId(row);
    if (!id) return;
    setSelectedPlayer(row);
    setProfileSummary(null);
    setProfileDistribution(null);
    setProfileGames([]);
    setProfileError("");
    setProfileLoading(true);
    try {
      const [summaries, distributions, allGames] = await Promise.all([
        fetchTable("player_summary"),
        fetchTable("mart_points_distribution"),
        fetchTable("fct_player_stats"),
      ]);
      const matches = (candidate: DataRow) => rowPlayerId(candidate) === id;
      setProfileSummary(summaries.find(matches) ?? (activeSection.table === "player_summary" ? row : null));
      setProfileDistribution(distributions.find(matches) ?? null);

      const playerGames = allGames.filter(matches).filter((game) => !excludeLowTog || (asNumber(game.tog) !== null && asNumber(game.tog)! >= 50)).map((game) => {
        const team = displayValue(game.team);
        const homeTeam = displayValue(game.home_team);
        const awayTeam = displayValue(game.away_team);
        const opponent = team.trim().toLowerCase() === homeTeam.trim().toLowerCase()
          ? awayTeam
          : homeTeam;

        // Standard AFL Fantasy scoring from the match-level stat columns.
        const stat = (key: string) => asNumber(game[key]) ?? 0;
        const fantasyScore =
          stat("goals") * 6 +
          stat("tackles") * 4 +
          stat("kicks") * 3 +
          stat("marks") * 3 +
          stat("handballs") * 2 +
          stat("hitouts") +
          stat("behinds") +
          stat("frees_for") -
          stat("frees_against") * 3;

        return {
          ...game,
          profile_round: asNumber(game.round_number ?? game.round) ?? 0,
          profile_opponent: opponent,
          profile_fantasy_score: fantasyScore,
        };
      }).sort((a, b) => (asNumber(a.profile_round) ?? 0) - (asNumber(b.profile_round) ?? 0));
      setProfileGames(playerGames);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not load player profile.");
      if (activeSection.table === "player_summary") setProfileSummary(row);
    } finally {
      setProfileLoading(false);
    }
  }, [activeSection.table, fetchTable, excludeLowTog]);

  useEffect(() => {
    let cancelled = false;
    fetchTable("player_summary")
      .then((rows) => { if (!cancelled) setSummaryLookup(rows); })
      .catch(() => { if (!cancelled) setSummaryLookup([]); });
    return () => { cancelled = true; };
  }, [fetchTable, reloadKey]);

  const summaryById = useMemo(() => {
    const map = new Map<string, DataRow>();
    summaryLookup.forEach((row) => {
      const id = rowPlayerId(row);
      if (id) map.set(id, row);
    });
    return map;
  }, [summaryLookup]);

  const hasTeamAverageBaseline = ["mart_team_points_avgs", "mart_team_position_averages_by_result"].includes(activeSection.table);
  const tableData = data;
  const columns = useMemo(() => Object.keys(tableData[0] ?? {}).filter((column) => !["player id", "player_id"].includes(column.toLowerCase())), [tableData]);
  const teamColumn = findColumn(columns, ["team", "team_name", "team_name_home", "player_team"]);
  const positionColumn = findColumn(columns, ["pos", "position", "player_position"]);
  const teams = useMemo(() => teamColumn ? [...new Set(tableData.map((row) => normalise(row[teamColumn])).filter((v) => v && v !== "—" && v !== "-"))].sort((a,b) => a.localeCompare(b)) : [], [tableData, teamColumn]);
  const positions = useMemo(() => positionColumn ? [...new Set(tableData.flatMap((row) => normalise(row[positionColumn]).split(",").map((v) => v.trim()).filter(Boolean)))].sort((a,b) => a.localeCompare(b)) : [], [tableData, positionColumn]);

  const averageBaseline = hasTeamAverageBaseline && teamColumn
    ? tableData.find((row) => normalise(row[teamColumn]).toLowerCase().replaceAll("_", " ") === "afl average")
    : undefined;
  const isTeamAgainstPage = activeSection.table === "mart_team_points_against_avgs";
  const isTeamResultPage = activeSection.table === "mart_team_position_averages_by_result";
  const isPositionResultPage = activeSection.table === "mart_position_averages_by_result";
  const isVenueAveragePage = activeSection.table === "mart_venue_averages";
  const isPlayerVenuePage = activeSection.table === "mart_player_averages_by_venue";
  const showPlayerFilters = !["mart_team_points_avgs", "mart_team_points_against_avgs", "mart_team_position_averages_by_result", "mart_position_averages_by_result", "mart_venue_averages"].includes(activeSection.table);
  const heatmapEnabled = hasTeamAverageBaseline || isTeamAgainstPage || isVenueAveragePage || isPlayerVenuePage || isPositionResultPage;
  const coloredColumns = columns.filter((column) => {
    if (column === teamColumn) return false;
    if (isVenueAveragePage && column.toLowerCase() === "team_matches") return false;
    if (isPlayerVenuePage && !column.toLowerCase().endsWith("_avg")) return false;
    return tableData.some((row) => asNumber(row[column]) !== null);
  });
  const getHeatStyle = (column: string, value: unknown, row: DataRow): CSSProperties | undefined => {
    if (!heatmapEnabled || !coloredColumns.includes(column)) return undefined;
    if (averageBaseline && row === averageBaseline) return { backgroundColor: "#fff", color: "#0f172a" };
    const numericValue = asNumber(value);
    if (numericValue === null) return undefined;
    if (isPlayerVenuePage) {
      const rowValues = coloredColumns.map((key) => asNumber(row[key])).filter((candidate): candidate is number => candidate !== null);
      const playerAverage = average(rowValues);
      if (playerAverage === null) return undefined;
      const delta = numericValue - playerAverage;
      const maxDelta = Math.max(...rowValues.map((candidate) => Math.abs(candidate - playerAverage)));
      if (maxDelta === 0 || delta === 0) return { backgroundColor: "#fff", color: "#0f172a" };
      const alpha = 0.12 + Math.abs(delta) / maxDelta * 0.48;
      return delta > 0
        ? { backgroundColor: `rgba(34, 197, 94, ${alpha})`, color: "#14532d" }
        : { backgroundColor: `rgba(239, 68, 68, ${alpha})`, color: "#7f1d1d" };
    }
    const comparisonValues = tableData.filter((candidate) => candidate !== averageBaseline)
      .map((candidate) => asNumber(candidate[column])).filter((candidate): candidate is number => candidate !== null);
    if (!comparisonValues.length) return undefined;
    if (averageBaseline) {
      const baselineValue = asNumber(averageBaseline[column]);
      if (baselineValue === null) return undefined;
      const maxDelta = Math.max(...comparisonValues.map((candidate) => Math.abs(candidate - baselineValue)));
      const delta = numericValue - baselineValue;
      if (maxDelta === 0 || delta === 0) return { backgroundColor: "#fff", color: "#0f172a" };
      const alpha = 0.12 + Math.abs(delta) / maxDelta * 0.48;
      return delta > 0
        ? { backgroundColor: `rgba(34, 197, 94, ${alpha})`, color: "#14532d" }
        : { backgroundColor: `rgba(239, 68, 68, ${alpha})`, color: "#7f1d1d" };
    }
    const min = Math.min(...comparisonValues), max = Math.max(...comparisonValues);
    if (min === max) return { backgroundColor: "#fff", color: "#0f172a" };
    const t = (numericValue - min) / (max - min);
    const channel = (from: number, to: number, progress: number) => Math.round(from + (to - from) * progress);
    const red = t < 0.5 ? 255 : channel(255, 134, (t - 0.5) * 2);
    const green = t < 0.5 ? channel(134, 255, t * 2) : 255;
    const blue = t < 0.5 ? channel(134, 255, t * 2) : channel(255, 134, (t - 0.5) * 2);
    return { backgroundColor: `rgb(${red}, ${green}, ${blue})`, color: "#0f172a" };
  };

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = tableData.filter((row) => {
      const id = rowPlayerId(row);
      const summary = id ? summaryById.get(id) : undefined;
      const valueFor = (keys: string[]) => {
        for (const key of keys) {
          const direct = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
          if (direct && row[direct] != null) return row[direct];
          const fromSummary = summary && Object.keys(summary).find((k) => k.toLowerCase() === key.toLowerCase());
          if (fromSummary && summary?.[fromSummary] != null) return summary[fromSummary];
        }
        return undefined;
      };

      const matchesSearch = Object.values(row).map(displayValue).join(" ").toLowerCase().includes(query);
      const matchesTeam = teamFilter === "all" || (teamColumn !== undefined && normalise(row[teamColumn]) === teamFilter);
      const rowPositions = positionColumn ? normalise(row[positionColumn]).split(/[,/|+]/).map((v) => v.trim()).filter(Boolean) : [];
      const matchesPosition = positionFilter === "all" || rowPositions.includes(positionFilter);

      const price = asNumber(valueFor(["Price", "price"]));
      const age = asNumber(valueFor(["Age", "age"]));
      const games = asNumber(valueFor(["Games Played", "games_played"]));
      const dppPositions = normalise(valueFor(["Position", "position", "pos"])).split(/[,/|+]/).map((v) => v.trim()).filter(Boolean);
      const matchesMinPrice = !showPlayerFilters || minPrice === "" || (price !== null && price >= Number(minPrice));
      const matchesMaxPrice = !showPlayerFilters || maxPrice === "" || (price !== null && price <= Number(maxPrice));
      const matchesMinAge = !showPlayerFilters || minAge === "" || (age !== null && age >= Number(minAge));
      const matchesMaxAge = !showPlayerFilters || maxAge === "" || (age !== null && age <= Number(maxAge));
      const matchesDpp = !showPlayerFilters || !dppOnly || dppPositions.length >= 2;
      const matchesGp = !showPlayerFilters || !gpOnly || (games !== null && games > 0);

      // TOG-exclusion is currently meaningful on the Player Summary, where Neon provides
      // a precomputed average excluding games with TOG < 50. Other marts are pre-aggregated.
      const adjustedAvg = asNumber(valueFor(["Season Avg Fantasy (TOG Adjusted)"]));
      const matchesTog = !showPlayerFilters || !excludeLowTog || activeSection.table !== "player_summary" || adjustedAvg !== null;

      return matchesSearch && matchesTeam && matchesPosition && matchesMinPrice && matchesMaxPrice &&
        matchesMinAge && matchesMaxAge && matchesDpp && matchesGp && matchesTog;
    });
    if (!sortColumn) return filtered;
    return filtered.sort((a,b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      const aIsNull = aValue === null || aValue === undefined || aValue === "";
      const bIsNull = bValue === null || bValue === undefined || bValue === "";
      // Keep missing values at the bottom regardless of sort direction.
      if (aIsNull && bIsNull) return 0;
      if (aIsNull) return 1;
      if (bIsNull) return -1;
      const comparison = compareValues(aValue, bValue);
      return sortDescending ? -comparison : comparison;
    });
  }, [tableData, search, teamFilter, positionFilter, teamColumn, positionColumn, sortColumn, sortDescending,
    summaryById, minPrice, maxPrice, minAge, maxAge, dppOnly, gpOnly, excludeLowTog, activeSection.table, showPlayerFilters]);

  function handleSort(column: string) {
    if (sortColumn === column) setSortDescending((current) => !current);
    else { setSortColumn(column); setSortDescending(true); }
  }

  const summaryFields = [
    ["Team", "Team"], ["Position", "Position"], ["Age", "Age"], ["Price", "Price"],
    ["Season Avg Fantasy", "Season Avg Fantasy"],
    ["Season Avg Fantasy (TOG Adjusted)", "Season Avg Fantasy (TOG Adjusted)"],
    ["Difference Home to Away", "Difference Home to Away"],
    ["Difference Wins vs Losses", "Difference Wins vs Losses"],
    ["Highest Score", "Highest Score"], ["Lowest Score", "Lowest Score"],
    ["High-to-Low Spread", "High-to-Low Spread"], ["Season Cash Gen", "Season Cash Gen"],
    ["Games Played", "Games Played"],
  ] as const;

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d2b52] text-white shadow-lg shadow-slate-900/10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
          <button onClick={() => setActiveSection(sections[0])} className={`text-left ${focusRing}`}>
            <span className={`block text-4xl font-extrabold leading-none tracking-tight sm:text-5xl`}>AF<span className="text-[#f2b705]">_</span>LAB</span>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/70">AFL Fantasy Intelligence</span>
          </button>
          <nav className="flex items-center gap-4 text-sm font-semibold sm:gap-7" aria-label="Site">
            <a href="#statistics" className={`border-b-2 border-[#f2b705] py-2 text-white ${focusRing}`}>Statistics</a>
            <Link href="/policies" className={`border-b-2 border-transparent py-2 text-blue-100/70 transition hover:border-[#f2b705] hover:text-white ${focusRing}`}>Policies</Link>
          </nav>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#d4202c] via-[#f2b705] to-[#f2b705]" />
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
        <section id="statistics" className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="self-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c18d00]">AF_Lab / Data</p>
            <h1 className={`mb-4 text-3xl font-bold leading-none text-[#0d2b52]`}>AFL Fantasy Stats</h1>
            <nav className="space-y-4" aria-label="Statistics pages">
              {sectionGroups.map((group) => <div key={group.label}>
                <h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.label}</h2>
                {group.tables.length ? <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col">{group.tables.map((section) => {
                const active = activeSection.table === section.table;
                return <button key={section.table} onClick={() => setActiveSection(section)} aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center rounded-xl px-3 py-3 text-left text-sm transition ${focusRing} ${active ? "bg-[#0d2b52] font-semibold text-white shadow-md shadow-blue-950/15" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
                  <span>{section.label}</span>
                </button>;
                })}</div> : <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">Coming soon</p>}
              </div>)}
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b18200]">Player & team analytics</p>
                <h2 className={`text-4xl font-bold leading-none text-[#0d2b52] sm:text-5xl`}>{activeSection.label}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">{activeSection.description}</p>
                {hasTeamAverageBaseline && averageBaseline && <p className="mt-3 text-xs text-slate-500">Cells compare each team with the AFL Average row: above average is green, below average is red, and the AFL Average stays white.</p>}
                {(isTeamAgainstPage || isVenueAveragePage || isPositionResultPage || (isTeamResultPage && !averageBaseline)) && <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span>Lower</span><span className="h-3 w-36 rounded-full bg-gradient-to-r from-red-400 via-white to-green-400 ring-1 ring-slate-200" /><span>Higher</span></div>}
                {isTeamResultPage && averageBaseline && <p className="mt-3 text-xs text-slate-500">Cells compare each team with the AFL Average row; the AFL Average stays white.</p>}
                {isPlayerVenuePage && <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span>Below player&apos;s venue average</span><span className="h-3 w-36 rounded-full bg-gradient-to-r from-red-400 via-white to-green-400 ring-1 ring-slate-200" /><span>Above</span></div>}
              </div>
              <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm sm:block">
                {hasTeamAverageBaseline || isTeamAgainstPage || isTeamResultPage ? "Team-level averages" : isVenueAveragePage || isPlayerVenuePage ? "Venue comparisons" : isPositionResultPage ? "Position averages by result" : "Select a player row to open their profile"}
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <label className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Search
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Player, team, venue…" className={`${fieldClass} w-52 normal-case tracking-normal`} />
              </label>
              <label className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Team
                <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} disabled={!teamColumn || loading} className={`${fieldClass} w-44 normal-case tracking-normal`}>
                  <option value="all">All teams</option>{teams.map((team) => <option key={team} value={team}>{prettyName(team)}</option>)}
                </select>
              </label>
              <label className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Position
                <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} disabled={!positionColumn || loading} className={`${fieldClass} w-40 normal-case tracking-normal`}>
                  <option value="all">All positions</option>{positions.map((position) => <option key={position} value={position}>{position}</option>)}
                </select>
              </label>
              {sortColumn && <button onClick={() => { setSortColumn(""); setSortDescending(true); }} className={`${outlineButton} ml-auto`}>Clear sorting</button>}
            </div>

            {showPlayerFilters && <details open={filtersOpen} onToggle={(event) => setFiltersOpen(event.currentTarget.open)} className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-[#0d2b52] hover:bg-slate-50">
                <span className="flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-[#0d2b52]">☷</span> Filters</span>
                <span className="text-xs font-medium text-slate-400">{filtersOpen ? "Hide filters −" : "Show filters +"}</span>
              </summary>
              <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2 xl:grid-cols-3">
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold uppercase tracking-wider text-slate-500">Price ($)</legend>
                  <div className="flex gap-2">
                    <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" className={fieldClass} aria-label="Minimum price" />
                    <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className={fieldClass} aria-label="Maximum price" />
                  </div>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold uppercase tracking-wider text-slate-500">Age</legend>
                  <div className="flex gap-2">
                    <input type="number" min="0" max="60" value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="Min age" className={fieldClass} aria-label="Minimum age" />
                    <input type="number" min="0" max="60" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} placeholder="Max age" className={fieldClass} aria-label="Maximum age" />
                  </div>
                </fieldset>
                <div className="flex flex-col justify-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={dppOnly} onChange={(e) => setDppOnly(e.target.checked)} className="h-4 w-4 accent-[#0d2b52]" />
                    DPP only (2+ positions)
                  </label>
                  <button type="button" onClick={() => setGpOnly((v) => !v)} aria-pressed={gpOnly}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${gpOnly ? "border-[#0d2b52] bg-[#0d2b52] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                    {gpOnly ? "✓ " : ""}Games played greater than 0
                  </button>
                  <button type="button" onClick={() => setExcludeLowTog((v) => !v)} aria-pressed={excludeLowTog}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${excludeLowTog ? "border-[#0d2b52] bg-[#0d2b52] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                    {excludeLowTog ? "✓ " : ""}Exclude low TOG games (&lt;50%)
                  </button>
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); setMinAge(""); setMaxAge(""); setDppOnly(false); setGpOnly(false); setExcludeLowTog(false); }} className={outlineButton}>Clear all filters</button>
                </div>
              </div>
            </details>}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {loading ? <p className="p-8 text-sm text-slate-500">Loading statistics…</p> :
               error ? <div className="p-8"><p className="font-semibold text-rose-700">Could not load this table.</p><p className="mt-1 text-sm text-slate-500">{error}</p><button onClick={() => setReloadKey((v) => v + 1)} className={`${outlineButton} mt-4`}>Try again</button></div> :
               data.length === 0 ? <p className="p-8 text-sm text-slate-500">No data available.</p> :
               <div className="max-h-[72vh] overflow-auto">
                <table className="data-table w-full border-collapse text-left text-sm tabular-nums">
                  <thead className="sticky top-0 z-10"><tr>{columns.map((column) => {
                    const sorted = sortColumn === column;
                    return <th key={column} aria-sort={sorted ? (sortDescending ? "descending" : "ascending") : "none"} className={`whitespace-nowrap border-b border-slate-200 p-0 font-semibold ${sorted ? "bg-amber-100 text-[#0d2b52]" : "bg-slate-50 text-slate-600"}`}>
                      <button onClick={() => handleSort(column)} className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-amber-50 ${focusRing}`}>
                        {prettyName(column)}<span className="text-xs text-slate-400">{sorted ? (sortDescending ? "▼" : "▲") : "↕"}</span>
                      </button>
                    </th>;
                  })}</tr></thead>
                  <tbody>{filteredData.map((row, index) => {
                    const id = rowPlayerId(row);
                    const clickable = Boolean(id);
                    return <tr key={`${id ?? "row"}-${index}`} className={`border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/70 ${clickable ? "cursor-pointer hover:bg-amber-50" : "hover:bg-slate-50"}`} onClick={() => { if (clickable) void openPlayer(row); }}>
                      {columns.map((column) => <td key={column} style={getHeatStyle(column, row[column], row)} className={`whitespace-nowrap px-4 py-3 ${sortColumn === column ? "font-semibold text-[#0d2b52]" : "text-slate-700"}`}>
                        {column.toLowerCase() === "player name" || column.toLowerCase() === "player" || column.toLowerCase() === "player_name"
                          ? <button onClick={(e) => { e.stopPropagation(); if (clickable) void openPlayer(row); }} className={`font-semibold text-[#0d2b52] decoration-amber-500 underline-offset-4 hover:underline ${focusRing}`}>{displayValue(row[column])}</button>
                          : formatCell(column, row[column])}
                      </td>)}
                    </tr>;
                  })}</tbody>
                </table>
                {filteredData.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No rows match your filters.</p>}
               </div>}
            </div>
            {!loading && !error && !isVenueAveragePage && <p className="mt-3 text-xs text-slate-400">Select a player row to open their profile.</p>}
          </div>
        </section>
        <AdSlot placement="leaderboard" className="mt-8" />
      </main>
      <SiteFooter />

      {selectedPlayer && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={`${rowPlayerName(selectedPlayer)} player profile`} onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedPlayer(null); }}>
        <section className="my-4 w-full max-w-5xl overflow-hidden rounded-3xl bg-[#f4f6fa] shadow-2xl">
          <header className="flex items-start justify-between gap-4 bg-[#0d2b52] px-5 py-5 text-white sm:px-8">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">Player profile</p><h2 className={`mt-1 text-4xl font-bold sm:text-5xl`}>{rowPlayerName(profileSummary ?? selectedPlayer)}</h2><p className="mt-1 text-sm text-blue-100/70">{displayValue((profileSummary ?? selectedPlayer).Team ?? (profileSummary ?? selectedPlayer).team)}{(profileSummary ?? selectedPlayer).Position || (profileSummary ?? selectedPlayer).position ? ` · ${displayValue((profileSummary ?? selectedPlayer).Position ?? (profileSummary ?? selectedPlayer).position)}` : ""}</p></div>
            <button onClick={() => setSelectedPlayer(null)} className={`rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 ${focusRing}`} aria-label="Close player profile">✕ Close</button>
          </header>
          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              {profileLoading ? <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading player profile…</div> :
               profileError && !profileSummary ? <div className="rounded-2xl bg-white p-6 text-sm text-rose-700">{profileError}</div> :
               <div className="grid grid-cols-2 gap-3">
                 {summaryFields.map(([key, label]) => {
                   const value = profileSummary?.[key] ?? profileSummary?.[key.toLowerCase()];
                   return <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                     <p className={`mt-1 break-words text-2xl font-bold text-[#0d2b52]`}>{formatCell(key, value)}</p>
                   </div>;
                 })}
               </div>}
              {profileError && <p className="mt-3 text-xs text-rose-600">{profileError}</p>}
            </div>
            <DistributionChart row={profileDistribution} />
          </div>
          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b18200]">Season match log</p>
                <h3 className={`text-3xl font-bold text-[#0d2b52]`}>Game-by-game stats</h3>
              </div>
              <p className="text-xs text-slate-400">{profileGames.length.toLocaleString()} games</p>
            </div>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
              {profileLoading ? <p className="p-5 text-sm text-slate-500">Loading match log…</p> :
                profileGames.length === 0 ? <p className="p-5 text-sm text-slate-500">No match-level stats found for this player.</p> :
                <table className="data-table w-full border-collapse text-left text-sm tabular-nums">
                  <thead><tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    {["Round", "Opponent", "Venue", "Fantasy Score", "TOG"].map((heading) => <th key={heading} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 font-bold">{heading}</th>)}
                  </tr></thead>
                  <tbody>{profileGames.map((game, index) => <tr key={`${String(game.match_id ?? game.game_key ?? index)}-${index}`} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">{formatNumber(game.profile_round)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{displayValue(game.profile_opponent)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{displayValue(game.venue_type)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#0d2b52]">{formatNumber(game.profile_fantasy_score)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{asNumber(game.tog) === null ? "—" : `${formatNumber(game.tog)}%`}</td>
                  </tr>)}</tbody>
                </table>}
            </div>
          </div>
          {!profileDistribution && !profileLoading && <p className="px-5 pb-5 text-xs text-slate-400 sm:px-6">No points-distribution record was found for this player.</p>}
        </section>
      </div>}
    </div>
  );
}
