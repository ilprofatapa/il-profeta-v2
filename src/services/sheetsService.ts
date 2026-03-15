// ============================================================
// IL PROFETA v2 — services/sheetsService.ts
// L'unico file che parla con Apps Script
// Il cameriere — chiede i dati e li porta ai componenti
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxK3GTcWqA4jXbZE-Xs6xn2kcfcmmOGMQhSNjtDTgIwqItFVWpEkpPNbI6erCllH5ZkaA/exec';

// ── Tipi TypeScript ──────────────────────────────────────────
// Qui definiamo la "forma" dei dati che arrivano da Apps Script
// TypeScript ci avvisa se proviamo ad usare un campo che non esiste

export interface PartitaStats {
    sibHome: number;
    sibAway: number;
    sotHome: number;
    sotAway: number;
    shotsHome: number;
    shotsAway: number;
    cornersHome: number;
    cornersAway: number;
    possHome: number;
    possAway: number;
}

export interface PartitaLive {
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    status: string;
    minute: number;
    scoreHome: number;
    scoreAway: number;
    ipHome: number;
    ipAway: number;
    trendHome: number;
    trendAway: number;
    semaforoHome: number;
    semaforoAway: number;
    votoHome: number;
    votoAway: number;
    league: string;
    stats?: PartitaStats;
}

export interface PartitaDisponibile {
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    status: string;
    minute: number;
    scoreHome: number;
    scoreAway: number;
    league: string;
}

// ── Funzione base — chiama Apps Script ───────────────────────
// Tutti i metodi qui sotto la usano internamente
async function chiamaAppsScript(params: Record<string, string>): Promise<unknown> {
    const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    const fullUrl = `${APPS_SCRIPT_URL}?${queryString}`;

    const response = await fetch(fullUrl, {
        method: 'GET',
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error('Errore chiamata Apps Script: ' + response.status);
    }

    return response.json();
}

// ── Ottieni le partite monitorate con dati live ──────────────
// Chiamata ogni 30 secondi dal frontend per aggiornare i dati
export async function getPartiteMonitor(): Promise<PartitaLive[]> {
    try {
        const data = await chiamaAppsScript({ action: 'getPartite' });
        return data as PartitaLive[];
    } catch (e) {
        console.error('Errore getPartiteMonitor:', e);
        return [];
    }
}

// ── Ottieni tutte le partite live disponibili ────────────────
// Usata quando l'utente vuole aggiungere una partita ai preferiti
export async function getPartiteLive(): Promise<PartitaDisponibile[]> {
    try {
        const data = await chiamaAppsScript({ action: 'getPartiteLive' });
        return data as PartitaDisponibile[];
    } catch (e) {
        console.error('Errore getPartiteLive:', e);
        return [];
    }
}

// ── Aggiungi una partita ai preferiti ───────────────────────
// Scrive su Sheets — Apps Script inizia a monitorarla
export async function aggiungiPartita(
    fixtureId: string,
    homeTeam: string,
    awayTeam: string,
    kickoff: string
): Promise<boolean> {
    try {
        await chiamaAppsScript({
            action: 'aggiungiPartita',
            fixtureId,
            homeTeam,
            awayTeam,
            kickoff,
        });
        return true;
    } catch (e) {
        console.error('Errore aggiungiPartita:', e);
        return false;
    }
}

// ── Rimuovi una partita dai preferiti ───────────────────────
// Cancella da Sheets — Apps Script smette di monitorarla
export async function rimuoviPartita(fixtureId: string): Promise<boolean> {
    try {
        await chiamaAppsScript({
            action: 'rimuoviPartita',
            fixtureId,
        });
        return true;
    } catch (e) {
        console.error('Errore rimuoviPartita:', e);
        return false;
    }
}

// ── Helper semaforo → emoji ──────────────────────────────────
export const semaforoEmoji = (livello: number): string => {
    if (livello === 3) return '🟢';
    if (livello === 2) return '🟠';
    if (livello === 1) return '🟡';
    return '⚫';
};

// ── Helper trend → etichetta ─────────────────────────────────
export const getTrendLabel = (delta: number): { label: string; color: string } => {
    if (delta >= 0.20) return { label: '🚀 ESPLOSO', color: 'text-red-400' };
    if (delta >= 0.15) return { label: '📈 IN SALITA', color: 'text-orange-400' };
    if (delta >= 0.10) return { label: '↗ CRESCENTE', color: 'text-yellow-400' };
    if (delta >= 0.05) return { label: '→ STABILE', color: 'text-gray-400' };
    if (delta >= 0) return { label: '↘ PIATTO', color: 'text-gray-600' };
    return { label: '📉 IN CALO', color: 'text-blue-400' };
};

// ── Helper voto → etichetta ──────────────────────────────────
export const getVotoLabel = (v: number): { label: string; color: string } => {
    if (v >= 4.5) return { label: '🔴 GOL IN ARRIVO', color: 'text-red-400' };
    if (v >= 3.5) return { label: '🟠 PORTA SOTTO ASSEDIO', color: 'text-orange-400' };
    if (v >= 2.5) return { label: '🟡 SPINGONO MA SENZA MORDERE', color: 'text-yellow-400' };
    if (v >= 1.5) return { label: '⚪ PASSAMI IL CUSCINO', color: 'text-gray-400' };
    return { label: '💤 SPARITI DAL CAMPO', color: 'text-gray-600' };
};