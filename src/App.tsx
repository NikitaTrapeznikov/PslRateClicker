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
  RebirthStarryBackground,
} from './components/ModalsAndPanels';
import { RankPortraitThumb } from './components/RankPortraitThumb';
import {
  BuyMultiplierMode,
  MarketplacePhoneShop,
} from './components/MarketplacePhoneShop';
import { LooksmaxMusicPlayer } from './components/LooksmaxMusicPlayer';
import { LooksmaxLoadingScreen } from './components/LooksmaxLoadingScreen';
import {
  loadTutorialTapsState,
  saveTutorialTapsState,
  TutorialTapHand,
  TutorialTapsState,
} from './components/TutorialTapHand';
import {
  PlayerProfileHeaderButton,
  PlayerProfileModal,
} from './components/PlayerProfileModal';
import { looksmaxMusic } from './modules/musicPlayer';
import {
  calculateItemCost,
  calculateMaxAffordable,
  calculatePerkDnaCost,
  computePlayerStats,
  DNA_PERKS,
  getMilestoneMultiplier,
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

type ActiveSection = 'arena' | 'evolution' | 'rebirth';

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
  const hasCheckedArenaSoundRef = useRef<boolean>(false);
  const [rankUpBanner, setRankUpBanner] = useState<{
    rankIndex: number;
    title: string;
    subtitle: string;
  } | null>(null);
  const [auraWaves, setAuraWaves] = useState<Array<{ id: number; isCrit: boolean }>>([]);
  const [arenaLocationOverride, setArenaLocationOverride] = useState<'auto' | ArenaLocationTier>('auto');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [tutorialTaps, setTutorialTaps] = useState<TutorialTapsState>(() =>
    loadTutorialTapsState()
  );

  const markTutorialTapped = useCallback((key: keyof TutorialTapsState) => {
    setTutorialTaps((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      saveTutorialTapsState(next);
      return next;
    });
  }, []);

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
      .then(({ profile: loaded, offlineReport }) => {
        if (!mounted) return;
        setProfile(loaded);
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

  // Прямая привязка работы плеера к главному экрану (Арена, Эволюция, Поколения).
  // На этапе загрузки или вне этих 3 вкладок музыка полностью выключена.
  const isMainScreenWithMusic =
    !isInitialLoading &&
    (activeSection === 'arena' ||
      activeSection === 'evolution' ||
      activeSection === 'rebirth');

  useEffect(() => {
    looksmaxMusic.setMainScreenActive(isMainScreenWithMusic);
    return () => {
      looksmaxMusic.setMainScreenActive(false);
    };
  }, [isMainScreenWithMusic]);

  // Проверка наличия звука из плеера при первом заходе на Арену после запуска приложения:
  // если звука нет — вызываем reloadPlayer() ровно 1 раз без уведомлений
  useEffect(() => {
    if (isInitialLoading || activeSection !== 'arena' || hasCheckedArenaSoundRef.current) {
      return;
    }
    hasCheckedArenaSoundRef.current = true;

    const timerId = window.setTimeout(() => {
      if (!looksmaxMusic.isAudioActuallyPlaying()) {
        looksmaxMusic.reloadPlayer();
      }
    }, 450);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isInitialLoading, activeSection]);

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
          durationMs: 10500,
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

        const prevRank = currentStats.currentRank;
        const newHighestRank = Math.max(prev.highestRankIndexReached, newRank.index);

        if (newRank.index > prevRank.index) {
          soundEngine.playRankUp();
          rendererRef.current?.triggerMoggedTransition(prevRank, newRank);
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

      markTutorialTapped('mirror');

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
        const prevRank = computePlayerStats({
          currentRunTotalLooks: prev.currentRunTotalLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: comboRef.current,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
        }).currentRank;

        const nextRunLooks = prev.currentRunTotalLooks + gain;
        const nextRank = computePlayerStats({
          currentRunTotalLooks: nextRunLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: comboRef.current,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
        }).currentRank;

        if (nextRank.index > prevRank.index) {
          soundEngine.playRankUp();
          rendererRef.current?.triggerMoggedTransition(prevRank, nextRank);
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
    [stats, profile.itemLevels, markTutorialTapped]
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
    markTutorialTapped('rewardedAd');
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
  }, [isAdLoading, markTutorialTapped]);

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

  // Полный сброс профиля с возвратом на стадию Sub 3
  const handleResetProfile = useCallback(() => {
    const fresh = profileManager.resetAllProgress();
    setProfile(fresh);
    setMewingCombo(0);
    setAuraFrenzyRemainingSec(0);
    setMirrorTarget(null);
    setOfflineBanner(null);
    setRankUpBanner(null);
    setActiveSection('arena');
  }, []);

  // Принудительное сохранение профиля из окна Профиля
  const handleForceSaveProfile = useCallback(() => {
    profileManager.saveProfileAsync(profileRef.current, true);
  }, []);

  // Повторное включение пальцев-подсказок обучения
  const handleResetTutorialHints = useCallback(() => {
    const resetState: TutorialTapsState = {
      mirror: false,
      playerGif: false,
      phoneFlip: false,
      evolutionTab: false,
      rebirthTab: false,
      rewardedAd: false,
    };
    setTutorialTaps(resetState);
    saveTutorialTapsState(resetState);
  }, []);

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
        18,
        Math.floor(stats.passivePerSecond * 7 + stats.clickPower * 6)
      );

      soundEngine.playHammerCrit();
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
      setAuraFrenzyRemainingSec((prev) => Math.min(45, prev + 20));

      setProfile((prev) => {
        const prevRank = computePlayerStats({
          currentRunTotalLooks: prev.currentRunTotalLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: 100,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
          auraFrenzyRemainingSec: 20,
        }).currentRank;

        const nextRunLooks = prev.currentRunTotalLooks + instantBonus;
        const nextRank = computePlayerStats({
          currentRunTotalLooks: nextRunLooks,
          generation: prev.generation,
          itemLevels: prev.itemLevels,
          perkLevels: prev.perkLevels,
          mewingCombo: 100,
          rewardedBoostRemainingSec: prev.rewardedBoostRemainingSec,
          auraFrenzyRemainingSec: 20,
        }).currentRank;

        if (nextRank.index > prevRank.index) {
          soundEngine.playRankUp();
          rendererRef.current?.triggerMoggedTransition(prevRank, nextRank);
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

        {/* Zone 2: 3 навигационные вкладки с высокой контрастностью */}
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
            onClick={() => {
              markTutorialTapped('evolutionTab');
              setActiveSection('evolution');
            }}
            className={`relative px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
              activeSection === 'evolution'
                ? 'bg-emerald-500/20 text-white border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Эволюция PSL (8 стадий)
            {!tutorialTaps.evolutionTab && (
              <TutorialTapHand
                size="sm"
                className="absolute -bottom-6 left-1/2 -translate-x-1/2"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              markTutorialTapped('rebirthTab');
              setActiveSection('rebirth');
            }}
            className={`relative px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
              activeSection === 'rebirth'
                ? 'bg-amber-500/25 text-amber-300 border-amber-400/70 shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Поколения и ДНК {stats.canRebirth ? `(+${stats.pendingRebirthDNA})` : ''}
            {!tutorialTaps.rebirthTab && (
              <TutorialTapHand
                size="sm"
                className="absolute -bottom-6 left-1/2 -translate-x-1/2"
              />
            )}
          </button>
        </nav>

        {/* Zone 3: Rewarded Boost Яндекс Игр + Кнопка-иконка Профиля игрока */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleActivateRewardedBoost}
            disabled={isAdLoading}
            className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            {!tutorialTaps.rewardedAd && (
              <TutorialTapHand
                size="sm"
                className="absolute -bottom-6 left-1/2 -translate-x-1/2"
              />
            )}
          </button>

          <PlayerProfileHeaderButton
            profile={profile}
            stats={stats}
            atlasImage={atlasImage}
            onClick={() => setIsProfileModalOpen(true)}
          />
        </div>
      </header>

      {/* Мобильная панель переключения разделов */}
      <div className="relative z-30 md:hidden grid grid-cols-3 gap-1.5 p-2 bg-[#0B1017]/95 backdrop-blur-md border-b border-white/15 shadow-md">
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
          onClick={() => {
            markTutorialTapped('evolutionTab');
            setActiveSection('evolution');
          }}
          className={`relative py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap truncate border ${
            activeSection === 'evolution'
              ? 'bg-emerald-500/20 text-white border-emerald-400/60'
              : 'bg-white/5 text-slate-200 border-white/10'
          }`}
        >
          8 стадий
          {!tutorialTaps.evolutionTab && (
            <TutorialTapHand
              size="sm"
              className="absolute -bottom-5 left-1/2 -translate-x-1/2"
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            markTutorialTapped('rebirthTab');
            setActiveSection('rebirth');
          }}
          className={`relative py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap truncate border ${
            activeSection === 'rebirth'
              ? 'bg-amber-500/25 text-amber-300 border-amber-400/70'
              : 'bg-white/5 text-slate-200 border-white/10'
          }`}
        >
          Реборн
          {!tutorialTaps.rebirthTab && (
            <TutorialTapHand
              size="sm"
              className="absolute -bottom-5 left-1/2 -translate-x-1/2"
            />
          )}
        </button>
      </div>

      {/* Всплывающие уведомления поверх UI (оффлайн-доход после входа и повышение ранга) — не сдвигают верстку */}
      {(offlineBanner || rankUpBanner) && (
        <div className="pointer-events-none fixed top-16 md:top-[68px] left-1/2 -translate-x-1/2 z-50 w-full max-w-[720px] px-4 flex flex-col gap-2.5">
          {offlineBanner && (
            <div className="pointer-events-auto p-3.5 rounded-2xl border border-emerald-400/50 bg-[#111820]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_24px_rgba(16,185,129,0.2)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
              <div className="text-xs text-[#F1F5F9] leading-relaxed">
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
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              >
                Забрать очки
              </button>
            </div>
          )}

          {rankUpBanner && (
            <div className="pointer-events-auto p-3.5 rounded-2xl border border-amber-400/60 bg-[#111820]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_24px_rgba(245,158,11,0.22)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
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
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
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
              <LooksmaxMusicPlayer
                showGifTutorialHand={!tutorialTaps.playerGif}
                onDismissGifTutorialHand={() => markTutorialTapped('playerGif')}
              />
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

                  {/* Полупрозрачный палец подсказки при первом входе: клик по зеркалу */}
                  {!tutorialTaps.mirror && (
                    <TutorialTapHand
                      size="lg"
                      label="Тапай зеркало"
                      className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                    />
                  )}

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
              <MarketplacePhoneShop
                profile={profile}
                shopCategory={shopCategory}
                setShopCategory={setShopCategory}
                buyMode={buyMode}
                setBuyMode={setBuyMode}
                isShopMinimized={isShopMinimized}
                setIsShopMinimized={setIsShopMinimized}
                filteredShopItems={filteredShopItems}
                bestRoiItemId={bestRoiItemId}
                onBuyShopItem={handleBuyShopItem}
                showPhoneFlipTutorialHand={!tutorialTaps.phoneFlip}
                onDismissPhoneFlipTutorialHand={() => markTutorialTapped('phoneFlip')}
              />
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
      </main>

      {/* Модальное окно Профиля игрока (статистика, настройки, сброс прогресса) */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        stats={stats}
        atlasImage={atlasImage}
        onResetProfile={handleResetProfile}
        onToggleOriginalCaption={handleToggleOriginalCaption}
        onForceSaveProfile={handleForceSaveProfile}
        onResetTutorialHints={handleResetTutorialHints}
      />
    </div>
  );
}
