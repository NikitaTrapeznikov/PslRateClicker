/**
 * Полноформатный двухдековый MP3-аудиоплеер (Deck A + Deck B) с плавным переходом (Crossfade)
 * для 16 полных мемных треков луксмаксинга.
 *
 * Архитектура хранения и воспроизведения:
 * 1. Все 16 MP3-файлов уже скачаны в проект (/public/assets/music/track_01.mp3 .. track_16.mp3).
 * 2. В браузере каждый трек кэшируется в оперативной памяти (RAM Blob URL Cache), поэтому
 *    он не скачивается заново при переключениях или повторах и не зависит от внешних сайтов.
 * 3. Стартовая громкость установлена на 10% (0.1), музыка играет непрерывно, пока ее
 *    не поставят на паузу вручную или не свернут вкладку браузера.
 */

export interface LooksmaxTrack {
  id: string;
  title: string;
  artist: string;
  memeTag: string;
  durationHint: string;
  streamUrl: string;
  fallbackUrl: string;
}

export const LOOKSMAX_PLAYLIST: LooksmaxTrack[] = [
  {
    id: 'revolver_dj_zup_raiii',
    title: 'револьвер (Оригинал SoundCloud)',
    artist: 'DJ ZUP RAlii (sadcircus)',
    memeTag: 'Что ты можешь сказать, например?',
    durationHint: '1:13',
    streamUrl: '/assets/music/revolver_original_sc.mp3',
    fallbackUrl: '/assets/music/revolver_original_sc.mp3',
  },
  {
    id: 'sleepwalker_x_icewhore',
    title: 'Sleepwalker × ICEWHORE! (Slowed Extended)',
    artist: 'akiaura × Lumi Athena',
    memeTag: 'Главный гимн мьюинга (Полный микс)',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_01.mp3',
    fallbackUrl: '/assets/music/track_01.mp3',
  },
  {
    id: 'eeyuh_x_fluxxwave',
    title: 'EEYUH! × Fluxxwave (Slowed + Reverb)',
    artist: 'Clovis Reyes × Irokz',
    memeTag: 'Эдиты с Jordan Barrett и Chico',
    durationHint: '1:55',
    streamUrl: '/assets/music/track_02.mp3',
    fallbackUrl: '/assets/music/track_02.mp3',
  },
  {
    id: 'ecstacy_slowed_perfection',
    title: 'Ecstacy (Slowed to Perfection)',
    artist: 'SUICIDAL-IDOL',
    memeTag: 'Классика TikTok Looksmax',
    durationHint: '3:54',
    streamUrl: '/assets/music/track_03.mp3',
    fallbackUrl: '/assets/music/track_03.mp3',
  },
  {
    id: 'sleepwalker_full_slowed',
    title: 'Sleepwalker (Ultra Slowed)',
    artist: 'akiaura, LONOWN & STM',
    memeTag: 'Ночной бонсмэшинг',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_04.mp3',
    fallbackUrl: '/assets/music/track_04.mp3',
  },
  {
    id: 'lost_soul_down_slowed',
    title: 'The Lost Soul Down × Lost Soul (Slowed)',
    artist: 'NBSPLV',
    memeTag: 'Холодный взгляд Hunter Eyes',
    durationHint: '2:44',
    streamUrl: '/assets/music/track_05.mp3',
    fallbackUrl: '/assets/music/track_05.mp3',
  },
  {
    id: 'memory_reboot_full',
    title: 'Memory Reboot (Full Synth Version)',
    artist: 'VØJ & Narvent',
    memeTag: 'Восхождение до True Adam',
    durationHint: '3:56',
    streamUrl: '/assets/music/track_06.mp3',
    fallbackUrl: '/assets/music/track_06.mp3',
  },
  {
    id: 'metamorphosis_interworld_full',
    title: 'METAMORPHOSIS (Full Track)',
    artist: 'INTERWORLD',
    memeTag: 'Гониальный угол 120°',
    durationHint: '2:22',
    streamUrl: '/assets/music/track_07.mp3',
    fallbackUrl: '/assets/music/track_07.mp3',
  },
  {
    id: 'close_eyes_dvrst_full',
    title: 'Close Eyes (Full Drift Phonk)',
    artist: 'DVRST',
    memeTag: 'Аура Chadlite',
    durationHint: '2:12',
    streamUrl: '/assets/music/track_08.mp3',
    fallbackUrl: '/assets/music/track_08.mp3',
  },
  {
    id: 'sahara_hensonn_full',
    title: 'Sahara (Full Remix)',
    artist: 'Hensonn',
    memeTag: 'Выдвинутая максилла',
    durationHint: '3:16',
    streamUrl: '/assets/music/track_09.mp3',
    fallbackUrl: '/assets/music/track_09.mp3',
  },
  {
    id: 'murder_in_my_mind_extended',
    title: 'Murder In My Mind (Extended Gym Mix)',
    artist: 'KORDHELL',
    memeTag: 'Сушка в зале до 10% жира',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_10.mp3',
    fallbackUrl: '/assets/music/track_10.mp3',
  },
  {
    id: 'after_dark_mrkitty_full',
    title: 'After Dark (Full Track)',
    artist: 'Mr.Kitty',
    memeTag: 'Вечерний курс ретинола 0.1%',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_11.mp3',
    fallbackUrl: '/assets/music/track_11.mp3',
  },
  {
    id: 'the_perfect_girl_mareux_full',
    title: 'The Perfect Girl (Full Version)',
    artist: 'Mareux',
    memeTag: 'Симметрия золотого сечения',
    durationHint: '3:14',
    streamUrl: '/assets/music/track_12.mp3',
    fallbackUrl: '/assets/music/track_12.mp3',
  },
  {
    id: 'streets_silhouette_mog',
    title: 'Streets (Silhouette Mog Remix)',
    artist: 'Slowed Aesthetic Edit',
    memeTag: 'Плавный переход скул',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_14.mp3',
    fallbackUrl: '/assets/music/track_14.mp3',
  },
  {
    id: 'montagem_batchi_phonk',
    title: 'MONTAGEM BATCHI (Slowed Phonk)',
    artist: 'MXZI',
    memeTag: 'Агрессивный бонсмэшинг молотком',
    durationHint: '1:26',
    streamUrl: '/assets/music/track_15.mp3',
    fallbackUrl: '/assets/music/track_15.mp3',
  },
  {
    id: 'crystal_castles_kerosene_mix',
    title: 'Kerosene & Darkwave (Extended Mix)',
    artist: 'Crystal Castles',
    memeTag: 'Зимняя арка (Winter Arc)',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_16.mp3',
    fallbackUrl: '/assets/music/track_16.mp3',
  },
];

const AUTO_CROSSFADE_SECONDS = 4.0;
const MANUAL_CROSSFADE_SECONDS = 1.4;

class DualDeckCrossfadeController {
  private deckA: HTMLAudioElement | null = null;
  private deckB: HTMLAudioElement | null = null;
  private activeSlot: 'A' | 'B' = 'A';

  private isPlaying = true;
  private userExplicitlyPaused = false;
  private systemPaused = false;
  private isLoading = false;
  private isCrossfading = false;

  // Стартовая громкость ровно 10% (0.1) по запросу пользователя
  private masterVolume = 0.1;
  private deckAVolumeFactor = 1.0;
  private deckBVolumeFactor = 0.0;

  private slowedMode = false;
  private loopSingle = false;
  private currentTrackIndex = 0;
  private currentTime = 0;
  private duration = 0;

  private fadeIntervalId: number | null = null;
  private autoCrossfadeTriggered = false;
  private listeners: Set<() => void> = new Set();

  // Кэш уже загруженных локальных MP3-файлов в оперативной памяти (blob: URL)
  private blobUrlCache: Map<string, string> = new Map();
  private pendingFetches: Map<string, Promise<string>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.deckA = this.createDeckElement('A');
      this.deckB = this.createDeckElement('B');
      this.syncPhysicalVolumes();
      this.prepareDeck(this.deckA, 0);
      this.preloadTrackIntoMemory(1);
      this.initContinuousPlayback();
    }
  }

  /**
   * Загружает локальный файл из /assets/music/ один раз в Blob URL в памяти браузера,
   * чтобы исключить повторное скачивание и проблемы с HTTP Range запросами.
   */
  private getOrLoadBlobUrl(streamUrl: string): Promise<string> {
    const cached = this.blobUrlCache.get(streamUrl);
    if (cached) return Promise.resolve(cached);

    const existingPromise = this.pendingFetches.get(streamUrl);
    if (existingPromise) return existingPromise;

    const promise = fetch(streamUrl, { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.blobUrlCache.set(streamUrl, objectUrl);
        this.pendingFetches.delete(streamUrl);
        return objectUrl;
      })
      .catch(() => {
        this.pendingFetches.delete(streamUrl);
        return streamUrl;
      });

    this.pendingFetches.set(streamUrl, promise);
    return promise;
  }

  private preloadTrackIntoMemory(trackIndex: number): void {
    const normalizedIdx =
      ((trackIndex % LOOKSMAX_PLAYLIST.length) + LOOKSMAX_PLAYLIST.length) %
      LOOKSMAX_PLAYLIST.length;
    const track = LOOKSMAX_PLAYLIST[normalizedIdx];
    this.getOrLoadBlobUrl(track.streamUrl).catch(() => {});
  }

  /**
   * Гарантирует, что музыка всегда играет с самого старта (пока пользователь сам не нажмет «Пауза»
   * или не свернет вкладку браузера).
   */
  private initContinuousPlayback(): void {
    const ensurePlaying = () => {
      if (this.userExplicitlyPaused || this.systemPaused || this.isCrossfading) {
        return;
      }
      const active = this.getActiveDeck();
      if (!active) return;

      if (!active.src) {
        this.prepareDeck(active, this.currentTrackIndex);
      }
      if (active.paused) {
        this.syncPhysicalVolumes();
        this.applyPlaybackRateToDeck(active);
        active
          .play()
          .then(() => {
            this.isPlaying = true;
            this.notify();
          })
          .catch(() => {
            // Браузер может ждать первого клика по странице после открытия вкладки
          });
      }
    };

    // Любое действие пользователя на странице разблокирует Web Audio / HTML5 Audio, если автоплей был отложен браузером
    const onUserInteraction = () => {
      ensurePlaying();
    };

    window.addEventListener('pointerdown', onUserInteraction, { capture: true, passive: true });
    window.addEventListener('keydown', onUserInteraction, { capture: true, passive: true });
    window.addEventListener('click', onUserInteraction, { capture: true, passive: true });

    // Сторожевой таймер: если музыка не поставлена на паузу пользователем и вкладка открыта — держим воспроизведение активным
    window.setInterval(() => {
      ensurePlaying();
    }, 1200);

    setTimeout(ensurePlaying, 100);
  }

  private createDeckElement(slot: 'A' | 'B'): HTMLAudioElement {
    const el = new Audio();
    el.preload = 'auto';

    el.addEventListener('timeupdate', () => {
      if (this.activeSlot !== slot) return;
      this.currentTime = el.currentTime || 0;
      if (Number.isFinite(el.duration) && el.duration > 0) {
        this.duration = el.duration;
      }

      if (
        !this.userExplicitlyPaused &&
        !this.systemPaused &&
        !this.isCrossfading &&
        !this.autoCrossfadeTriggered &&
        this.duration > AUTO_CROSSFADE_SECONDS * 2 &&
        this.duration - this.currentTime <= AUTO_CROSSFADE_SECONDS
      ) {
        this.autoCrossfadeTriggered = true;
        const nextIdx = this.loopSingle
          ? this.currentTrackIndex
          : (this.currentTrackIndex + 1) % LOOKSMAX_PLAYLIST.length;
        this.crossfadeToTrack(nextIdx, AUTO_CROSSFADE_SECONDS);
      }

      this.notify();
    });

    el.addEventListener('loadedmetadata', () => {
      if (this.activeSlot !== slot) return;
      this.duration = Number.isFinite(el.duration) ? el.duration : 0;
      this.isLoading = false;
      this.applyPlaybackRateToDeck(el);
      this.notify();
    });

    el.addEventListener('canplay', () => {
      if (this.activeSlot !== slot) return;
      this.isLoading = false;
      if (!this.userExplicitlyPaused && !this.systemPaused && el.paused) {
        el.play().catch(() => {});
      }
      this.notify();
    });

    el.addEventListener('playing', () => {
      if (this.activeSlot !== slot) return;
      this.isLoading = false;
      this.isPlaying = true;
      this.applyPlaybackRateToDeck(el);
      this.notify();
    });

    el.addEventListener('ended', () => {
      if (this.activeSlot !== slot) {
        el.pause();
        return;
      }
      if (!this.isCrossfading) {
        const nextIdx = this.loopSingle
          ? this.currentTrackIndex
          : (this.currentTrackIndex + 1) % LOOKSMAX_PLAYLIST.length;
        this.crossfadeToTrack(nextIdx, 1.2);
      }
    });

    return el;
  }

  private getActiveDeck(): HTMLAudioElement | null {
    return this.activeSlot === 'A' ? this.deckA : this.deckB;
  }

  private getInactiveDeck(): HTMLAudioElement | null {
    return this.activeSlot === 'A' ? this.deckB : this.deckA;
  }

  private prepareDeck(deck: HTMLAudioElement | null, trackIndex: number): void {
    if (!deck) return;
    const normalizedIdx =
      ((trackIndex % LOOKSMAX_PLAYLIST.length) + LOOKSMAX_PLAYLIST.length) %
      LOOKSMAX_PLAYLIST.length;
    const track = LOOKSMAX_PLAYLIST[normalizedIdx];

    const cachedBlobUrl = this.blobUrlCache.get(track.streamUrl);
    if (cachedBlobUrl) {
      deck.src = cachedBlobUrl;
      deck.load();
      this.applyPlaybackRateToDeck(deck);
    } else {
      // Ставим прямой локальный путь сразу, а параллельно кэшируем в Blob-память для следующих проигрываний
      deck.src = track.streamUrl;
      deck.load();
      this.applyPlaybackRateToDeck(deck);
      this.getOrLoadBlobUrl(track.streamUrl).catch(() => {});
    }

    // Предзагружаем следующий трек в память заранее
    this.preloadTrackIntoMemory(normalizedIdx + 1);
  }

  private applyPlaybackRateToDeck(deck: HTMLAudioElement | null): void {
    if (!deck) return;
    const rate = this.slowedMode ? 0.85 : 1.0;
    const ext = deck as HTMLAudioElement & {
      preservesPitch?: boolean;
      mozPreservesPitch?: boolean;
      webkitPreservesPitch?: boolean;
    };
    if ('preservesPitch' in ext) ext.preservesPitch = !this.slowedMode;
    if ('mozPreservesPitch' in ext) ext.mozPreservesPitch = !this.slowedMode;
    if ('webkitPreservesPitch' in ext) ext.webkitPreservesPitch = !this.slowedMode;
    deck.playbackRate = rate;
  }

  private syncPhysicalVolumes(): void {
    if (this.deckA) {
      this.deckA.volume = Math.max(
        0,
        Math.min(1, this.masterVolume * this.deckAVolumeFactor)
      );
    }
    if (this.deckB) {
      this.deckB.volume = Math.max(
        0,
        Math.min(1, this.masterVolume * this.deckBVolumeFactor)
      );
    }
  }

  private crossfadeToTrack(nextTrackIndex: number, fadeDurationSec: number): void {
    this.systemPaused = false;
    const normalizedIdx =
      ((nextTrackIndex % LOOKSMAX_PLAYLIST.length) + LOOKSMAX_PLAYLIST.length) %
      LOOKSMAX_PLAYLIST.length;

    const outgoingSlot = this.activeSlot;
    const incomingSlot: 'A' | 'B' = outgoingSlot === 'A' ? 'B' : 'A';
    const outgoingDeck = this.getActiveDeck();
    const incomingDeck = this.getInactiveDeck();

    if (this.fadeIntervalId !== null) {
      window.clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }

    this.activeSlot = incomingSlot;
    this.currentTrackIndex = normalizedIdx;
    this.currentTime = 0;
    this.duration = 0;
    this.autoCrossfadeTriggered = false;
    this.isLoading = true;

    this.prepareDeck(incomingDeck, normalizedIdx);

    if (this.userExplicitlyPaused) {
      if (outgoingDeck) outgoingDeck.pause();
      this.deckAVolumeFactor = incomingSlot === 'A' ? 1 : 0;
      this.deckBVolumeFactor = incomingSlot === 'B' ? 1 : 0;
      this.syncPhysicalVolumes();
      this.isCrossfading = false;
      this.isLoading = false;
      this.notify();
      return;
    }

    this.isCrossfading = true;
    if (incomingSlot === 'A') {
      this.deckAVolumeFactor = 0.2;
      this.deckBVolumeFactor = 0.8;
    } else {
      this.deckBVolumeFactor = 0.2;
      this.deckAVolumeFactor = 0.8;
    }
    this.syncPhysicalVolumes();

    if (incomingDeck) {
      incomingDeck.play().catch(() => {});
    }

    const stepMs = 50;
    const totalSteps = Math.max(8, Math.floor((fadeDurationSec * 1000) / stepMs));
    let currentStep = 0;

    this.fadeIntervalId = window.setInterval(() => {
      currentStep++;
      const t = Math.min(1, currentStep / totalSteps);
      const smoothT = t * t * (3 - 2 * t);

      if (incomingSlot === 'A') {
        this.deckAVolumeFactor = smoothT;
        this.deckBVolumeFactor = 1 - smoothT;
      } else {
        this.deckBVolumeFactor = smoothT;
        this.deckAVolumeFactor = 1 - smoothT;
      }
      this.syncPhysicalVolumes();
      this.notify();

      if (t >= 1) {
        if (this.fadeIntervalId !== null) {
          window.clearInterval(this.fadeIntervalId);
          this.fadeIntervalId = null;
        }
        if (outgoingDeck) {
          outgoingDeck.pause();
        }
        this.isCrossfading = false;
        this.notify();
      }
    }, stepMs);
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }

  public getCurrentTrack(): LooksmaxTrack {
    return LOOKSMAX_PLAYLIST[this.currentTrackIndex] || LOOKSMAX_PLAYLIST[0];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getIsPlaying(): boolean {
    return !this.userExplicitlyPaused && !this.systemPaused && this.isPlaying;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getIsCrossfading(): boolean {
    return this.isCrossfading;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public getSlowedMode(): boolean {
    return this.slowedMode;
  }

  public getLoopSingle(): boolean {
    return this.loopSingle;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public setVolume(val: number): void {
    this.systemPaused = false;
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.syncPhysicalVolumes();
    this.notify();
  }

  public seekTo(seconds: number): void {
    this.systemPaused = false;
    const active = this.getActiveDeck();
    if (!active || !Number.isFinite(active.duration)) return;
    const clamped = Math.max(0, Math.min(active.duration, seconds));
    active.currentTime = clamped;
    this.currentTime = clamped;
    if (active.duration - clamped > AUTO_CROSSFADE_SECONDS + 1) {
      this.autoCrossfadeTriggered = false;
    }
    this.notify();
  }

  public toggleSlowedMode(): void {
    this.slowedMode = !this.slowedMode;
    this.applyPlaybackRateToDeck(this.deckA);
    this.applyPlaybackRateToDeck(this.deckB);
    this.notify();
  }

  public toggleLoopSingle(): void {
    this.loopSingle = !this.loopSingle;
    this.notify();
  }

  public selectTrack(index: number, autoPlay = true): void {
    this.systemPaused = false;
    if (autoPlay) {
      this.userExplicitlyPaused = false;
      this.isPlaying = true;
    }
    const active = this.getActiveDeck();
    if (index === this.currentTrackIndex && active && !active.paused) {
      this.seekTo(0);
      return;
    }
    this.crossfadeToTrack(index, MANUAL_CROSSFADE_SECONDS);
  }

  public nextTrack(autoPlay = true): void {
    this.systemPaused = false;
    if (autoPlay) {
      this.userExplicitlyPaused = false;
      this.isPlaying = true;
    }
    this.crossfadeToTrack(this.currentTrackIndex + 1, MANUAL_CROSSFADE_SECONDS);
  }

  public prevTrack(): void {
    this.systemPaused = false;
    const active = this.getActiveDeck();
    if (active && active.currentTime > 5) {
      this.seekTo(0);
      return;
    }
    this.userExplicitlyPaused = false;
    this.isPlaying = true;
    this.crossfadeToTrack(this.currentTrackIndex - 1, MANUAL_CROSSFADE_SECONDS);
  }

  public togglePlay(): void {
    this.systemPaused = false;
    const active = this.getActiveDeck();
    if (!active) return;

    if (!this.userExplicitlyPaused) {
      this.userExplicitlyPaused = true;
      this.isPlaying = false;
      this.deckA?.pause();
      this.deckB?.pause();
      if (this.fadeIntervalId !== null) {
        window.clearInterval(this.fadeIntervalId);
        this.fadeIntervalId = null;
      }
      this.isCrossfading = false;
      this.notify();
    } else {
      this.userExplicitlyPaused = false;
      this.isPlaying = true;
      this.deckAVolumeFactor = this.activeSlot === 'A' ? 1 : 0;
      this.deckBVolumeFactor = this.activeSlot === 'B' ? 1 : 0;
      this.syncPhysicalVolumes();

      if (!active.src) {
        this.prepareDeck(active, this.currentTrackIndex);
      }
      this.applyPlaybackRateToDeck(active);
      active.play().catch(() => {});
      this.notify();
    }
  }

  public setSystemPaused(paused: boolean): void {
    this.systemPaused = paused;
    if (paused) {
      this.deckA?.pause();
      this.deckB?.pause();
    } else if (!this.userExplicitlyPaused) {
      this.isPlaying = true;
      const active = this.getActiveDeck();
      active?.play().catch(() => {});
    }
    this.notify();
  }
}

export const looksmaxMusic = new DualDeckCrossfadeController();
