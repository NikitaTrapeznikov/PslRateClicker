import React from 'react';

export interface TutorialTapsState {
  mirror: boolean;
  playerGif: boolean;
  phoneFlip: boolean;
  evolutionTab: boolean;
  rebirthTab: boolean;
  rewardedAd: boolean;
}

const TUTORIAL_STORAGE_KEY = 'psl_first_visit_taps_v1';

const DEFAULT_TUTORIAL_STATE: TutorialTapsState = {
  mirror: false,
  playerGif: false,
  phoneFlip: false,
  evolutionTab: false,
  rebirthTab: false,
  rewardedAd: false,
};

export function loadTutorialTapsState(): TutorialTapsState {
  try {
    const raw = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TUTORIAL_STATE };
    const parsed = JSON.parse(raw);
    return {
      mirror: Boolean(parsed?.mirror),
      playerGif: Boolean(parsed?.playerGif),
      phoneFlip: Boolean(parsed?.phoneFlip),
      evolutionTab: Boolean(parsed?.evolutionTab),
      rebirthTab: Boolean(parsed?.rebirthTab),
      rewardedAd: Boolean(parsed?.rewardedAd),
    };
  } catch {
    return { ...DEFAULT_TUTORIAL_STATE };
  }
}

export function saveTutorialTapsState(state: TutorialTapsState): void {
  try {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

interface TutorialTapHandProps {
  /** Дополнительные классы позиционирования контейнера */
  className?: string;
  /** Размер иконки пальца: 'sm' для кнопок в шапке, 'md' для карточек, 'lg' для зеркала */
  size?: 'sm' | 'md' | 'lg';
  /** Необязательная короткая подпись рядом с пальцем */
  label?: string;
}

/**
 * Полупрозрачный анимированный указательный палец для первого входа в игру.
 * Имеет pointer-events-none, поэтому клик проходит сквозь него сразу по целевой кнопке/элементу.
 */
export const TutorialTapHand: React.FC<TutorialTapHandProps> = ({
  className = '',
  size = 'md',
  label,
}) => {
  const sizePx = size === 'lg' ? 54 : size === 'md' ? 40 : 30;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none z-40 flex flex-col items-center justify-center ${className}`}
    >
      <style>{`
        @keyframes pslTapFingerMotion {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(-12deg);
          }
          45% {
            transform: translate3d(-2px, -7px, 0) scale(0.92) rotate(-16deg);
          }
          65% {
            transform: translate3d(0, 2px, 0) scale(1.03) rotate(-10deg);
          }
        }
        @keyframes pslTapRingPulse {
          0% {
            transform: scale(0.55);
            opacity: 0.75;
          }
          70% {
            transform: scale(1.55);
            opacity: 0;
          }
          100% {
            transform: scale(1.65);
            opacity: 0;
          }
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* Пульсирующий кружок в точке касания кончика пальца */}
        <span
          className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white/75 bg-emerald-400/25 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
          style={{
            animation: 'pslTapRingPulse 1.35s cubic-bezier(0.22, 1, 0.36, 1) infinite',
          }}
        />

        {/* Полупрозрачный силуэт руки с вытянутым указательным пальцем */}
        <svg
          width={sizePx}
          height={sizePx}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-75 drop-shadow-[0_6px_14px_rgba(0,0,0,0.75)]"
          style={{
            animation: 'pslTapFingerMotion 1.35s ease-in-out infinite',
          }}
        >
          {/* Внешнее мягкое свечение кончика пальца */}
          <circle cx="24" cy="11" r="6" fill="rgba(255,255,255,0.28)" />

          {/* Контур кисти с указательным пальцем */}
          <path
            d="M24 8C21.2386 8 19 10.2386 19 13V32.5L15.1 29.55C13.15 28.08 10.35 28.4 8.8 30.3C7.35 32.08 7.58 34.68 9.25 36.2L21.6 47.45C24.35 49.95 27.95 51.35 31.68 51.35H39.5C46.4 51.35 52 45.75 52 38.85V27.5C52 24.95 49.95 22.9 47.4 22.9C46.28 22.9 45.25 23.3 44.45 23.96C43.92 21.82 42 20.25 39.7 20.25C38.45 20.25 37.32 20.72 36.46 21.5C35.82 19.6 34.02 18.25 31.9 18.25C30.72 18.25 29.65 18.67 28.82 19.37V13C28.82 10.2386 26.6614 8 24 8Z"
            fill="rgba(255, 255, 255, 0.72)"
            stroke="rgba(15, 23, 42, 0.85)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Блик на ногте указательного пальца */}
          <rect
            x="21.4"
            y="10.2"
            width="5.2"
            height="5.6"
            rx="2.5"
            fill="rgba(255,255,255,0.92)"
          />
        </svg>
      </div>

      {label && (
        <span className="mt-0.5 px-2 py-0.5 rounded-md bg-slate-950/75 border border-white/25 text-[10px] font-mono font-semibold text-white/90 whitespace-nowrap shadow-md backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
};
