import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { looksmaxMusic } from '../modules/musicPlayer';

interface LooksmaxLoadingScreenProps {
  isProfileLoaded: boolean;
  isAtlasLoaded: boolean;
  onFinish: () => void;
}

interface MemeShowcase {
  id: string;
  title: string;
  subtitle: string;
  gifUrl: string;
  tag: string;
}

const LOADING_MEMES: MemeShowcase[] = [
  {
    id: 'bye_bye',
    title: 'Bye Bye · Shhh Mogging',
    subtitle: 'Язык прижат к нёбу. Не разговаривай со мной, идет мьюинг.',
    gifUrl: '/assets/loading/bye_bye_mewing.gif',
    tag: 'МЬЮИНГ 100%',
  },
  {
    id: 'jordan_barrett',
    title: 'Jordan Barrett · Hunter Eyes',
    subtitle: 'Положительный кантальный наклон, глубокая посадка глазниц и холодный взгляд.',
    gifUrl: '/assets/loading/jordan_barrett_mewing.gif',
    tag: 'HUNTER EYES',
  },
  {
    id: 'patrick_bateman',
    title: 'Patrick Bateman · Sigma Rhythm',
    subtitle: 'Концентрация, наушники и утренний ритуал ухода за кожей.',
    gifUrl: '/assets/loading/patrick_bateman_sigma.gif',
    tag: 'SIGMA DISCIPLINE',
  },
  {
    id: 'gigachad',
    title: 'GigaChad · True Adam Apex',
    subtitle: 'Финальная стадия PSL 8.0 — безупречная симметрия и гониальный угол 120°.',
    gifUrl: '/assets/loading/gigachad.gif',
    tag: 'APEX PSL 8.0',
  },
  {
    id: 'chico',
    title: 'Chico Lachowski · PSL Shuffle',
    subtitle: 'Классический танец луксмаксера под треки фонка и slowed-ремиксы.',
    gifUrl: '/assets/dancers/chico_dancing_320x420.gif',
    tag: 'DANCE FLOOR',
  },
];

export const LooksmaxLoadingScreen: React.FC<LooksmaxLoadingScreenProps> = ({
  isProfileLoaded,
  isAtlasLoaded,
  onFinish,
}) => {
  const [activeMemeIndex, setActiveMemeIndex] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [areGifsLoaded, setAreGifsLoaded] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(12);
  const [statusText, setStatusText] = useState('Инициализация биометрии и профиля...');
  const [isReadyToEnter, setIsReadyToEnter] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // На этапе загрузки плеер жестко выключен
  useEffect(() => {
    looksmaxMusic.setMainScreenActive(false);
  }, []);

  // Мгновенный переход на главный экран (музыка включается только при появлении главного экрана)
  const handleEnterOrSkip = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      if (isFadingOut) return;
      setIsFadingOut(true);
      onFinish();
    },
    [isFadingOut, onFinish]
  );

  // 1. Предзагрузка ключевой музыки в буфер памяти (БЕЗ воспроизведения на экране загрузки)
  useEffect(() => {
    let mounted = true;
    looksmaxMusic
      .ensureTrackLoaded(0)
      .then(() => {
        if (mounted) setIsAudioLoaded(true);
      })
      .catch(() => {
        if (mounted) setIsAudioLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Предзагрузка компактных гифок загрузочного экрана (танцоры уже смонтированы в LooksmaxMusicPlayer)
  useEffect(() => {
    let mounted = true;
    const urlsToPreload = LOADING_MEMES.slice(0, 4).map((m) => m.gifUrl);

    let loadedCount = 0;
    const totalCount = urlsToPreload.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalCount && mounted) {
        setAreGifsLoaded(true);
      }
    };

    urlsToPreload.forEach((src) => {
      const img = new Image();
      img.onload = checkComplete;
      img.onerror = checkComplete;
      img.src = src;
    });

    const fallbackTimer = window.setTimeout(() => {
      if (mounted) setAreGifsLoaded(true);
    }, 2200);

    return () => {
      mounted = false;
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  // 3. Автоматическое циклическое переключение мемов каждые 2.6 секунды
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveMemeIndex((prev) => (prev + 1) % LOADING_MEMES.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, []);

  // 4. Клавиатурный шорткат (Escape / Space / Enter) для быстрого пропуска (Skip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnterOrSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEnterOrSkip]);

  // 5. Плавная динамика прогресс-бара и синхронизация этапов без зависаний
  const allModulesReady = isProfileLoaded && isAtlasLoaded && isAudioLoaded && areGifsLoaded;

  const computedTargetProgress = useMemo(() => {
    let target = 16;
    if (isProfileLoaded) target += 21;
    if (isAtlasLoaded) target += 21;
    if (isAudioLoaded) target += 22;
    if (areGifsLoaded) target += 20;
    return Math.min(100, target);
  }, [isProfileLoaded, isAtlasLoaded, isAudioLoaded, areGifsLoaded]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const minDisplaySatisfied = elapsed >= 1200;
      const forceReadyTimeout = elapsed >= 4000;

      setDisplayProgress((prev) => {
        if ((allModulesReady && minDisplaySatisfied) || forceReadyTimeout) {
          if (prev < 100) {
            const next = Math.min(100, prev + 8);
            if (next === 100) {
              setStatusText('Все системы готовы. Начинаем восхождение!');
              setIsReadyToEnter(true);
            }
            return next;
          }
          setStatusText('Все системы готовы. Начинаем восхождение!');
          setIsReadyToEnter(true);
          return 100;
        }

        // Пока ждём минимальный показ или один из ресурсов, плавно доводим максимум до 99%
        const cappedTarget = Math.min(99, computedTargetProgress);
        if (prev < cappedTarget) {
          const step = Math.max(1, Math.ceil((cappedTarget - prev) * 0.28));
          const next = Math.min(cappedTarget, prev + step);

          if (next < 35) {
            setStatusText('Синхронизация профиля и ДНК поколений...');
          } else if (next < 60) {
            setStatusText('Загрузка анатомического атласа PSL (8 стадий)...');
          } else if (next < 85) {
            setStatusText('Буферизация трека (DJ ZUP RAlii — Револьвер)...');
          } else {
            setStatusText('Калибровка угла челюсти 120° и анимаций...');
          }
          return next;
        }

        return prev;
      });
    }, 50);

    return () => window.clearInterval(interval);
  }, [allModulesReady, computedTargetProgress]);

  const currentMeme = LOADING_MEMES[activeMemeIndex];

  return (
    <div
      onClick={isReadyToEnter ? () => handleEnterOrSkip() : undefined}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 select-none bg-[#090D12] text-[#F1F5F9] transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 18%, rgba(16, 185, 129, 0.15), transparent 48%),
          radial-gradient(circle at 50% 82%, rgba(56, 189, 248, 0.12), transparent 45%),
          linear-gradient(180deg, #090D12 0%, #06080B 100%)
        `,
      }}
    >
      {/* Декоративная антропометрическая сетка на фоне */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#F1F5F9_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Верхний статус-бар загрузки + кнопка SKIP */}
      <div className="relative z-10 w-full max-w-xl flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
            PSL ASCENSION
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
            <span className="text-sky-400 font-semibold">КАЛИБРОВКА</span>
            <span className="text-white/20">|</span>
            <span>120° JAWLINE</span>
          </div>

          <button
            type="button"
            onClick={handleEnterOrSkip}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-slate-950 border border-white/20 hover:border-emerald-400 text-xs font-mono font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Пропустить заставку (Esc / Space)"
          >
            <span>SKIP · ПРОПУСТИТЬ</span>
            <span>⏭</span>
          </button>
        </div>
      </div>

      {/* Центральный визуальный блок: Умное зеркало с культовыми гифками луксмаксинга */}
      <div className="relative z-10 w-full max-w-md my-auto flex flex-col items-center">
        <div className="relative w-full rounded-[28px] p-1.5 bg-gradient-to-b from-slate-500/30 via-slate-700/20 to-slate-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] border border-white/15">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10 shadow-inner">
            <img
              key={currentMeme.gifUrl}
              src={currentMeme.gifUrl}
              alt={currentMeme.title}
              className="w-full h-full object-cover object-center transition-opacity duration-300"
            />

            {/* Зеркальные стеклянные блики поверх гифки */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.14]" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]" />

            {/* Метка мема в верхнем углу */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-emerald-400 shadow-md">
              {currentMeme.tag}
            </div>

            {/* Индикатор номера мема */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-slate-300">
              {activeMemeIndex + 1} / {LOADING_MEMES.length}
            </div>
          </div>
        </div>

        {/* Подпись к мему и переключатели */}
        <div className="mt-3.5 text-center px-2">
          <h2 className="text-base sm:text-lg font-bold text-white font-display tracking-tight flex items-center justify-center gap-2">
            <span>{currentMeme.title}</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {currentMeme.subtitle}
          </p>

          {/* Интерактивные точки смены мемов */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {LOADING_MEMES.map((meme, idx) => (
              <button
                key={meme.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMemeIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeMemeIndex === idx
                    ? 'w-6 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={meme.title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Нижний блок: Прогресс-бар, чеклист модулей и кнопки входа / Skip */}
      <div className="relative z-10 w-full max-w-lg pb-3 flex flex-col items-center">
        {/* Чеклист ключевых компонентов */}
        <div className="w-full grid grid-cols-4 gap-1.5 mb-3 text-[11px] font-mono">
          <div
            className={`px-2 py-1.5 rounded-lg border flex flex-col items-center text-center transition-colors ${
              isProfileLoaded
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            <span className="text-[10px]">ПРОФИЛЬ</span>
            <span className="font-bold">{isProfileLoaded ? '✓ Готово' : '...'}</span>
          </div>

          <div
            className={`px-2 py-1.5 rounded-lg border flex flex-col items-center text-center transition-colors ${
              isAtlasLoaded
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            <span className="text-[10px]">8 СТАДИЙ</span>
            <span className="font-bold">{isAtlasLoaded ? '✓ Готово' : '...'}</span>
          </div>

          <div
            className={`px-2 py-1.5 rounded-lg border flex flex-col items-center text-center transition-colors ${
              isAudioLoaded
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            <span className="text-[10px]">МУЗЫКА</span>
            <span className="font-bold">{isAudioLoaded ? '✓ Готово' : '...'}</span>
          </div>

          <div
            className={`px-2 py-1.5 rounded-lg border flex flex-col items-center text-center transition-colors ${
              areGifsLoaded
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            <span className="text-[10px]">ГИФКИ</span>
            <span className="font-bold">{areGifsLoaded ? '✓ Готово' : '...'}</span>
          </div>
        </div>

        {/* Текстовый статус и процент */}
        <div className="w-full flex items-center justify-between text-xs font-mono mb-1.5 px-1">
          <span className="text-slate-300 truncate max-w-[80%]">{statusText}</span>
          <span className="font-bold tabular-nums text-emerald-400">{displayProgress}%</span>
        </div>

        {/* Прогресс-бар со свечением */}
        <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/15 overflow-hidden shadow-inner p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-150 relative shadow-[0_0_12px_rgba(16,185,129,0.7)]"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        {/* Кнопка входа или мгновенного пропуска (SKIP) */}
        <div className="mt-4 w-full flex flex-col items-center">
          {isReadyToEnter ? (
            <button
              type="button"
              onClick={handleEnterOrSkip}
              className="w-full py-3.5 px-6 rounded-xl font-bold font-display text-sm sm:text-base tracking-wide bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.65)] hover:shadow-[0_0_36px_rgba(16,185,129,0.85)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5 animate-bounce-subtle"
            >
              <span>🤫</span>
              <span>ВОЙТИ В АРЕНУ (НАЧАТЬ МЬЮИНГ)</span>
              <span>⚡</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="py-2 text-xs font-mono text-slate-400 flex items-center gap-2 truncate">
                <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="truncate">Загрузка музыки и ресурсов...</span>
              </div>

              <button
                type="button"
                onClick={handleEnterOrSkip}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-semibold text-white transition-colors cursor-pointer shrink-0"
              >
                Пропустить (Skip) ⏭
              </button>
            </div>
          )}

          {isReadyToEnter && (
            <span className="mt-2 text-[11px] text-slate-400 font-mono">
              Нажмите кнопку, клавишу Space/Enter или любую точку экрана
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
