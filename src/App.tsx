// ============================================================
// IL PROFETA v2 — App.tsx
// Root dell'applicazione — gestisce i tab e il polling
// ============================================================

import { useState, useEffect } from 'react';
import { getPartiteMonitor } from './services/sheetsService';
import type { PartitaLive } from './services/sheetsService';
import FavoritesList from './components/FavoritesList';

export default function App() {
  const [partite, setPartite] = useState<PartitaLive[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState<Date | null>(null);

  // ── Polling ogni 30 secondi ────────────────────────────────
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

      {/* Contenuto principale */}
      <main className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-2xl mb-2">⏳</p>
            <p>Caricamento...</p>
          </div>
        ) : (
          <FavoritesList
            partite={partite}
            onRefresh={caricaDati}
          />
        )}
      </main>

    </div>
  );
}