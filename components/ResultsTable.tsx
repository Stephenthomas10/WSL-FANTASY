
import React, { useState, useMemo } from 'react';
import { PlayerEfpOutput } from '../types';
import { BrainCircuitIcon, InfoIcon } from './Icons';

interface ResultsTableProps {
  results: PlayerEfpOutput[];
  onAnalyze: (player: PlayerEfpOutput) => void;
}

type SortKey = keyof PlayerEfpOutput;
type SortDirection = 'asc' | 'desc';

const ResultsTable: React.FC<ResultsTableProps> = ({ results, onAnalyze }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'EFP',
    direction: 'desc',
  });
  
  const [filterPosition, setFilterPosition] = useState<string>('ALL');

  const sortedResults = useMemo(() => {
    let sortableItems = [...results];
    if (filterPosition !== 'ALL') {
      sortableItems = sortableItems.filter(p => p.position === filterPosition);
    }
    sortableItems.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [results, sortConfig, filterPosition]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'desc' ? '▼' : '▲';
  };

  const positions = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];
  const currentGW = results[0]?.gameweek;
  const currentSeason = results[0]?.season;

  return (
    <div className="p-4 bg-gray-800 h-full text-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">EFP Results (Season {currentSeason} - GW{currentGW})</h2>
        <div className="flex items-center space-x-2 bg-gray-700/50 p-1 rounded-lg">
          {positions.map(pos => (
            <button
              key={pos}
              onClick={() => setFilterPosition(pos)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filterPosition === pos ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto h-[calc(100%-4rem)]">
        <table className="w-full text-sm text-left text-gray-300 table-fixed">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
            <tr>
              {['Notes', 'Player', 'Pos', 'Team', 'Opp', 'EFP', 'C(EFP)', 'Value', 'xG', 'xA', 'CS%', 'Starts%', 'Analyze'].map(header => {
                const keyMap: { [key: string]: SortKey } = { 'Player': 'player', 'Pos': 'position', 'EFP': 'EFP', 'C(EFP)': 'Captain_EFP', 'Value': 'value_ep_per_m', 'xG': 'E_goals', 'xA': 'E_assists', 'CS%': 'P_clean_sheet', 'Starts%': 'prob_starts' };
                const sortKey = keyMap[header] as SortKey;
                const canSort = !!sortKey;
                const widthClass = header === 'Player' ? 'w-1/4' : (header === 'Notes' || header === 'Analyze') ? 'w-1/16' : 'w-auto';
                return (
                  <th key={header} scope="col" className={`px-4 py-3 ${canSort ? 'cursor-pointer' : ''} ${widthClass}`} onClick={() => canSort && requestSort(sortKey)}>
                    {header} {getSortIndicator(sortKey)}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((p) => (
              <tr key={p.player_id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="px-4 py-2 text-center">
                  {p.data_notes && p.data_notes.length > 0 && (
                    <div className="relative group flex justify-center">
                        <InfoIcon className="w-5 h-5 text-yellow-400 cursor-pointer" />
                        <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            {p.data_notes.join('; ')}
                            <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 font-medium text-white whitespace-nowrap">{p.player}</td>
                <td className="px-4 py-2">{p.position}</td>
                <td className="px-4 py-2">{p.team}</td>
                <td className="px-4 py-2">{p.opponent}</td>
                <td className="px-4 py-2 font-bold text-cyan-400">{p.EFP.toFixed(2)}</td>
                <td className="px-4 py-2">{p.Captain_EFP.toFixed(2)}</td>
                <td className="px-4 py-2">{p.value_ep_per_m.toFixed(2)}</td>
                <td className="px-4 py-2">{p.E_goals.toFixed(2)}</td>
                <td className="px-4 py-2">{p.E_assists.toFixed(2)}</td>
                <td className="px-4 py-2">{(p.P_clean_sheet * 100).toFixed(1)}%</td>
                <td className="px-4 py-2">{(p.prob_starts * 100).toFixed(0)}%</td>
                <td className="px-4 py-2">
                  <button onClick={() => onAnalyze(p)} className="text-cyan-400 hover:text-cyan-300" title={`Analyze ${p.player}`}>
                    <BrainCircuitIcon className="w-5 h-5"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
