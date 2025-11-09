
// Scoring Rules (Aerial Fantasy)
export const SCORING_RULES = {
  MIN_0_60: 1,
  MIN_60_PLUS: 1,
  GOAL_FWD: 4,
  GOAL_MID: 5,
  GOAL_DEF_GK: 6,
  ASSIST: 3,
  GK_SAVE_PER_3: 1,
  CS_GK_DEF: 4,
  CS_MID: 1,
  PEN_SAVE: 5,
  PEN_MISS: -2,
  YELLOW: -1,
  RED: -3,
  OWN_GOAL: -2,
  BONUS_TOP1: 3,
  BONUS_TOP2: 2,
  BONUS_TOP3: 1,
  VISIONARY_BONUS: 3,
};

// Modeling Parameters
export const MODEL_PARAMS = {
  LEAGUE_AVG_XGA: 1.30,
  HOME_ATT_BOOST: 1.07,
  AWAY_ATT_BOOST: 0.93,
  HOME_DEF_BOOST: 1.08,
  AWAY_DEF_BOOST: 0.92,
  RECENCY_DECAY: 0.25,
  LAST_N_APPEARANCES: 8,
  XG_PROXY_WEIGHT: 0.85,
};

export const SCRIPT_CONTENT = `
# expected_points.py
# A freshness-aware script to compute Expected Fantasy Points (EFP) for Aerial Fantasy (WSL)
# Author: Expert Data Engineer + Sports Analyst
# Version: 2.0.0

import argparse
import math
import re
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

# --- Configuration ---
DATA_DIR_DEFAULT = "data"
OUTPUT_DIR_DEFAULT = "out"
RECENCY_DECAY = 0.25
LAST_N_APPEARANCES = 8
XG_PROXY_WEIGHT = 0.85

# --- Venue & League Average Adjustments ---
HOME_ATT_BOOST = 1.07
AWAY_ATT_BOOST = 0.93
HOME_DEF_BOOST = 1.08
AWAY_DEF_BOOST = 0.92
LEAGUE_AVG_XGA = 1.30

# --- Scoring Rules ---
@dataclass
class Scoring:
    MIN_0_60: int = 1
    MIN_60_PLUS: int = 1
    GOAL_FWD: int = 4
    GOAL_MID: int = 5
    # ... (all other rules)

# --- Data Structures ---
@dataclass
class FreshnessCheck:
    name: str
    status: str = "PENDING"
    message: str = ""

@dataclass
class FreshnessReport:
    checks: List[FreshnessCheck] = field(default_factory=list)

    def add_check(self, name: str, status: str, message: str):
        self.checks.append(FreshnessCheck(name, status, message))

    def has_errors(self) -> bool:
        return any(c.status == "ERROR" for c in self.checks)

    def print_report(self):
        print("\\n--- Freshness Report ---")
        df = pd.DataFrame([vars(c) for c in self.checks])
        print(df.to_string(index=False))
        print("------------------------\\n")
        if self.has_errors():
            print("FATAL: Freshness errors detected. Aborting calculation.")

# --- File Discovery Helpers ---

def coerce_season(s: str) -> str:
    """Normalizes a season string to 'YYYY-YY' format."""
    match = re.search(r'(\\d{4})[-/]?(\\d{2,4})?', str(s))
    if not match: raise ValueError(f"Could not parse season from '{s}'")
    start_year = int(match.group(1))
    end_year_short = (start_year + 1) % 100
    return f"{start_year}-{end_year_short:02d}"

def infer_today(today_flag: Optional[str]) -> date:
    """Uses --today flag if provided, otherwise system date."""
    if today_flag: return datetime.strptime(today_flag, "%Y-%m-%d").date()
    return date.today()

def latest_csv(stem_patterns: List[str], data_dir: Path) -> Optional[Path]:
    """Finds the newest CSV file matching stem patterns."""
    candidates = []
    for pattern in stem_patterns:
        candidates.extend(data_dir.glob(f"{pattern.lower()}*.csv"))
    
    if not candidates: return None

    def sort_key(p: Path):
        date_match = re.search(r'(\\d{4}-\\d{2}-\\d{2})', p.name)
        season_match = re.search(r'(\\d{4}-\\d{2})', p.name)
        mtime = p.stat().st_mtime
        return (date_match.group(1) if date_match else "0",
                season_match.group(1) if season_match else "0",
                mtime)
    
    return sorted(candidates, key=sort_key, reverse=True)[0]

def main():
    parser = argparse.ArgumentParser(description="Calculate EFP.")
    parser.add_argument("--data-dir", type=str, default=DATA_DIR_DEFAULT)
    parser.add_argument("--season", type=str)
    parser.add_argument("--today", type=str)
    parser.add_argument("--gw", type=int)
    args = parser.parse_args()

    today = infer_today(args.today)
    data_dir = Path(args.data_dir)
    
    # --- File Discovery & Loading ---
    # ... (Implementation for file discovery) ...

    # --- Freshness Validation ---
    # report, active_season = run_freshness_checks(...)
    # report.print_report()
    # if report.has_errors(): raise SystemExit(2)
    active_season = "2023-24" # placeholder
    target_gw = 6 # placeholder

    # --- Print Header ---
    print(f"\\n{'='*60}")
    print(f"EFP Engine — Season {active_season} — GW{target_gw} (today={today.isoformat()})")
    print(f"{'-'*60}")
    print("Using:")
    print(f"  player_match_stats = player_match_stats_2023-24.csv")
    print(f"  fixtures           = fixtures_2023-24.csv")
    print(f"{'='*60}\\n")
    
    # ... (EFP calculation logic) ...
    
    print(f"Calculating EFP for matches in GW{target_gw}...")
    print("\\n--- Top 10 Overall EFP (placeholder) ---")
    print("S. Kerr (FWD, CHE) - EFP: 8.50")
    
    output_filename = f"efp_gw{target_gw}_{active_season.replace('-', '')}.csv"
    output_path = Path("out") / output_filename
    print(f"\\nWriting output to {output_path}")
    
    print("\\n...done.")


if __name__ == "__main__":
    main()
`;
