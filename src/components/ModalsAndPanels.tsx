import React, { useState } from 'react';
import {
  calculatePerkDnaCost,
  ComputedStats,
  DNA_PERKS,
  GENERATION_TITLES,
  PSL_RANKS,
} from '../modules/mechanics';
import { LeaderboardEntry, PlayerProfileData } from '../modules/profile';
import { PSL_ATLAS_URL } from '../modules/renderer';
import { formatDuration, formatLooks } from '../modules/utils';
import { RankPortraitThumb } from './RankPortraitThumb';

interface EvolutionViewProps {
  profile: PlayerProfileData;
  stats: ComputedStats;
  atlasImage: HTMLImageElement | null;
  onToggleOriginalCaption: () => void;
}

export const EvolutionAtlasView: React.FC<EvolutionViewProps> = ({
  profile,
  stats,
  atlasImage,
  onToggleOriginalCaption,
}) => {
  const [showFullSheet, setShowFullSheet] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A343D] pb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#F1F5F9] font-display">
            Атлас эволюции внешности (8 стадий PSL)
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Каждая достигнутая стадия открывает новый портрет из референса и умножает весь ваш доход.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleOriginalCaption}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#2A343D] bg-[#182026] text-[#F1F5F9] hover:border-[#3E4C59] transition-colors whitespace-nowrap shrink-0"
          >
            {profile.showOriginalAtlasCaption
              ? 'Режим: С оригинальной подписью'
              : 'Режим: Чистый портрет'}
          </button>
          <button
            type="button"
            onClick={() => setShowFullSheet((prev) => !prev)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#2A343D] bg-[#182026] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0"
          >
            {showFullSheet ? 'Скрыть исходный лист' : 'Показать весь лист-референс'}
          </button>
        </div>
      </div>

      {showFullSheet && (
        <div className="p-5 rounded-xl border border-[#2A343D] bg-[#182026] flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white p-3 rounded-lg border border-[#2A343D] shrink-0 max-w-[280px]">
            <img
              src={PSL_ATLAS_URL}
              alt="Табличный референс шкалы PSL от sub 3 до true adam"
              referrerPolicy="no-referrer"
              className="w-full h-auto block rounded"
            />
          </div>
          <div className="space-y-3 text-sm text-[#94A3B8]">
            <h3 className="text-base font-semibold text-[#F1F5F9] font-display">
              Исходный спрайт-атлас шкалы PSL
            </h3>
            <p>
              Движок игры (<span className="text-[#F1F5F9] font-mono">PSLSpriteRenderer</span>)
              напрямую кадрирует 8 стадий из этого листа по нормализованным UV-координатам и
              накладывает антропометрическую сетку, удары ортопедического молотка и маркеры
              наследственных перков ДНК.
            </p>
            <div className="text-xs text-[#94A3B8] font-mono tabular-nums">
              <span>Открыто стадий: {profile.highestRankIndexReached + 1} из 8</span>
              <span className="mx-2">·</span>
              <span>Текущий ранг: {stats.currentRank.title}</span>
              <span className="mx-2">·</span>
              <span>Множитель ранга: ×{stats.currentRank.rankMultiplier.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PSL_RANKS.map((rank) => {
          const isUnlocked = profile.highestRankIndexReached >= rank.index;
          const isCurrent = stats.currentRank.index === rank.index;

          return (
            <div
              key={rank.id}
              className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
                isCurrent
                  ? 'border-emerald-500/70 bg-[#182026]'
                  : isUnlocked
                  ? 'border-[#2A343D] bg-[#182026]'
                  : 'border-[#1E262D] bg-[#13191E] opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <RankPortraitThumb
                    atlasImage={atlasImage}
                    rankIndex={rank.index}
                    size={76}
                    includeOriginalLabel={profile.showOriginalAtlasCaption}
                    locked={!isUnlocked}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-[#94A3B8] font-mono tabular-nums">
                      <span>0{rank.index + 1}</span>
                      <span className="mx-1.5">·</span>
                      <span>{rank.pslScoreLabel}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#F1F5F9] font-display truncate mt-0.5">
                      {rank.title}
                    </h3>
                    <div className="text-xs text-emerald-400 font-mono tabular-nums mt-0.5">
                      Доход ×{rank.rankMultiplier.toFixed(2)}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed">
                  {rank.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2A343D] flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-[#94A3B8]">
                  Порог: {formatLooks(rank.requiredLooks)} PSL
                </span>
                <span
                  className={
                    isCurrent
                      ? 'text-emerald-400 font-semibold'
                      : isUnlocked
                      ? 'text-[#F1F5F9]'
                      : 'text-[#64748B]'
                  }
                >
                  {isCurrent ? 'Активен' : isUnlocked ? 'Открыт' : 'Закрыт'}
                </span>
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
  onTriggerRebirth: () => void;
  onBuyPerk: (perkId: string) => void;
}

export const GeneticsRebirthView: React.FC<RebirthViewProps> = ({
  profile,
  stats,
  onTriggerRebirth,
  onBuyPerk,
}) => {
  const currentGenTitle =
    GENERATION_TITLES[Math.min(GENERATION_TITLES.length - 1, profile.generation - 1)];
  const nextGenTitle =
    GENERATION_TITLES[Math.min(GENERATION_TITLES.length - 1, profile.generation)];
  const chadliteTarget = PSL_RANKS[5].requiredLooks;
  const rebirthProgress = Math.min(
    100,
    (profile.currentRunTotalLooks / chadliteTarget) * 100
  );

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl border border-[#2A343D] bg-[#182026] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs text-amber-400 font-mono tabular-nums">
            <span>{currentGenTitle}</span>
            <span className="mx-2">·</span>
            <span>Множитель династии ×{stats.generationMultiplier.toFixed(2)}</span>
            <span className="mx-2">·</span>
            <span>Доступно ДНК: {profile.dnaPoints}</span>
          </div>
          <h2 className="text-xl font-semibold text-[#F1F5F9] font-display">
            Многоступенчатая смена поколений (Генетический Реборн)
          </h2>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Достигнув ранга <span className="text-[#F1F5F9] font-medium">Chadlite</span> (
            {formatLooks(chadliteTarget)} очков за поколение), вы можете передать накопленную
            эстетику следующему поколению. Очки и мази сбрасываются, но вы навсегда получаете{' '}
            <span className="text-amber-400 font-medium">+40% к доходу династии</span> и{' '}
            <span className="text-amber-400 font-medium">Очки ДНК</span> для прокачки врожденных
            черт лица.
          </p>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          <div className="text-right font-mono tabular-nums">
            <div className="text-xs text-[#94A3B8]">Награда при смене поколения:</div>
            <div className="text-xl font-bold text-amber-400">
              +{stats.pendingRebirthDNA} ДНК
            </div>
          </div>

          <button
            type="button"
            disabled={!stats.canRebirth}
            onClick={onTriggerRebirth}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              stats.canRebirth
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer'
                : 'bg-[#222C34] text-[#64748B] border border-[#2A343D] cursor-not-allowed'
            }`}
          >
            {stats.canRebirth
              ? `Перейти в Поколение ${profile.generation + 1} (+${stats.pendingRebirthDNA} ДНК)`
              : `Требуется ранг Chadlite (${rebirthProgress.toFixed(1)}%)`}
          </button>
          <div className="text-xs text-[#94A3B8]">
            Следующий титул: <span className="text-[#F1F5F9]">{nextGenTitle}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#F1F5F9] font-display">
            Наследственные перки внешности (Вкладывайте Очки ДНК)
          </h3>
          <div className="text-xs font-mono tabular-nums text-amber-400">
            Баланс ДНК: {profile.dnaPoints} · Всего заработано: {profile.totalDnaEarned}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DNA_PERKS.map((perk) => {
            const currentLvl = profile.perkLevels[perk.id] || 0;
            const isMax = currentLvl >= perk.maxLevel;
            const cost = calculatePerkDnaCost(perk, currentLvl);
            const canAfford = !isMax && profile.dnaPoints >= cost;

            return (
              <div
                key={perk.id}
                className="p-4 rounded-xl border border-[#2A343D] bg-[#182026] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono tabular-nums">
                    <span>{perk.traitCode}</span>
                    <span>
                      Уровень {currentLvl} / {perk.maxLevel}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-[#F1F5F9] font-display mt-1">
                    {perk.name}
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                    {perk.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2A343D] space-y-3">
                  <div className="text-xs text-emerald-400 font-mono tabular-nums">
                    Текущий бонус: {perk.effectSummary(currentLvl)}
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onBuyPerk(perk.id)}
                    className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isMax
                        ? 'bg-[#222C34] text-emerald-400 border border-[#2A343D] cursor-default'
                        : canAfford
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer'
                        : 'bg-[#222C34] text-[#64748B] border border-[#2A343D] cursor-not-allowed'
                    }`}
                  >
                    {isMax
                      ? 'Максимальный геном'
                      : `Улучшить черту за ${cost} ДНК`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
