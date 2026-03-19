// ============================================================
// IL PROFETA v2 — components/TimelineBar.tsx
// Timeline eventi — casa sopra, ospite sotto
// v2.3.0
// ============================================================

import type { EventoLive } from '../services/sheetsService';

interface TimelineBarProps {
    events: EventoLive[];
    homeTeam: string;
    awayTeam: string;
    minute: number;
}

const getEventoIcon = (type: EventoLive['type']): string => {
    switch (type) {
        case 'goal':         return '⚽';
        case 'penalty':      return '⚽P';
        case 'autogoal':     return '🔴⚽';
        case 'yellow':       return '🟨';
        case 'red':          return '🟥';
        case 'second_yellow': return '🟨🟥';
        case 'subst':        return '🔄';
        default:             return '•';
    }
};

const getEventoColor = (type: EventoLive['type']): string => {
    switch (type) {
        case 'goal':
        case 'penalty':      return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
        case 'autogoal':     return 'text-red-400 border-red-500/40 bg-red-500/10';
        case 'yellow':       return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
        case 'red':
        case 'second_yellow': return 'text-red-400 border-red-500/40 bg-red-500/10';
        case 'subst':        return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
        default:             return 'text-gray-400 border-gray-600 bg-gray-800';
    }
};

const EventoBadge = ({
    evento,
    side,
}: {
    evento: EventoLive;
    side: 'home' | 'away';
}) => {
    const colorClass = getEventoColor(evento.type);
    const icon       = getEventoIcon(evento.type);
    const minLabel   = evento.extraTime
        ? `${evento.minute}+${evento.extraTime}'`
        : `${evento.minute}'`;

    return (
        <div
            className={`absolute flex flex-col items-center gap-0.5 ${side === 'home' ? '-top-8' : 'top-2'}`}
            style={{ left: `calc(${(evento.minute / 90) * 100}% - 12px)` }}
        >
            {side === 'home' && (
                <span className="text-[7px] text-gray-500 font-bold">{minLabel}</span>
            )}
            <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-black ${colorClass}`}
                title={`${evento.player}${evento.assist ? ` (${evento.assist})` : ''}`}
            >
                {icon}
            </div>
            {side === 'away' && (
                <span className="text-[7px] text-gray-500 font-bold">{minLabel}</span>
            )}
        </div>
    );
};

const TimelineBar = ({ events, homeTeam, awayTeam, minute }: TimelineBarProps) => {
    if (!events || events.length === 0) return null;

    const homeEvents = events.filter(e => e.team === homeTeam);
    const awayEvents = events.filter(e => e.team !== homeTeam);

    const progressPct = Math.min(100, (minute / 90) * 100);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px] uppercase tracking-widest text-gray-600">
                <span>{homeTeam}</span>
                <span>Timeline</span>
                <span>{awayTeam}</span>
            </div>

            {/* Contenitore timeline */}
            <div className="relative" style={{ height: '72px' }}>

                {/* Linea centrale */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-700" />

                {/* Barra progresso */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-yellow-500/40 transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                />

                {/* Marker minuto attuale */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-yellow-500 rounded-full"
                    style={{ left: `${progressPct}%` }}
                />

                {/* Marker mezz'ora */}
                {[30, 45, 60, 75].map(m => (
                    <div
                        key={m}
                        className="absolute top-1/2 -translate-y-1/2 w-px h-2 bg-gray-700"
                        style={{ left: `${(m / 90) * 100}%` }}
                    />
                ))}

                {/* Eventi casa — sopra la linea */}
                {homeEvents.map((evento, idx) => (
                    <EventoBadge key={idx} evento={evento} side="home" />
                ))}

                {/* Eventi ospite — sotto la linea */}
                {awayEvents.map((evento, idx) => (
                    <EventoBadge key={idx} evento={evento} side="away" />
                ))}
            </div>

            {/* Legenda */}
            <div className="flex items-center justify-center gap-3 pt-1">
                {[
                    { icon: '⚽', label: 'Gol' },
                    { icon: '🟨', label: 'Giallo' },
                    { icon: '🟥', label: 'Rosso' },
                    { icon: '🔄', label: 'Sost.' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-1">
                        <span className="text-[9px]">{item.icon}</span>
                        <span className="text-[7px] text-gray-600 uppercase tracking-wider">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineBar;
