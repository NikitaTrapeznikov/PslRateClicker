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
  ARENA_LOCATIONS,
  ArenaLocationTier,
  ArenaStageBackground,
  getLocationTierByRankIndex,
} from './components/ArenaStageBackground';
import {
  EvolutionAtlasView,
  GeneticsRebirthView,
  LeaderboardAndBalanceView,
  RebirthStarryBackground,
} from './components/ModalsAndPanels';
import { RankPortraitThumb } from './components/RankPortraitThumb';
import { UpgradeSketchArt } from './components/UpgradeSketchArt';
import { LooksmaxMusicPlayer } from './components/LooksmaxMusicPlayer';
import { LooksmaxLoadingScreen } from './components/LooksmaxLoadingScreen';
import { looksmaxMusic } from './modules/musicPlayer';
import {
  calculateItemCost,
  calculateMaxAffordable,
  calculatePerkDnaCost,
  computePlayerStats,
  DNA_PERKS,
  getMilestoneMultiplier,
  getNextMilestone,
  getPreviousMilestone,
  PSL_RANKS,
  RANK_LED_PALETTES,
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

interface MirrorBonusTarget {
  id: number;
  normX: number;
  normY: number;
  label: string;
  spawnedAtMs: number;
  durationMs: number;
}

const MIRROR_TARGET_LABELS = [
  'Фокус Ауры',
  'Импульс Симметрии',
  'Точка Гониона',
  'Вектор Максиллы',
];

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [isAtlasLoaded, setIsAtlasLoaded] = useState<boolean>(false);
  const [profile, setProfile] = useState<PlayerProfileData>(() => createDefaultProfile());
  const [sdkMode, setSdkMode] = useState<'yagames_cloud' | 'local_storage'>('local_storage');
  const [activeSection, setActiveSection] = useState<ActiveSection>('arena');
  const [shopCategory, setShopCategory] = useState<UpgradeCategory>('click');
  const [buyMode, setBuyMode] = useState<BuyMultiplierMode>(1);
  const [mewingCombo, setMewingCombo] = useState<number>(0);
  const [auraFrenzyRemainingSec, setAuraFrenzyRemainingSec] = useState<number>(0);
  const [mirrorTarget, setMirrorTarget] = useState<MirrorBonusTarget | null>(null);
  const [mirrorTargetProgress, setMirrorTargetProgress] = useState<number>(1);
  const [isShopMinimized, setIsShopMinimized] = useState<boolean>(false);
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);
  const [atlasImage, setAtlasImage] = useState<HTMLImageElement | null>(null);
  const [offlineBanner, setOfflineBanner] = useState<OfflineEarningsReport | null>(null);
  const [rankUpBanner, setRankUpBanner] = useState<{
    rankIndex: number;
    title: string;
    subtitle: string;
  } | null>(null);
  const [auraWaves, setAuraWaves] = useState<Array<{ id: number; isCrit: boolean }>>([]);
  const [arenaLocationOverride, setArenaLocationOverride] = useState<'auto' | ArenaLocationTier>('auto');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<PSLSpriteRenderer | null>(null);
  const profileRef = useRef<PlayerProfileData>(profile);
  const comboRef = useRef<number>(mewingCombo);
  const auraFrenzyRef = useRef<number>(auraFrenzyRemainingSec);
  const nextWaveIdRef = useRef<number>(1);

  const spawnAuraWave = useCallback((isCrit: boolean) => {
    const waveId = nextWaveIdRef.current++;
    setAuraWaves((prev) => [...prev.slice(-4), { id: waveId, isCrit }]);
    window.setTimeout(() => {
      setAuraWaves((prev) => prev.filter((w) => w.id !== waveId));
    }, 680);
  }, []);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    comboRef.current = mewingCombo;
  }, [mewingCombo]);

  useEffect(() => {
    auraFrenzyRef.current = auraFrenzyRemainingSec;
  }, [auraFrenzyRemainingSec]);

  // 1. Инициализация системных ограничений Яндекс Игр, загрузчика спрайт-атласа и асинхронного профиля
  useEffect(() => {
    const cleanupGuards = installYandexGamesPlatformGuards();

    let mounted = true;
    const spriteRenderer = new PSLSpriteRenderer(() => {
      if (!mounted) return;
      setAtlasImage(spriteRenderer.getAtlasImage());
      setIsAtlasLoaded(true);
    });
    rendererRef.current = spriteRenderer;

    profileManager
      .initializeAndLoad()
      .then(({ profile: loaded, offlineReport, sdkMode: mode }) => {
        if (!mounted) return;
        setProfile(loaded);
        setSdkMode(mode);
        setIsProfileLoaded(true);
        if (offlineReport && offlineReport.looksEarned > 0) {
          setOfflineBanner(offlineReport);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setIsProfileLoaded(true);
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
        auraFrenzyRemainingSec,
      }),
    [
      profile.currentRunTotalLooks,
      profile.generation,
      profile.itemLevels,
      profile.perkLevels,
      profile.rewardedBoostRemainingSec,
      mewingCombo,
      auraFrenzyRemainingSec,
    ]
  );

  // Прямая привязка работы плеера к главному экрану (Арена, Эволюция, Поколения, Рейтинг).
  // На этапе загрузки или вне этих 4 вкладок музыка полностью выключена.
  const isMainScreenWithMusic =
    !isInitialLoading &&
    (activeSection === 'arena' ||
      activeSection === 'evolution' ||
      activeSection === 'rebirth' ||
      activeSection === 'leaderboard');

  useEffect(() => {
    looksmaxMusic.setMainScreenActive(isMainScreenWithMusic);
    return () => {
      looksmaxMusic.setMainScreenActive(false);
    };
  }, [isMainScreenWithMusic]);

  // 2.5. Генератор случайных интерактивных бонус-мишеней на стекле Умного Зеркала
  useEffect(() => {
    if (isInitialLoading || activeSection !== 'arena') {
      setMirrorTarget(null);
      return;
    }

    let spawnTimeout: number;
    const scheduleNextTarget = (initialDelay = false) => {
      const delayMs = initialDelay
        ? 14000 + Math.random() * 8000
        : 28000 + Math.random() * 20000;

      spawnTimeout = window.setTimeout(() => {
        const label =
          MIRROR_TARGET_LABELS[Math.floor(Math.random() * MIRROR_TARGET_LABELS.length)];
        const normX = 0.22 + Math.random() * 0.56;
        const normY = 0.28 + Math.random() * 0.42;
        setMirrorTarget({
          id: Date.now(),
          normX,
          normY,
          label,
          spawnedAtMs: performance.now(),
          durationMs: 6000,
        });
        setMirrorTargetProgress(1);
        scheduleNextTarget(false);
      }, delayMs);
    };

    scheduleNextTarget(true);
    return () => {
      window.clearTimeout(spawnTimeout);
    };
  }, [isInitialLoading, activeSection]);

  // Таймер обратного отсчета активной бонус-мишени на зеркале
  useEffect(() => {
    if (!mirrorTarget) return;
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - mirrorTarget.spawnedAtMs;
      const remainingRatio = 1 - elapsed / mirrorTarget.durationMs;
      if (remainingRatio <= 0) {
        setMirrorTarget(null);
      } else {
        setMirrorTargetProgress(remainingRatio);
      }
    }, 60);
    return () => window.clearInterval(interval);
  }, [mirrorTarget]);

  // 3. Главный игровой тик экономики (10 раз в секунду для плавного прироста) + затухание комбо
  useEffect(() => {
    if (isInitialLoading) return;
    const tickIntervalMs = 100;
    const dt = tickIntervalMs / 1000;

    const timer = window.setInterval(() => {
      setMewingCombo((prev) => Math.max(0, prev - 5.5 * dt));
      setAuraFrenzyRemainingSec((prev) => Math.max(0, prev - dt));

      setProfile((prev) => {
        const currentStats = computePlayerStats({
          currentRunTotalLooks: prev.currentRunTotalLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: comboRef.current,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
          auraFrenzyRemainingSec: auraFrenzyRef.current,
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
          auraFrenzyRemainingSec: auraFrenzyRef.current,
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
  }, [isInitialLoading]);

  // 4. Асинхронное автосохранение каждые 5 секунд и при выгрузке страницы
  useEffect(() => {
    if (isInitialLoading) return;
    const saveTimer = window.setInterval(() => {
      profileManager.saveProfileAsync(profileRef.current, false);
    }, 5000);

    const handleBeforeUnload = () => {
      looksmaxMusic.shutdown();
      profileManager.saveProfileAsync(profileRef.current, true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.clearInterval(saveTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [isInitialLoading]);

  // 5. Цикл рендеринга HTML5 Canvas (60 FPS) для центральной сцены персонажа
  useEffect(() => {
    if (isInitialLoading) return;
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
            auraFrenzyRemainingSec: auraFrenzyRef.current,
          });

          renderer.renderFrame(ctx, rect.width, rect.height, {
            rank: curStats.currentRank,
            showOriginalCaption: curProfile.showOriginalAtlasCaption,
            mewingCombo: comboRef.current,
            generation: curProfile.generation,
            perkLevels: curProfile.perkLevels,
            rewardedBoostActive:
              curProfile.rewardedBoostRemainingSec > 0 || auraFrenzyRef.current > 0,
          });
          ctx.restore();
        }
      }
      animationFrameId = window.requestAnimationFrame(renderLoop);
    };

    animationFrameId = window.requestAnimationFrame(renderLoop);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [activeSection, isInitialLoading]);

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

      spawnAuraWave(isCrit);
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

  // Определение самой выгодной покупки (лучший ROI = минимальная цена за единицу прироста с учетом рубежей ×2)
  const bestRoiItemId = useMemo(() => {
    const maxillaLevel = profile.perkLevels['forward_maxilla'] || 0;
    let bestId: string | null = null;
    let bestScore = Infinity;

    for (const item of filteredShopItems) {
      const isUnlocked =
        profile.highestRankIndexReached >= Math.max(0, item.unlockAtRankIndex - 1);
      if (!isUnlocked) continue;

      const curLvl = profile.itemLevels[item.id] || 0;
      const nextLvl = curLvl + 1;
      const cost1 = calculateItemCost(item, curLvl, 1, maxillaLevel);

      const curMult = getMilestoneMultiplier(curLvl);
      const nextMult = getMilestoneMultiplier(nextLvl);
      const baseUnit =
        item.category === 'click'
          ? item.baseClickBonus + (item.critChanceBonus ? item.critChanceBonus * 450 : 0)
          : item.basePassiveBonus;

      const deltaPower = Math.max(0.1, nextLvl * nextMult * baseUnit - curLvl * curMult * baseUnit);
      const roiRatio = cost1 / deltaPower;

      if (roiRatio < bestScore) {
        bestScore = roiRatio;
        bestId = item.id;
      }
    }

    return bestId;
  }, [filteredShopItems, profile.highestRankIndexReached, profile.itemLevels, profile.perkLevels]);

  // Живая контурная LED-подсветка Умного Зеркала под текущий ранг, тонус Мьюинга и Импульс Ауры
  const mirrorLedPalette =
    RANK_LED_PALETTES[stats.currentRank.index] || RANK_LED_PALETTES[0];
  const isPeakAura = mewingCombo >= 80 || auraFrenzyRemainingSec > 0;
  const comboRatio = Math.max(0, Math.min(1, mewingCombo / 100));

  const mirrorOuterShadow = useMemo(() => {
    const rgb = auraFrenzyRemainingSec > 0 ? '251, 191, 36' : mirrorLedPalette.rgb;
    const spreadPx = Math.round(26 + comboRatio * 28 + (isPeakAura ? 14 : 0));
    const alpha = (0.16 + comboRatio * 0.28 + (isPeakAura ? 0.12 : 0)).toFixed(2);
    return `0 24px 60px rgba(0,0,0,0.78), 0 0 ${spreadPx}px rgba(${rgb}, ${alpha})`;
  }, [mirrorLedPalette.rgb, comboRatio, isPeakAura, auraFrenzyRemainingSec]);

  const mirrorInnerShadow = useMemo(() => {
    const rgb = auraFrenzyRemainingSec > 0 ? '251, 191, 36' : mirrorLedPalette.rgb;
    const innerSpread = Math.round(14 + comboRatio * 20 + (isPeakAura ? 10 : 0));
    const innerAlpha = (0.28 + comboRatio * 0.34).toFixed(2);
    return `inset 0 0 32px rgba(255,255,255,0.9), inset 0 0 ${innerSpread}px rgba(${rgb}, ${innerAlpha})`;
  }, [mirrorLedPalette.rgb, comboRatio, isPeakAura, auraFrenzyRemainingSec]);

  // Перехват случайной бонус-мишени на стекле Умного Зеркала
  const handleCatchMirrorTarget = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (!mirrorTarget) return;

      const instantBonus = Math.max(
        30,
        Math.floor(stats.passivePerSecond * 18 + stats.clickPower * 14)
      );

      soundEngine.playRankUp();
      rendererRef.current?.triggerClickEffect({
        normX: mirrorTarget.normX,
        normY: mirrorTarget.normY,
        amount: instantBonus,
        isCrit: true,
        hasHammerUpgrade: true,
      });

      setMirrorTarget(null);
      spawnAuraWave(true);
      setMewingCombo(100);
      setAuraFrenzyRemainingSec((prev) => Math.min(30, prev + 12));

      setProfile((prev) => {
        const nextRunLooks = prev.currentRunTotalLooks + instantBonus;
        const nextRank = computePlayerStats({
          currentRunTotalLooks: nextRunLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: 100,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
          auraFrenzyRemainingSec: 12,
        }).currentRank;

        if (nextRank.index > prev.highestRankIndexReached) {
          setRankUpBanner({
            rankIndex: nextRank.index,
            title: nextRank.title,
            subtitle: nextRank.subtitle,
          });
        }

        return {
          ...prev,
          looks: prev.looks + instantBonus,
          currentRunTotalLooks: nextRunLooks,
          lifetimeTotalLooks: prev.lifetimeTotalLooks + instantBonus,
          highestRankIndexReached: Math.max(prev.highestRankIndexReached, nextRank.index),
        };
      });
    },
    [mirrorTarget, stats.passivePerSecond, stats.clickPower]
  );

  const leaderboardSnapshot = useMemo(
    () => profileManager.getLeaderboardSnapshot(profile),
    [profile]
  );

  // Пока идет этап загрузки — рендерим ТОЛЬКО экран загрузки, главный экран и плеер выключены
  if (isInitialLoading) {
    return (
      <LooksmaxLoadingScreen
        isProfileLoaded={isProfileLoaded}
        isAtlasLoaded={isAtlasLoaded || atlasImage !== null}
        onFinish={() => {
          setIsInitialLoading(false);
          looksmaxMusic.startPlaybackWithGesture();
        }}
      />
    );
  }

  const activeGlowRgb =
    auraFrenzyRemainingSec > 0 ? '251, 191, 36' : mirrorLedPalette.rgb;
  const activeGlowHex =
    auraFrenzyRemainingSec > 0 ? '#FBBF24' : mirrorLedPalette.accentHex;

  const autoLocationTier = getLocationTierByRankIndex(stats.currentRank.index);
  const activeArenaTier: ArenaLocationTier =
    arenaLocationOverride === 'auto' ? autoLocationTier : arenaLocationOverride;
  const activeLocationMeta = ARENA_LOCATIONS[activeArenaTier];

  return (
    <div
      className="relative min-h-screen bg-[#0B0F14] text-[#F1F5F9] flex flex-col overflow-x-hidden transition-colors duration-300"
      style={
        activeSection === 'arena'
          ? {
              backgroundImage: `
                radial-gradient(circle at 50% 38%, rgba(${activeGlowRgb}, ${(
                  0.12 +
                  comboRatio * 0.24 +
                  (isPeakAura ? 0.1 : 0)
                ).toFixed(2)}) 0%, transparent 58%),
                radial-gradient(circle at 18% 75%, rgba(16, 185, 129, ${(
                  0.07 +
                  comboRatio * 0.14
                ).toFixed(2)}) 0%, transparent 48%),
                radial-gradient(circle at 82% 72%, rgba(56, 189, 248, ${(
                  0.07 +
                  comboRatio * 0.14
                ).toFixed(2)}) 0%, transparent 48%)
              `,
            }
          : undefined
      }
    >
      {/* ТОЛЬКО ДЛЯ АРЕНЫ ПРОКАЧКИ: Сменяемый фон окружения + экранный эффект «Поток Сигмы» */}
      {activeSection === 'arena' && (
        <>
          <ArenaStageBackground
            tier={activeArenaTier}
            comboRatio={comboRatio}
            isPeakAura={isPeakAura}
          />

          {/* ЭКРАННЫЙ ЭФФЕКТ «ПОТОК СИГМЫ» (OVERDRIVE): Неоновая виньетка по краям экрана только на Арене */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-40 transition-all duration-150"
            style={{
              boxShadow:
                comboRatio > 0.08 || isPeakAura
                  ? `inset 0 0 ${Math.round(35 + comboRatio * 85 + (isPeakAura ? 30 : 0))}px rgba(${activeGlowRgb}, ${(
                      comboRatio * 0.34 +
                      (isPeakAura ? 0.16 : 0)
                    ).toFixed(2)})`
                  : 'none',
            }}
          >
            {/* Верхняя и нижняя плазменные линии на пике комбо (Overdrive) */}
            {isPeakAura && (
              <>
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] animate-sigma-overdrive"
                  style={{
                    background: `linear-gradient(90deg, transparent 5%, ${activeGlowHex} 50%, transparent 95%)`,
                    boxShadow: `0 0 20px ${activeGlowHex}`,
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px] animate-sigma-overdrive"
                  style={{
                    background: `linear-gradient(90deg, transparent 5%, ${activeGlowHex} 50%, transparent 95%)`,
                    boxShadow: `0 0 20px ${activeGlowHex}`,
                  }}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* ТОЛЬКО ДЛЯ ВКЛАДКИ ПОКОЛЕНИЯ И ДНК: Яркое звездное небо + фото Адамов без затухания */}
      {activeSection === 'rebirth' && <RebirthStarryBackground />}

      {/* Top Bar Contract: 3 зоны с разделением gap-8 (z-30 и плотная подложка, чтобы все вкладки были отлично видны на любом фоне) */}
      <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-white/15 bg-[#0B1017]/95 backdrop-blur-md shadow-[0_6px_24px_rgba(0,0,0,0.75)]">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => setActiveSection('arena')}
          className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 cursor-pointer"
        >
          PSL Ascension
        </button>

        {/* Zone 2: 4 навигационные вкладки с высокой контрастностью */}
        <nav className="hidden md:flex items-center gap-2.5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection('arena')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
              activeSection === 'arena'
                ? 'bg-emerald-500/20 text-white border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Арена прокачки
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('evolution')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
              activeSection === 'evolution'
                ? 'bg-emerald-500/20 text-white border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Эволюция PSL (8 стадий)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('rebirth')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
              activeSection === 'rebirth'
                ? 'bg-amber-500/25 text-amber-300 border-amber-400/70 shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Поколения и ДНК {stats.canRebirth ? `(+${stats.pendingRebirthDNA})` : ''}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('leaderboard')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
              activeSection === 'leaderboard'
                ? 'bg-emerald-500/20 text-white border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Рейтинг и Баланс
          </button>
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
      <div className="relative z-30 md:hidden grid grid-cols-4 gap-1.5 p-2 bg-[#0B1017]/95 backdrop-blur-md border-b border-white/15 shadow-md">
        <button
          type="button"
          onClick={() => setActiveSection('arena')}
          className={`py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap truncate border ${
            activeSection === 'arena'
              ? 'bg-emerald-500/20 text-white border-emerald-400/60'
              : 'bg-white/5 text-slate-200 border-white/10'
          }`}
        >
          Арена
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('evolution')}
          className={`py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap truncate border ${
            activeSection === 'evolution'
              ? 'bg-emerald-500/20 text-white border-emerald-400/60'
              : 'bg-white/5 text-slate-200 border-white/10'
          }`}
        >
          8 стадий
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('rebirth')}
          className={`py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap truncate border ${
            activeSection === 'rebirth'
              ? 'bg-amber-500/25 text-amber-300 border-amber-400/70'
              : 'bg-white/5 text-slate-200 border-white/10'
          }`}
        >
          Реборн
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('leaderboard')}
          className={`py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap truncate border ${
            activeSection === 'leaderboard'
              ? 'bg-emerald-500/20 text-white border-emerald-400/60'
              : 'bg-white/5 text-slate-200 border-white/10'
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
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-5">
        {activeSection === 'arena' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ЛЕВАЯ КОЛОНКА (Col 1–3): Только проигрыватель со сворачиванием в мини-версию */}
            <div className="lg:col-span-3 flex flex-col">
              <LooksmaxMusicPlayer />
            </div>

            {/* ЦЕНТРАЛЬНАЯ КОЛОНКА (Col 4–7): Умное зеркало (Smart Mirror) с живой LED-подсветкой, световыми кольцами Потока Сигмы и бонус-мишенями */}
            <div className="lg:col-span-5 flex flex-col gap-3 relative">
              {/* Компактная плашка текущей локации фона Арены с мини-превью картинок */}
              <div className="relative z-10 px-3 py-2 rounded-2xl bg-[#111820]/85 backdrop-blur-md border border-white/15 flex flex-wrap items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-5 rounded-md overflow-hidden border shrink-0"
                    style={{
                      borderColor: activeLocationMeta.accentHex,
                      boxShadow: `0 0 8px ${activeLocationMeta.accentHex}55`,
                    }}
                  >
                    <img
                      src={activeLocationMeta.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {activeLocationMeta.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      ({activeLocationMeta.ranksLabel})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setArenaLocationOverride('auto')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      arenaLocationOverride === 'auto'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                    title="Менять фон автоматически по текущему рангу"
                  >
                    АВТО
                  </button>
                  {ARENA_LOCATIONS.map((loc) => {
                    const isSelected = arenaLocationOverride === loc.tier;
                    const isCurrentEffective = activeArenaTier === loc.tier;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setArenaLocationOverride(loc.tier)}
                        className={`relative w-8 h-6 rounded-lg overflow-hidden border transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'scale-105 ring-2 ring-white/80'
                            : isCurrentEffective
                            ? 'opacity-95'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                        style={{
                          borderColor:
                            isSelected || isCurrentEffective
                              ? loc.accentHex
                              : 'rgba(255,255,255,0.2)',
                        }}
                        title={`${loc.title} (${loc.ranksLabel})`}
                      >
                        <img
                          src={loc.imageUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <span className="relative z-10 text-[10px] font-mono font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] bg-black/45 px-1 rounded">
                          {loc.tier + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Мягкое круговое свечение за зеркалом (без квадратных рамок) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-8 z-0 flex items-center justify-center"
              >
                <div
                  className="w-full h-full rounded-full blur-3xl transition-opacity duration-200"
                  style={{
                    background: `radial-gradient(circle, rgba(${activeGlowRgb}, ${(
                      0.14 +
                      comboRatio * 0.28 +
                      (isPeakAura ? 0.12 : 0)
                    ).toFixed(2)}) 0%, transparent 70%)`,
                  }}
                />
              </div>

              <div
                className="relative z-10 rounded-[32px] p-[6px] bg-gradient-to-b from-[#475569] via-[#1E293B] to-[#0F172A] transition-shadow duration-200 flex-1 flex flex-col"
                style={{ boxShadow: mirrorOuterShadow }}
              >
                {/* Верхняя диодная LED-полоса ранга и пикового тонуса */}
                <div
                  className="pointer-events-none absolute top-1.5 left-12 right-12 h-[3px] rounded-full z-20 transition-opacity duration-200"
                  style={{
                    backgroundColor:
                      auraFrenzyRemainingSec > 0 ? '#FBBF24' : mirrorLedPalette.accentHex,
                    opacity: 0.45 + comboRatio * 0.55,
                    boxShadow: `0 0 12px ${
                      auraFrenzyRemainingSec > 0 ? '#FBBF24' : mirrorLedPalette.accentHex
                    }`,
                  }}
                />

                {/* Внутренняя поверхность зеркала с контурной LED-подсветкой и фацетом */}
                <div
                  className={`relative w-full h-full min-h-[520px] rounded-[26px] overflow-hidden border bg-[#F8FAFC] flex flex-col justify-between select-none transition-colors duration-200 ${
                    isPeakAura ? 'border-amber-300/70' : 'border-white/45'
                  }`}
                  style={{ boxShadow: mirrorInnerShadow }}
                >
                  {/* Интерактивное полотно отражения во всю площадь зеркала */}
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handleStagePointerDown}
                    className="absolute inset-0 w-full h-full block cursor-pointer touch-none"
                  />

                  {/* Зеркальные блики, градиент стекла и контурное свечение умного зеркала */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(226,232,240,0.45)_0%,rgba(255,255,255,0)_38%,rgba(255,255,255,0.32)_52%,rgba(203,213,225,0.25)_100%)]" />
                  <div
                    className="pointer-events-none absolute inset-2.5 rounded-[20px] border transition-colors duration-200"
                    style={{
                      borderColor: isPeakAura
                        ? 'rgba(251, 191, 36, 0.35)'
                        : `rgba(${mirrorLedPalette.rgb}, 0.25)`,
                      boxShadow: `inset 0 0 24px rgba(255,255,255,0.85), inset 0 0 ${Math.round(
                        8 + comboRatio * 18
                      )}px rgba(${mirrorLedPalette.rgb}, ${(0.15 + comboRatio * 0.25).toFixed(2)})`,
                    }}
                  />

                  {/* Случайная интерактивная бонус-мишень на стекле Умного Зеркала */}
                  {mirrorTarget && (
                    <button
                      type="button"
                      onPointerDown={handleCatchMirrorTarget}
                      style={{
                        left: `${(mirrorTarget.normX * 100).toFixed(1)}%`,
                        top: `${(mirrorTarget.normY * 100).toFixed(1)}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute z-30 group cursor-pointer focus:outline-none"
                    >
                      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.55)] hover:scale-105 active:scale-95 transition-transform duration-150">
                        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
                        </span>
                        <div className="text-left">
                          <div className="text-[11px] font-semibold text-amber-300 whitespace-nowrap leading-none">
                            {mirrorTarget.label} · ×2.5
                          </div>
                          <div className="mt-1 w-full h-0.5 rounded-full bg-white/15 overflow-hidden">
                            <div
                              className="h-full bg-amber-400 origin-left transition-transform duration-75"
                              style={{
                                transform: `scaleX(${Math.max(0, Math.min(1, mirrorTargetProgress))})`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Верхняя минималистичная HUD-панель на стекле зеркала */}
                  <div className="pointer-events-none relative z-10 p-4 sm:p-5 flex items-start justify-between gap-3 bg-gradient-to-b from-slate-950/65 via-slate-950/30 to-transparent">
                    {/* Слева: Текущая стадия и индекс PSL */}
                    <div>
                      <div className="text-[11px] font-mono font-semibold text-sky-300 tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                        {stats.currentRank.pslScoreLabel}
                        {auraFrenzyRemainingSec > 0
                          ? ` · Импульс ×2.5 (${Math.ceil(auraFrenzyRemainingSec)}с)`
                          : isPeakAura
                          ? ' · Пик Ауры'
                          : ''}
                      </div>
                      <h1 className="mt-0.5 text-xl sm:text-2xl font-bold text-white font-display tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
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
                            <span className="text-amber-300 text-[11px] font-semibold">
                              Мьюинг ×{stats.mewingComboMultiplier.toFixed(2)}
                            </span>
                          )}
                          <span className="text-white/30">·</span>
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
                          className="h-full transition-transform duration-100 origin-left"
                          style={{
                            backgroundColor: isPeakAura ? '#FBBF24' : mirrorLedPalette.accentHex,
                            transform: `scaleX(${Math.max(0, Math.min(1, mewingCombo / 100))})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА (Col 8–12): Смартфон 1:1 Cosmic Orange (17 Pro) с 3D-переворотом на заднюю крышку и сменной витриной О-ЗОНА / ЯГОДКИ */}
            <div className="lg:col-span-4 flex flex-col">
              {(() => {
                const isClickMarket = shopCategory === 'click';
                const marketTheme: 'ozon' | 'wb' = isClickMarket ? 'ozon' : 'wb';

                const featuredItem =
                  filteredShopItems.find((it) => it.id === bestRoiItemId) ||
                  filteredShopItems.find(
                    (it) =>
                      profile.highestRankIndexReached >=
                      Math.max(0, it.unlockAtRankIndex - 1)
                  ) ||
                  filteredShopItems[0];

                return (
                  <div
                    className="relative w-full select-none"
                    style={{ perspective: '2000px' }}
                  >
                    {/* 3D-корпус смартфона с анимацией переворота на 180° при сворачивании/разворачивании */}
                    <div
                      className="relative w-full transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isShopMinimized
                          ? 'rotateY(180deg) scale(0.985)'
                          : 'rotateY(0deg) scale(1)',
                      }}
                    >
                      {/* Боковые физические кнопки (Action Button + Громкость слева, Питание + Camera Control справа) */}
                      {/* Левая грань: Кнопка действия и качелька громкости */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-[4px] top-24 w-[4px] h-7 rounded-l-md bg-gradient-to-b from-[#FF985A] via-[#D95318] to-[#8C2F06] shadow-[-1px_0_3px_rgba(0,0,0,0.6)] border-y border-l border-[#FFA873]/50"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-[4px] top-36 w-[4px] h-12 rounded-l-md bg-gradient-to-b from-[#FF985A] via-[#D95318] to-[#8C2F06] shadow-[-1px_0_3px_rgba(0,0,0,0.6)] border-y border-l border-[#FFA873]/50"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-[4px] top-52 w-[4px] h-12 rounded-l-md bg-gradient-to-b from-[#FF985A] via-[#D95318] to-[#8C2F06] shadow-[-1px_0_3px_rgba(0,0,0,0.6)] border-y border-l border-[#FFA873]/50"
                      />
                      {/* Правая грань: Кнопка питания и утопленная кнопка Camera Control */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-[4px] top-40 w-[4px] h-16 rounded-r-md bg-gradient-to-b from-[#FF985A] via-[#D95318] to-[#8C2F06] shadow-[1px_0_3px_rgba(0,0,0,0.6)] border-y border-r border-[#FFA873]/50"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-[3px] bottom-36 w-[3px] h-11 rounded-r-sm bg-gradient-to-b from-[#B33D0A] via-[#E8662A] to-[#8C2F06] border-y border-r border-[#FFB080]/40"
                      />

                      {/* ===================================================================== */}
                      {/* ЛИЦЕВАЯ СТОРОНА (FRONT FACE): Экран смартфона с маркетплейсом внутри */}
                      {/* ===================================================================== */}
                      <div
                        className={`w-full rounded-[48px] p-[7px] bg-gradient-to-b from-[#F77B3E] via-[#DF5618] to-[#A63808] shadow-[0_24px_60px_rgba(0,0,0,0.65),0_0_28px_rgba(234,88,28,0.22),inset_0_1.5px_2px_rgba(255,196,156,0.75),inset_0_-2px_3px_rgba(90,26,3,0.85)] border border-[#FF9B66]/45 ${
                          isShopMinimized ? 'pointer-events-none' : ''
                        }`}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        {/* Пластиковые антенные вставки на оранжевой титаново-алюминиевой рамке */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-14 left-0 w-[7px] h-1.5 bg-[#9E3508]/80"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-14 right-0 w-[7px] h-1.5 bg-[#9E3508]/80"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-14 left-0 w-[7px] h-1.5 bg-[#9E3508]/80"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-14 right-0 w-[7px] h-1.5 bg-[#9E3508]/80"
                        />

                        {/* Тонкая чёрная экранная рамка (Bezel) */}
                        <div className="relative w-full rounded-[41px] bg-[#040508] p-[6px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                          {/* Верхняя щель разговорного динамика в рамке */}
                          <div
                            aria-hidden="true"
                            className="mx-auto mb-1 w-14 h-[3px] rounded-full bg-[#151821] border border-white/5"
                          />

                          {/* OLED-дисплей смартфона (внутри весь интерфейс магазина без изменений) */}
                          <div
                            className={`rounded-[35px] border overflow-hidden transition-colors duration-200 flex flex-col ${
                              isClickMarket
                                ? 'border-[#005BFF]/40 bg-[#0D1526]'
                                : 'border-[#CB11AB]/40 bg-[#170E24]'
                            }`}
                          >
                            {/* Статус-бар смартфона + Dynamic Island */}
                            <div
                              className={`px-5 pt-2 pb-1.5 flex items-center justify-between select-none transition-colors duration-200 ${
                                isClickMarket ? 'bg-[#0047CC]' : 'bg-[#981088]'
                              }`}
                            >
                              <span className="text-[11px] font-semibold tracking-tight text-white font-mono tabular-nums">
                                9:41
                              </span>

                              {/* Dynamic Island с объективом фронтальной камеры и датчиком */}
                              <button
                                type="button"
                                onClick={() => setIsShopMinimized(true)}
                                title="Перевернуть смартфон задней крышкой"
                                className="group relative h-[22px] w-[104px] rounded-full bg-black px-2.5 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(255,255,255,0.08)] cursor-pointer transition-transform duration-200 hover:scale-105"
                              >
                                <span className="w-2 h-2 rounded-full bg-[#140d1f] ring-1 ring-white/10 flex items-center justify-center">
                                  <span className="w-1 h-1 rounded-full bg-[#E8662A]/70 group-hover:bg-[#FF854D]" />
                                </span>
                                <span className="text-[9px] font-mono text-white/55 group-hover:text-white/90 tracking-tight transition-colors">
                                  17 PRO
                                </span>
                                {/* Сапфировый глазок селфи-камеры */}
                                <span className="relative w-3 h-3 rounded-full bg-gradient-to-br from-[#192847] via-[#070B14] to-[#1E1B4B] ring-1 ring-white/15 flex items-center justify-center">
                                  <span className="w-1 h-1 rounded-full bg-sky-400/70 blur-[0.3px]" />
                                </span>
                              </button>

                              {/* Иконки сети 5G, Wi-Fi и заряда батареи */}
                              <div className="flex items-center gap-1.5 text-white">
                                <span className="text-[9px] font-mono font-bold tracking-tighter opacity-90">
                                  5G
                                </span>
                                <svg
                                  viewBox="0 0 16 12"
                                  className="w-3.5 h-2.5 fill-current opacity-95"
                                >
                                  <rect x="1" y="8" width="2" height="3" rx="0.5" />
                                  <rect x="4.5" y="6" width="2" height="5" rx="0.5" />
                                  <rect x="8" y="3.5" width="2" height="7.5" rx="0.5" />
                                  <rect x="11.5" y="1" width="2" height="10" rx="0.5" />
                                </svg>
                                <div className="relative w-5 h-2.5 rounded-[3px] border border-white/80 p-[1.5px] flex items-center">
                                  <div className="w-full h-full rounded-[1px] bg-white" />
                                  <div className=" -right-[2.5px] absolute w-[1.5px] h-1 rounded-r-full bg-white/80" />
                                </div>
                              </div>
                            </div>

                            {/* Фирменная шапка маркетплейса (безопасная пародийная символика без ТЗ) */}
                            <div
                              className={`px-4 py-3 border-b transition-colors duration-200 ${
                                isClickMarket
                                  ? 'bg-gradient-to-r from-[#005BFF] via-[#0047CC] to-[#1D3570] border-[#005BFF]/40'
                                  : 'bg-gradient-to-r from-[#CB11AB] via-[#8E118C] to-[#481173] border-[#CB11AB]/40'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Оригинальная векторная эмблема витрины (кобальтовая сфера-импульс или ягодный кристалл) */}
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                      isClickMarket
                                        ? 'bg-white text-[#005BFF] border-white/60 shadow-sm'
                                        : 'bg-white/15 text-white border-white/30 backdrop-blur-sm'
                                    }`}
                                  >
                                    {isClickMarket ? (
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-5 h-5"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <circle
                                          cx="11"
                                          cy="12"
                                          r="6.5"
                                          stroke="#005BFF"
                                          strokeWidth="2.8"
                                        />
                                        <path
                                          d="M17.5 7.5L21 5.5M18 12H22M17.5 16.5L21 18.5"
                                          stroke="#F91155"
                                          strokeWidth="2.4"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-5 h-5"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <circle cx="9.5" cy="13.5" r="4.5" fill="#F472B6" />
                                        <circle cx="15" cy="14" r="4" fill="#E879F9" />
                                        <path
                                          d="M12 9C12 6.5 14 4.5 16.5 4.5M12 9C10.5 6.8 8.5 6 7 6"
                                          stroke="#FFFFFF"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h2 className="text-base font-extrabold tracking-tight text-white font-display truncate">
                                        {isClickMarket ? 'О-ЗОНА · Клик' : 'ЯГОДКИ · Уход'}
                                      </h2>
                                      <span
                                        className={`text-[11px] font-mono font-bold ${
                                          isClickMarket ? 'text-[#FFB4C8]' : 'text-[#F5D0FE]'
                                        }`}
                                      >
                                        · {isClickMarket ? 'Экспресс' : 'Beauty'}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-white/85 truncate">
                                      {isClickMarket
                                        ? 'ПВЗ «Челюстной» · выдача за 1 клик'
                                        : 'Склад эстетики · 4.9 ★ проверено'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Переключатель пакета заказа: x1, x10, MAX */}
                                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-950/45 border border-white/20">
                                    {([1, 10, 'MAX'] as BuyMultiplierMode[]).map((mode) => (
                                      <button
                                        key={String(mode)}
                                        type="button"
                                        onClick={() => setBuyMode(mode)}
                                        className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                          buyMode === mode
                                            ? isClickMarket
                                              ? 'bg-[#F91155] text-white'
                                              : 'bg-white text-[#6B1169]'
                                            : 'text-white/75 hover:text-white'
                                        }`}
                                      >
                                        {mode === 'MAX' ? 'MAX' : `×${mode}`}
                                      </button>
                                    ))}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setIsShopMinimized(true)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950/35 text-white/90 hover:bg-slate-950/55 border border-white/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    Свернуть
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="p-3.5 flex-1 flex flex-col">
                              {/* Переключатель витрин маркетплейса: Клик (О-ЗОНА) vs Уход (ЯГОДКИ) */}
                              <div
                                className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${
                                  isClickMarket
                                    ? 'bg-[#090F1C] border-[#1E3A8A]/60'
                                    : 'bg-[#10091A] border-[#581C87]/60'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setShopCategory('click')}
                                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                                    shopCategory === 'click'
                                      ? 'bg-[#005BFF] text-white shadow-[0_4px_14px_rgba(0,91,255,0.4)]'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#F91155] shrink-0" />
                                  <span>Клик · О-ЗОНА</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShopCategory('passive')}
                                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                                    shopCategory === 'passive'
                                      ? 'bg-gradient-to-r from-[#CB11AB] to-[#7E22CE] text-white shadow-[0_4px_14px_rgba(203,17,171,0.4)]'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#F472B6] shrink-0" />
                                  <span>Уход · ЯГОДКИ</span>
                                </button>
                              </div>

                              {/* Информационная строка программы лояльности текущей витрины */}
                              <div className="mt-2.5 px-1 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-300">
                                <span>
                                  {isClickMarket
                                    ? 'Синяя Карта активна · Мгновенная выдача'
                                    : 'Ягодный Кошелёк активен · Склад красоты'}
                                </span>
                                <span
                                  className={
                                    isClickMarket
                                      ? 'text-[#60A5FA] font-semibold'
                                      : 'text-[#F472B6] font-semibold'
                                  }
                                >
                                  {isClickMarket ? 'ПВЗ 0 PSL' : 'Рейтинг 4.9 ★'}
                                </span>
                              </div>

                              {/* Список товаров-улучшений */}
                              <div className="mt-2.5 space-y-2.5 overflow-y-auto max-h-[520px] pr-1">
                                {filteredShopItems.map((item) => {
                                  const currentLevel = profile.itemLevels[item.id] || 0;
                                  const maxillaLevel =
                                    profile.perkLevels['forward_maxilla'] || 0;
                                  const isUnlocked =
                                    profile.highestRankIndexReached >=
                                    Math.max(0, item.unlockAtRankIndex - 1);
                                  const isBestRoi = isUnlocked && item.id === bestRoiItemId;

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
                                    cost = calculateItemCost(
                                      item,
                                      currentLevel,
                                      buyCount,
                                      maxillaLevel
                                    );
                                  }

                                  const canAfford = isUnlocked && profile.looks >= cost;
                                  const nextMilestone = getNextMilestone(currentLevel);
                                  const prevMilestone = getPreviousMilestone(currentLevel);
                                  const milestoneProgress = nextMilestone
                                    ? Math.max(
                                        0,
                                        Math.min(
                                          1,
                                          (currentLevel - prevMilestone) /
                                            Math.max(1, nextMilestone - prevMilestone)
                                        )
                                      )
                                    : 1;
                                  const levelsToMilestone = nextMilestone
                                    ? Math.max(0, nextMilestone - currentLevel)
                                    : 0;

                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-3 rounded-xl border transition-colors flex items-center gap-3.5 ${
                                        !isUnlocked
                                          ? isClickMarket
                                            ? 'border-[#162238] bg-[#090F1C]/65 opacity-60'
                                            : 'border-[#27163A] bg-[#10091A]/65 opacity-60'
                                          : isBestRoi
                                          ? isClickMarket
                                            ? 'border-[#F91155]/65 hover:border-[#F91155] bg-[#111C33]'
                                            : 'border-[#F472B6]/65 hover:border-[#F472B6] bg-[#211334]'
                                          : canAfford
                                          ? isClickMarket
                                            ? 'border-[#1E3A8A] hover:border-[#005BFF] bg-[#101A2E]'
                                            : 'border-[#4C1D95] hover:border-[#CB11AB] bg-[#1D112E]'
                                          : isClickMarket
                                          ? 'border-[#172540] bg-[#0B1221]'
                                          : 'border-[#2E1846] bg-[#130B1F]'
                                      }`}
                                    >
                                      <UpgradeSketchArt
                                        itemId={item.id}
                                        locked={!isUnlocked}
                                        marketplaceTheme={marketTheme}
                                        isHotDeal={isBestRoi}
                                      />

                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                          <h3 className="text-sm font-semibold text-white font-display truncate">
                                            {item.name}
                                          </h3>
                                          <span className="text-xs font-mono tabular-nums text-slate-300 shrink-0">
                                            Ур. {currentLevel}
                                            {isBestRoi ? (
                                              <span
                                                className={
                                                  isClickMarket
                                                    ? 'text-[#FF477E] font-semibold'
                                                    : 'text-[#F472B6] font-semibold'
                                                }
                                              >
                                                {' '}
                                                · {isClickMarket ? 'Распродажа' : 'Хит выгоды'}
                                              </span>
                                            ) : null}
                                          </span>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between gap-2">
                                          <div
                                            className={`text-xs font-mono tabular-nums font-medium ${
                                              isClickMarket
                                                ? 'text-[#60A5FA]'
                                                : 'text-[#E879F9]'
                                            }`}
                                          >
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
                                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tabular-nums transition-all whitespace-nowrap shrink-0 ${
                                              !isUnlocked
                                                ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                                : canAfford
                                                ? isClickMarket
                                                  ? isBestRoi
                                                    ? 'bg-[#F91155] text-white hover:bg-[#FF2E6C] shadow-[0_2px_10px_rgba(249,17,85,0.35)] cursor-pointer'
                                                    : 'bg-[#005BFF] text-white hover:bg-[#1D6BFF] shadow-[0_2px_10px_rgba(0,91,255,0.35)] cursor-pointer'
                                                  : isBestRoi
                                                  ? 'bg-gradient-to-r from-[#F43F5E] to-[#CB11AB] text-white hover:brightness-110 shadow-[0_2px_10px_rgba(203,17,171,0.4)] cursor-pointer'
                                                  : 'bg-[#CB11AB] text-white hover:bg-[#DF19BD] shadow-[0_2px_10px_rgba(203,17,171,0.35)] cursor-pointer'
                                                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                                            }`}
                                          >
                                            {!isUnlocked
                                              ? `С ${PSL_RANKS[item.unlockAtRankIndex]?.title}`
                                              : `${formatLooks(cost)} PSL${buyCount > 1 ? ` (×${buyCount})` : ''}`}
                                          </button>
                                        </div>

                                        {/* Тонкая шкала прогресса до ближайшего бонуса ×2 (10 / 25 / 50 / 100 / 150 / 200 ур.) */}
                                        {isUnlocked && (
                                          <div className="mt-2 space-y-1">
                                            <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                                              <span>
                                                {nextMilestone
                                                  ? isClickMarket
                                                    ? `До акции ×2 (Ур. ${nextMilestone})`
                                                    : `До бонуса ×2 (Ур. ${nextMilestone})`
                                                  : 'Все рубежи ×2 открыты'}
                                              </span>
                                              <span>
                                                {nextMilestone
                                                  ? `ещё ${levelsToMilestone} шт.`
                                                  : 'МАКС'}
                                              </span>
                                            </div>
                                            <div
                                              className={`w-full h-1 rounded-full overflow-hidden ${
                                                isClickMarket ? 'bg-[#080D18]' : 'bg-[#0F0817]'
                                              }`}
                                            >
                                              <div
                                                className={`h-full transition-transform duration-150 origin-left ${
                                                  isClickMarket
                                                    ? isBestRoi
                                                      ? 'bg-gradient-to-r from-[#005BFF] to-[#F91155]'
                                                      : 'bg-[#005BFF]'
                                                    : isBestRoi
                                                    ? 'bg-gradient-to-r from-[#CB11AB] to-[#F43F5E]'
                                                    : 'bg-[#CB11AB]'
                                                }`}
                                                style={{
                                                  transform: `scaleX(${milestoneProgress})`,
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Нижний индикатор Home Bar (нажатие также переворачивает айфон крышкой вверх) */}
                              <div className="pt-3 pb-0.5 flex flex-col items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setIsShopMinimized(true)}
                                  title="Свернуть и перевернуть задней крышкой"
                                  className="group py-1 px-6 cursor-pointer flex items-center justify-center"
                                >
                                  <span className="w-32 h-1.5 rounded-full bg-white/30 group-hover:bg-white/65 transition-colors" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ===================================================================== */}
                      {/* ЗАДНЯЯ КРЫШКА (BACK FACE): Реалистичный 1:1 Оранжевый iPhone 17 Pro   */}
                      {/* ===================================================================== */}
                      <div
                        onClick={() => setIsShopMinimized(false)}
                        role="button"
                        tabIndex={isShopMinimized ? 0 : -1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsShopMinimized(false);
                          }
                        }}
                        className={`absolute inset-0 w-full h-full rounded-[48px] p-[10px] bg-gradient-to-br from-[#F47133] via-[#DF5618] to-[#9E3407] shadow-[0_28px_65px_rgba(0,0,0,0.75),0_0_34px_rgba(234,88,28,0.26),inset_0_2px_3px_rgba(255,204,170,0.8),inset_0_-3px_6px_rgba(70,19,2,0.9)] border border-[#FFA06A]/55 flex flex-col justify-between overflow-hidden cursor-pointer group ${
                          isShopMinimized ? '' : 'pointer-events-none'
                        }`}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {/* Анодированный металлический блик по диагонали корпуса */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-20 bg-[radial-gradient(circle_at_25%_18%,rgba(255,212,184,0.28),transparent_48%),radial-gradient(circle_at_80%_82%,rgba(120,32,4,0.45),transparent_55%)]"
                        />

                        {/* Антенные прожилки на задней титаново-алюминиевой раме */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-14 left-0 w-2.5 h-1.5 bg-[#8E2E05]/85"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-14 right-0 w-2.5 h-1.5 bg-[#8E2E05]/85"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-14 left-0 w-2.5 h-1.5 bg-[#8E2E05]/85"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-14 right-0 w-2.5 h-1.5 bg-[#8E2E05]/85"
                        />

                        {/* 1. ВЕРХНЕЕ ПЛАТО КАМЕР (Фирменный полноширинный горизонтальный Camera Bar iPhone 17 Pro) */}
                        <div className="relative z-10 w-full rounded-[36px] p-4 bg-gradient-to-b from-[#E55E20] via-[#CB4911] to-[#9E3508] shadow-[0_14px_28px_rgba(55,14,2,0.65),inset_0_1.5px_2px_rgba(255,198,162,0.75),inset_0_-2px_4px_rgba(74,20,3,0.85)] border border-[#FF9B64]/50">
                          {/* Фрезерованная фаска вокруг плато камер */}
                          <div className="flex items-center justify-between gap-4">
                            {/* ЛЕВАЯ ЧАСТЬ ПЛАТО: Классический треугольник из 3 огромных объективов Pro */}
                            <div className="relative w-[154px] h-[156px] shrink-0">
                              {/* Верхний левый объектив (48MP Fusion Main Camera) */}
                              <div className="absolute top-0 left-0 w-[72px] h-[72px] rounded-full p-[4px] bg-gradient-to-br from-[#FFA978] via-[#D95116] to-[#7A2503] shadow-[0_6px_14px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,225,205,0.8)]">
                                <div className="w-full h-full rounded-full p-[5px] bg-gradient-to-b from-[#1C1D22] to-[#090A0D] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] flex items-center justify-center">
                                  <div className="relative w-full h-full rounded-full bg-[radial-gradient(circle_at_35%_30%,#1E3A5F_0%,#0B1324_42%,#04060A_78%)] border border-white/15 flex items-center justify-center overflow-hidden">
                                    {/* Многослойное сапфировое просветление и диафрагма */}
                                    <div className="w-6 h-6 rounded-full bg-[#030407] ring-2 ring-[#2563EB]/35 flex items-center justify-center shadow-inner">
                                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-sky-500/40 via-indigo-400/20 to-white/70" />
                                    </div>
                                    <span className="absolute top-2 left-2.5 w-3.5 h-1.5 -rotate-30 rounded-full bg-white/35 blur-[0.4px]" />
                                    <span className="absolute bottom-2 right-2.5 w-2.5 h-1 -rotate-30 rounded-full bg-cyan-400/30 blur-[0.5px]" />
                                  </div>
                                </div>
                              </div>

                              {/* Нижний левый объектив (48MP Ultra Wide Camera) */}
                              <div className="absolute bottom-0 left-0 w-[72px] h-[72px] rounded-full p-[4px] bg-gradient-to-br from-[#FFA978] via-[#D95116] to-[#7A2503] shadow-[0_6px_14px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,225,205,0.8)]">
                                <div className="w-full h-full rounded-full p-[5px] bg-gradient-to-b from-[#1C1D22] to-[#090A0D] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] flex items-center justify-center">
                                  <div className="relative w-full h-full rounded-full bg-[radial-gradient(circle_at_32%_32%,#272352_0%,#0D1021_45%,#040508_80%)] border border-white/15 flex items-center justify-center overflow-hidden">
                                    <div className="w-7 h-7 rounded-full bg-[#030407] ring-2 ring-purple-400/30 flex items-center justify-center">
                                      <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-fuchsia-500/35 via-sky-400/25 to-white/65" />
                                    </div>
                                    <span className="absolute top-2 left-2.5 w-3.5 h-1.5 -rotate-30 rounded-full bg-white/35 blur-[0.4px]" />
                                  </div>
                                </div>
                              </div>

                              {/* Правый центральный объектив (5x Tetraprism Telephoto Camera) */}
                              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[72px] h-[72px] rounded-full p-[4px] bg-gradient-to-br from-[#FFA978] via-[#D95116] to-[#7A2503] shadow-[0_6px_14px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,225,205,0.8)]">
                                <div className="w-full h-full rounded-full p-[5px] bg-gradient-to-b from-[#1C1D22] to-[#090A0D] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] flex items-center justify-center">
                                  <div className="relative w-full h-full rounded-full bg-[radial-gradient(circle_at_35%_35%,#133A3E_0%,#091620_48%,#040508_82%)] border border-white/15 flex items-center justify-center overflow-hidden">
                                    {/* Квадратная призма перископа (Tetraprism) внутри телеобъектива */}
                                    <div className="w-6 h-6 rounded-[5px] rotate-45 bg-[#030508] ring-1 ring-emerald-400/40 flex items-center justify-center">
                                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-emerald-400/45 to-white/70" />
                                    </div>
                                    <span className="absolute top-2 left-2.5 w-3.5 h-1.5 -rotate-30 rounded-full bg-white/35 blur-[0.4px]" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* ПРАВАЯ ЧАСТЬ ПОЛНОШИРИННОГО ПЛАТО (Вспышка True Tone, микрофон и сканер LiDAR у правого края, как в 17 Pro) */}
                            <div className="h-[146px] pr-1.5 flex flex-col items-center justify-between py-1 shrink-0">
                              {/* Верх: Двухтональная вспышка True Tone LED Flash */}
                              <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-b from-[#FFAA7A] to-[#8C2F06] shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
                                <div className="w-full h-full rounded-full bg-[radial-gradient(circle,#FFFBEB_0%,#FDE68A_48%,#F59E0B_85%,#B45309_100%)] border border-white/60 shadow-inner flex items-center justify-center">
                                  <div className="w-3.5 h-3.5 rounded-full border border-amber-300/70 bg-white/50" />
                                </div>
                              </div>

                              {/* Центр: Микрофон студийного качества (лазерная перфорация) */}
                              <div className="w-2.5 h-2.5 rounded-full bg-[#180802] ring-1 ring-[#FF9B64]/35 shadow-inner" />

                              {/* Низ: Сканер глубины LiDAR */}
                              <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-b from-[#FFAA7A] to-[#8C2F06] shadow-[0_3px_8px_rgba(0,0,0,0.5)]">
                                <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_35%_30%,#3B232E_0%,#1C1219_55%,#0C080B_100%)] border border-white/10 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-[#582F41]/50" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. НИЖНЯЯ МАТОВАЯ СТЕКЛЯННАЯ ВСТАВКА CERAMIC SHIELD + КОЛЬЦО MAGSAFE */}
                        <div className="relative z-10 mt-3 flex-1 rounded-[36px] p-4 bg-gradient-to-b from-[#F06D30] via-[#E25A1C] to-[#C6450D] border border-[#FFA876]/55 shadow-[inset_0_2px_6px_rgba(255,212,184,0.45),inset_0_-4px_10px_rgba(89,25,2,0.55)] flex flex-col items-center justify-between overflow-hidden">
                          {/* Сатиновая матовая текстура стекла */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,228,205,0.22),transparent_62%)]"
                          />

                          {/* Верхняя плашка статуса на крышке */}
                          <div className="relative z-10 w-full flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFF0E5]/85 font-semibold">
                              COSMIC ORANGE · 17 PRO
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-black/25 text-white border border-white/25 backdrop-blur-sm group-hover:bg-black/40 transition-colors">
                              Нажми, чтобы перевернуть ↻
                            </span>
                          </div>

                          {/* Центральное кольцо MagSafe + безопасная геометрическая эмблема по центру */}
                          <div className="relative z-10 my-3 flex flex-col items-center justify-center">
                            <div className="relative w-36 h-36 rounded-full border-[5px] border-[#FFD3B5]/35 shadow-[0_0_25px_rgba(120,32,4,0.25),inset_0_0_16px_rgba(255,215,188,0.2)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <div className="w-28 h-28 rounded-full border border-[#FFE4D1]/20 flex items-center justify-center">
                                {/* Глянцевый металлический медальон по центру крышки */}
                                <div className="w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-br from-[#FFE5D4] via-[#F7945E] to-[#9E3508] p-[1.5px] shadow-[0_6px_16px_rgba(80,20,2,0.45)] flex items-center justify-center">
                                  <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#D84E12] to-[#8F2E05] flex items-center justify-center -rotate-45">
                                    <span className="text-xs font-mono font-extrabold tracking-tighter text-[#FFF2E8]">
                                      PSL
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Нижний вертикальный магнитный штрих выравнивания MagSafe */}
                            <div className="mt-2.5 w-1.5 h-6 rounded-full bg-[#FFD3B5]/40 shadow-inner" />
                          </div>

                          {/* Нижний MagSafe-картхолдер быстрого заказа + кнопка переворота обратно */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-10 w-full rounded-2xl p-3 bg-[#160B06]/75 backdrop-blur-md border border-[#FFA876]/35 shadow-[0_10px_24px_rgba(0,0,0,0.45)] space-y-2.5 cursor-default"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFB38A]">
                                  MagSafe Wallet ·{' '}
                                  {isClickMarket ? 'О-ЗОНА Клик' : 'ЯГОДКИ Уход'}
                                </div>
                                <div className="text-xs font-semibold text-white truncate">
                                  Смартфон перевёрнут крышкой вверх
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setIsShopMinimized(false)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#FF7A3D] to-[#E04F10] hover:brightness-110 text-white shadow-[0_4px_12px_rgba(224,79,16,0.45)] border border-[#FFB58F]/40 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                На экран ↻
                              </button>
                            </div>

                            {featuredItem &&
                              (() => {
                                const curLvl = profile.itemLevels[featuredItem.id] || 0;
                                const maxillaLvl =
                                  profile.perkLevels['forward_maxilla'] || 0;
                                const cost = calculateItemCost(
                                  featuredItem,
                                  curLvl,
                                  1,
                                  maxillaLvl
                                );
                                const canAfford = profile.looks >= cost;

                                return (
                                  <div className="p-2 rounded-xl bg-black/45 border border-white/10 flex items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <UpgradeSketchArt
                                        itemId={featuredItem.id}
                                        marketplaceTheme={marketTheme}
                                        isHotDeal
                                      />
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold text-white truncate">
                                          {featuredItem.name}
                                        </div>
                                        <div className="text-[11px] font-mono tabular-nums text-[#FFD2B8]/80">
                                          Ур. {curLvl} · Лучшая выгода
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      disabled={!canAfford}
                                      onClick={() => handleBuyShopItem(featuredItem)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                                        canAfford
                                          ? isClickMarket
                                            ? 'bg-[#005BFF] text-white hover:bg-[#1A6BFF] cursor-pointer'
                                            : 'bg-[#CB11AB] text-white hover:bg-[#DF19BD] cursor-pointer'
                                          : 'bg-white/5 text-slate-400 border border-white/10 cursor-not-allowed'
                                      }`}
                                    >
                                      {formatLooks(cost)} PSL
                                    </button>
                                  </div>
                                );
                              })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
            atlasImage={atlasImage}
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
