import React, { useState } from 'react';
import {
  ComputedStats,
  PSL_RANKS,
  RANK_LED_PALETTES,
} from '../modules/mechanics';
import { PlayerProfileData } from '../modules/profile';
import { formatLooks } from '../modules/utils';
import { OlympusTitansBattleBackdrop } from './OlympusTitansBattleBackdrop';
import { RankPortraitThumb } from './RankPortraitThumb';

export interface EvolutionViewProps {
  profile: PlayerProfileData;
  stats: ComputedStats;
  atlasImage: HTMLImageElement | null;
  onToggleOriginalCaption: () => void;
}

export const EvolutionAtlasView: React.FC<EvolutionViewProps> = ({
  profile,
  stats,
  atlasImage,
}) => {
  const [selectedRankIndex, setSelectedRankIndex] = useState<number>(
    stats.currentRank.index
  );
  const [watchBattleMode, setWatchBattleMode] = useState<boolean>(false);

  const unlockedCount = profile.highestRankIndexReached + 1;
  const inspectedRank =
    PSL_RANKS[Math.min(PSL_RANKS.length - 1, Math.max(0, selectedRankIndex))] ||
    stats.currentRank;
  const inspectedPalette =
    RANK_LED_PALETTES[inspectedRank.index] || RANK_LED_PALETTES[0];

  const nextLockedRank =
    PSL_RANKS[Math.min(PSL_RANKS.length - 1, profile.highestRankIndexReached + 1)];
  const isAllUnlocked = profile.highestRankIndexReached >= PSL_RANKS.length - 1;

  const nextRankProgress = isAllUnlocked
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          (profile.currentRunTotalLooks / Math.max(1, nextLockedRank.requiredLooks)) *
            100
        )
      );

  return (
    <>
      {/* ФОН ОЛИМПА + ЖИВАЯ АНИМАЦИЯ БОЯ ГРЕЧЕСКИХ НАКАЧАННЫХ ТИТАНОВ */}
      <OlympusTitansBattleBackdrop rankIndex={inspectedRank.index} />

      <div className="relative z-10 space-y-4 select-none">
        {/* КОМПАКТНАЯ ВЕРХНЯЯ ПАНЕЛЬ */}
        <div className="relative rounded-2xl border border-amber-400/30 bg-[#0D131B]/72 backdrop-blur-md p-3.5 sm:p-4 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Слева: Текущий / выбранный портрет + краткий титул и множитель */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <RankPortraitThumb
                atlasImage={atlasImage}
                rankIndex={inspectedRank.index}
                size={68}
                includeOriginalLabel={false}
                className="ring-2 ring-amber-400/40 shadow-lg shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                  <span
                    className="font-extrabold"
                    style={{ color: inspectedPalette.accentHex }}
                  >
                    #{inspectedRank.index + 1} / {PSL_RANKS.length}
                  </span>
                  <span aria-hidden="true" className="text-slate-500">
                    ·
                  </span>
                  <span
                    className="font-extrabold"
                    style={{ color: inspectedPalette.accentHex }}
                  >
                    ×{inspectedRank.rankMultiplier.toFixed(2)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight mt-0.5">
                  {inspectedRank.title}
                </h2>
              </div>
            </div>

            {/* Центр: Переключатель режима просмотра боя Олимпа во весь экран + точки рангов */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setWatchBattleMode((prev) => !prev)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-400/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-colors cursor-pointer whitespace-nowrap"
              >
                {watchBattleMode ? 'Показать карточки' : 'Смотреть бой Олимпа'}
              </button>

              <div className="hidden lg:flex items-center gap-1.5 bg-[#090D13]/85 px-3 py-2 rounded-xl border border-white/15">
                {PSL_RANKS.map((r) => {
                  const unlocked = profile.highestRankIndexReached >= r.index;
                  const selected = inspectedRank.index === r.index;
                  const pal = RANK_LED_PALETTES[r.index] || RANK_LED_PALETTES[0];
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRankIndex(r.index)}
                      className={`h-3 rounded-full transition-transform duration-150 cursor-pointer ${
                        selected ? 'w-8 scale-105' : 'w-3 hover:scale-125'
                      }`}
                      style={{
                        backgroundColor: selected || unlocked ? pal.accentHex : '#334155',
                        boxShadow: selected ? `0 0 12px ${pal.accentHex}` : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Справа: Прогресс до следующего ранга */}
            <div className="w-full sm:w-52 p-2.5 rounded-xl bg-[#090D13]/85 border border-white/15">
              <div className="flex items-center justify-between text-xs font-mono font-bold tabular-nums">
                <span className="text-white truncate">
                  {isAllUnlocked
                    ? `Открыто ${unlockedCount}/${PSL_RANKS.length}`
                    : `➔ ${nextLockedRank.title}`}
                </span>
                <span className="text-amber-400">
                  {isAllUnlocked ? '100%' : `${nextRankProgress.toFixed(0)}%`}
                </span>
              </div>
              <div className="mt-1.5 w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-200"
                  style={{ width: `${nextRankProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* СЕТКА ИЗ 8 КАРТОЧЕК (полупрозрачная, чтобы бой на фоне Олимпа был отлично виден) */}
        {!watchBattleMode && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PSL_RANKS.map((rank) => {
              const isUnlocked = profile.highestRankIndexReached >= rank.index;
              const isCurrent = stats.currentRank.index === rank.index;
              const isSelected = inspectedRank.index === rank.index;
              const palette = RANK_LED_PALETTES[rank.index] || RANK_LED_PALETTES[0];

              const unlockRatio = isUnlocked
                ? 100
                : Math.max(
                    0,
                    Math.min(
                      100,
                      (profile.currentRunTotalLooks / Math.max(1, rank.requiredLooks)) *
                        100
                    )
                  );

              return (
                <div
                  key={rank.id}
                  onClick={() => setSelectedRankIndex(rank.index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedRankIndex(rank.index);
                    }
                  }}
                  className={`group relative rounded-2xl border p-3.5 flex flex-col justify-between transition-transform duration-150 overflow-hidden backdrop-blur-[4px] cursor-pointer hover:-translate-y-0.5 ${
                    isSelected
                      ? 'bg-[#151F2A]/72'
                      : isUnlocked
                      ? 'bg-[#111922]/60 hover:bg-[#16202C]/72'
                      : 'bg-[#0D131A]/58 opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: isSelected
                      ? palette.accentHex
                      : isCurrent
                      ? `${palette.accentHex}AA`
                      : isUnlocked
                      ? 'rgba(255,255,255,0.22)'
                      : 'rgba(255,255,255,0.12)',
                    boxShadow: isSelected
                      ? `0 12px 32px rgba(0,0,0,0.6), 0 0 26px rgba(${palette.rgb}, 0.38)`
                      : `0 10px 26px rgba(0,0,0,0.45)`,
                  }}
                >
                  {/* Верхняя диодная полоска */}
                  <div
                    className="pointer-events-none absolute top-0 left-6 right-6 h-[2.5px] rounded-b-full"
                    style={{
                      backgroundColor: isSelected || isUnlocked ? palette.accentHex : '#475569',
                      opacity: isSelected || isCurrent ? 1 : isUnlocked ? 0.7 : 0.35,
                    }}
                  />

                  {/* Шапка карточки: только номер и множитель */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono font-extrabold tabular-nums">
                    <span className="text-slate-300">#{rank.index + 1}</span>
                    <span
                      style={{
                        color: isUnlocked || isSelected ? palette.accentHex : '#94A3B8',
                      }}
                    >
                      ×{rank.rankMultiplier.toFixed(2)}
                    </span>
                  </div>

                  {/* Крупный портрет */}
                  <div className="my-3 flex flex-col items-center justify-center">
                    <div
                      className="p-1.5 rounded-2xl transition-transform duration-150 group-hover:scale-[1.03]"
                      style={{
                        background:
                          isUnlocked || isSelected
                            ? `linear-gradient(180deg, rgba(${palette.rgb}, 0.28), rgba(15, 20, 25, 0.2))`
                            : 'rgba(15, 23, 42, 0.4)',
                      }}
                    >
                      <RankPortraitThumb
                        atlasImage={atlasImage}
                        rankIndex={rank.index}
                        size={124}
                        includeOriginalLabel={false}
                        locked={!isUnlocked && !isSelected}
                      />
                    </div>
                  </div>

                  {/* Только название ранга */}
                  <h3 className="text-center text-base sm:text-lg font-extrabold text-white font-display tracking-tight truncate">
                    {rank.title}
                  </h3>

                  {/* Компактный нижний индикатор */}
                  <div className="mt-2.5 pt-2 border-t border-white/10">
                    {isCurrent ? (
                      <div className="text-center text-[11px] font-mono font-extrabold text-emerald-400">
                        ◆ АКТИВЕН
                      </div>
                    ) : isUnlocked ? (
                      <div className="text-center text-[11px] font-mono font-bold text-emerald-400">
                        ✓ ОТКРЫТ
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                          <span className="text-slate-300">{formatLooks(rank.requiredLooks)}</span>
                          <span className="text-amber-400 font-bold">{unlockRatio.toFixed(0)}%</span>
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
        )}
      </div>
    </>
  );
};
