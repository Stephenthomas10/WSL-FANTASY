import { 
  PlayerMatchStats, Fixture, SquadAvailability, TeamRatings, Popularity, Price, PlayerEfpOutput
} from '../types';
import { SCORING_RULES, MODEL_PARAMS } from '../constants';
import { 
  PLAYER_MATCH_STATS_2023_24_CSV, PLAYER_MATCH_STATS_2022_23_CSV, FIXTURES_2023_24_CSV,
  getMockSquadAvailability, getMockTeamRatings, getMockPopularity, getMockPrices 
} from './mockDataService';

// --- HELPER TYPES & CLASSES ---
type CliArgs = { season?: string; today?: string; gw?: number };

class FreshnessReport {
  private checks: { name: string; status: 'OK' | 'WARN' | 'ERROR'; message: string }[] = [];
  
  add(name: string, status: 'OK' | 'WARN' | 'ERROR', message: string) {
    this.checks.push({ name, status, message });
  }

  hasErrors(): boolean {
    return this.checks.some(c => c.status === 'ERROR');
  }

  render(): string {
    if (this.checks.length === 0) return "";
    let output = "\n--- Freshness Report ---\n";
    const data = this.checks.map(c => `  ${c.status.padEnd(5)} | ${c.name.padEnd(25)} | ${c.message}`).join('\n');
    output += data + "\n------------------------\n";
    if (this.hasErrors()) {
      output += "\nFATAL: Freshness errors detected. Aborting calculation.";
    }
    return output;
  }
}

// --- UTILITY FUNCTIONS ---
function parseCsv<T>(csvString: string): T[] {
  // FIX: Add a guard clause to handle undefined or empty string inputs gracefully.
  if (!csvString) {
    return [];
  }
  const lines = csvString.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    header.forEach((key, index) => {
      const value = values[index];
      // Default undefined value to an empty string to prevent error on .trim()
      const safeValue = value || '';
      obj[key] = isNaN(Number(safeValue)) || safeValue === '' ? safeValue.trim() : Number(safeValue);
    });
    return obj as T;
  });
}

function coerceSeason(s: string | number): string {
    const yearMatch = String(s).match(/(\d{4})/);
    if (!yearMatch) throw new Error(`Could not parse season from '${s}'`);
    const startYear = parseInt(yearMatch[1]);
    const endYearShort = (startYear + 1) % 100;
    return `${startYear}-${endYearShort.toString().padStart(2, '0')}`;
}

// --- MAIN CALCULATION LOGIC ---
export function runEfpCalculation(args: CliArgs): { consoleOutput: string; results: PlayerEfpOutput[]; error?: boolean } {
  let consoleOutput = "";
  const report = new FreshnessReport();

  // 1. Setup
  const today = new Date(args.today || new Date().toISOString().split('T')[0] + 'T12:00:00Z');
  const discoveredFiles: { [key: string]: string } = {};

  // 2. File Discovery & Loading (Simulated)
  const allFiles = {
      'player_match_stats_2023-24.csv': PLAYER_MATCH_STATS_2023_24_CSV,
      'player_match_stats_2022-23.csv': PLAYER_MATCH_STATS_2022_23_CSV,
      'fixtures_2023-24.csv': FIXTURES_2023_24_CSV,
  };
  // Simple simulation: pick the file with the desired season or the latest one.
  const statsFileKey = args.season?.includes('2022') ? 'player_match_stats_2022-23.csv' : 'player_match_stats_2023-24.csv';
  discoveredFiles['player_match_stats'] = statsFileKey;
  discoveredFiles['fixtures'] = 'fixtures_2023-24.csv';
  
  const stats = parseCsv<PlayerMatchStats>(allFiles[discoveredFiles['player_match_stats']]);
  // FIX: Corrected the key to look up fixtures data, preventing an 'undefined' value from being parsed.
  const fixtures = parseCsv<Fixture>(allFiles[discoveredFiles['fixtures']]);
  const availability = parseCsv<SquadAvailability>(getMockSquadAvailability());
  const teamRatings = parseCsv<TeamRatings>(getMockTeamRatings());
  const popularity = parseCsv<Popularity>(getMockPopularity());
  const prices = parseCsv<Price>(getMockPrices());

  // 3. Freshness Checks
  const inferredSeasonFromStats = coerceSeason(stats.sort((a,b) => b.season - a.season)[0].season);
  const activeSeason = args.season ? coerceSeason(args.season) : inferredSeasonFromStats;
  report.add("Season Determination", "OK", `Active season set to ${activeSeason}`);

  stats.forEach(s => s.match_date_obj = new Date(s.match_date + 'T12:00:00Z'));
  const latestMatchDate = new Date(Math.max(...stats.map(s => s.match_date_obj!.getTime())));
  const daysSinceLastMatch = (today.getTime() - latestMatchDate.getTime()) / (1000 * 3600 * 24);
  if (daysSinceLastMatch > 28) {
      report.add("Player Data Freshness", "ERROR", `Player stats stale. Last match was ${daysSinceLastMatch.toFixed(0)} days ago.`);
  } else {
      report.add("Player Data Freshness", "OK", `Player stats current (last match ${daysSinceLastMatch.toFixed(0)} days ago).`);
  }
  
  consoleOutput += report.render();
  if (report.hasErrors()) {
      return { consoleOutput, results: [], error: true };
  }
  
  // 4. Determine Target Gameweek
  fixtures.forEach(f => f.match_date_obj = new Date(f.match_date + 'T12:00:00Z'));
  let targetGameweek: number;
  if (args.gw) {
    targetGameweek = args.gw;
  } else {
    const upcomingFixtures = fixtures.filter(f => f.match_date_obj! >= today);
    if (upcomingFixtures.length > 0) {
        targetGameweek = Math.min(...upcomingFixtures.map(f => f.gameweek));
    } else {
        consoleOutput += "\nNo upcoming fixtures found, using max gameweek from file.";
        targetGameweek = Math.max(...fixtures.map(f => f.gameweek));
    }
  }
  
  const targetFixtures = fixtures.filter(f => f.gameweek === targetGameweek);
  if (targetFixtures.length === 0) {
    consoleOutput += `\nFATAL: No fixtures found for target GW${targetGameweek}.`;
    return { consoleOutput, results: [], error: true };
  }
  
  // 5. Print Header
  consoleOutput += `\n============================================================\n`;
  consoleOutput += `EFP Engine — Season ${activeSeason} — GW${targetGameweek} (today=${today.toISOString().split('T')[0]})\n`;
  consoleOutput += `------------------------------------------------------------\n`;
  consoleOutput += `Using:\n`;
  for(const [key, path] of Object.entries(discoveredFiles)) {
    consoleOutput += `  ${key.padEnd(20)} = ${path}\n`;
  }
  consoleOutput += `============================================================\n`;
  
  const statsForSeason = stats.filter(s => coerceSeason(s.season) === activeSeason);
  const allPlayers = [...new Set(statsForSeason.map(s => s.player_id))].map(id => {
      const p = statsForSeason.find(s => s.player_id === id);
      return { player_id: id, player: p!.player, position: p!.position, team: p!.team };
  });

  const finalResults: PlayerEfpOutput[] = [];

  // 6. Main Calculation Loop
  allPlayers.forEach(playerInfo => {
    const playerFixtures = targetFixtures.filter(f => f.home_team === playerInfo.team || f.away_team === playerInfo.team);
    if (playerFixtures.length === 0) return;

    let aggregatedProps: any = {};
    const data_notes: string[] = [];
    if(playerFixtures.length > 1) data_notes.push(`DGW(${playerFixtures.map(f => f.home_team === playerInfo.team ? f.away_team : f.home_team).join(',')})`);

    playerFixtures.forEach(fixture => {
      const team = playerInfo.team;
      const opponent = fixture.home_team === team ? fixture.away_team : fixture.home_team;
      const venue = fixture.home_team === team ? 'H' : 'A';

      const playerHistory = statsForSeason
        .filter(s => s.player_id === playerInfo.player_id && s.minutes > 0)
        .sort((a, b) => b.match_date_obj!.getTime() - a.match_date_obj!.getTime())
        .slice(0, MODEL_PARAMS.LAST_N_APPEARANCES);

      if (playerHistory.length === 0) return;

      const nGames = playerHistory.length;
      const weights = Array.from({ length: nGames }, (_, i) => Math.exp(-MODEL_PARAMS.RECENCY_DECAY * i)).reverse();
      const sumWeights = weights.reduce((a, b) => a + b, 0);
      const normalizedWeights = weights.map(w => w / sumWeights);
      
      const weightedStat = (key: keyof PlayerMatchStats) => playerHistory.reduce((acc, game, i) => acc + (((game[key] as number || 0) / game.minutes) * 90) * normalizedWeights[i], 0);

      const form = {
        goals90: weightedStat('goals'), assists90: weightedStat('assists'), xg90: weightedStat('xg'),
        xa90: weightedStat('xa'), shots90: weightedStat('shots'), saves90: weightedStat('saves'),
        yellow90: weightedStat('yellow'), red90: weightedStat('red'), og90: weightedStat('own_goal'),
      };
      if (!form.xg90 || !form.xa90) data_notes.push("Using goals/assists as proxy for xG/xA.");
      
      const avgMinutes = playerHistory.reduce((acc, g, i) => acc + g.minutes * normalizedWeights[i], 0);
      const startRate = playerHistory.reduce((acc, g, i) => acc + g.started * normalizedWeights[i], 0);

      const teamRating = teamRatings.find(t => t.team === team)!;
      const opponentRating = teamRatings.find(t => t.team === opponent)!;

      const attMultiplier = (opponentRating.def_strength / 1.0) * (venue === 'H' ? MODEL_PARAMS.HOME_ATT_BOOST : MODEL_PARAMS.AWAY_ATT_BOOST);
      const defMultiplier = (opponentRating.att_strength / 1.0) * (venue === 'H' ? MODEL_PARAMS.HOME_DEF_BOOST : MODEL_PARAMS.AWAY_DEF_BOOST);

      const playerAvail = availability.find(p => p.player_id === playerInfo.player_id);
      const prob_starts = playerAvail ? playerAvail.prob_starts : startRate;
      const E_minutes = Math.min(90, prob_starts * Math.max(65, avgMinutes) + (1 - prob_starts) * 15);
      const p60 = Math.min(1, prob_starts * (avgMinutes / 60));

      const scale = E_minutes / 90;
      const E_goals = (form.xg90 || form.goals90 * MODEL_PARAMS.XG_PROXY_WEIGHT) * attMultiplier * scale;
      const E_assists = (form.xa90 || form.assists90 * MODEL_PARAMS.XG_PROXY_WEIGHT) * attMultiplier * scale;
      
      const lambda = (opponentRating.att_strength / teamRating.def_strength) * defMultiplier;
      const P_clean_sheet = Math.exp(-lambda);
      const E_saves = opponentRating.pace * 0.3 * defMultiplier * scale * 90;
      const E_bonus = ((form.xg90 || 0) + (form.xa90 || 0) > 1.0 ? 0.5 : 0.1);

      let breakdown: { [key: string]: number } = {};
      breakdown.min_pts = 1 + p60 * SCORING_RULES.MIN_60_PLUS;
      breakdown.goal_pts = E_goals * (playerInfo.position === 'FWD' ? SCORING_RULES.GOAL_FWD : playerInfo.position === 'MID' ? SCORING_RULES.GOAL_MID : SCORING_RULES.GOAL_DEF_GK);
      breakdown.assist_pts = E_assists * SCORING_RULES.ASSIST;
      breakdown.cs_pts = P_clean_sheet * p60 * (['GK', 'DEF'].includes(playerInfo.position) ? SCORING_RULES.CS_GK_DEF : playerInfo.position === 'MID' ? SCORING_RULES.CS_MID : 0);
      breakdown.saves_pts = playerInfo.position === 'GK' ? (E_saves / 3) * SCORING_RULES.GK_SAVE_PER_3 : 0;
      breakdown.card_pts = (form.yellow90 * SCORING_RULES.YELLOW + form.red90 * SCORING_RULES.RED) * scale;
      breakdown.bonus_pts = E_bonus;
      const E_non_minute_pts = Object.values(breakdown).reduce((a,b) => a+b, 0) - breakdown.min_pts;
      const playerPop = popularity.find(p => p.player_id === playerInfo.player_id);
      breakdown.visionary_pts = (playerPop && playerPop.selected_percent < 2.0 && E_non_minute_pts > 0) ? SCORING_RULES.VISIONARY_BONUS : 0;
      
      const currentEFP = Object.values(breakdown).reduce((a, b) => a + b, 0);

      const singleFixtureResult = {
        gameweek: targetGameweek, match_date: fixture.match_date, team, opponent, venue, prob_starts, E_minutes, p60, E_goals,
        E_assists, P_clean_sheet, E_saves: playerInfo.position === 'GK' ? E_saves : 0, E_bonus, E_visionary: breakdown.visionary_pts,
        E_min_pts: breakdown.min_pts, EFP: currentEFP, breakdown
      };

      if (Object.keys(aggregatedProps).length === 0) {
        aggregatedProps = singleFixtureResult;
      } else {
        // Aggregate for DGW
        aggregatedProps.EFP += singleFixtureResult.EFP;
        aggregatedProps.E_minutes += singleFixtureResult.E_minutes;
        aggregatedProps.E_goals += singleFixtureResult.E_goals;
        // ... and so on for other numeric properties
        aggregatedProps.opponent += `, ${singleFixtureResult.opponent}`;
        aggregatedProps.P_clean_sheet = (aggregatedProps.P_clean_sheet + singleFixtureResult.P_clean_sheet) / 2; // Average probabilities
      }
    });

    if (Object.keys(aggregatedProps).length > 0) {
        const price = prices.find(p => p.player_id === playerInfo.player_id)?.price_m || 0;
        const finalEFP = aggregatedProps.EFP;
        finalResults.push({
            ...aggregatedProps,
            player_id: playerInfo.player_id, player: playerInfo.player, position: playerInfo.position,
            Captain_EFP: finalEFP * 2,
            price_m: price,
            value_ep_per_m: price > 0 ? finalEFP / price : 0,
            season: activeSeason,
            data_notes: [...new Set(data_notes)],
        });
    }
  });

  // 7. Final output formatting
  finalResults.sort((a, b) => b.EFP - a.EFP);
  
  consoleOutput += "\n--- Top 10 Overall EFP ---\n";
  finalResults.slice(0, 10).forEach(p => {
    consoleOutput += `${p.player.padEnd(15)} (${p.position}, ${p.team}) - EFP: ${p.EFP.toFixed(2)}\n`;
  });

  ['GK', 'DEF', 'MID', 'FWD'].forEach(pos => {
    consoleOutput += `\n--- Top 5 ${pos} EFP ---\n`;
    finalResults
      .filter(p => p.position === pos)
      .slice(0, 5)
      .forEach(p => {
        consoleOutput += `${p.player.padEnd(15)} (${p.team}) - EFP: ${p.EFP.toFixed(2)}\n`;
      });
  });

  return { consoleOutput, results: finalResults };
}