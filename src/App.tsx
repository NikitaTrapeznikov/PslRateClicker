/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MAIN-модуль (Точка входа и главный игровой цикл 60 FPS):
 * Запускает и связывает все 4 основные подсистемы проекта:
 * 1. Async Profile & YaGames SDK v2 (src/modules/profile.ts)
 * 2. Sprite & Canvas Renderer (src/modules/renderer.ts)
 * 3. Game Mechanics, Shop & 24h Economy (src/modules/mechanics.ts)
 * 4. Platform Utilities & Web Audio Synthesizer (src/modules/utils.ts)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EvolutionAtlasView,
  GeneticsRebirthView,
  LeaderboardAndBalanceView,
} from './components/ModalsAndPanels';
import { RankPortraitThumb } from './components/RankPortraitThumb';
import { UpgradeSketchArt } from './components/UpgradeSketchArt';
import { LooksmaxMusicPlayer } from './components/LooksmaxMusicPlayer';
import {
  calculateItemCost,
  calculateMaxAffordable,
  calculatePerkDnaCost,
  computePlayerStats,
  DNA_PERKS,
  GENERATION_TITLES,
  getNextMilestone,
  PSL_RANKS,
  SHOP_ITEMS,
  ShopItemDefinition,
  UpgradeCategory,
} from './modules/mechanics';
import {
  createDefaultProfile,
  OfflineEarningsReport,
  PlayerProfileData,
  profileManager,
} from './modules/profile';
import { PSLSpriteRenderer } from './modules/renderer';
import {
  formatDuration,
  formatLooks,
  installYandexGamesPlatformGuards,
  soundEngine,
} from './modules/utils';

type ActiveSection = 'arena' | 'evolution' | 'rebirth' | 'leaderboard';
type BuyMultiplierMode = 1 | 10 | 'MAX';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfileData>(() => createDefaultProfile());
  const [sdkMode, setSdkMode] = useState<'yagames_cloud' | 'local_storage'>('local_storage');
  const [activeSection, setActiveSection] = useState<ActiveSection>('arena');
  const [shopCategory, setShopCategory] = useState<UpgradeCategory>('click');
  const [buyMode, setBuyMode] = useState<BuyMultiplierMode>(1);
  const [mewingCombo, setMewingCombo] = useState<number>(0);
  const [isShopMinimized, setIsShopMinimized] = useState<boolean>(false);
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);
  const [atlasImage, setAtlasImage] = useState<HTMLImageElement | null>(null);
  const [offlineBanner, setOfflineBanner] = useState<OfflineEarningsReport | null>(null);
  const [rankUpBanner, setRankUpBanner] = useState<{
    rankIndex: number;
    title: string;
    subtitle: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<PSLSpriteRenderer | null>(null);
  const profileRef = useRef<PlayerProfileData>(profile);
  const comboRef = useRef<number>(mewingCombo);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    comboRef.current = mewingCombo;
  }, [mewingCombo]);

  // 1. Инициализация системных ограничений Яндекс Игр, загрузчика спрайт-атласа и асинхронного профиля
  useEffect(() => {
    const cleanupGuards = installYandexGamesPlatformGuards();

    const spriteRenderer = new PSLSpriteRenderer(() => {
      setAtlasImage(spriteRenderer.getAtlasImage());
    });
    rendererRef.current = spriteRenderer;

    let mounted = true;
    profileManager.initializeAndLoad().then(({ profile: loaded, offlineReport, sdkMode: mode }) => {
      if (!mounted) return;
      setProfile(loaded);
      setSdkMode(mode);
      if (offlineReport && offlineReport.looksEarned > 0) {
        setOfflineBanner(offlineReport);
      }
    });

    return () => {
      mounted = false;
      cleanupGuards();
    };
  }, []);

  // 2. Вычисление всех текущих показателей экономики и рангов
  const stats = useMemo(
    () =>
      computePlayerStats({
        currentRunTotalLooks: profile.currentRunTotalLooks,
        generation: profile.generation,
        itemLevels: profile.itemLevels,
        perkLevels: profile.perkLevels,
        mewingCombo,
        rewardedBoostRemainingSec: profile.rewardedBoostRemainingSec,
      }),
    [
      profile.currentRunTotalLooks,
      profile.generation,
      profile.itemLevels,
      profile.perkLevels,
      profile.rewardedBoostRemainingSec,
      mewingCombo,
    ]
  );

  // 3. Главный игровой тик экономики (10 раз в секунду для плавного прироста) + затухание комбо
  useEffect(() => {
    const tickIntervalMs = 100;
    const dt = tickIntervalMs / 1000;

    const timer = window.setInterval(() => {
      setMewingCombo((prev) => Math.max(0, prev - 5.5 * dt));

      setProfile((prev) => {
        const currentStats = computePlayerStats({
          currentRunTotalLooks: prev.currentRunTotalLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: comboRef.current,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
        });

        const passiveGain = currentStats.passivePerSecond * dt;
        const newCurrentRunLooks = prev.currentRunTotalLooks + passiveGain;
        const newRank = computePlayerStats({
          currentRunTotalLooks: newCurrentRunLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: comboRef.current,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
        }).currentRank;

        const newHighestRank = Math.max(prev.highestRankIndexReached, newRank.index);

        if (newRank.index > prev.highestRankIndexReached) {
          soundEngine.playRankUp();
          setRankUpBanner({
            rankIndex: newRank.index,
            title: newRank.title,
            subtitle: newRank.subtitle,
          });
        }

        return {
          ...prev,
          looks: prev.looks + passiveGain,
          currentRunTotalLooks: newCurrentRunLooks,
          lifetimeTotalLooks: prev.lifetimeTotalLooks + passiveGain,
          highestRankIndexReached: newHighestRank,
          totalPlayTimeSec: prev.totalPlayTimeSec + dt,
          rewardedBoostRemainingSec: Math.max(0, prev.rewardedBoostRemainingSec - dt),
        };
      });
    }, tickIntervalMs);

    return () => window.clearInterval(timer);
  }, []);

  // 4. Асинхронное автосохранение каждые 5 секунд и при выгрузке страницы
  useEffect(() => {
    const saveTimer = window.setInterval(() => {
      profileManager.saveProfileAsync(profileRef.current, false);
    }, 5000);

    const handleBeforeUnload = () => {
      profileManager.saveProfileAsync(profileRef.current, true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.clearInterval(saveTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 5. Цикл рендеринга HTML5 Canvas (60 FPS) для центральной сцены персонажа
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      if (canvas && renderer && activeSection === 'arena') {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const targetW = Math.max(280, Math.floor(rect.width * dpr));
        const targetH = Math.max(280, Math.floor(rect.height * dpr));

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          const curProfile = profileRef.current;
          const curStats = computePlayerStats({
            currentRunTotalLooks: curProfile.currentRunTotalLooks,
            generation: curProfile.generation,
            itemLevels: curProfile.itemLevels,
            perkLevels: curProfile.perkLevels,
            mewingCombo: comboRef.current,
            rewardedBoostRemainingSec: curProfile.rewardedBoostRemainingSec,
          });

          renderer.renderFrame(ctx, rect.width, rect.height, {
            rank: curStats.currentRank,
            showOriginalCaption: curProfile.showOriginalAtlasCaption,
            mewingCombo: comboRef.current,
            generation: curProfile.generation,
            perkLevels: curProfile.perkLevels,
            rewardedBoostActive: curProfile.rewardedBoostRemainingSec > 0,
          });
          ctx.restore();
        }
      }
      animationFrameId = window.requestAnimationFrame(renderLoop);
    };

    animationFrameId = window.requestAnimationFrame(renderLoop);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [activeSection]);

  // Обработчик ручного клика по портрету (Мьюинг + Критический удар Молотка)
  const handleStagePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const normX = Math.max(0.1, Math.min(0.9, (e.clientX - rect.left) / rect.width));
      const normY = Math.max(0.1, Math.min(0.9, (e.clientY - rect.top) / rect.height));

      const isCrit = Math.random() < stats.critChance;
      const gain = isCrit ? stats.clickPower * stats.critMultiplier : stats.clickPower;
      const hasHammer = (profile.itemLevels['orthopedic_hammer'] || 0) > 0;

      // Звуковой и визуальный отклик
      if (isCrit) {
        soundEngine.playHammerCrit();
      } else {
        soundEngine.playClick(stats.mewingComboMultiplier);
      }

      rendererRef.current?.triggerClickEffect({
        normX,
        normY,
        amount: gain,
        isCrit,
        hasHammerUpgrade: hasHammer,
      });

      setMewingCombo((prev) => Math.min(100, prev + 8.5));

      setProfile((prev) => {
        const nextRunLooks = prev.currentRunTotalLooks + gain;
        const nextRank = computePlayerStats({
          currentRunTotalLooks: nextRunLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: comboRef.current,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
        }).currentRank;

        if (nextRank.index > prev.highestRankIndexReached) {
          soundEngine.playRankUp();
          setRankUpBanner({
            rankIndex: nextRank.index,
            title: nextRank.title,
            subtitle: nextRank.subtitle,
          });
        }

        return {
          ...prev,
          looks: prev.looks + gain,
          currentRunTotalLooks: nextRunLooks,
          lifetimeTotalLooks: prev.lifetimeTotalLooks + gain,
          highestRankIndexReached: Math.max(prev.highestRankIndexReached, nextRank.index),
          totalClicks: prev.totalClicks + 1,
          totalCriticalHits: prev.totalCriticalHits + (isCrit ? 1 : 0),
        };
      });
    },
    [stats, profile.itemLevels]
  );

  // Покупка предмета в магазине (Ручной клик / Пассивные мази и операции)
  const handleBuyShopItem = useCallback(
    (item: ShopItemDefinition) => {
      const currentLevel = profile.itemLevels[item.id] || 0;
      const maxillaLevel = profile.perkLevels['forward_maxilla'] || 0;

      let countToBuy = 1;
      let totalCost = 0;

      if (buyMode === 'MAX') {
        const res = calculateMaxAffordable(item, currentLevel, profile.looks, maxillaLevel);
        countToBuy = res.count;
        totalCost = res.totalCost;
      } else {
        countToBuy = buyMode;
        totalCost = calculateItemCost(item, currentLevel, countToBuy, maxillaLevel);
      }

      if (profile.looks < totalCost) return;

      soundEngine.playUpgradeBuy();

      setProfile((prev) => {
        const updated: PlayerProfileData = {
          ...prev,
          looks: prev.looks - totalCost,
          itemLevels: {
            ...prev.itemLevels,
            [item.id]: (prev.itemLevels[item.id] || 0) + countToBuy,
          },
        };
        profileManager.saveProfileAsync(updated, false);
        return updated;
      });
    },
    [profile.looks, profile.itemLevels, profile.perkLevels, buyMode]
  );

  // Смена Поколения (Многоступенчатый Реборн)
  const handleTriggerRebirth = useCallback(() => {
    if (!stats.canRebirth) return;
    const earnedDna = stats.pendingRebirthDNA;
    const lineageLevel = profile.perkLevels['adams_lineage'] || 0;
    const startingLooks = lineageLevel * 1500;

    soundEngine.playRebirth();

    setProfile((prev) => {
      const updated: PlayerProfileData = {
        ...prev,
        looks: startingLooks,
        currentRunTotalLooks: startingLooks,
        generation: prev.generation + 1,
        dnaPoints: prev.dnaPoints + earnedDna,
        totalDnaEarned: prev.totalDnaEarned + earnedDna,
        itemLevels: {},
      };
      profileManager.saveProfileAsync(updated, true);
      return updated;
    });

    setMewingCombo(0);
    setActiveSection('rebirth');
  }, [stats.canRebirth, stats.pendingRebirthDNA, profile.perkLevels]);

  // Прокачка наследственного перка внешности за Очки ДНК
  const handleBuyDnaPerk = useCallback((perkId: string) => {
    const perk = DNA_PERKS.find((p) => p.id === perkId);
    if (!perk) return;

    setProfile((prev) => {
      const curLvl = prev.perkLevels[perkId] || 0;
      if (curLvl >= perk.maxLevel) return prev;
      const cost = calculatePerkDnaCost(perk, curLvl);
      if (prev.dnaPoints < cost) return prev;

      soundEngine.playUpgradeBuy();
      const updated: PlayerProfileData = {
        ...prev,
        dnaPoints: prev.dnaPoints - cost,
        perkLevels: {
          ...prev.perkLevels,
          [perkId]: curLvl + 1,
        },
      };
      profileManager.saveProfileAsync(updated, true);
      return updated;
    });
  }, []);

  // Активация буста x2 за просмотр Rewarded-рекламы Яндекс Игр
  const handleActivateRewardedBoost = useCallback(() => {
    if (isAdLoading) return;
    profileManager.showRewardedAdForBoost(
      () => {
        soundEngine.playRankUp();
        setProfile((prev) => {
          const updated: PlayerProfileData = {
            ...prev,
            rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec + 120,
          };
          profileManager.saveProfileAsync(updated, false);
          return updated;
        });
      },
      (busy) => setIsAdLoading(busy)
    );
  }, [isAdLoading]);

  // Переключение режима подписи из оригинального атласа
  const handleToggleOriginalCaption = useCallback(() => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        showOriginalAtlasCaption: !prev.showOriginalAtlasCaption,
      };
      profileManager.saveProfileAsync(updated, false);
      return updated;
    });
  }, []);

  // Симуляция оффлайн-времени для проверки 24-часового баланса
  const handleSimulateOfflineTime = useCallback(
    (seconds: number) => {
      const lineageLevel = profile.perkLevels['adams_lineage'] || 0;
      const offlineEfficiency = Math.min(1.5, 0.45 + lineageLevel * 0.15);
      const baseRate = Math.max(2, stats.passivePerSecond);
      const earned = Math.floor(baseRate * seconds * offlineEfficiency);

      soundEngine.playUpgradeBuy();
      setProfile((prev) => {
        const updated: PlayerProfileData = {
          ...prev,
          looks: prev.looks + earned,
          currentRunTotalLooks: prev.currentRunTotalLooks + earned,
          lifetimeTotalLooks: prev.lifetimeTotalLooks + earned,
          totalPlayTimeSec: prev.totalPlayTimeSec + seconds,
        };
        profileManager.saveProfileAsync(updated, false);
        return updated;
      });

      setOfflineBanner({
        elapsedSeconds: seconds,
        looksEarned: earned,
      });
    },
    [profile.perkLevels, stats.passivePerSecond]
  );

  const filteredShopItems = useMemo(
    () => SHOP_ITEMS.filter((item) => item.category === shopCategory),
    [shopCategory]
  );

  const leaderboardSnapshot = useMemo(
    () => profileManager.getLeaderboardSnapshot(profile),
    [profile]
  );

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#F1F5F9] flex flex-col">
      {/* Top Bar Contract: 3 зоны с разделением gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-[#2A343D] bg-[#141B21]">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#arena"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('arena');
          }}
          className="text-lg font-bold tracking-tight text-[#F1F5F9] font-display whitespace-nowrap shrink-0"
        >
          PSL Ascension
        </a>

        {/* Zone 2: 4 однострочные навигационные ссылки */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94A3B8]">
          <a
            href="#arena"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('arena');
            }}
            className={`hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'arena' ? 'text-[#F1F5F9] underline underline-offset-8 decoration-emerald-500' : ''
            }`}
          >
            Арена прокачки
          </a>
          <a
            href="#evolution"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('evolution');
            }}
            className={`hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'evolution' ? 'text-[#F1F5F9] underline underline-offset-8 decoration-emerald-500' : ''
            }`}
          >
            Эволюция PSL (8 стадий)
          </a>
          <a
            href="#rebirth"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('rebirth');
            }}
            className={`hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'rebirth' ? 'text-[#F1F5F9] underline underline-offset-8 decoration-amber-500' : ''
            }`}
          >
            Поколения и ДНК {stats.canRebirth ? `(+${stats.pendingRebirthDNA})` : ''}
          </a>
          <a
            href="#leaderboard"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('leaderboard');
            }}
            className={`hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'leaderboard' ? 'text-[#F1F5F9] underline underline-offset-8 decoration-emerald-500' : ''
            }`}
          >
            Рейтинг и Баланс
          </a>
        </nav>

        {/* Zone 3: 1 основное действие (Rewarded Boost Яндекс Игр) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleActivateRewardedBoost}
            disabled={isAdLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              profile.rewardedBoostRemainingSec > 0
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isAdLoading
              ? 'Загрузка рекламы...'
              : profile.rewardedBoostRemainingSec > 0
              ? `Буст ×2 активен (${formatDuration(profile.rewardedBoostRemainingSec)})`
              : 'Буст ×2 за рекламу'}
          </button>
        </div>
      </header>

      {/* Мобильная панель переключения разделов */}
      <div className="md:hidden grid grid-cols-4 gap-1 p-2 bg-[#141B21] border-b border-[#2A343D]">
        <button
          type="button"
          onClick={() => setActiveSection('arena')}
          className={`py-2 px-2 rounded text-xs font-medium whitespace-nowrap truncate ${
            activeSection === 'arena' ? 'bg-[#222C34] text-[#F1F5F9]' : 'text-[#94A3B8]'
          }`}
        >
          Арена
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('evolution')}
          className={`py-2 px-2 rounded text-xs font-medium whitespace-nowrap truncate ${
            activeSection === 'evolution' ? 'bg-[#222C34] text-[#F1F5F9]' : 'text-[#94A3B8]'
          }`}
        >
          8 стадий
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('rebirth')}
          className={`py-2 px-2 rounded text-xs font-medium whitespace-nowrap truncate ${
            activeSection === 'rebirth' ? 'bg-[#222C34] text-amber-400' : 'text-[#94A3B8]'
          }`}
        >
          Реборн
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('leaderboard')}
          className={`py-2 px-2 rounded text-xs font-medium whitespace-nowrap truncate ${
            activeSection === 'leaderboard' ? 'bg-[#222C34] text-[#F1F5F9]' : 'text-[#94A3B8]'
          }`}
        >
          Рейтинг
        </button>
      </div>

      {/* Уведомление о начисленном оффлайн-доходе или повышении ранга */}
      {(offlineBanner || rankUpBanner) && (
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-3">
          {offlineBanner && (
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-[#182026] flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-[#F1F5F9]">
                <span className="font-semibold text-emerald-400">Оффлайн-уход завершен:</span>{' '}
                за {formatDuration(offlineBanner.elapsedSeconds)} работы мазей и восстановления вы
                получили{' '}
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  +{formatLooks(offlineBanner.looksEarned)} PSL
                </span>
                .
              </div>
              <button
                type="button"
                onClick={() => setOfflineBanner(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0"
              >
                Забрать очки
              </button>
            </div>
          )}

          {rankUpBanner && (
            <div className="mt-2 p-3.5 rounded-xl border border-amber-500/50 bg-[#182026] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <RankPortraitThumb
                  atlasImage={atlasImage}
                  rankIndex={rankUpBanner.rankIndex}
                  size={44}
                />
                <div className="text-xs">
                  <div className="text-amber-400 font-semibold">
                    Новая стадия внешности достигнута: {rankUpBanner.title}
                  </div>
                  <div className="text-[#94A3B8]">{rankUpBanner.subtitle}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRankUpBanner(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
              >
                Продолжить
              </button>
            </div>
          )}
        </div>
      )}

      {/* Основной контейнер 1440px */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-5">
        {activeSection === 'arena' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ЛЕВАЯ КОЛОНКА (Col 1–3): Только проигрыватель со сворачиванием в мини-версию */}
            <div className="lg:col-span-3 flex flex-col">
              <LooksmaxMusicPlayer />
            </div>

            {/* ЦЕНТРАЛЬНАЯ КОЛОНКА (Col 4–7): Умное зеркало (Smart Mirror) с минималистичным HUD на поверхности */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative rounded-[32px] p-[6px] bg-gradient-to-b from-[#475569] via-[#1E293B] to-[#0F172A] shadow-[0_24px_60px_rgba(0,0,0,0.75),0_0_28px_rgba(56,189,248,0.12)] flex-1 flex flex-col">
                {/* Внутренняя поверхность зеркала с контурной LED-подсветкой и фацетом */}
                <div className="relative w-full h-full min-h-[520px] rounded-[26px] overflow-hidden border border-white/40 bg-[#F8FAFC] shadow-[inset_0_0_32px_rgba(255,255,255,0.9),inset_0_0_12px_rgba(56,189,248,0.28)] flex flex-col justify-between select-none">
                  {/* Интерактивное полотно отражения во всю площадь зеркала */}
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handleStagePointerDown}
                    className="absolute inset-0 w-full h-full block cursor-pointer touch-none"
                  />

                  {/* Зеркальные блики, градиент стекла и контурное свечение умного зеркала */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(226,232,240,0.45)_0%,rgba(255,255,255,0)_38%,rgba(255,255,255,0.32)_52%,rgba(203,213,225,0.25)_100%)]" />
                  <div className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-slate-900/10 shadow-[inset_0_0_24px_rgba(255,255,255,0.85)]" />

                  {/* Верхняя минималистичная HUD-панель на стекле зеркала */}
                  <div className="pointer-events-none relative z-10 p-4 sm:p-5 flex items-start justify-between gap-3 bg-gradient-to-b from-slate-950/65 via-slate-950/30 to-transparent">
                    {/* Слева: Текущая стадия и индекс PSL */}
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/55 backdrop-blur-md border border-white/20 text-[11px] font-mono font-semibold text-sky-300 tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{stats.currentRank.pslScoreLabel}</span>
                      </div>
                      <h1 className="mt-1 text-xl sm:text-2xl font-bold text-white font-display tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                        {stats.currentRank.title}
                      </h1>
                    </div>

                    {/* Справа: Баланс PSL и чистый прирост */}
                    <div className="text-right font-mono tabular-nums px-3 py-1.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border border-white/20 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-white leading-none tracking-tight">
                        {formatLooks(profile.looks)}{' '}
                        <span className="text-xs font-semibold text-emerald-400">PSL</span>
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-2 text-[11px] text-slate-200">
                        <span className="text-emerald-300">+{formatLooks(stats.passivePerSecond)}/с</span>
                        <span className="text-white/30">·</span>
                        <span>+{formatLooks(stats.clickPower)}/клик</span>
                      </div>
                    </div>
                  </div>

                  {/* Нижняя минималистичная HUD-панель на стекле зеркала */}
                  <div className="pointer-events-none relative z-10 p-4 sm:p-5 bg-gradient-to-t from-slate-950/75 via-slate-950/35 to-transparent">
                    <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 space-y-2">
                      {/* Компактная строка прогресса до следующей стадии + бонус мьюинга */}
                      <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-white">
                        <span className="truncate text-slate-200">
                          {stats.nextRank ? (
                            <>
                              До <span className="text-white font-semibold">{stats.nextRank.title}</span>:{' '}
                              {formatLooks(
                                Math.max(0, stats.nextRank.requiredLooks - profile.currentRunTotalLooks)
                              )}
                            </>
                          ) : (
                            <span className="text-amber-300 font-semibold">МАКСИМУМ · TRUE ADAM</span>
                          )}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          {mewingCombo > 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[11px] font-semibold">
                              Мьюинг ×{stats.mewingComboMultiplier.toFixed(2)}
                            </span>
                          )}
                          <span className="text-emerald-300 font-semibold">
                            {stats.progressToNextRank.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Тонкая LED-полоса прогресса на поверхности зеркала */}
                      <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-transform duration-150 origin-left"
                          style={{
                            transform: `scaleX(${Math.max(0, Math.min(1, stats.progressToNextRank / 100))})`,
                          }}
                        />
                      </div>

                      {/* Тонкий индикатор тонуса кликов (показывается как светящаяся линия) */}
                      <div className="w-full h-0.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-amber-300 transition-transform duration-100 origin-left"
                          style={{
                            transform: `scaleX(${Math.max(0, Math.min(1, mewingCombo / 100))})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА (Col 8–12): Магазин улучшений со сворачиванием в мини-версию */}
            <div className="lg:col-span-4 flex flex-col">
              {isShopMinimized ? (
                <div className="p-3.5 rounded-xl border border-[#2A343D] bg-[#182026] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono text-emerald-400">
                        Мини-магазин · {shopCategory === 'click' ? 'Практики клика' : 'Пассивный уход'}
                      </div>
                      <h2 className="text-sm font-semibold text-[#F1F5F9] font-display truncate">
                        Магазин улучшений
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsShopMinimized(false)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#0F1419] hover:bg-[#222C34] text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Развернуть
                    </button>
                  </div>

                  {/* В мини-версии показываем 1 ближайшее доступное улучшение для быстрой покупки */}
                  {(() => {
                    const featuredItem =
                      filteredShopItems.find(
                        (it) =>
                          profile.highestRankIndexReached >=
                          Math.max(0, it.unlockAtRankIndex - 1)
                      ) || filteredShopItems[0];
                    if (!featuredItem) return null;

                    const curLvl = profile.itemLevels[featuredItem.id] || 0;
                    const maxillaLvl = profile.perkLevels['forward_maxilla'] || 0;
                    const cost = calculateItemCost(featuredItem, curLvl, 1, maxillaLvl);
                    const canAfford = profile.looks >= cost;

                    return (
                      <div className="p-2.5 rounded-lg bg-[#0F1419] border border-[#2A343D] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UpgradeSketchArt itemId={featuredItem.id} />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#F1F5F9] truncate">
                              {featuredItem.name}
                            </div>
                            <div className="text-[11px] font-mono tabular-nums text-[#94A3B8]">
                              Ур. {curLvl}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => handleBuyShopItem(featuredItem)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                            canAfford
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer'
                              : 'bg-[#182026] text-[#64748B] border border-[#2A343D] cursor-not-allowed'
                          }`}
                        >
                          {formatLooks(cost)} PSL
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-[#2A343D] bg-[#182026] flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2A343D]">
                    <h2 className="text-base font-semibold text-[#F1F5F9] font-display">
                      Магазин улучшений
                    </h2>

                    <div className="flex items-center gap-1.5">
                      {/* Переключатель кратности покупки: x1, x10, MAX */}
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1419] border border-[#2A343D]">
                        {([1, 10, 'MAX'] as BuyMultiplierMode[]).map((mode) => (
                          <button
                            key={String(mode)}
                            type="button"
                            onClick={() => setBuyMode(mode)}
                            className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              buyMode === mode
                                ? 'bg-emerald-500 text-slate-950'
                                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                            }`}
                          >
                            {mode === 'MAX' ? 'MAX' : `×${mode}`}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsShopMinimized(true)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#0F1419] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2A343D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Свернуть
                      </button>
                    </div>
                  </div>

                  {/* Вкладки категорий магазина: Практики клика vs Мази и пассивный уход */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 mt-3 rounded-lg bg-[#0F1419] border border-[#2A343D]">
                    <button
                      type="button"
                      onClick={() => setShopCategory('click')}
                      className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        shopCategory === 'click'
                          ? 'bg-[#222C34] text-[#F1F5F9]'
                          : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      Клик (Молоток, Мьюинг)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShopCategory('passive')}
                      className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        shopCategory === 'passive'
                          ? 'bg-[#222C34] text-[#F1F5F9]'
                          : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      Уход (Мази, Зал, Хирургия)
                    </button>
                  </div>

                  {/* Список улучшений */}
                  <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[540px] pr-1">
                    {filteredShopItems.map((item) => {
                      const currentLevel = profile.itemLevels[item.id] || 0;
                      const maxillaLevel = profile.perkLevels['forward_maxilla'] || 0;
                      const isUnlocked =
                        profile.highestRankIndexReached >= Math.max(0, item.unlockAtRankIndex - 1);

                      let buyCount = 1;
                      let cost = 0;
                      if (buyMode === 'MAX') {
                        const maxInfo = calculateMaxAffordable(
                          item,
                          currentLevel,
                          profile.looks,
                          maxillaLevel
                        );
                        buyCount = maxInfo.count;
                        cost = maxInfo.totalCost;
                      } else {
                        buyCount = buyMode;
                        cost = calculateItemCost(item, currentLevel, buyCount, maxillaLevel);
                      }

                      const canAfford = isUnlocked && profile.looks >= cost;
                      const nextMilestone = getNextMilestone(currentLevel);

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border transition-colors flex items-center gap-3.5 ${
                            !isUnlocked
                              ? 'border-[#1E262D] bg-[#13191E] opacity-60'
                              : canAfford
                              ? 'border-[#2A343D] hover:border-emerald-500/50 bg-[#0F1419]'
                              : 'border-[#2A343D] bg-[#0F1419]/80'
                          }`}
                        >
                          <UpgradeSketchArt itemId={item.id} locked={!isUnlocked} />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-[#F1F5F9] font-display truncate">
                                {item.name}
                              </h3>
                              <span className="text-xs font-mono tabular-nums text-[#94A3B8] shrink-0">
                                Ур. {currentLevel}
                                {nextMilestone ? ` · ×2/${nextMilestone}` : ''}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="text-xs font-mono tabular-nums text-emerald-400">
                                {item.category === 'click'
                                  ? `+${formatLooks(item.baseClickBonus)} клик`
                                  : `+${formatLooks(item.basePassiveBonus)} /с`}
                                {item.critChanceBonus
                                  ? ` · +${(item.critChanceBonus * 100).toFixed(1)}% крит`
                                  : ''}
                              </div>

                              <button
                                type="button"
                                disabled={!canAfford}
                                onClick={() => handleBuyShopItem(item)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                                  !isUnlocked
                                    ? 'bg-[#182026] text-[#64748B] cursor-not-allowed'
                                    : canAfford
                                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer'
                                    : 'bg-[#182026] text-[#64748B] border border-[#2A343D] cursor-not-allowed'
                                }`}
                              >
                                {!isUnlocked
                                  ? `С ${PSL_RANKS[item.unlockAtRankIndex]?.title}`
                                  : `${formatLooks(cost)} PSL${buyCount > 1 ? ` (×${buyCount})` : ''}`}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'evolution' && (
          <EvolutionAtlasView
            profile={profile}
            stats={stats}
            atlasImage={atlasImage}
            onToggleOriginalCaption={handleToggleOriginalCaption}
          />
        )}

        {activeSection === 'rebirth' && (
          <GeneticsRebirthView
            profile={profile}
            stats={stats}
            onTriggerRebirth={handleTriggerRebirth}
            onBuyPerk={handleBuyDnaPerk}
          />
        )}

        {activeSection === 'leaderboard' && (
          <LeaderboardAndBalanceView
            profile={profile}
            stats={stats}
            leaderboard={leaderboardSnapshot}
            sdkMode={sdkMode}
            onForceCloudSave={() => {
              profileManager.saveProfileAsync(profile, true);
              soundEngine.playUpgradeBuy();
            }}
            onSimulateOfflineTime={handleSimulateOfflineTime}
            onResetProgress={() => {
              const fresh = profileManager.resetAllProgress();
              setProfile(fresh);
              setMewingCombo(0);
            }}
          />
        )}
      </main>
    </div>
  );
}
