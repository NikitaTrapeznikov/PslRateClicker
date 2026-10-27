import React, { useEffect, useState } from 'react';
import { LOOKSMAX_PLAYLIST, looksmaxMusic } from '../modules/musicPlayer';

function formatAudioTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const rem = total % 60;
  return `${mins}:${rem.toString().padStart(2, '0')}`;
}

interface LooksmaxDancerGif {
  id: string;
  name: string;
  gifUrl: string;
}

const LOOKSMAX_DANCERS: LooksmaxDancerGif[] = [
  {
    id: 'bo_jack',
    name: 'Bo Jack Mog Dance',
    gifUrl: '/assets/dancers/bo_jack_mog_dance_320x420.gif',
  },
  {
    id: 'clavicular',
    name: 'Clavicular Dance',
    gifUrl: '/assets/dancers/clavicular_dance_320x420.gif',
  },
  {
    id: 'psl_shuffle',
    name: 'PSL Coat Shuffle',
    gifUrl: '/assets/dancers/psl_shuffle_320x420.gif',
  },
  {
    id: 'sigma_mog',
    name: 'Sigma Looksmax Dance',
    gifUrl: '/assets/dancers/looksmaxxing_sigma_dance_320x420.gif',
  },
  {
    id: 'chico_dance',
    name: 'Chico Lachowski Vibe',
    gifUrl: '/assets/dancers/chico_dancing_320x420.gif',
  },
];

export const LooksmaxMusicPlayer: React.FC = () => {
  const [, setTick] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [dancerIndex, setDancerIndex] = useState(0);

  useEffect(() => {
    return looksmaxMusic.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  // Предзагрузка всех 5 GIF в память браузера при старте, чтобы переключение было мгновенным (0 мс)
  useEffect(() => {
    LOOKSMAX_DANCERS.forEach((dancer) => {
      const preloadImg = new Image();
      preloadImg.src = dancer.gifUrl;
    });
  }, []);

  const currentTrack = looksmaxMusic.getCurrentTrack();
  const currentIndex = looksmaxMusic.getCurrentTrackIndex();
  const isPlaying = looksmaxMusic.getIsPlaying();
  const isLoading = looksmaxMusic.getIsLoading();
  const isCrossfading = looksmaxMusic.getIsCrossfading();
  const volume = looksmaxMusic.getVolume();
  const slowedMode = looksmaxMusic.getSlowedMode();
  const loopSingle = looksmaxMusic.getLoopSingle();
  const currentTime = looksmaxMusic.getCurrentTime();
  const duration = looksmaxMusic.getDuration();

  const activeDancerIdx = dancerIndex % LOOKSMAX_DANCERS.length;
  const activeDancer = LOOKSMAX_DANCERS[activeDancerIdx];

  // Свернутая мини-версия плеера с мгновенно переключаемыми зацикленными GIF (320x420 px) по клику на саму плашку
  if (isMinimized) {
    return (
      <div
        onClick={() =>
          setDancerIndex((prev) => (prev + 1) % LOOKSMAX_DANCERS.length)
        }
        title="Нажмите на гифку, чтобы сменить танец"
        className="relative w-full max-w-[320px] mx-auto aspect-[320/420] rounded-xl border border-[#2A343D] bg-[#0F1419] overflow-hidden flex flex-col justify-end shadow-lg cursor-pointer select-none"
      >
        {/* Все 5 GIF смонтированы одновременно в DOM — переключение индекса меняет только прозрачность за 0 мс без перезагрузки */}
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
          {LOOKSMAX_DANCERS.map((dancer, idx) => (
            <img
              key={dancer.id}
              src={dancer.gifUrl}
              width={320}
              height={420}
              loading="eager"
              decoding="sync"
              alt={dancer.name}
              className={`absolute inset-0 w-full h-full object-cover ${
                idx === activeDancerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />
          ))}
        </div>

        {/* Легкое затемнение снизу для контраста мини-плеера поверх оригинального видеофона */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,20,25,0.05) 0%, rgba(15,20,25,0.12) 55%, rgba(15,20,25,0.78) 100%)',
          }}
        />

        {/* Свернутый мини-плеер поверх оригинальной GIF луксмаксера */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 m-2.5 p-3.5 rounded-xl border border-[#2A343D] bg-[#182026]/88 backdrop-blur-md space-y-2.5 shadow-xl cursor-default"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono text-emerald-400 truncate">
                Мини-плеер · {currentIndex + 1}/{LOOKSMAX_PLAYLIST.length}
                {isCrossfading ? ' · Переход...' : ''}
              </div>
              <div className="text-sm font-semibold text-[#F1F5F9] font-display truncate">
                {currentTrack.title}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#0F1419] hover:bg-[#222C34] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Развернуть
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => looksmaxMusic.prevTrack()}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0F1419] hover:bg-[#222C34] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Пред.
              </button>
              <button
                type="button"
                onClick={() => looksmaxMusic.togglePlay()}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isPlaying ? 'Пауза' : 'Играть'}
              </button>
              <button
                type="button"
                onClick={() => looksmaxMusic.nextTrack(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0F1419] hover:bg-[#222C34] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                След.
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-[130px]">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) =>
                  looksmaxMusic.setVolume(Number(e.target.value) / 100)
                }
                className="w-full h-1.5 bg-[#0F1419] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[11px] font-mono tabular-nums text-[#94A3B8] shrink-0">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-[#2A343D] bg-[#182026] space-y-3.5">
      {/* Заголовок плеера, режимы и кнопка сворачивания в мини-версию */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#F1F5F9] font-display truncate">
          Плеер ({LOOKSMAX_PLAYLIST.length} треков)
        </h2>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => looksmaxMusic.toggleLoopSingle()}
            className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              loopSingle
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#0F1419] text-[#94A3B8] border border-[#2A343D] hover:text-[#F1F5F9]'
            }`}
          >
            {loopSingle ? 'Повтор 1' : 'Подряд'}
          </button>

          <button
            type="button"
            onClick={() => looksmaxMusic.toggleSlowedMode()}
            className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              slowedMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-[#0F1419] text-[#94A3B8] border border-[#2A343D] hover:text-[#F1F5F9]'
            }`}
          >
            {slowedMode ? '0.85x' : '1.0x'}
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#0F1419] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Свернуть
          </button>
        </div>
      </div>

      {/* Карточка активного трека + индикатор плавного кроссфейда + таймлайн */}
      <div className="p-3 rounded-xl bg-[#0F1419] border border-[#2A343D] space-y-2.5">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
            <span className="text-emerald-400 truncate">
              {currentIndex + 1}/{LOOKSMAX_PLAYLIST.length} · {currentTrack.memeTag}
            </span>
            {isCrossfading && (
              <span className="text-amber-400 shrink-0">
                Плавный переход...
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-[#F1F5F9] font-display truncate mt-0.5">
            {currentTrack.title}
          </div>
          <div className="text-xs text-[#94A3B8] truncate">
            {currentTrack.artist}
          </div>
        </div>

        {/* Полоса перемотки (Seek bar) */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration > 0 ? Math.floor(duration) : 180}
            step={1}
            value={Math.min(currentTime, duration > 0 ? duration : 180)}
            onChange={(e) => looksmaxMusic.seekTo(Number(e.target.value))}
            className="w-full h-1.5 bg-[#182026] rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#94A3B8]">
            <span>{formatAudioTime(currentTime)}</span>
            <span>
              {isLoading
                ? 'Буферизация MP3...'
                : duration > 0
                ? formatAudioTime(duration)
                : currentTrack.durationHint}
            </span>
          </div>
        </div>

        {/* Кнопки управления воспроизведением */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => looksmaxMusic.prevTrack()}
            className="py-1.5 px-2 rounded-lg text-xs font-medium bg-[#182026] hover:bg-[#222C34] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Пред.
          </button>
          <button
            type="button"
            onClick={() => looksmaxMusic.togglePlay()}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isPlaying ? 'Пауза' : 'Играть'}
          </button>
          <button
            type="button"
            onClick={() => looksmaxMusic.nextTrack(true)}
            className="py-1.5 px-2 rounded-lg text-xs font-medium bg-[#182026] hover:bg-[#222C34] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            След.
          </button>
        </div>

        {/* Регулятор громкости музыки */}
        <div className="pt-1 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#94A3B8]">
            <span>Громкость · Кроссфейд 4с</span>
            <span className="text-[#F1F5F9]">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) =>
              looksmaxMusic.setVolume(Number(e.target.value) / 100)
            }
            className="w-full h-1.5 bg-[#182026] rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Прокручиваемый список из 16 полных MP3 треков */}
      <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
        {LOOKSMAX_PLAYLIST.map((track, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => looksmaxMusic.selectTrack(idx, true)}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500/15 text-[#F1F5F9] border border-emerald-500/40'
                  : 'bg-[#0F1419] text-[#94A3B8] hover:text-[#F1F5F9] border border-transparent'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[#F1F5F9] truncate">
                  {idx + 1}. {track.title}
                </div>
                <div className="text-[11px] text-[#94A3B8] truncate">
                  {track.artist} · {track.memeTag}
                </div>
              </div>
              <span className="font-mono tabular-nums text-[11px] shrink-0 text-emerald-400">
                {isSelected && isPlaying ? 'ИГРАЕТ' : track.durationHint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
