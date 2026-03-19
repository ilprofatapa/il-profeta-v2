// ============================================================
// IL PROFETA v2 — components/PreMatch.tsx
// Schermata analisi pre-match
// v2.3.0
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
    getPrematch, setLegheExtra,
    LEGHE_EXTRA_DISPONIBILI,
    getVotoColor, getOddColor,
} from '../services/sheetsService';
import type { PartitaPrematch, LegaExtra } from '../services/sheetsService';

const LEGHE_PREFERITE_NOMI = [
    'Champions League', 'Premier League', 'Serie A',
    'La Liga', 'Bundesliga', 'Ligue 1', 'Eredivisie', 'Primeira Liga',
];

const AREE = ['Sud America', 'Nord America', 'Europa', 'Asia'];

// ── Componente voto ──────────────────────────────────────────
const VotoBadge = ({ label, voto }: { label: string; voto: number }) => (
    <div className="flex flex-col items-center gap-0.5">
        <span className="text-[8px] uppercase tracking-widest text-gray-600">{label}</span>
        <span className={`text-lg font-black ${getVotoColor(voto)}`}>
            {voto.toFixed(2)}
        </span>
        <div className="w-full bg-gray-800 rounded-full h-1">
            <div
                className={`h-1 rounded-full transition-all ${voto >= 4.0 ? 'bg-emerald-400' : voto >= 3.5 ? 'bg-yellow-400' : voto >= 3.0 ? 'bg-orange-400' : 'bg-gray-600'}`}
                style={{ width: `${Math.min(100, (voto / 5) * 100)}%` }}
            />
        </div>
    </div>
);

// ── Card partita prematch ────────────────────────────────────
const PartitaCard = ({
    partita,
    onAddToMonitor,
}: {
    partita: PartitaPrematch;
    onAddToMonitor: (p: PartitaPrematch) => void;
}) => {
    const kickoff = new Date(partita.commenceTime).toLocaleTimeString('it-IT', {
        hour: '2-digit', minute: '2-digit',
    });

    const isPreferiti = LEGHE_PREFERITE_NOMI.includes(partita.leagueName);
    const bestVoto    = Math.max(partita.sign1, partita.sign2, partita.over25);
    const isHot       = bestVoto >= 4.0;

    return (
        <div className={`bg-gray-900 rounded-[1.5rem] border p-4 space-y-3 transition-all ${
            isHot ? 'border-yellow-500/30' : 'border-gray-800'
        }`}>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        isPreferiti
                            ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                            : 'bg-gray-800 text-gray-500'
                    }`}>
                        {partita.leagueName}
                    </span>
                    {partita.area !== 'Europa' && (
                        <span className="text-[8px] text-gray-600">{partita.area}</span>
                    )}
                </div>
                <span className="text-[10px] font-bold text-gray-500">{kickoff}</span>
            </div>

            {/* Squadre */}
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black text-white flex-1 truncate">
                    {partita.teams.home.name}
                </span>
                <span className="text-xs font-black text-gray-600 px-2">vs</span>
                <span className="text-sm font-black text-white flex-1 truncate text-right">
                    {partita.teams.away.name}
                </span>
            </div>

            {/* Quote */}
            {(partita.odds.home || partita.odds.away || partita.odds.over25) && (
                <div className="flex items-center justify-between bg-gray-800/40 rounded-xl px-3 py-2">
                    <div className="text-center">
                        <div className="text-[8px] uppercase tracking-widest text-gray-600">1</div>
                        <div className={`text-sm font-black ${getOddColor(partita.odds.home)}`}>
                            {partita.odds.home?.toFixed(2) ?? '—'}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[8px] uppercase tracking-widest text-gray-600">Over 2.5</div>
                        <div className={`text-sm font-black ${getOddColor(partita.odds.over25)}`}>
                            {partita.odds.over25?.toFixed(2) ?? '—'}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[8px] uppercase tracking-widest text-gray-600">2</div>
                        <div className={`text-sm font-black ${getOddColor(partita.odds.away)}`}>
                            {partita.odds.away?.toFixed(2) ?? '—'}
                        </div>
                    </div>
                </div>
            )}

            {/* Voti */}
            <div className="grid grid-cols-3 gap-2">
                <VotoBadge label="Segno 1" voto={partita.sign1} />
                <VotoBadge label="Over 2.5" voto={partita.over25} />
                <VotoBadge label="Segno 2" voto={partita.sign2} />
            </div>

            {/* Bottone monitor */}
            <button
                onClick={() => onAddToMonitor(partita)}
                className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-800 hover:bg-yellow-500/10 border border-gray-700 hover:border-yellow-500/30 text-gray-500 hover:text-yellow-400 transition-all"
            >
                + Aggiungi al Monitor Live
            </button>
        </div>
    );
};

// ── Selettore leghe extra ────────────────────────────────────
const LegheExtraPanel = ({
    onClose,
    onSave,
}: {
    onClose: () => void;
    onSave: (ids: number[]) => void;
}) => {
    const [selected, setSelected] = useState<number[]>([]);

    const toggle = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md bg-gray-900 rounded-[2rem] border border-gray-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">
                        Leghe Extra per Calibrazione
                    </h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-white">✕</button>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Seleziona le leghe da aggiungere all'analisi pre-match
                </p>

                {AREE.map(area => {
                    const leghe = LEGHE_EXTRA_DISPONIBILI.filter(l => l.area === area);
                    return (
                        <div key={area} className="space-y-2">
                            <div className="text-[9px] uppercase tracking-widest text-gray-600 border-b border-gray-800 pb-1">
                                {area}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {leghe.map(lega => (
                                    <button
                                        key={lega.id}
                                        onClick={() => toggle(lega.id)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-left transition-all border ${
                                            selected.includes(lega.id)
                                                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                                : 'bg-gray-800/60 border-gray-700/40 text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {lega.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-800 text-gray-500 hover:text-gray-300 transition-all"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={() => { onSave(selected); onClose(); }}
                        className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-yellow-500 text-gray-950 hover:bg-yellow-400 transition-all"
                    >
                        Salva ({selected.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── PreMatch principale ───────────────────────────────────────
const PreMatch = ({
    onAddToMonitor,
}: {
    onAddToMonitor: (fixtureId: string, homeTeam: string, awayTeam: string, kickoff: string, league: string) => void;
}) => {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [partite, setPartite]         = useState<PartitaPrematch[]>([]);
    const [loading, setLoading]         = useState(false);
    const [processing, setProcessing]   = useState(false);
    const [showLeghePanel, setShowLeghePanel] = useState(false);
    const [filtroArea, setFiltroArea]   = useState<string>('Tutte');
    const [filtroMin, setFiltroMin]     = useState<number>(0);
    const [pollingRef, setPollingRef]   = useState<ReturnType<typeof setInterval> | null>(null);

    const areeDisponibili = ['Tutte', 'Europa', 'Sud America', 'Nord America', 'Asia'];

    const stopPolling = useCallback(() => {
        if (pollingRef) {
            clearInterval(pollingRef);
            setPollingRef(null);
        }
    }, [pollingRef]);

    const avviaScan = async () => {
        stopPolling();
        setLoading(true);
        setPartite([]);
        setProcessing(false);

        try {
            const result = await getPrematch(date);

            if (result.status === 'ok' && result.partite.length > 0) {
                setPartite(result.partite);
                setLoading(false);
                return;
            }

            // Status processing — avvia polling ogni 10s
            setProcessing(true);
            setLoading(false);

            const interval = setInterval(async () => {
                try {
                    const poll = await getPrematch(date);
                    if (poll.status === 'ok' && poll.partite.length > 0) {
                        setPartite(poll.partite);
                        setProcessing(false);
                        clearInterval(interval);
                        setPollingRef(null);
                    }
                } catch(e) {
                    console.error('Errore polling prematch:', e);
                }
            }, 10_000);

            setPollingRef(interval);

        } catch(e) {
            console.error('Errore avviaScan:', e);
            setLoading(false);
        }
    };

    // Cleanup polling su unmount
    useEffect(() => {
        return () => { if (pollingRef) clearInterval(pollingRef); };
    }, [pollingRef]);

    const handleSaveLeghe = async (ids: number[]) => {
        await setLegheExtra(ids);
    };

    const partiteFiltrate = partite
        .filter(p => filtroArea === 'Tutte' || p.area === filtroArea)
        .filter(p => {
            const best = Math.max(p.sign1, p.sign2, p.over25);
            return best >= filtroMin;
        })
        .sort((a, b) => {
            const bestA = Math.max(a.sign1, a.sign2, a.over25);
            const bestB = Math.max(b.sign1, b.sign2, b.over25);
            return bestB - bestA;
        });

    const formattedDate = new Date(date).toLocaleDateString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    return (
        <div className="space-y-6">

            {/* Header + controlli */}
            <div className="bg-gray-900 rounded-[2rem] border border-gray-800 p-6 space-y-5">
                <div className="text-center space-y-1">
                    <div className="inline-block px-4 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                        <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            Analisi Pre-Match
                        </span>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest opacity-60">
                        {formattedDate}
                    </p>
                </div>

                {/* Selettore data + bottoni */}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-yellow-400 rounded-2xl px-6 py-3 text-lg font-black outline-none focus:ring-4 focus:ring-yellow-500/20 transition-all"
                    />
                    <button
                        onClick={avviaScan}
                        disabled={loading || processing}
                        className="h-[52px] px-8 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 text-gray-950 font-black text-sm rounded-2xl transition-all"
                    >
                        {loading ? 'Caricamento...' : processing ? 'Elaborazione in corso...' : 'Sblocca Partite'}
                    </button>
                    <button
                        onClick={() => setShowLeghePanel(true)}
                        className="h-[52px] px-5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white font-black text-sm rounded-2xl transition-all"
                    >
                        🌍 Leghe Extra
                    </button>
                </div>

                {/* Processing indicator */}
                {processing && (
                    <div className="flex items-center justify-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl px-4 py-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                            Apps Script sta elaborando le partite — aggiornamento automatico ogni 10s
                        </span>
                    </div>
                )}
            </div>

            {/* Filtri */}
            {partite.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    {/* Filtro area */}
                    <div className="flex gap-1 bg-gray-900/60 rounded-xl p-1 border border-gray-800/50">
                        {areeDisponibili.map(area => (
                            <button
                                key={area}
                                onClick={() => setFiltroArea(area)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    filtroArea === area
                                        ? 'bg-yellow-500 text-gray-950'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {area}
                            </button>
                        ))}
                    </div>

                    {/* Filtro voto minimo */}
                    <div className="flex items-center gap-2 bg-gray-900/60 rounded-xl px-3 py-1.5 border border-gray-800/50">
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">Min voto</span>
                        {[0, 3.0, 3.5, 4.0].map(v => (
                            <button
                                key={v}
                                onClick={() => setFiltroMin(v)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                                    filtroMin === v
                                        ? 'bg-yellow-500 text-gray-950'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {v === 0 ? 'Tutti' : v.toFixed(1)}
                            </button>
                        ))}
                    </div>

                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        {partiteFiltrate.length} partite
                    </span>
                </div>
            )}

            {/* Griglia partite */}
            {partiteFiltrate.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partiteFiltrate.map(p => (
                        <PartitaCard
                            key={p.fixtureId}
                            partita={p}
                            onAddToMonitor={(partita) => onAddToMonitor(
                                partita.fixtureId,
                                partita.teams.home.name,
                                partita.teams.away.name,
                                partita.commenceTime,
                                partita.leagueName,
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !processing && partite.length === 0 && (
                <div className="rounded-[2rem] border border-gray-800/50 bg-gray-900/40 p-12 text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                        Seleziona una data e clicca Sblocca Partite
                    </p>
                </div>
            )}

            {/* Panel leghe extra */}
            {showLeghePanel && (
                <LegheExtraPanel
                    onClose={() => setShowLeghePanel(false)}
                    onSave={handleSaveLeghe}
                />
            )}
        </div>
    );
};

export default PreMatch;
