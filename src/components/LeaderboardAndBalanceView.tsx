import React, { useState } from 'react';
import { ComputedStats } from '../modules/mechanics';
import { LeaderboardEntry, PlayerProfileData } from '../modules/profile';
import { formatDuration, formatLooks } from '../modules/utils';

export interface LeaderboardAndBalanceViewProps {
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
