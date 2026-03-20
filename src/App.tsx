// ============================================================
// IL PROFETA v2 — App.tsx
// Root — tab Pre-Match + Live Monitor
// v2.3.0
// ============================================================

import { useState, useEffect } from 'react';
import { getPartiteMonitor, aggiungiPartita, rimuoviPartita } from './services/sheetsService';
import type { PartitaLive } from './services/sheetsService';
import LiveGrid from './components/LiveGrid';
import PreMatch from './components/PreMatch';

type Tab = 'prematch' | 'live';

export default function App() {
  const [partite, setPartite] = useState<PartitaLive[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('prematch');

  // ── Polling ogni 30 secondi ──────────────────────────────
  useEffect(() => {
    caricaDati();
    const intervallo = setInterval(caricaDati, 30000);
    return () => clearInterval(intervallo);
  }, []);

  const caricaDati = async () => {
    try {
      const dati = await getPartiteMonitor();
      setPartite(dati);
      setUltimoAggiornamento(new Date());
    } catch (e) {
      console.error('Errore caricamento dati:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMonitor = async (
    fixtureId: string,
    homeTeam: string,
    awayTeam: string,
    kickoff: string,
    league: string
  ) => {
    await aggiungiPartita(fixtureId, homeTeam, awayTeam, kickoff, league);
    setActiveTab('live');
    await caricaDati();
  };

  const liveCount = partite.filter(
    p => p.status === '1H' || p.status === '2H'
  ).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-yellow-400">
          ⚽ IL PROFETA v2
        </h1>
        {ultimoAggiornamento && (
          <span className="text-xs text-gray-500">
            🕐 {ultimoAggiornamento.toLocaleTimeString()}
          </span>
        )}
      </header>

      {/* Tab switcher */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-gray-900/60 rounded-2xl p-1 border border-gray-800/50 w-fit">
          <button
            onClick={() => setActiveTab('prematch')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
              activeTab === 'prematch'
                ? 'bg-yellow-500 text-gray-950 shadow-[0_8px_20px_rgba(234,179,8,0.2)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Pre-Match
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
              activeTab === 'live'
                ? 'bg-yellow-500 text-gray-950 shadow-[0_8px_20px_rgba(234,179,8,0.2)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Live & Monitor
            {liveCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">
                {liveCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenuto */}
      <main className="p-4 max-w-6xl mx-auto mt-4">

        {/* TAB PRE-MATCH */}
        {activeTab === 'prematch' && (
          <PreMatch onAddToMonitor={handleAddToMonitor} />
        )}

        {/* TAB LIVE */}
        {activeTab === 'live' && (
          <>
            {loading ? (
              <div className="text-center text-gray-400 mt-10">
                <p className="text-2xl mb-2">⏳</p>
                <p>Caricamento...</p>
              </div>
            ) : (
              <LiveGrid
                partite={partite}
                onRefresh={caricaDati}
                onRemove={async (id) => {
                  await rimuoviPartita(id);
                  await caricaDati();
                }}
              />
            )}
          </>
        )}

      </main>
    </div>
  );
}
