import React, { useEffect, useState } from 'react';
import {
  ComputedPlayerStats,
  DNA_PERKS,
  PSL_RANKS,
  SHOP_ITEMS,
} from '../modules/mechanics';
import { PlayerProfileData, profileManager } from '../modules/profile';
import { formatDuration, formatLooks, soundEngine } from '../modules/utils';
import { RankPortraitThumb } from './RankPortraitThumb';

const CUSTOM_NICKNAME_KEY = 'psl_player_custom_nickname_v1';

export function loadCustomNickname(): string {
  try {
    const saved = window.localStorage.getItem(CUSTOM_NICKNAME_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch {
    // ignore
  }
  return profileManager.getPlayerDisplayName();
}

export function saveCustomNickname(name: string): void {
  try {
    window.localStorage.setItem(CUSTOM_NICKNAME_KEY, name.trim());
  } catch {
    // ignore
  }
}

export interface PlayerProfileHeaderButtonProps {
  profile: PlayerProfileData;
  stats: ComputedPlayerStats;
  atlasImage: HTMLImageElement | null;
  onClick: () => void;
}

/**
 * Компактная кнопка-иконка профиля для верхней навигационной панели.
 */
export const PlayerProfileHeaderButton: React.FC<PlayerProfileHeaderButtonProps> = ({
  profile,
  stats,
  atlasImage,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Открыть профиль, статистику и настройки"
      className="group relative pl-1.5 pr-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-emerald-400/50 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
    >
      <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-slate-900 flex items-center justify-center shrink-0">
        <RankPortraitThumb
          atlasImage={atlasImage}
          rankIndex={stats.currentRank.index}
          size={28}
        />
      </div>
      <div className="text-left hidden sm:block">
        <div className="text-[11px] font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">
          Профиль
        </div>
        <div className="text-[9px] font-mono text-slate-400 leading-tight">
          Пок. #{profile.generation} · {stats.currentRank.title}
        </div>
      </div>
      {/* Иконка пользователя на мобильных экранах */}
      <svg
        viewBox="0 0 20 20"
        className="w-4 h-4 fill-slate-300 group-hover:fill-emerald-300 sm:hidden"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
};

export interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfileData;
  stats: ComputedPlayerStats;
  atlasImage: HTMLImageElement | null;
  onResetProfile: () => void;
  onToggleOriginalCaption: () => void;
  onForceSaveProfile: () => void;
  onResetTutorialHints: () => void;
}

/**
 * Отдельный независимый компонент модального окна Профиля игрока:
 * - Подробная статистика кликов, критов, времени в игре, рекордов PSL и поколений
 * - Редактирование имени профиля
 * - Быстрые переключатели звуковых эффектов, подписей атласа и подсказок обучения
 * - Безопасный сброс профиля с двухшаговым подтверждением
 */
export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  stats,
  atlasImage,
  onResetProfile,
  onToggleOriginalCaption,
  onForceSaveProfile,
  onResetTutorialHints,
}) => {
  const [nickname, setNickname] = useState<string>(() => loadCustomNickname());
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(nickname);
  const [sfxMuted, setSfxMuted] = useState<boolean>(() => soundEngine.isUserMuted());
  const [confirmResetStep, setConfirmResetStep] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);
  const [tutorialFeedback, setTutorialFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const currentName = loadCustomNickname();
      setNickname(currentName);
      setDraftName(currentName);
      setSfxMuted(soundEngine.isUserMuted());
      setConfirmResetStep(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const highestRank =
    PSL_RANKS[profile.highestRankIndexReached] || PSL_RANKS[0];

  const totalShopUpgradesCount = Object.values(profile.itemLevels).reduce(
    (acc, lvl) => acc + (lvl || 0),
    0
  );
  const unlockedShopTypesCount = SHOP_ITEMS.filter(
    (item) => (profile.itemLevels[item.id] || 0) > 0
  ).length;

  const totalPerkLevelsCount = Object.values(profile.perkLevels).reduce(
    (acc, lvl) => acc + (lvl || 0),
    0
  );
  const maxPossiblePerkLevels = DNA_PERKS.reduce((acc, p) => acc + p.maxLevel, 0);

  const handleSaveNickname = () => {
    const cleaned = draftName.trim() || 'Сигма Асцендер';
    setNickname(cleaned);
    saveCustomNickname(cleaned);
    setIsEditingName(false);
  };

  const handleToggleSfx = () => {
    const nextMuted = !sfxMuted;
    soundEngine.setUserMuted(nextMuted);
    setSfxMuted(nextMuted);
  };

  const handleManualSave = () => {
    onForceSaveProfile();
    setSaveFeedback(true);
    window.setTimeout(() => setSaveFeedback(false), 1600);
  };

  const handleRestoreTutorials = () => {
    onResetTutorialHints();
    setTutorialFeedback(true);
    window.setTimeout(() => setTutorialFeedback(false), 1600);
  };

  const handleConfirmReset = () => {
    onResetProfile();
    setConfirmResetStep(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] rounded-3xl border border-white/15 bg-[#0E151F] text-white shadow-[0_28px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(16,185,129,0.12)] overflow-hidden"
      >
        {/* Верхняя декоративная полоса */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400" />

        {/* Шапка модального окна */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-[#131C28]/80">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative rounded-2xl p-1 bg-gradient-to-br from-emerald-400/40 via-sky-500/30 to-amber-400/40 border border-white/20 shrink-0 shadow-lg">
              <RankPortraitThumb
                atlasImage={atlasImage}
                rankIndex={stats.currentRank.index}
                size={68}
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-emerald-500 text-slate-950 shadow">
                #{stats.currentRank.index + 1}/8
              </span>
            </div>

            <div className="min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    maxLength={24}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNickname();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    className="px-2.5 py-1 rounded-lg bg-[#090D14] border border-emerald-400/60 text-sm font-bold text-white focus:outline-none w-44"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNickname}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    ОК
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white truncate">
                    {nickname}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    title="Изменить имя игрока"
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 cursor-pointer shrink-0"
                  >
                    Изм. имя
                  </button>
                </div>
              )}

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-semibold">
                  {stats.currentRank.title} · {stats.currentRank.pslScoreLabel}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono font-semibold">
                  Поколение #{profile.generation}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {profileManager.isCloudActive()
                    ? '☁ Облако синхронизировано'
                    : '💾 Локальное сохранение'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors cursor-pointer shrink-0"
          >
            Закрыть ✕
          </button>
        </div>

        {/* Тело модального окна */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Сетка основной статистики */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Статистика аккаунта и рекорды
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">
                Рекорд ранга: {highestRank.title}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Заработано за всё время
                </div>
                <div className="mt-1 text-sm font-mono font-bold text-emerald-400 tabular-nums">
                  {formatLooks(profile.lifetimeTotalLooks)} PSL
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Текущий баланс
                </div>
                <div className="mt-1 text-sm font-mono font-bold text-white tabular-nums">
                  {formatLooks(profile.looks)} PSL
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Сила клика / Пассив
                </div>
                <div className="mt-1 text-xs font-mono font-bold text-sky-300 tabular-nums">
                  +{formatLooks(stats.clickPower)} / +{formatLooks(stats.passivePerSecond)}/с
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Время в игре
                </div>
                <div className="mt-1 text-sm font-mono font-bold text-amber-300 tabular-nums">
                  {formatDuration(profile.totalPlayTimeSec)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Всего кликов (Мьюинг)
                </div>
                <div className="mt-1 text-sm font-mono font-bold text-white tabular-nums">
                  {profile.totalClicks.toLocaleString('ru-RU')}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Критических ударов
                </div>
                <div className="mt-1 text-sm font-mono font-bold text-rose-400 tabular-nums">
                  {profile.totalCriticalHits.toLocaleString('ru-RU')}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({(stats.critChance * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Очки ДНК (в наличии / всего)
                </div>
                <div className="mt-1 text-sm font-mono font-bold text-amber-400 tabular-nums">
                  {profile.dnaPoints} / {profile.totalDnaEarned} ДНК
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141E2B] border border-white/10">
                <div className="text-[10px] font-mono text-slate-400">
                  Куплено апгрейдов / ДНК
                </div>
                <div className="mt-1 text-xs font-mono font-bold text-purple-300 tabular-nums">
                  {totalShopUpgradesCount} шт. ({unlockedShopTypesCount}/14) · ДНК {totalPerkLevelsCount}/{maxPossiblePerkLevels}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Настройки и полезные мелочи профиля */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
              Настройки и инструменты профиля
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Звуковые эффекты SFX */}
              <button
                type="button"
                onClick={handleToggleSfx}
                className="p-3 rounded-2xl bg-[#141E2B] hover:bg-[#192636] border border-white/10 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-white">
                    Звуковые эффекты (SFX и MOG)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Звуки кликов, молотка и повышения уровня
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shrink-0 ${
                    !sfxMuted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                  }`}
                >
                  {!sfxMuted ? 'ВКЛ' : 'ВЫКЛ'}
                </span>
              </button>

              {/* Подписи оригинального атласа */}
              <button
                type="button"
                onClick={onToggleOriginalCaption}
                className="p-3 rounded-2xl bg-[#141E2B] hover:bg-[#192636] border border-white/10 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-white">
                    Оригинальные подписи атласа
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Показывать англ. термины в таблице стадий
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shrink-0 ${
                    profile.showOriginalAtlasCaption
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-white/10 text-slate-300 border border-white/15'
                  }`}
                >
                  {profile.showOriginalAtlasCaption ? 'ВКЛ' : 'ВЫКЛ'}
                </span>
              </button>

              {/* Ручное сохранение профиля */}
              <button
                type="button"
                onClick={handleManualSave}
                className="p-3 rounded-2xl bg-[#141E2B] hover:bg-[#192636] border border-white/10 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-white">
                    Принудительное сохранение
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Записать прогресс в память и облако
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40 shrink-0">
                  {saveFeedback ? 'Сохранено ✓' : 'Сохранить'}
                </span>
              </button>

              {/* Повторный показ обучающих пальцев */}
              <button
                type="button"
                onClick={handleRestoreTutorials}
                className="p-3 rounded-2xl bg-[#141E2B] hover:bg-[#192636] border border-white/10 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-white">
                    Подсказки управления (Палец)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Снова показать куда нажимать новичку
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0">
                  {tutorialFeedback ? 'Включены ✓' : 'Показать'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. Опасная зона: Полный сброс профиля */}
          <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/35">
            {!confirmResetStep ? (
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-rose-300">
                    Сброс профиля и прогресса
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Полностью обнуляет очки PSL, купленные товары, поколения и ДНК (начнёте заново с Sub 3).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmResetStep(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Сбросить профиль...
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-rose-200">
                  Вы уверены, что хотите полностью удалить весь прогресс (Поколение #{profile.generation}, {formatLooks(profile.lifetimeTotalLooks)} PSL)? Это действие нельзя отменить.
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmResetStep(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_16px_rgba(225,29,72,0.5)] cursor-pointer"
                  >
                    Да, сбросить всё с нуля
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
