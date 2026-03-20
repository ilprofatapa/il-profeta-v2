// ============================================================
// IL PROFETA v2 — components/LiveGrid.tsx
// Griglia 2 colonne partite live con modal dettaglio
// v2.4.0
// ============================================================

import { useState } from 'react';
import type { PartitaLive, EventoLive } from '../services/sheetsService';
import { getTrendLabel, getVotoLabel } from '../services/sheetsService';
import LiveMonitor from './LiveMonitor';

// ── Timeline compatta ─────────────────────────────────────────
const MiniTimeline = ({
  events,
  homeTeam,
  minute,
}: {
  events: EventoLive[];
  homeTeam: string;
  minute: number;
}) => {
  const durata = minute > 90 ? minute : 90;
  const goals = events.filter(e => e.type === 'goal' || e.type === 'penalty' || e.type === 'autogoal');
  const cards = events.filter(e => e.type === 'yellow' || e.type === 'red' || e.type === 'second_yellow');
  const allEvents = [...goals, ...cards].sort((a, b) => a.minute - b.minute);

  return (
    <div style={{ position: 'relative', padding: '12px 0 4px' }}>
      <div style={{
        height: '2px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '1px',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min((minute / durata) * 100, 100)}%`,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '1px',
        }} />
        <div style={{
          position: 'absolute',
          left: `${(45 / durata) * 100}%`,
          top: '-4px',
          width: '1px',
          height: '10px',
          background: 'rgba(255,255,255,0.15)',
        }} />
        {minute > 90 && (
          <div style={{
            position: 'absolute',
            left: `${(90 / durata) * 100}%`,
            top: '-4px',
            width: '1px',
            height: '10px',
            background: 'rgba(255,255,255,0.15)',
          }} />
        )}
        {allEvents.map((ev, i) => {
          const pct = Math.min((ev.minute / durata) * 100, 99);
          const isHome = ev.team === homeTeam;
          const isGoal = ev.type === 'goal' || ev.type === 'penalty' || ev.type === 'autogoal';
          const isRed = ev.type === 'red' || ev.type === 'second_yellow';
          const icon = isGoal ? '⚽' : isRed ? '🟥' : '🟨';
          const minColor = isGoal
            ? (isHome ? '#EF9F27' : '#378ADD')
            : 'rgba(255,255,255,0.4)';
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${pct}%`,
              top: '-10px',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '11px', lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: '9px', color: minColor, marginTop: '1px' }}>
                {ev.minute}'
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Card singola ──────────────────────────────────────────────
const LiveCard = ({
  partita,
  onClick,
}: {
  partita: PartitaLive;
  onClick: () => void;
}) => {
  const isLive = partita.status === '1H' || partita.status === '2H';
  const isHT   = partita.status === 'HT';
  const isFT   = partita.status === 'FT';

  const statusLabel = isHT ? 'HT'
    : isFT ? 'FT'
    : partita.status === 'NS' ? 'NS'
    : `${partita.minute}'`;

  const livMax = Math.max(partita.semaforoHome ?? 0, partita.semaforoAway ?? 0);
  const useHome = (partita.semaforoHome ?? 0) >= (partita.semaforoAway ?? 0);
  const livTeam  = useHome ? partita.homeTeam : partita.awayTeam;
  const livVoto  = useHome ? (partita.votoHome ?? 0)   : (partita.votoAway ?? 0);
  const livIp10  = useHome ? (partita.ipHome ?? 0)     : (partita.ipAway ?? 0);
  const livIp5   = useHome ? (partita.ipHome5 ?? 0)    : (partita.ipAway5 ?? 0);
  const livTrend = useHome ? (partita.trendHome ?? 0)  : (partita.trendAway ?? 0);

  const semConfig: Record<number, { bg: string; border: string; dot: string; text: string; label: string }> = {
    0: { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', dot: '#888780', text: 'rgba(255,255,255,0.3)', label: 'Nessun segnale' },
    1: { bg: 'rgba(239,159,39,0.08)',  border: 'rgba(239,159,39,0.25)',  dot: '#EF9F27', text: '#EF9F27', label: 'LIV.1' },
    2: { bg: 'rgba(216,90,48,0.08)',   border: 'rgba(216,90,48,0.25)',   dot: '#D85A30', text: '#D85A30', label: 'LIV.2' },
    3: { bg: 'rgba(99,153,34,0.10)',   border: 'rgba(99,153,34,0.30)',   dot: '#639922', text: '#639922', label: 'LIV.3' },
  };
  const sem = semConfig[livMax];

  const trendLabel = getTrendLabel(livTrend);
  const votoLabel  = getVotoLabel(livVoto);

  const cardBorder = isLive
    ? livMax >= 3 ? 'rgba(99,153,34,0.35)'
    : livMax === 2 ? 'rgba(216,90,48,0.30)'
    : livMax === 1 ? 'rgba(239,159,39,0.25)'
    : 'rgba(255,255,255,0.08)'
    : 'rgba(255,255,255,0.06)';

  return (
    <div
      onClick={onClick}
      style={{
        background: '#111827',
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'transform 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{partita.homeTeam}</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{partita.awayTeam}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{partita.league}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#FBBF24', letterSpacing: '2px' }}>
            {partita.scoreHome} – {partita.scoreAway}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
            {isLive && (
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#EF4444', display: 'inline-block',
                animation: 'pulse 1.5s infinite',
              }} />
            )}
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Badge semaforo */}
      <div style={{ marginBottom: '8px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 8px', borderRadius: '20px',
          background: sem.bg, border: `1px solid ${sem.border}`,
          fontSize: '11px', fontWeight: 600, color: sem.text,
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sem.dot, display: 'inline-block' }} />
          {livMax > 0 ? `${sem.label} — ${livTeam}` : sem.label}
        </span>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '5px', marginBottom: '8px' }}>
        {[
          { label: "IP/10'", val: livIp10.toFixed(2), color: '#fff',          big: false },
          { label: "IP/5'",  val: livIp5.toFixed(2),  color: '#fff',          big: false },
          { label: 'Trend Δ', val: `${livTrend > 0 ? '+' : ''}${livTrend.toFixed(2)}`, color: trendLabel.color, big: true },
          { label: 'Voto',    val: livVoto.toFixed(1), color: votoLabel.color, big: true },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '5px 4px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>{kpi.label}</div>
            <div style={{ fontSize: kpi.big ? '15px' : '13px', fontWeight: 700, color: kpi.color }}>{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Mini timeline */}
      {partita.events && partita.events.length > 0 ? (
        <MiniTimeline
          events={partita.events}
          homeTeam={partita.homeTeam}
          minute={partita.minute ?? 0}
        />
      ) : (
        <div style={{
          height: '2px', background: 'rgba(255,255,255,0.06)',
          borderRadius: '1px', margin: '10px 0 4px',
        }} />
      )}

      {/* Hint */}
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: '6px' }}>
        tocca per dettaglio →
      </div>
    </div>
  );
};

// ── Modal dettaglio ───────────────────────────────────────────
const ModalDettaglio = ({
  partita,
  onClose,
  onRemove,
}: {
  partita: PartitaLive;
  onClose: () => void;
  onRemove: (id: string) => void;
}) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto',
    }}
  >
    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', marginTop: '8px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            color: 'rgba(255,255,255,0.6)',
            padding: '4px 14px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ✕ Chiudi
        </button>
      </div>
      <LiveMonitor partita={partita} onRemove={(id) => { onRemove(id); onClose(); }} />
    </div>
  </div>
);

// ── LiveGrid ──────────────────────────────────────────────────
interface LiveGridProps {
  partite: PartitaLive[];
  onRefresh: () => void;
  onRemove: (fixtureId: string) => void;
}

const LiveGrid = ({ partite, onRefresh, onRemove }: LiveGridProps) => {
  const [modalPartita, setModalPartita] = useState<PartitaLive | null>(null);

  if (partite.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '48px' }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
        <p style={{ fontSize: '14px' }}>Nessuna partita nel monitor</p>
        <p style={{ fontSize: '12px', marginTop: '4px', color: 'rgba(255,255,255,0.15)' }}>
          Aggiungile dalla tab Pre-Match
        </p>
      </div>
    );
  }

  const liveCount = partite.filter(p => p.status === '1H' || p.status === '2H').length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
          {partite.length} partite · {liveCount} live
        </span>
        <button
          onClick={onRefresh}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.4)',
            padding: '4px 12px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          🔄 Aggiorna
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px' }}>
        {partite.map(p => (
          <LiveCard key={p.fixtureId} partita={p} onClick={() => setModalPartita(p)} />
        ))}
      </div>

      {modalPartita && (
        <ModalDettaglio
          partita={modalPartita}
          onClose={() => setModalPartita(null)}
          onRemove={(id) => { onRemove(id); setModalPartita(null); }}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </>
  );
};

export default LiveGrid;
