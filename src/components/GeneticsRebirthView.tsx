import React, { useState } from 'react';
import {
  calculatePerkDnaCost,
  ComputedStats,
  DNA_PERKS,
  DNAPerkDefinition,
  PSL_RANKS,
} from '../modules/mechanics';
import { PlayerProfileData } from '../modules/profile';
import { formatLooks } from '../modules/utils';

export interface RebirthViewProps {
  profile: PlayerProfileData;
  stats: ComputedStats;
  atlasImage?: HTMLImageElement | null;
  onTriggerRebirth: () => void;
  onBuyPerk: (perkId: string) => void;
}

interface PerkGifMeta {
  shortTitle: string;
  gifUrl: string;
  colorHex: string;
  rgb: string;
  bonusText: (lvl: number) => string;
  nextBonusText: (lvl: number) => string;
}

const PERK_GIF_META: Record<string, PerkGifMeta> = {
  hunter_eyes: {
    shortTitle: 'Охотничий взгляд',
    gifUrl: '/assets/loading/jordan_barrett_mewing.gif',
    colorHex: '#38BDF8',
    rgb: '56, 189, 248',
    bonusText: (lvl) => `+${lvl * 60}% клик`,
    nextBonusText: () => '+60% клик',
  },
  hollow_cheeks: {
    shortTitle: 'Впалые щёки',
    gifUrl: '/assets/perks/handsome_squidward.gif',
    colorHex: '#10B981',
    rgb: '16, 185, 129',
    bonusText: (lvl) => `+${lvl * 50}% пассив`,
    nextBonusText: () => '+50% пассив',
  },
  gonial_angle: {
    shortTitle: 'Челюсть 120°',
    gifUrl: '/assets/perks/jawline_check.gif',
    colorHex: '#F59E0B',
    rgb: '245, 158, 11',
    bonusText: (lvl) => `+${lvl * 3}% крит`,
    nextBonusText: () => '+3% крит',
  },
  forward_maxilla: {
    shortTitle: 'Максилла Сигмы',
    gifUrl: '/assets/loading/patrick_bateman_sigma.gif',
    colorHex: '#A855F7',
    rgb: '168, 85, 247',
    bonusText: (lvl) => `-${Math.min(56, lvl * 7)}% цены`,
    nextBonusText: () => '-7% цены',
  },
  adams_lineage: {
    shortTitle: 'Геном Адама',
    gifUrl: '/assets/perks/david_laid.gif',
    colorHex: '#F43F5E',
    rgb: '244, 63, 94',
    bonusText: (lvl) => `+${lvl * 35}% оффлайн`,
    nextBonusText: () => '+35% оффлайн',
  },
};

// Яркие фото эталонов эстетики / Адамов для космического фона (без затухания и без надписей)
const BACKGROUND_ADAMS_PHOTOS = [
  {
    src: '/assets/adams/sean_opry_2.jpg',
    className: 'top-[76px] left-[1.5%] w-44 sm:w-56 lg:w-64 aspect-[3/4] -rotate-3',
    borderColor: 'rgba(56, 189, 248, 0.75)',
    glowColor: 'rgba(56, 189, 248, 0.38)',
    floatDelay: '0s',
    floatDuration: '6.2s',
  },
  {
    src: '/assets/adams/david_gandy_2.jpg',
    className: 'top-[76px] right-[1.5%] w-44 sm:w-56 lg:w-64 aspect-[3/4] rotate-3',
    borderColor: 'rgba(251, 191, 36, 0.75)',
    glowColor: 'rgba(251, 191, 36, 0.38)',
    floatDelay: '1.1s',
    floatDuration: '6.8s',
  },
  {
    src: '/assets/adams/alain_delon.jpg',
    className: 'bottom-[3%] left-[2%] w-48 sm:w-64 lg:w-72 aspect-[4/3] rotate-2',
    borderColor: 'rgba(16, 185, 129, 0.75)',
    glowColor: 'rgba(16, 185, 129, 0.38)',
    floatDelay: '0.5s',
    floatDuration: '7.1s',
  },
  {
    src: '/assets/adams/christian_bale.jpg',
    className: 'bottom-[3%] right-[2%] w-44 sm:w-56 lg:w-64 aspect-[3/4] -rotate-2',
    borderColor: 'rgba(168, 85, 247, 0.75)',
    glowColor: 'rgba(168, 85, 247, 0.38)',
    floatDelay: '1.7s',
    floatDuration: '6.4s',
  },
  {
    src: '/assets/adams/david_gandy_1.jpg',
    className:
      'bottom-[2.5%] left-[27%] w-40 sm:w-52 lg:w-60 aspect-[3/4] -rotate-2 hidden md:block',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    glowColor: 'rgba(245, 158, 11, 0.38)',
    floatDelay: '0.8s',
    floatDuration: '6.9s',
  },
  {
    src: '/assets/perks/david_laid.gif',
    className:
      'bottom-[2.5%] right-[27%] w-40 sm:w-52 lg:w-60 aspect-[3/4] rotate-2 hidden md:block',
    borderColor: 'rgba(244, 63, 94, 0.8)',
    glowColor: 'rgba(244, 63, 94, 0.38)',
    floatDelay: '1.4s',
    floatDuration: '6.0s',
  },
];

// Звездные искры на фоне космоса
const COSMIC_DNA_SPARKS = [
  { left: '8%', top: '18%', size: 4, color: '#FBBF24', delay: '0s', duration: '4.5s' },
  { left: '16%', top: '68%', size: 3.5, color: '#38BDF8', delay: '1.1s', duration: '5.2s' },
  { left: '27%', top: '24%', size: 4.5, color: '#F59E0B', delay: '0.6s', duration: '4.8s' },
  { left: '38%', top: '82%', size: 3.5, color: '#FFFFFF', delay: '1.8s', duration: '5.5s' },
  { left: '52%', top: '14%', size: 4.5, color: '#FBBF24', delay: '0.3s', duration: '4.2s' },
  { left: '64%', top: '76%', size: 4, color: '#38BDF8', delay: '2.2s', duration: '5.0s' },
  { left: '78%', top: '22%', size: 4.5, color: '#FFFFFF', delay: '0.9s', duration: '4.6s' },
  { left: '89%', top: '62%', size: 4, color: '#F59E0B', delay: '1.5s', duration: '5.4s' },
  { left: '93%', top: '28%', size: 3.5, color: '#38BDF8', delay: '0.4s', duration: '4.9s' },
];

export const RebirthStarryBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Яркое звездное небо и космическая туманность без темной пелены */}
      <img
        src="/assets/adams/nebula_1.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-100"
        style={{
          filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
        }}
      />

      {/* 2. Живые парящие фотографии Адамов в невесомости на фоне звездного неба */}
      <div className="absolute inset-0">
        {BACKGROUND_ADAMS_PHOTOS.map((photo, idx) => (
          <div
            key={idx}
            className={`absolute ${photo.className} rounded-2xl overflow-hidden bg-slate-950 animate-adams-float`}
            style={{
              border: `2px solid ${photo.borderColor}`,
              boxShadow: `0 16px 40px rgba(0,0,0,0.85), 0 0 28px ${photo.glowColor}`,
              animationDelay: photo.floatDelay,
              animationDuration: photo.floatDuration,
            }}
          >
            <img
              src={photo.src}
              alt=""
              className="w-full h-full object-cover object-top brightness-105 contrast-105"
            />
          </div>
        ))}
      </div>

      {/* 3. Мерцающие звезды */}
      {COSMIC_DNA_SPARKS.map((spark, idx) => (
        <span
          key={idx}
          className="absolute rounded-full animate-pulse"
          style={{
            left: spark.left,
            top: spark.top,
            width: `${spark.size}px`,
            height: `${spark.size}px`,
            backgroundColor: spark.color,
            boxShadow: `0 0 12px ${spark.color}, 0 0 24px ${spark.color}`,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
          }}
        />
      ))}
    </div>
  );
};

export const GeneticsRebirthView: React.FC<RebirthViewProps> = ({
  profile,
  stats,
  onTriggerRebirth,
  onBuyPerk,
}) => {
  const [rebirthFlash, setRebirthFlash] = useState<{
    generation: number;
    dnaEarned: number;
    newMultiplier: number;
  } | null>(null);
  const [pulsingPerkId, setPulsingPerkId] = useState<string | null>(null);

  const chadliteTarget = PSL_RANKS[5].requiredLooks;
  const rebirthProgress = Math.min(
    100,
    (profile.currentRunTotalLooks / chadliteTarget) * 100
  );
  const nextGenMultiplier = 1 + profile.generation * 0.4;

  const handleRebirthClick = () => {
    if (!stats.canRebirth) return;
    const earned = stats.pendingRebirthDNA;
    const nextGen = profile.generation + 1;
    const nextMult = 1 + profile.generation * 0.4;

    setRebirthFlash({
      generation: nextGen,
      dnaEarned: earned,
      newMultiplier: nextMult,
    });
    onTriggerRebirth();

    window.setTimeout(() => {
      setRebirthFlash(null);
    }, 1750);
  };

  const handleBuyPerkClick = (perkId: string) => {
    setPulsingPerkId(perkId);
    onBuyPerk(perkId);
    window.setTimeout(() => {
      setPulsingPerkId((prev) => (prev === perkId ? null : prev));
    }, 420);
  };

  return (
    <div className="relative z-10 max-w-[1060px] mx-auto space-y-4 select-none">
      {/* ЭПИЧНАЯ ВСПЫШКА СМЕНЫ ПОКОЛЕНИЯ */}
      {rebirthFlash && (
        <div
          onClick={() => setRebirthFlash(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md cursor-pointer overflow-hidden"
        >
          {/* Расходящиеся золотые ударные волны */}
          <div className="pointer-events-none absolute w-72 h-72 rounded-full border-4 border-amber-400/80 shadow-[0_0_80px_rgba(251,191,36,0.8)] animate-rebirth-shockwave" />
          <div
            className="pointer-events-none absolute w-96 h-96 rounded-full border-2 border-cyan-400/70 shadow-[0_0_90px_rgba(56,189,248,0.65)] animate-rebirth-shockwave"
            style={{ animationDelay: '0.16s' }}
          />

          {/* Центральная карточка вознесения ДНК */}
          <div className="relative z-10 mx-4 max-w-md w-full rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-[#171F2E]/95 via-[#0E1420]/95 to-[#090D14]/95 p-6 text-center shadow-[0_0_90px_rgba(251,191,36,0.55)] animate-rebirth-banner">
            <div className="mx-auto mb-3 w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-[0_0_32px_rgba(251,191,36,0.65)] bg-slate-950">
              <img
                src="/assets/perks/dna_helix.gif"
                alt="DNA Ascension"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-300 font-mono text-[11px] font-extrabold uppercase tracking-widest">
              ГЕНЕТИКА ОБНОВЛЕНА
            </div>

            <h3 className="mt-1.5 text-3xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-[0_2px_16px_rgba(251,191,36,0.5)]">
              ПОКОЛЕНИЕ {rebirthFlash.generation}
            </h3>

            <div className="mt-4 flex items-center justify-center gap-2.5 font-mono text-sm font-extrabold">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.6)]">
                +{rebirthFlash.dnaEarned} ДНК 🧬
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/25 border border-emerald-400/60 text-emerald-300">
                ДОХОД ×{rebirthFlash.newMultiplier.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* КОМПАКТНЫЙ БАННЕР РЕБОРНА С МИНИМУМОМ ТЕКСТА */}
      <div className="relative rounded-2xl border border-amber-400/50 bg-[#0D131C]/80 backdrop-blur-md p-3.5 sm:p-4 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Слева: 3D-спираль ДНК + краткие цифры */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.4)] shrink-0 bg-slate-950">
              <img
                src="/assets/perks/dna_helix.gif"
                alt="DNA Helix"
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold uppercase whitespace-nowrap">
                ПОК. {profile.generation}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-tight">
                Смена Поколения
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/45 text-amber-300">
                  🧬 {profile.dnaPoints} ДНК
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/45 text-emerald-300">
                  Доход ×{stats.generationMultiplier.toFixed(2)} ➔ ×
                  {nextGenMultiplier.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Справа: Прогресс + Кнопка Реборна */}
          <div className="w-full md:w-[320px] p-3 rounded-xl bg-[#090D14]/90 border border-white/15 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-300">
                {stats.canRebirth ? 'Готово' : 'До Chadlite'}
              </span>
              <span className="text-amber-400 font-extrabold">
                {stats.canRebirth
                  ? `+${stats.pendingRebirthDNA} ДНК`
                  : `${rebirthProgress.toFixed(0)}% (${formatLooks(chadliteTarget)} PSL)`}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-200"
                style={{ width: `${rebirthProgress}%` }}
              />
            </div>

            <button
              type="button"
              disabled={!stats.canRebirth}
              onClick={handleRebirthClick}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wide transition-all ${
                stats.canRebirth
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.45)] hover:brightness-110 active:scale-[0.99] cursor-pointer'
                  : 'bg-[#182028] text-slate-400 border border-white/10 cursor-not-allowed'
              }`}
            >
              {stats.canRebirth
                ? `⚡ ПЕРЕРОДИТЬСЯ (+${stats.pendingRebirthDNA} ДНК)`
                : '🔒 Нужен Chadlite'}
            </button>
          </div>
        </div>
      </div>

      {/* СЕТКА МУТАЦИЙ ДНК С ЗОЛОТОЙ ЭВОЛЮЦИЕЙ НА 10/10 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {DNA_PERKS.map((perk: DNAPerkDefinition) => {
          const currentLvl = profile.perkLevels[perk.id] || 0;
          const isMax = currentLvl >= perk.maxLevel;
          const cost = calculatePerkDnaCost(perk, currentLvl);
          const canAfford = !isMax && profile.dnaPoints >= cost;
          const meta = PERK_GIF_META[perk.id] || PERK_GIF_META['hunter_eyes'];
          const progressPct = Math.min(100, (currentLvl / perk.maxLevel) * 100);
          const isJustUpgraded = pulsingPerkId === perk.id;

          return (
            <div
              key={perk.id}
              className={`group relative rounded-2xl border backdrop-blur-md p-3 flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                isMax
                  ? 'bg-gradient-to-b from-[#1F190D]/90 via-[#121620]/90 to-[#0E141D]/90 animate-gold-gene'
                  : 'bg-[#0E141D]/80 hover:bg-[#131C28]/90 shadow-[0_14px_34px_rgba(0,0,0,0.7)]'
              } ${isJustUpgraded ? 'scale-[1.03]' : ''}`}
              style={
                isMax
                  ? undefined
                  : {
                      borderColor: isJustUpgraded
                        ? '#FBBF24'
                        : canAfford
                        ? meta.colorHex
                        : currentLvl > 0
                        ? `${meta.colorHex}77`
                        : 'rgba(255,255,255,0.18)',
                      boxShadow: isJustUpgraded
                        ? `0 0 30px rgba(251, 191, 36, 0.55)`
                        : canAfford
                        ? `0 8px 25px rgba(${meta.rgb}, 0.3)`
                        : undefined,
                    }
              }
            >
              {/* Чистая GIF-карточка без имен и тегов */}
              <div>
                <div
                  className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border ${
                    isMax
                      ? 'border-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
                      : 'border-white/15'
                  }`}
                >
                  <img
                    src={meta.gifUrl}
                    alt={meta.shortTitle}
                    loading="eager"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Компактный уровень или золотой статус MAX */}
                  <span
                    className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold tabular-nums ${
                      isMax
                        ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                        : 'bg-black/80 backdrop-blur-md border border-white/20 text-white'
                    }`}
                  >
                    {isMax
                      ? `★ ${currentLvl}/${perk.maxLevel}`
                      : `${currentLvl}/${perk.maxLevel}`}
                  </span>
                </div>

                {/* Короткое название и бонус */}
                <div className="mt-2.5 text-center">
                  <h3
                    className={`text-sm font-extrabold font-display tracking-tight truncate ${
                      isMax
                        ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                        : 'text-white'
                    }`}
                  >
                    {meta.shortTitle}
                  </h3>
                  <div
                    className="mt-0.5 text-xs font-mono font-bold tabular-nums"
                    style={{ color: isMax ? '#FBBF24' : meta.colorHex }}
                  >
                    {meta.bonusText(currentLvl)}
                  </div>
                </div>
              </div>

              {/* Прогресс-бар + Кнопка */}
              <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2">
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full transition-all duration-200"
                    style={{
                      width: `${progressPct}%`,
                      background: isMax
                        ? 'linear-gradient(90deg, #F59E0B, #FDE047, #F59E0B)'
                        : meta.colorHex,
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleBuyPerkClick(perk.id)}
                  className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-mono font-extrabold tabular-nums transition-all whitespace-nowrap ${
                    isMax
                      ? 'bg-gradient-to-r from-amber-400/25 via-yellow-400/30 to-amber-500/25 text-amber-200 border border-amber-300/70 shadow-[0_0_16px_rgba(251,191,36,0.3)] cursor-default'
                      : canAfford
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_4px_14px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer'
                      : 'bg-[#1A232E] text-slate-300 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {isMax
                    ? '★ АБСОЛЮТ ✓'
                    : `${meta.nextBonusText(currentLvl)} · ${cost} ДНК`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
