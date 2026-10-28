/**
 * Модуль утилит: форматирование больших чисел, Web Audio API синтезатор звуков,
 * защита сохранений чек-суммой и системные хуки модерации Яндекс Игр.
 */

import { looksmaxMusic } from './musicPlayer';

const SUFFIXES = [
  '',
  'тыс.',
  'млн',
  'млрд',
  'трлн',
  'квадр.',
  'квинт.',
  'секст.',
];

/**
 * Форматирует число для табличного отображения (tabular-nums) без скачков ширины.
 */
export function formatLooks(value: number, decimals = 1): string {
  if (!Number.isFinite(value) || value < 0) return '0';
  if (value < 1000) {
    return value < 10 && value % 1 !== 0 ? value.toFixed(1) : Math.floor(value).toString();
  }

  const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
  if (tier === 0) return Math.floor(value).toString();

  const suffix = SUFFIXES[tier] || `e${tier * 3}`;
  const scale = Math.pow(10, tier * 3);
  const scaled = value / scale;

  return `${scaled.toFixed(scaled >= 100 ? 1 : decimals)} ${suffix}`.trim();
}

/**
 * Форматирует время в читаемую строку (для оффлайн-дохода и времени в игре).
 */
export function formatDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  if (hours > 0) {
    return `${hours}ч ${minutes.toString().padStart(2, '0')}м`;
  }
  if (minutes > 0) {
    return `${minutes}м ${seconds.toString().padStart(2, '0')}с`;
  }
  return `${seconds}с`;
}

/**
 * Вычисляет быструю контрольную сумму FNV-1a для проверки целостности сохранения.
 */
export function computeSaveChecksum(payload: string): string {
  let hash = 0x811c9dc5;
  const salt = 'PSL_ASCENSION_YAGAMES_2026';
  const combined = payload + salt;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Процедурный звуковой движок на базе Web Audio API.
 * Полностью соответствует п. 4.7 правил Яндекс Игр (авто-пауза звука при потере фокуса или рекламе).
 */
class SoundController {
  private ctx: AudioContext | null = null;
  private userMuted: boolean = false;
  private systemPaused: boolean = false; // При сворачивании вкладки или показе рекламы YaGames

  private getContext(): AudioContext | null {
    if (this.userMuted || this.systemPaused) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setUserMuted(muted: boolean): void {
    this.userMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public isUserMuted(): boolean {
    return this.userMuted;
  }

  public setSystemPaused(paused: boolean): void {
    this.systemPaused = paused;
    looksmaxMusic.setSystemPaused(paused);
    if (this.ctx) {
      if (paused && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      } else if (!paused && !this.userMuted && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  /**
   * Короткий тактильный звук при обычном клике (мьюинге).
   */
  public playClick(comboMultiplier = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const pitchBoost = Math.min(220, (comboMultiplier - 1) * 90);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 + pitchBoost, now);
      osc.frequency.exponentialRampToValueAtTime(110 + pitchBoost * 0.5, now + 0.065);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Игнорируем ошибки автовоспроизведения до первого клика
    }
  }

  /**
   * Мощный металлический удар ортопедического молотка (при критическом бонсмэшинге).
   */
  public playHammerCrit(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(175, now);
      osc1.frequency.exponentialRampToValueAtTime(52, now + 0.16);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(680, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.11);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  /**
   * Звук покупки мази или инструмента в магазине.
   */
  public playUpgradeBuy(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(587.33, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  /**
   * Фанфара повышения ранга внешности (Sub 3 -> Sub 5 -> ... -> True Adam).
   */
  public playRankUp(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [392.0, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.065;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Глубокий аккорд смены поколения (Генетический Реборн).
   */
  public playRebirth(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chord = [261.63, 329.63, 392.0, 523.25, 659.25];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.11, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.46);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundController();

/**
 * Устанавливает обязательные обработчики для прохождения модерации Яндекс Игр:
 * 1. Запрет контекстного меню по правому клику / долгому тапу
 * 2. Пауза звука при сворачивании вкладки или переключении окна браузера
 */
export function installYandexGamesPlatformGuards(): () => void {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  const handleVisibilityChange = () => {
    soundEngine.setSystemPaused(document.hidden);
  };

  const handlePageUnload = () => {
    soundEngine.setSystemPaused(true);
    looksmaxMusic.shutdown();
  };

  window.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handlePageUnload);
  window.addEventListener('pagehide', handlePageUnload);
  window.addEventListener('unload', handlePageUnload);

  return () => {
    window.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handlePageUnload);
    window.removeEventListener('pagehide', handlePageUnload);
    window.removeEventListener('unload', handlePageUnload);
  };
}
