import React, { useState } from 'react';
import {
  calculatePerkDnaCost,
  ComputedStats,
  DNA_PERKS,
  DNAPerkDefinition,
  GENERATION_TITLES,
  PSL_RANKS,
  RANK_LED_PALETTES,
} from '../modules/mechanics';
import { LeaderboardEntry, PlayerProfileData } from '../modules/profile';
import { formatDuration, formatLooks } from '../modules/utils';
import { RankPortraitThumb } from './RankPortraitThumb';

interface EvolutionViewProps {
  profile: PlayerProfileData;
  stats: ComputedStats;
  atlasImage: HTMLImageElement | null;
  onToggleOriginalCaption: () => void;
}

/**
 * Короткие игровые бейджи для каждого из 8 рангов (вместо длинных абзацев текста)
 */
const RANK_SHORT_BADGES: Array<{
  tag: string;
  keyFeature: string;
  tierLabel: string;
}> = [
  { tag: 'Старт пути', keyFeature: 'Базовый профиль', tierLabel: 'TIER D' },
  { tag: 'Носовое дыхание', keyFeature: 'Снятие отёков', tierLabel: 'TIER C' },
  { tag: 'Чистая база', keyFeature: 'Уход и мастика', tierLabel: 'TIER C+' },
  { tag: 'Золотая середина', keyFeature: 'Ровные пропорции', tierLabel: 'TIER B' },
  { tag: 'Высокий ранг', keyFeature: 'Рельеф скул', tierLabel: 'TIER A' },
  { tag: 'Открывает Реборн 🧬', keyFeature: 'Угол челюсти 122°', tierLabel: 'TIER S' },
  { tag: 'Пик генетики', keyFeature: 'Охотничий взгляд', tierLabel: 'TIER S+' },
  { tag: 'Абсолют Адама', keyFeature: 'Золотое сечение', tierLabel: 'GOD TIER' },
];

export const EvolutionAtlasView: React.FC<EvolutionViewProps> = ({
  profile,
  stats,
  atlasImage,
  onToggleOriginalCaption,
}) => {
  const [selectedRankIndex, setSelectedRankIndex] = useState<number>(stats.currentRank.index);

  const unlockedCount = profile.highestRankIndexReached + 1;
  const inspectedRank =
    PSL_RANKS[
      Math.min(profile.highestRankIndexReached, Math.max(0, selectedRankIndex))
    ] || stats.currentRank;
  const inspectedPalette =
    RANK_LED_PALETTES[inspectedRank.index] || RANK_LED_PALETTES[0];
  const inspectedMeta =
    RANK_SHORT_BADGES[inspectedRank.index] || RANK_SHORT_BADGES[0];

  const nextLockedRank =
    PSL_RANKS[Math.min(PSL_RANKS.length - 1, profile.highestRankIndexReached + 1)];
  const isAllUnlocked = profile.highestRankIndexReached >= PSL_RANKS.length - 1;

  const nextRankProgress = isAllUnlocked
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          (profile.currentRunTotalLooks / Math.max(1, nextLockedRank.requiredLooks)) * 100
        )
      );

  return (
    <div className="space-y-5 select-none">
      {/* ВЕРХНИЙ ВИЗУАЛЬНЫЙ ПОДИУМ: СТАРТ -> ТЕКУЩИЙ РАНГ -> СЛЕДУЮЩАЯ ЦЕЛЬ */}
      <div className="relative rounded-2xl border border-[#2A343D] bg-gradient-to-br from-[#161F27] via-[#12181F] to-[#0F1419] p-4 sm:p-5 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        {/* Фоновое свечение под цвет выбранного ранга */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-20 transition-all duration-300"
          style={{ backgroundColor: inspectedPalette.accentHex }}
        />

        {/* Верхняя компактная шапка со шкалой коллекции 8/8 */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border"
              style={{
                borderColor: `${inspectedPalette.accentHex}66`,
                backgroundColor: `rgba(${inspectedPalette.rgb}, 0.14)`,
                color: inspectedPalette.accentHex,
              }}
            >
              Коллекция: {unlockedCount} / 8
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display tracking-tight">
              Шкала Эволюции PSL
            </h2>
          </div>

          {/* Сегментированная дорожка из 8 стадий + тумблер подписи */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-[#0B1014] px-2.5 py-1.5 rounded-xl border border-white/10">
              {PSL_RANKS.map((r) => {
                const unlocked = profile.highestRankIndexReached >= r.index;
                const active = stats.currentRank.index === r.index;
                const pal = RANK_LED_PALETTES[r.index] || RANK_LED_PALETTES[0];
                return (
                  <div
                    key={r.id}
                    title={`${r.title} (×${r.rankMultiplier})`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      active ? 'w-6' : 'w-2.5'
                    }`}
                    style={{
                      backgroundColor: unlocked ? pal.accentHex : '#1E293B',
                      boxShadow: active ? `0 0 10px ${pal.accentHex}` : 'none',
                    }}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={onToggleOriginalCaption}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-xl border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {profile.showOriginalAtlasCaption ? 'Подписи: ВКЛ' : 'Подписи: ВЫКЛ'}
            </button>
          </div>
        </div>

        {/* ТРИ СЛОТА СРАВНЕНИЯ: ДО -> СЕЙЧАС -> СЛЕДУЮЩИЙ РУБЕЖ */}
        <div className="relative z-10 mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Слот 1: Точка старта (Sub 3) */}
          <div className="md:col-span-3 p-3.5 rounded-xl bg-[#0D1217]/90 border border-white/10 flex items-center gap-3.5">
            <RankPortraitThumb
              atlasImage={atlasImage}
              rankIndex={0}
              size={68}
              includeOriginalLabel={profile.showOriginalAtlasCaption}
            />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Точка старта
              </div>
              <div className="text-base font-bold text-white font-display truncate">
                {PSL_RANKS[0].title}
              </div>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-800 text-slate-300">
                Доход ×1.00
              </div>
            </div>
          </div>

          {/* Слот 2 (Центр): Выбранный / Текущий активный ранг */}
          <div
            className="md:col-span-6 p-4 rounded-2xl border bg-[#131B22]/95 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300"
            style={{
              borderColor: `${inspectedPalette.accentHex}88`,
              boxShadow: `0 0 28px rgba(${inspectedPalette.rgb}, 0.18)`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <RankPortraitThumb
                  atlasImage={atlasImage}
                  rankIndex={inspectedRank.index}
                  size={96}
                  includeOriginalLabel={profile.showOriginalAtlasCaption}
                  className="ring-2 ring-white/20 shadow-xl"
                />
                <span
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-950 whitespace-nowrap shadow"
                  style={{ backgroundColor: inspectedPalette.accentHex }}
                >
                  {inspectedMeta.tierLabel}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: inspectedPalette.accentHex }}
                  >
                    #{inspectedRank.index + 1} · {inspectedRank.pslScoreLabel}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-white font-display tracking-tight mt-0.5">
                  {inspectedRank.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white/10 text-slate-200">
                    {inspectedMeta.tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400">
                    {inspectedMeta.keyFeature}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto text-center sm:text-right px-4 py-2.5 rounded-xl bg-[#0B1015] border border-white/10 shrink-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Множитель стадии
              </div>
              <div
                className="text-2xl font-mono font-extrabold tabular-nums mt-0.5"
                style={{ color: inspectedPalette.accentHex }}
              >
                ×{inspectedRank.rankMultiplier.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                {inspectedRank.index === stats.currentRank.index
                  ? '● Активен сейчас'
                  : '✓ В коллекции'}
              </div>
            </div>
          </div>

          {/* Слот 3: Следующая цель или Вершина */}
          <div className="md:col-span-3 p-3.5 rounded-xl bg-[#0D1217]/90 border border-white/10 flex items-center gap-3.5">
            <RankPortraitThumb
              atlasImage={atlasImage}
              rankIndex={nextLockedRank.index}
              size={68}
              includeOriginalLabel={profile.showOriginalAtlasCaption}
              locked={!isAllUnlocked}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                {isAllUnlocked ? 'Вершина взята' : 'Следующая цель'}
              </div>
              <div className="text-base font-bold text-white font-display truncate">
                {isAllUnlocked ? 'True Adam' : nextLockedRank.title}
              </div>
              {!isAllUnlocked ? (
                <div className="mt-1.5 space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-200"
                      style={{ width: `${nextRankProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
                    <span>{nextRankProgress.toFixed(0)}%</span>
                    <span>{formatLooks(nextLockedRank.requiredLooks)} PSL</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300">
                  Все 8 стадий открыты
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* СЕТКА ИЗ 8 КОЛЛЕКЦИОННЫХ КАРТОЧЕК-СТУПЕНЕЙ (МИНИМУМ ТЕКСТА, МАКСИМУМ ВИЗУАЛА) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PSL_RANKS.map((rank) => {
          const isUnlocked = profile.highestRankIndexReached >= rank.index;
          const isCurrent = stats.currentRank.index === rank.index;
          const isSelected = inspectedRank.index === rank.index;
          const palette = RANK_LED_PALETTES[rank.index] || RANK_LED_PALETTES[0];
          const badge = RANK_SHORT_BADGES[rank.index] || RANK_SHORT_BADGES[0];

          const unlockRatio = isUnlocked
            ? 100
            : Math.max(
                0,
                Math.min(
                  100,
                  (profile.currentRunTotalLooks / Math.max(1, rank.requiredLooks)) * 100
                )
              );

          return (
            <div
              key={rank.id}
              onClick={() => {
                if (isUnlocked) setSelectedRankIndex(rank.index);
              }}
              role={isUnlocked ? 'button' : undefined}
              tabIndex={isUnlocked ? 0 : -1}
              onKeyDown={(e) => {
                if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setSelectedRankIndex(rank.index);
                }
              }}
              className={`group relative rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                isUnlocked ? 'cursor-pointer hover:-translate-y-0.5' : ' opacity-80'
              } ${
                isCurrent
                  ? 'bg-[#17212B]'
                  : isUnlocked
                  ? 'bg-[#141C24] hover:bg-[#18222C]'
                  : 'bg-[#10151B] border-[#1E262E]'
              }`}
              style={{
                borderColor: isCurrent
                  ? palette.accentHex
                  : isSelected && isUnlocked
                  ? `${palette.accentHex}88`
                  : isUnlocked
                  ? '#2A343D'
                  : '#1E262D',
                boxShadow: isCurrent
                  ? `0 10px 30px rgba(0,0,0,0.5), 0 0 22px rgba(${palette.rgb}, 0.25)`
                  : undefined,
              }}
            >
              {/* Верхняя диодная полоска цвета ранга */}
              <div
                className="pointer-events-none absolute top-0 left-6 right-6 h-[2.5px] rounded-b-full transition-opacity"
                style={{
                  backgroundColor: isUnlocked ? palette.accentHex : '#334155',
                  opacity: isCurrent ? 1 : isUnlocked ? 0.65 : 0.25,
                }}
              />

              {/* Шапка карточки: Номер ступени + Tier-бейдж */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">
                  0{rank.index + 1} · {rank.pslScoreLabel.replace(' · Божественный золотой стандарт', '')}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider"
                  style={{
                    backgroundColor: isUnlocked
                      ? `rgba(${palette.rgb}, 0.16)`
                      : 'rgba(51, 65, 85, 0.35)',
                    color: isUnlocked ? palette.accentHex : '#64748B',
                  }}
                >
                  {badge.tierLabel}
                </span>
              </div>

              {/* Центральный крупный портрет на подиуме */}
              <div className="my-3.5 flex flex-col items-center justify-center relative">
                <div
                  className="p-1.5 rounded-2xl transition-transform duration-200 group-hover:scale-[1.03]"
                  style={{
                    background: isUnlocked
                      ? `linear-gradient(180deg, rgba(${palette.rgb}, 0.28), rgba(15, 20, 25, 0.2))`
                      : 'rgba(15, 23, 42, 0.4)',
                  }}
                >
                  <RankPortraitThumb
                    atlasImage={atlasImage}
                    rankIndex={rank.index}
                    size={128}
                    includeOriginalLabel={profile.showOriginalAtlasCaption}
                    locked={!isUnlocked}
                  />
                </div>

                {/* Плашка множителя дохода поверх нижней кромки портрета */}
                <div
                  className="mt-2.5 px-3 py-1 rounded-xl font-mono text-xs font-extrabold tabular-nums border shadow-sm"
                  style={{
                    backgroundColor: isUnlocked
                      ? `rgba(${palette.rgb}, 0.14)`
                      : 'rgba(15, 23, 42, 0.7)',
                    borderColor: isUnlocked
                      ? `${palette.accentHex}55`
                      : 'rgba(255, 255, 255, 0.07)',
                    color: isUnlocked ? '#FFFFFF' : '#94A3B8',
                  }}
                >
                  Доход{' '}
                  <span style={{ color: isUnlocked ? palette.accentHex : '#CBD5E1' }}>
                    ×{rank.rankMultiplier.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Название ранга + короткий тег в 2 слова */}
              <div className="text-center">
                <h3 className="text-lg font-extrabold text-white font-display tracking-tight">
                  {rank.title}
                </h3>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <span className="truncate">{badge.tag}</span>
                  <span className="text-slate-600">·</span>
                  <span className="truncate text-slate-300">{badge.keyFeature}</span>
                </div>
              </div>

              {/* Нижний статус-бар карточки (Открыто / Активен / Прогресс разблокировки) */}
              <div className="mt-3.5 pt-2.5 border-t border-white/10">
                {isCurrent ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ТЕКУЩИЙ РАНГ</span>
                  </div>
                ) : isUnlocked ? (
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="text-emerald-400 font-semibold">✓ Открыто</span>
                    <span className="text-slate-400">
                      {rank.requiredLooks === 0 ? 'Старт' : `${formatLooks(rank.requiredLooks)} PSL`}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-slate-400">Цель: {formatLooks(rank.requiredLooks)}</span>
                      <span className="text-amber-400 font-semibold">
                        {unlockRatio.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-200"
                        style={{ width: `${unlockRatio}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface RebirthViewProps {
  profile: PlayerProfileData;
  stats: ComputedStats;
  atlasImage?: HTMLImageElement | null;
  onTriggerRebirth: () => void;
  onBuyPerk: (perkId: string) => void;
}

interface PerkGifMeta {
  shortTitle: string;
  memeHero: string;
  gifUrl: string;
  colorHex: string;
  rgb: string;
  bonusText: (lvl: number) => string;
  nextBonusText: (lvl: number) => string;
}

const PERK_GIF_META: Record<string, PerkGifMeta> = {
  hunter_eyes: {
    shortTitle: 'Охотничий взгляд',
    memeHero: 'Jordan Barrett · Hunter Eyes',
    gifUrl: '/assets/loading/jordan_barrett_mewing.gif',
    colorHex: '#38BDF8',
    rgb: '56, 189, 248',
    bonusText: (lvl) => `+${lvl * 60}% к силе клика`,
    nextBonusText: () => '+60% клик',
  },
  hollow_cheeks: {
    shortTitle: 'Впалые щёки',
    memeHero: 'Handsome Squidward · Скулы',
    gifUrl: '/assets/perks/handsome_squidward.gif',
    colorHex: '#10B981',
    rgb: '16, 185, 129',
    bonusText: (lvl) => `+${lvl * 50}% к пассиву`,
    nextBonusText: () => '+50% пассив',
  },
  gonial_angle: {
    shortTitle: 'Челюсть 120°',
    memeHero: 'Jawline Check · Бритва 120°',
    gifUrl: '/assets/perks/jawline_check.gif',
    colorHex: '#F59E0B',
    rgb: '245, 158, 11',
    bonusText: (lvl) => `+${lvl * 3}% крит · ×${(3 + lvl * 1.2).toFixed(1)}`,
    nextBonusText: () => '+3% крит',
  },
  forward_maxilla: {
    shortTitle: 'Максилла Сигмы',
    memeHero: 'Patrick Bateman · Routine',
    gifUrl: '/assets/loading/patrick_bateman_sigma.gif',
    colorHex: '#A855F7',
    rgb: '168, 85, 247',
    bonusText: (lvl) => `Скидка -${Math.min(56, lvl * 7)}% в магазине`,
    nextBonusText: () => '-7% цены',
  },
  adams_lineage: {
    shortTitle: 'Геном Адама',
    memeHero: 'David Laid · Peak Physique',
    gifUrl: '/assets/perks/david_laid.gif',
    colorHex: '#F43F5E',
    rgb: '244, 63, 94',
    bonusText: (lvl) => `+${lvl * 35}% оффлайн доход`,
    nextBonusText: () => '+35% оффлайн',
  },
};

// Чистые фото эталонов эстетики / Адамов для космического фона (без надписей и плашек)
const BACKGROUND_ADAMS_PHOTOS = [
  {
    src: '/assets/adams/sean_opry_2.jpg',
    className: 'top-[9%] left-[2%] w-44 sm:w-56 md:w-64 aspect-[3/4] -rotate-6',
  },
  {
    src: '/assets/adams/david_gandy_2.jpg',
    className: 'top-[10%] right-[2%] w-44 sm:w-56 md:w-64 aspect-[3/4] rotate-6',
  },
  {
    src: '/assets/adams/alain_delon.jpg',
    className: 'bottom-[7%] left-[4%] w-48 sm:w-60 md:w-72 aspect-[4/3] rotate-3',
  },
  {
    src: '/assets/adams/hernan_drago.jpg',
    className: 'bottom-[7%] right-[4%] w-44 sm:w-56 md:w-64 aspect-[3/4] -rotate-4',
  },
  {
    src: '/assets/adams/david_gandy_1.jpg',
    className: 'top-[42%] left-[18%] w-40 sm:w-52 md:w-60 aspect-[3/4] -rotate-3 hidden lg:block',
  },
  {
    src: '/assets/perks/david_laid.gif',
    className: 'top-[42%] right-[18%] w-40 sm:w-52 md:w-60 aspect-[3/4] rotate-3 hidden lg:block',
  },
];

// Звездные искры на фоне космоса
const COSMIC_DNA_SPARKS = [
  { left: '8%', top: '18%', size: 3.5, color: '#FBBF24', delay: '0s', duration: '4.5s' },
  { left: '16%', top: '68%', size: 3, color: '#38BDF8', delay: '1.1s', duration: '5.2s' },
  { left: '27%', top: '24%', size: 4, color: '#F59E0B', delay: '0.6s', duration: '4.8s' },
  { left: '38%', top: '82%', size: 3, color: '#FFFFFF', delay: '1.8s', duration: '5.5s' },
  { left: '52%', top: '14%', size: 4, color: '#FBBF24', delay: '0.3s', duration: '4.2s' },
  { left: '64%', top: '76%', size: 3.5, color: '#38BDF8', delay: '2.2s', duration: '5.0s' },
  { left: '78%', top: '22%', size: 4, color: '#FFFFFF', delay: '0.9s', duration: '4.6s' },
  { left: '89%', top: '62%', size: 3.5, color: '#F59E0B', delay: '1.5s', duration: '5.4s' },
  { left: '93%', top: '28%', size: 3, color: '#38BDF8', delay: '0.4s', duration: '4.9s' },
];

export const GeneticsRebirthView: React.FC<RebirthViewProps> = ({
  profile,
  stats,
  onTriggerRebirth,
  onBuyPerk,
}) => {
  const chadliteTarget = PSL_RANKS[5].requiredLooks;
  const rebirthProgress = Math.min(
    100,
    (profile.currentRunTotalLooks / chadliteTarget) * 100
  );
  const nextGenMultiplier = 1 + profile.generation * 0.4;

  return (
    <div className="relative space-y-5 select-none">
      {/* ПОЛНОЭКРАННЫЙ ФОН: ЗВЕЗДНОЕ НЕБО + ЧИСТЫЕ ФОТО АДАМОВ БЕЗ НАДПИСЕЙ */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {/* 1. Звездное небо и космическая туманность */}
        <img
          src="/assets/adams/nebula_1.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 opacity-75"
          style={{
            filter: 'saturate(1.2) contrast(1.08)',
          }}
        />

        {/* 2. Чистые фотографии эталонов эстетики на фоне звездного неба (без текста и подписей) */}
        <div className="absolute inset-0">
          {BACKGROUND_ADAMS_PHOTOS.map((photo, idx) => (
            <div
              key={idx}
              className={`absolute ${photo.className} rounded-2xl overflow-hidden border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.75)] opacity-45`}
            >
              <img
                src={photo.src}
                alt=""
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />
            </div>
          ))}
        </div>

        {/* 3. Мягкая звездная вуаль для читаемости карточек поверх фона */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.12) 0%, transparent 55%),
              radial-gradient(circle at 20% 70%, rgba(245, 158, 11, 0.12) 0%, transparent 50%),
              linear-gradient(180deg, rgba(7, 10, 16, 0.55) 0%, rgba(7, 10, 16, 0.38) 50%, rgba(7, 10, 16, 0.72) 100%)
            `,
          }}
        />

        {/* 4. Мерцающие звезды */}
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
              boxShadow: `0 0 10px ${spark.color}, 0 0 20px ${spark.color}`,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
      </div>

      {/* ВЕРХНИЙ ЖИВОЙ БАННЕР РЕБОРНА С GIF-АНИМАЦИЕЙ */}
      <div className="relative z-10 rounded-2xl border border-amber-500/45 bg-gradient-to-r from-[#171210]/80 via-[#121922]/75 to-[#0E141C]/80 backdrop-blur-md p-4 sm:p-5 overflow-hidden shadow-[0_16px_44px_rgba(0,0,0,0.65)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/3 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Слева: Живая 3D-спираль ДНК + Статус Поколения */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto text-center sm:text-left">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_28px_rgba(245,158,11,0.35)] shrink-0 bg-slate-950">
              <img
                src="/assets/perks/dna_helix.gif"
                alt="DNA Helix Rebirth"
                className="w-full h-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap">
                ПОК. {profile.generation}
              </span>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-mono font-bold text-amber-300">
                <span>🧬 Баланс: {profile.dnaPoints} ДНК</span>
                <span className="text-white/25">·</span>
                <span className="text-emerald-300">
                  Доход ×{stats.generationMultiplier.toFixed(2)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight">
                Смена Поколения · Новая Генетика
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200">
                  Поколение {profile.generation} ➔{' '}
                  <strong className="text-amber-300">Поколение {profile.generation + 1}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-bold">
                  Множитель ×{nextGenMultiplier.toFixed(2)} навсегда
                </span>
              </div>
            </div>
          </div>

          {/* Справа: Шкала до Chadlite + Крупная кнопка Реборна */}
          <div className="w-full lg:w-[360px] p-3.5 rounded-2xl bg-[#0B1016]/85 backdrop-blur-md border border-white/15 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-300">
                {stats.canRebirth ? 'Реборн открыт!' : 'Нужен ранг Chadlite'}
              </span>
              <span className="text-amber-400 font-extrabold">
                {stats.canRebirth
                  ? `+${stats.pendingRebirthDNA} ДНК`
                  : `${rebirthProgress.toFixed(0)}% (${formatLooks(chadliteTarget)} PSL)`}
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-200"
                style={{ width: `${rebirthProgress}%` }}
              />
            </div>

            <button
              type="button"
              disabled={!stats.canRebirth}
              onClick={onTriggerRebirth}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-mono font-extrabold uppercase tracking-wide transition-all ${
                stats.canRebirth
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 shadow-[0_6px_24px_rgba(245,158,11,0.45)] hover:brightness-110 active:scale-[0.99] cursor-pointer'
                  : 'bg-[#182028]/90 text-slate-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              {stats.canRebirth
                ? `⚡ ПЕРЕРОДИТЬСЯ (+${stats.pendingRebirthDNA} ДНК)`
                : '🔒 Прокачайся до Chadlite'}
            </button>
          </div>
        </div>
      </div>

      {/* СЕТКА МУТАЦИЙ ДНК С ЖИВЫМИ ГИФКАМИ ЛУКСМАКСЕРОВ */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {DNA_PERKS.map((perk: DNAPerkDefinition) => {
          const currentLvl = profile.perkLevels[perk.id] || 0;
          const isMax = currentLvl >= perk.maxLevel;
          const cost = calculatePerkDnaCost(perk, currentLvl);
          const canAfford = !isMax && profile.dnaPoints >= cost;
          const meta = PERK_GIF_META[perk.id] || PERK_GIF_META['hunter_eyes'];
          const progressPct = Math.min(100, (currentLvl / perk.maxLevel) * 100);

          return (
            <div
              key={perk.id}
              className="group relative rounded-2xl border bg-[#111821]/75 hover:bg-[#16202C]/85 backdrop-blur-md p-3.5 flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
              style={{
                borderColor: canAfford
                  ? meta.colorHex
                  : currentLvl > 0
                  ? `${meta.colorHex}66`
                  : 'rgba(255,255,255,0.14)',
                boxShadow: canAfford
                  ? `0 8px 25px rgba(${meta.rgb}, 0.25)`
                  : undefined,
              }}
            >
              {/* Живая GIF-карточка наверху */}
              <div>
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-white/15">
                  <img
                    src={meta.gifUrl}
                    alt={meta.shortTitle}
                    loading="eager"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent" />

                  {/* Бейдж зоны лица в левом верхнем углу */}
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-950 shadow"
                    style={{ backgroundColor: meta.colorHex }}
                  >
                    {perk.traitCode}
                  </span>

                  {/* Уровень в правом верхнем углу */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white tabular-nums">
                    Ур. {currentLvl}/{perk.maxLevel}
                  </span>

                  {/* Короткая подпись героя на нижней кромке GIF */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-200 truncate">
                      {meta.memeHero}
                    </span>
                  </div>
                </div>

                {/* Название и главный бонус крупно */}
                <div className="mt-3 text-center">
                  <h3 className="text-base font-extrabold text-white font-display tracking-tight truncate">
                    {meta.shortTitle}
                  </h3>
                  <div
                    className="mt-1 text-xs font-mono font-bold tabular-nums"
                    style={{ color: meta.colorHex }}
                  >
                    {meta.bonusText(currentLvl)}
                  </div>
                </div>
              </div>

              {/* Прогресс-бар уровня + Кнопка покупки за ДНК */}
              <div className="mt-3.5 pt-3 border-t border-white/10 space-y-2.5">
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full transition-all duration-200"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: meta.colorHex,
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => onBuyPerk(perk.id)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-extrabold tabular-nums transition-all whitespace-nowrap ${
                    isMax
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : canAfford
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_4px_14px_rgba(16,185,129,0.4)] cursor-pointer'
                      : 'bg-[#1D2630]/90 text-slate-400 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {isMax
                    ? 'МАКСИМУМ ✓'
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

interface LeaderboardAndBalanceViewProps {
  profile: PlayerProfileData;
  stats: ComputedStats;
  leaderboard: LeaderboardEntry[];
  sdkMode: 'yagames_cloud' | 'local_storage';
  onForceCloudSave: () => void;
  onSimulateOfflineTime: (seconds: number) => void;
  onResetProgress: () => void;
}

export const LeaderboardAndBalanceView: React.FC<LeaderboardAndBalanceViewProps> = ({
  profile,
  stats,
  leaderboard,
  sdkMode,
  onForceCloudSave,
  onSimulateOfflineTime,
  onResetProgress,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Таблица лидеров Яндекс Игр */}
      <div className="lg:col-span-7 p-5 rounded-xl border border-[#2A343D] bg-[#182026] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A343D] pb-3">
          <div>
            <h2 className="text-lg font-semibold text-[#F1F5F9] font-display">
              Таблица лидеров Яндекс Игр
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Глобальный рейтинг игроков по суммарно набранным очкам внешности за все поколения.
            </p>
          </div>
          <button
            type="button"
            onClick={onForceCloudSave}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#222C34] text-[#F1F5F9] border border-[#2A343D] hover:border-emerald-500/50 transition-colors whitespace-nowrap shrink-0"
          >
            Синхронизировать с облаком
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2A343D] text-[#94A3B8]">
                <th className="py-2.5 px-2 font-medium">#</th>
                <th className="py-2.5 px-2 font-medium">Игрок</th>
                <th className="py-2.5 px-2 font-medium">Поколение</th>
                <th className="py-2.5 px-2 font-medium">Пиковый ранг</th>
                <th className="py-2.5 px-2 font-medium text-right">Всего PSL очков</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A343D]/60 font-mono tabular-nums">
              {leaderboard.map((row) => (
                <tr
                  key={`${row.name}-${row.rank}`}
                  className={
                    row.isCurrentUser
                      ? 'bg-emerald-500/10 text-emerald-300 font-semibold'
                      : 'text-[#F1F5F9]'
                  }
                >
                  <td className="py-2.5 px-2">{row.rank}</td>
                  <td className="py-2.5 px-2 font-sans">
                    {row.name} {row.isCurrentUser ? '(Вы)' : ''}
                  </td>
                  <td className="py-2.5 px-2">Пок. {row.generation}</td>
                  <td className="py-2.5 px-2">{row.highestRankTitle}</td>
                  <td className="py-2.5 px-2 text-right">
                    {formatLooks(row.lifetimeLooks)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Статистика профиля, калькулятор 24ч баланса и симуляция оффлайн-времени */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-5 rounded-xl border border-[#2A343D] bg-[#182026] space-y-4">
          <h3 className="text-base font-semibold text-[#F1F5F9] font-display">
            Профиль и статус YaGames SDK v2
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
            <div className="p-3 rounded-lg bg-[#0F1419] border border-[#2A343D]">
              <div className="text-[#94A3B8] font-sans">Режим сохранения</div>
              <div className="text-emerald-400 font-semibold mt-1">
                {sdkMode === 'yagames_cloud'
                  ? 'YaGames Cloud + Local'
                  : 'Асинхронный LocalStorage'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0F1419] border border-[#2A343D]">
              <div className="text-[#94A3B8] font-sans">Время в игре</div>
              <div className="text-[#F1F5F9] font-semibold mt-1">
                {formatDuration(profile.totalPlayTimeSec)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0F1419] border border-[#2A343D]">
              <div className="text-[#94A3B8] font-sans">Всего кликов / Критов</div>
              <div className="text-[#F1F5F9] font-semibold mt-1">
                {profile.totalClicks} / {profile.totalCriticalHits}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0F1419] border border-[#2A343D]">
              <div className="text-[#94A3B8] font-sans">Шанс крита молотка</div>
              <div className="text-amber-400 font-semibold mt-1">
                {(stats.critChance * 100).toFixed(1)}% (×{stats.critMultiplier.toFixed(1)})
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2A343D] space-y-2.5">
            <div className="text-xs font-medium text-[#F1F5F9]">
              Тестирование 24-часового оффлайн-баланса (Прыжок во времени)
            </div>
            <p className="text-xs text-[#94A3B8]">
              Проверьте, сколько очков принесут купленные мази и процедуры за время отсутствия игрока:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSimulateOfflineTime(1800)}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-[#222C34] hover:bg-[#2A343D] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0"
              >
                +30 мин
              </button>
              <button
                type="button"
                onClick={() => onSimulateOfflineTime(7200)}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-[#222C34] hover:bg-[#2A343D] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0"
              >
                +2 часа
              </button>
              <button
                type="button"
                onClick={() => onSimulateOfflineTime(28800)}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-[#222C34] hover:bg-[#2A343D] text-amber-400 border border-[#2A343D] transition-colors whitespace-nowrap shrink-0"
              >
                +8ч (Сон)
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2A343D] flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Полный сброс сохранения</span>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors whitespace-nowrap shrink-0"
              >
                Сбросить прогресс
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors whitespace-nowrap shrink-0"
                >
                  Подтвердить
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#222C34] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
