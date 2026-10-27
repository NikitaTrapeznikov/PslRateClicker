/**
 * Полноформатный двухдековый MP3-аудиоплеер (Deck A + Deck B) с плавным переходом (Crossfade)
 * для 16 полных мемных треков луксмаксинга, раздаваемых напрямую с локального сервера приложения
 * (/assets/music/track_01.mp3 .. track_16.mp3) без блокировок внешних доменов.
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
    id: 'sleepwalker_x_icewhore',
    title: 'Sleepwalker × ICEWHORE! (Slowed Extended)',
    artist: 'akiaura × Lumi Athena',
    memeTag: 'Главный гимн мьюинга (Полный микс)',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_01.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/81/6c/00/816c006f-801a-e5d3-38fb-ed3f80769962/mzaf_4780956237814330381.plus.aac.p.m4a',
  },
  {
    id: 'eeyuh_x_fluxxwave',
    title: 'EEYUH! × Fluxxwave (Slowed + Reverb)',
    artist: 'Clovis Reyes × Irokz',
    memeTag: 'Эдиты с Jordan Barrett и Chico',
    durationHint: '1:55',
    streamUrl: '/assets/music/track_02.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7b/d1/bd/7bd1bd96-8684-cf91-f820-ec822031b9f0/mzaf_15607841787987664513.plus.aac.p.m4a',
  },
  {
    id: 'ecstacy_slowed_perfection',
    title: 'Ecstacy (Slowed to Perfection)',
    artist: 'SUICIDAL-IDOL',
    memeTag: 'Классика TikTok Looksmax',
    durationHint: '3:54',
    streamUrl: '/assets/music/track_03.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/47/69/4a/47694ae9-c171-9947-8db4-ee24de07b4dd/mzaf_2889285358440161229.plus.aac.p.m4a',
  },
  {
    id: 'sleepwalker_full_slowed',
    title: 'Sleepwalker (Ultra Slowed)',
    artist: 'akiaura, LONOWN & STM',
    memeTag: 'Ночной бонсмэшинг',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_04.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/46/2e/c2/462ec2c5-4be2-bf1e-7f54-3c17f5099012/mzaf_1669857085612465611.plus.aac.p.m4a',
  },
  {
    id: 'lost_soul_down_slowed',
    title: 'The Lost Soul Down × Lost Soul (Slowed)',
    artist: 'NBSPLV',
    memeTag: 'Холодный взгляд Hunter Eyes',
    durationHint: '2:44',
    streamUrl: '/assets/music/track_05.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/97/ea/04/97ea047f-4d90-c1d3-fc0f-4b266553a113/mzaf_8478242493993484447.plus.aac.p.m4a',
  },
  {
    id: 'memory_reboot_full',
    title: 'Memory Reboot (Full Synth Version)',
    artist: 'VØJ & Narvent',
    memeTag: 'Восхождение до True Adam',
    durationHint: '3:56',
    streamUrl: '/assets/music/track_06.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6d/98/20/6d9820e4-4453-20c4-3706-8407511183cc/mzaf_17555219195355900917.plus.aac.p.m4a',
  },
  {
    id: 'metamorphosis_interworld_full',
    title: 'METAMORPHOSIS (Full Track)',
    artist: 'INTERWORLD',
    memeTag: 'Гониальный угол 120°',
    durationHint: '2:22',
    streamUrl: '/assets/music/track_07.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bd/b8/28/bdb828dd-850d-cc23-d505-eb732924a31d/mzaf_11930869156490308194.plus.aac.p.m4a',
  },
  {
    id: 'close_eyes_dvrst_full',
    title: 'Close Eyes (Full Drift Phonk)',
    artist: 'DVRST',
    memeTag: 'Аура Chadlite',
    durationHint: '2:12',
    streamUrl: '/assets/music/track_08.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/4d/69/89/4d69898f-b8df-9ca0-5dbc-3b34e85fe7f2/mzaf_16602414006798813893.plus.aac.p.m4a',
  },
  {
    id: 'sahara_hensonn_full',
    title: 'Sahara (Full Remix)',
    artist: 'Hensonn',
    memeTag: 'Выдвинутая максилла',
    durationHint: '3:16',
    streamUrl: '/assets/music/track_09.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/5a/e7/a7/5ae7a76f-7460-bb18-bfab-02bb6c90020b/mzaf_15685735625886950974.plus.aac.p.m4a',
  },
  {
    id: 'murder_in_my_mind_extended',
    title: 'Murder In My Mind (Extended Gym Mix)',
    artist: 'KORDHELL',
    memeTag: 'Сушка в зале до 10% жира',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_10.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d2/5e/58/d25e5802-25f7-bd23-109e-5fd9a2ac5d1d/mzaf_3262384288922300118.plus.aac.p.m4a',
  },
  {
    id: 'after_dark_mrkitty_full',
    title: 'After Dark (Full Track)',
    artist: 'Mr.Kitty',
    memeTag: 'Вечерний курс ретинола 0.1%',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_11.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3e/cb/52/3ecb5294-5ea1-e392-7262-1b10cc67a299/mzaf_17548677748266742699.plus.aac.p.m4a',
  },
  {
    id: 'the_perfect_girl_mareux_full',
    title: 'The Perfect Girl (Full Version)',
    artist: 'Mareux',
    memeTag: 'Симметрия золотого сечения',
    durationHint: '3:14',
    streamUrl: '/assets/music/track_12.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/43/4a/de/434ade34-6dd1-0346-57c8-89e793506ffa/mzaf_2755628340755959823.plus.aac.p.m4a',
  },
  {
    id: 'sudno_molchat_doma',
    title: 'Судно (Sudno · Doomer to Chad Arc)',
    artist: 'Молчат Дома',
    memeTag: 'Старт пути с Sub 3',
    durationHint: '2:25',
    streamUrl: '/assets/music/track_13.mp3',
    fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'streets_silhouette_mog',
    title: 'Streets (Silhouette Mog Remix)',
    artist: 'Slowed Aesthetic Edit',
    memeTag: 'Плавный переход скул',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_14.mp3',
    fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'montagem_batchi_phonk',
    title: 'MONTAGEM BATCHI (Slowed Phonk)',
    artist: 'MXZI',
    memeTag: 'Агрессивный бонсмэшинг молотком',
    durationHint: '1:26',
    streamUrl: '/assets/music/track_15.mp3',
    fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'crystal_castles_kerosene_mix',
    title: 'Kerosene & Darkwave (Extended Mix)',
    artist: 'Crystal Castles',
    memeTag: 'Зимняя арка (Winter Arc)',
    durationHint: '4:00',
    streamUrl: '/assets/music/track_16.mp3',
    fallbackUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/55/2b/c6/552bc64b-dc54-46e1-2874-32e7bce2ba78/mzaf_4776738312820021495.plus.aac.p.m4a',
  },
];

const AUTO_CROSSFADE_SECONDS = 4.0;
const MANUAL_CROSSFADE_SECONDS = 1.4;

class DualDeckCrossfadeController {
  private deckA: HTMLAudioElement | null = null;
  private deckB: HTMLAudioElement | null = null;
  private activeSlot: 'A' | 'B' = 'A';

  private isPlaying = false;
  private systemPaused = false;
  private isLoading = false;
  private isCrossfading = false;

  private masterVolume = 0.55;
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

  constructor() {
    if (typeof window !== 'undefined') {
      this.deckA = this.createDeckElement('A');
      this.deckB = this.createDeckElement('B');
      this.prepareDeck(this.deckA, 0);
      this.syncPhysicalVolumes();
    }
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
        this.isPlaying &&
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

    el.addEventListener('error', () => {
      if (this.activeSlot !== slot) return;
      const track = this.getCurrentTrack();
      if (!el.src.includes('itunes.apple.com') && !el.src.includes('soundhelix.com')) {
        el.src = track.fallbackUrl;
        el.load();
        if (this.isPlaying && !this.systemPaused) {
          el.play().catch(() => {});
        }
      } else {
        this.isLoading = false;
        this.notify();
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
    deck.src = track.streamUrl;
    deck.load();
    this.applyPlaybackRateToDeck(deck);
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

    if (!this.isPlaying || this.systemPaused) {
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
      this.deckAVolumeFactor = 0.15;
      this.deckBVolumeFactor = 0.85;
    } else {
      this.deckBVolumeFactor = 0.15;
      this.deckAVolumeFactor = 0.85;
    }
    this.syncPhysicalVolumes();

    if (incomingDeck) {
      const playPromise = incomingDeck.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err?.name === 'NotAllowedError') {
            this.isPlaying = false;
            this.isCrossfading = false;
            this.notify();
          }
        });
      }
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
    return this.isPlaying && !this.systemPaused;
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
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.syncPhysicalVolumes();
    this.notify();
  }

  public seekTo(seconds: number): void {
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
    if (autoPlay && !this.isPlaying) {
      this.isPlaying = true;
    }
    if (index === this.currentTrackIndex && this.isPlaying) {
      this.seekTo(0);
      return;
    }
    this.crossfadeToTrack(index, MANUAL_CROSSFADE_SECONDS);
  }

  public nextTrack(autoPlay = true): void {
    if (autoPlay && !this.isPlaying) {
      this.isPlaying = true;
    }
    this.crossfadeToTrack(this.currentTrackIndex + 1, MANUAL_CROSSFADE_SECONDS);
  }

  public prevTrack(): void {
    const active = this.getActiveDeck();
    if (active && active.currentTime > 5) {
      this.seekTo(0);
      return;
    }
    if (!this.isPlaying) {
      this.isPlaying = true;
    }
    this.crossfadeToTrack(this.currentTrackIndex - 1, MANUAL_CROSSFADE_SECONDS);
  }

  public togglePlay(): void {
    const active = this.getActiveDeck();
    if (!active) return;

    if (this.isPlaying) {
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
      this.isPlaying = true;
      this.deckAVolumeFactor = this.activeSlot === 'A' ? 1 : 0;
      this.deckBVolumeFactor = this.activeSlot === 'B' ? 1 : 0;
      this.syncPhysicalVolumes();

      if (!active.src) {
        this.prepareDeck(active, this.currentTrackIndex);
      }
      this.applyPlaybackRateToDeck(active);

      const playPromise = active.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err?.name === 'NotAllowedError') {
            this.isPlaying = false;
            this.notify();
          }
        });
      }
      this.notify();
    }
  }

  public setSystemPaused(paused: boolean): void {
    this.systemPaused = paused;
    if (paused) {
      this.deckA?.pause();
      this.deckB?.pause();
    } else if (this.isPlaying) {
      const active = this.getActiveDeck();
      active?.play().catch(() => {});
    }
    this.notify();
  }
}

export const looksmaxMusic = new DualDeckCrossfadeController();
