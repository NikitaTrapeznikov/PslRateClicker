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

  private isMainScreenActive = false;
  private isPlaying = false;
  private userExplicitlyPaused = false;
  private systemPaused = false;
  private isLoading = false;
  private isCrossfading = false;

  // Стартовая громкость ровно 5% (0.05) по запросу пользователя
  private masterVolume = 0.05;
  private deckAVolumeFactor = 1.0;
  private deckBVolumeFactor = 0.0;

  private slowedMode = false;
  private loopSingle = false;
  private currentTrackIndex = 0;
  private currentTime = 0;
  private duration = 0;

  private fadeIntervalId: number | null = null;
  private watchdogIntervalId: number | null = null;
  private isUnloading = false;
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

      const handleUnload = () => this.shutdown();
      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('pagehide', handleUnload);
      window.addEventListener('unload', handleUnload);
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
   * Гарантирует, что музыка играет ТОЛЬКО когда активно главное окно приложения (4 основные вкладки),
   * и полностью молчит на этапе загрузки или вне главного экрана.
   */
  private initContinuousPlayback(): void {
    const ensurePlaying = () => {
      if (!this.isMainScreenActive || this.isUnloading) {
        if (this.deckA && !this.deckA.paused) this.deckA.pause();
        if (this.deckB && !this.deckB.paused) this.deckB.pause();
        this.isPlaying = false;
        return;
      }

      if (this.userExplicitlyPaused || this.systemPaused || this.isCrossfading) {
        return;
      }

      const active = this.getActiveDeck();
      const inactive = this.getInactiveDeck();
      if (inactive && !inactive.paused) {
        inactive.pause();
      }
      if (!active) return;

      if (!active.src || active.error) {
        this.prepareDeck(active, this.currentTrackIndex, true);
      }
      if (active.paused) {
        this.syncPhysicalVolumes();
        this.applyPlaybackRateToDeck(active);
        active
          .play()
          .then(() => {
            if (!this.isMainScreenActive || this.isUnloading) {
              active.pause();
              this.isPlaying = false;
              return;
            }
            this.isPlaying = true;
            this.isLoading = false;
            this.notify();
          })
          .catch(() => {
            // Браузер может ждать первого клика по странице
            this.isPlaying = false;
            this.notify();
          });
      }
    };

    const onUserInteraction = () => {
      if (!this.isMainScreenActive) return;
      ensurePlaying();
    };

    window.addEventListener('pointerdown', onUserInteraction, { capture: true, passive: true });
    window.addEventListener('keydown', onUserInteraction, { capture: true, passive: true });
    window.addEventListener('click', onUserInteraction, { capture: true, passive: true });

    this.watchdogIntervalId = window.setInterval(() => {
      ensurePlaying();
    }, 1000);
  }

  private createDeckElement(slot: 'A' | 'B'): HTMLAudioElement {
    const el = new Audio();
    el.preload = 'auto';

    el.addEventListener('timeupdate', () => {
      if (this.activeSlot !== slot) return;
      if (!this.isMainScreenActive || this.isUnloading) {
        if (!el.paused) el.pause();
        return;
      }
      this.currentTime = el.currentTime || 0;
      if (Number.isFinite(el.duration) && el.duration > 0) {
        this.duration = el.duration;
      }

      if (
        this.isMainScreenActive &&
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
      if (this.activeSlot !== slot || this.isUnloading) return;
      this.isLoading = false;
      if (
        this.isMainScreenActive &&
        !this.userExplicitlyPaused &&
        !this.systemPaused &&
        el.paused
      ) {
        el.play().catch(() => {});
      }
      this.notify();
    });

    el.addEventListener('playing', () => {
      if (
        !this.isMainScreenActive ||
        this.isUnloading ||
        this.systemPaused ||
        this.userExplicitlyPaused
      ) {
        el.pause();
        this.isPlaying = false;
        this.notify();
        return;
      }
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

    el.addEventListener('error', () => {
      if (this.activeSlot !== slot || this.isUnloading) return;
      this.isLoading = false;
      const track = LOOKSMAX_PLAYLIST[this.currentTrackIndex] || LOOKSMAX_PLAYLIST[0];
      // Сбрасываем возможный битый blob URL и пробуем прямой локальный поток
      this.blobUrlCache.delete(track.streamUrl);
      if (!el.src.includes('?reload=')) {
        el.src = `${track.streamUrl}?reload=${Date.now()}`;
        el.load();
        if (this.isMainScreenActive && !this.userExplicitlyPaused && !this.systemPaused) {
          el.play().catch(() => {});
        }
      }
      this.notify();
    });

    return el;
  }

  private getActiveDeck(): HTMLAudioElement | null {
    return this.activeSlot === 'A' ? this.deckA : this.deckB;
  }

  private getInactiveDeck(): HTMLAudioElement | null {
    return this.activeSlot === 'A' ? this.deckB : this.deckA;
  }

  private prepareDeck(
    deck: HTMLAudioElement | null,
    trackIndex: number,
    forceDirectStream = false
  ): void {
    if (!deck) return;
    const normalizedIdx =
      ((trackIndex % LOOKSMAX_PLAYLIST.length) + LOOKSMAX_PLAYLIST.length) %
      LOOKSMAX_PLAYLIST.length;
    const track = LOOKSMAX_PLAYLIST[normalizedIdx];

    const cachedBlobUrl = !forceDirectStream
      ? this.blobUrlCache.get(track.streamUrl)
      : undefined;
    if (cachedBlobUrl) {
      deck.src = cachedBlobUrl;
      deck.load();
      this.applyPlaybackRateToDeck(deck);
    } else {
      // Ставим прямой локальный путь сразу, а параллельно кэшируем в Blob-память для следующих проигрываний
      deck.src = forceDirectStream
        ? `${track.streamUrl}?r=${Date.now()}`
        : track.streamUrl;
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
    return (
      this.isMainScreenActive &&
      !this.userExplicitlyPaused &&
      !this.systemPaused &&
      this.isPlaying
    );
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

  /**
   * Полный перезапуск (Reload) аудио-плеера:
   * Сбрасывает зависшие кроссфейды, пересоздает оба HTMLAudioElement (Deck A и Deck B),
   * очищает кэш текущего трека и принудительно запускает воспроизведение.
   */
  public reloadPlayer(): void {
    if (this.fadeIntervalId !== null) {
      window.clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }

    // Останавливаем и очищаем старые деки
    try {
      if (this.deckA) {
        this.deckA.pause();
        this.deckA.removeAttribute('src');
        this.deckA.load();
      }
      if (this.deckB) {
        this.deckB.pause();
        this.deckB.removeAttribute('src');
        this.deckB.load();
      }
    } catch {
      // ignore cleanup errors
    }

    const currentTrack =
      LOOKSMAX_PLAYLIST[this.currentTrackIndex] || LOOKSMAX_PLAYLIST[0];
    const oldBlobUrl = this.blobUrlCache.get(currentTrack.streamUrl);
    if (oldBlobUrl) {
      try {
        URL.revokeObjectURL(oldBlobUrl);
      } catch {
        // ignore
      }
      this.blobUrlCache.delete(currentTrack.streamUrl);
    }
    this.pendingFetches.delete(currentTrack.streamUrl);

    // Пересоздаем свежие аудио-элементы
    this.deckA = this.createDeckElement('A');
    this.deckB = this.createDeckElement('B');
    this.activeSlot = 'A';
    this.deckAVolumeFactor = 1.0;
    this.deckBVolumeFactor = 0.0;

    if (this.masterVolume <= 0) {
      this.masterVolume = 0.05;
    }

    this.isUnloading = false;
    this.isMainScreenActive = true;
    this.systemPaused = false;
    this.userExplicitlyPaused = false;
    this.isCrossfading = false;
    this.autoCrossfadeTriggered = false;
    this.currentTime = 0;
    this.duration = 0;
    this.isLoading = true;
    this.isPlaying = true;

    this.syncPhysicalVolumes();
    this.prepareDeck(this.deckA, this.currentTrackIndex, true);

    if (this.deckA) {
      this.applyPlaybackRateToDeck(this.deckA);
      this.deckA
        .play()
        .then(() => {
          this.isPlaying = true;
          this.isLoading = false;
          this.notify();
        })
        .catch(() => {
          this.isLoading = false;
          this.notify();
        });
    }

    this.notify();
  }

  public setSystemPaused(paused: boolean): void {
    this.systemPaused = paused;
    if (paused || !this.isMainScreenActive) {
      this.deckA?.pause();
      this.deckB?.pause();
    } else if (this.isMainScreenActive && !this.userExplicitlyPaused) {
      this.isPlaying = true;
      const active = this.getActiveDeck();
      if (active && active.paused) {
        active.play().catch(() => {});
      }
    }
    this.notify();
  }

  /**
   * Прямая привязка плеера к главному экрану приложения (4 основные вкладки: Арена, Эволюция, Поколения, Рейтинг).
   * На экране загрузки или в любом другом состоянии плеер жестко выключен.
   */
  public setMainScreenActive(active: boolean): void {
    this.isMainScreenActive = active;

    if (!active) {
      if (this.fadeIntervalId !== null) {
        window.clearInterval(this.fadeIntervalId);
        this.fadeIntervalId = null;
      }
      this.isCrossfading = false;
      this.isPlaying = false;
      this.deckA?.pause();
      this.deckB?.pause();
      this.notify();
      return;
    }

    this.isUnloading = false;
    if (!this.userExplicitlyPaused && !this.systemPaused) {
      this.isPlaying = true;
      const inactive = this.getInactiveDeck();
      if (!this.isCrossfading && inactive && !inactive.paused) {
        inactive.pause();
      }
      const activeDeck = this.getActiveDeck() || this.deckA;
      if (activeDeck) {
        if (!activeDeck.src) {
          this.prepareDeck(activeDeck, this.currentTrackIndex);
        }
        this.syncPhysicalVolumes();
        this.applyPlaybackRateToDeck(activeDeck);
        if (activeDeck.paused) {
          activeDeck.play().catch(() => {
            this.isPlaying = false;
            this.notify();
          });
        }
      }
    }
    this.notify();
  }

  /**
   * Простая проверка физического наличия звука из плеера в данный момент:
   * активная дека реально воспроизводит аудио (не на паузе, громкость > 0, буфер готов, время > 0).
   */
  public isAudioActuallyPlaying(): boolean {
    const active = this.getActiveDeck();
    if (!active) return false;
    return (
      this.isMainScreenActive &&
      !active.paused &&
      !active.ended &&
      !active.muted &&
      active.volume > 0 &&
      active.readyState >= 2 &&
      active.currentTime > 0
    );
  }

  /**
   * Гарантирует полную загрузку и буферизацию трека для экрана загрузки (БЕЗ запуска воспроизведения).
   */
  public async ensureTrackLoaded(trackIndex = 0): Promise<void> {
    const track = LOOKSMAX_PLAYLIST[trackIndex] || LOOKSMAX_PLAYLIST[0];
    const active = this.getActiveDeck() || this.deckA;
    if (!active) return;

    if (active.readyState >= 2) {
      this.getOrLoadBlobUrl(track.streamUrl).catch(() => {});
      return;
    }

    const blobUrl = await Promise.race([
      this.getOrLoadBlobUrl(track.streamUrl),
      new Promise<string>((resolve) => setTimeout(() => resolve(track.streamUrl), 2500)),
    ]);

    if (active.readyState < 2 && active.src !== blobUrl && !active.src.endsWith(track.streamUrl)) {
      active.src = blobUrl;
      active.load();
    }

    if (active.readyState >= 2) {
      return;
    }

    return new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        active.removeEventListener('canplay', finish);
        active.removeEventListener('loadeddata', finish);
        active.removeEventListener('loadedmetadata', finish);
        active.removeEventListener('error', finish);
        resolve();
      };

      active.addEventListener('canplay', finish, { once: true });
      active.addEventListener('loadeddata', finish, { once: true });
      active.addEventListener('loadedmetadata', finish, { once: true });
      active.addEventListener('error', finish, { once: true });

      setTimeout(finish, 2500);
    });
  }

  /**
   * Вызывается при переходе с экрана загрузки на главный экран
   */
  public startPlaybackWithGesture(): void {
    this.userExplicitlyPaused = false;
    this.systemPaused = false;
    this.setMainScreenActive(true);
  }

  /**
   * Полностью выключает плеер и останавливает оба аудио-потока при обновлении страницы или закрытии приложения.
   */
  public shutdown(): void {
    this.isMainScreenActive = false;
    this.isUnloading = true;
    this.systemPaused = true;
    this.isPlaying = false;
    this.isCrossfading = false;

    if (this.watchdogIntervalId !== null) {
      window.clearInterval(this.watchdogIntervalId);
      this.watchdogIntervalId = null;
    }
    if (this.fadeIntervalId !== null) {
      window.clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }

    if (this.deckA) {
      this.deckA.pause();
      this.deckA.volume = 0;
      this.deckA.removeAttribute('src');
      this.deckA.load();
    }
    if (this.deckB) {
      this.deckB.pause();
      this.deckB.volume = 0;
      this.deckB.removeAttribute('src');
      this.deckB.load();
    }

    this.notify();
  }
}

export const looksmaxMusic = new DualDeckCrossfadeController();
