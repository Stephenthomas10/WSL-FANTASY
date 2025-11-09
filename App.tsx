
import React, { useState, useCallback, useRef } from 'react';
import { PythonIcon, FileIcon, PlayIcon, BrainCircuitIcon, BotIcon, InfoIcon } from './components/Icons';
import CodeViewer from './components/CodeViewer';
import Terminal from './components/Terminal';
import ResultsTable from './components/ResultsTable';
import { SCRIPT_CONTENT } from './constants';
import { PlayerEfpOutput } from './types';
import { runEfpCalculation } from './services/fantasyPointsService';
import { getPlayerAnalysis } from './services/geminiService';

type View = 'script' | 'results';

export default function App() {
  const [view, setView] = useState<View>('script');
  const [terminalLines, setTerminalLines] = useState<string[]>(['Welcome to the EFP Calculator. Configure parameters and press "Run Script" to begin.']);
  const [efpResults, setEfpResults] = useState<PlayerEfpOutput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScriptRun, setIsScriptRun] = useState(false);

  const [analysisPlayer, setAnalysisPlayer] = useState<PlayerEfpOutput | null>(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // State for CLI args simulation
  const [season, setSeason] = useState('2023-24');
  const [gameweek, setGameweek] = useState('');
  const [today, setToday] = useState('2023-11-07');

  const handleRunScript = useCallback(async () => {
    setIsProcessing(true);
    setTerminalLines(['Executing expected_points.py...']);
    setEfpResults([]);
    setIsScriptRun(false);
    setView('script');
    
    await new Promise(res => setTimeout(res, 500));
    
    const { consoleOutput, results, error } = runEfpCalculation({
      season: season || undefined,
      gw: gameweek ? parseInt(gameweek, 10) : undefined,
      today: today || undefined,
    });
    
    setTerminalLines(prev => [...prev, ...consoleOutput.split('\n')]);
    
    if (!error) {
      setEfpResults(results);
      setIsScriptRun(true);
      setView('results');
    }
    
    await new Promise(res => setTimeout(res, 200));
    setTerminalLines(prev => [...prev, error ? 'Execution failed.' : '...done.']);
    
    setIsProcessing(false);
  }, [season, gameweek, today]);

  const handleGetAnalysis = useCallback(async (player: PlayerEfpOutput) => {
    setAnalysisPlayer(player);
    setIsAnalyzing(true);
    setAnalysisResult('');
    try {
      const analysis = await getPlayerAnalysis(player);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Gemini API error:', error);
      setAnalysisResult('Sorry, an error occurred while analyzing the player. Please check the console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <div className="flex h-screen font-sans bg-gray-900 text-gray-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-700 p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-6">
          <BrainCircuitIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">EFP Engine</h1>
        </div>
        <nav className="space-y-2">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Workspace</p>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-gray-700/50 rounded-md">
            <PythonIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-white">expected_points.py</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-700/30 rounded-md">
            <FileIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">README.md</span>
          </a>
        </nav>
        
        <div className="mt-auto space-y-4">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Parameters</p>
            <div className="space-y-2 text-sm">
                <div>
                    <label htmlFor="season" className="block text-xs font-medium text-gray-400 mb-1">Season</label>
                    <input type="text" id="season" value={season} onChange={e => setSeason(e.target.value)} placeholder="e.g., 2023-24" className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-2 py-1 text-white focus:ring-cyan-500 focus:border-cyan-500 text-xs"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="gameweek" className="block text-xs font-medium text-gray-400 mb-1">Gameweek</label>
                        <input type="number" id="gameweek" value={gameweek} onChange={e => setGameweek(e.target.value)} placeholder="Auto" className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-2 py-1 text-white focus:ring-cyan-500 focus:border-cyan-500 text-xs"/>
                    </div>
                     <div>
                        <label htmlFor="today" className="block text-xs font-medium text-gray-400 mb-1">Today</label>
                        <input type="date" id="today" value={today} onChange={e => setToday(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-2 py-1 text-white focus:ring-cyan-500 focus:border-cyan-500 text-xs"/>
                    </div>
                </div>
            </div>
            <button
                onClick={handleRunScript}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                <PlayIcon className="w-5 h-5" />
                <span>{isProcessing ? 'Running...' : 'Run Script'}</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex border-b border-gray-700 mb-4">
            <button 
              onClick={() => setView('script')}
              className={`px-4 py-2 text-sm font-medium ${view === 'script' ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400'}`}
            >
              Script
            </button>
            <button 
              onClick={() => setView('results')}
              disabled={!isScriptRun}
              className={`px-4 py-2 text-sm font-medium ${view === 'results' ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400'} disabled:text-gray-600 disabled:cursor-not-allowed`}
            >
              Results
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg shadow-inner">
            {view === 'script' && <CodeViewer code={SCRIPT_CONTENT} />}
            {view === 'results' && isScriptRun && (
              <ResultsTable results={efpResults} onAnalyze={handleGetAnalysis} />
            )}
            {view === 'results' && !isScriptRun && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Run the script to see the results.
              </div>
            )}
          </div>
        </div>
        
        {/* Analysis Modal */}
        {analysisPlayer && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setAnalysisPlayer(null)}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <BotIcon className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">AI Analyst: {analysisPlayer.player}</h2>
                </div>
                <button onClick={() => setAnalysisPlayer(null)} className="text-gray-400 hover:text-white">&times;</button>
              </div>
              <div className="p-6 overflow-y-auto">
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                    <span>Gemini is analyzing the data...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terminal */}
        <div className="h-48 flex-shrink-0 p-4 bg-black/50 border-t border-gray-700">
          <Terminal lines={terminalLines} />
        </div>
      </main>
    </div>
  );
}
