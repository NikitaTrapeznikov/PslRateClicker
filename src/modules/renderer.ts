/**
 * Модуль рендеринга спрайтов (PSLSpriteRenderer):
 * - Загружает референсный атлас /assets/aistudio/image_998de055.png (8 стадий: sub 3 .. true adam)
 * - Вырезает нужный квадрант портрета с поддержкой Retina / High-DPI Canvas
 * - Отрисовывает антропометрическую сетку, ударные волны от Молотка (бонсмэшинга),
 *   частицы и всплывающие цифры (+Looks / КРИТ МОЛОТКОМ!)
 */

import { PSL_RANKS, PSLRankDefinition } from './mechanics';
import { formatLooks } from './utils';

export const PSL_ATLAS_HD_URL = '/assets/aistudio/image_998de055_hd.png';
export const PSL_ATLAS_FALLBACK_URL = '/assets/aistudio/image_998de055.png';
export const PSL_ATLAS_URL = PSL_ATLAS_HD_URL;

export interface FloatingFeedbackText {
  id: number;
  x: number;
  y: number;
  vy: number;
  text: string;
  subtext?: string;
  isCrit: boolean;
  alpha: number;
  scale: number;
}

export interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  isCrit: boolean;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

/**
 * Индивидуальные профили зацикленной биомеханической анимации и реалистичного объема
 * для каждой из 8 стадий PSL (воспроизводятся при удержании бонуса от нажатия mewingCombo > 0).
 */
interface StageAnimationProfile {
  /** Базовая скорость цикла при активном бонусе */
  cycleSpeed: number;
  /** Амплитуда наклона/поворота головы (в радианах) */
  headTiltRad: number;
  /** Амплитуда сжатия жевательных мышц / нижней трети лица (мьюинг-импульс) */
  jawClenchAmp: number;
  /** Амплитуда движения прядей волос на макушке и висках */
  hairSwayAmp: number;
  /** Амплитуда дыхания шеи и плеч */
  breathAmp: number;
  /** Прищур глаз (Hunter Eyes squint) во время цикла */
  eyeSquintAmp: number;
  /** Нормализованная координата Y линии глаз внутри портрета */
  eyeLineY: number;
  /** Нормализованное расстояние от центра до зрачков по X */
  eyeSpanX: number;
  /** Интенсивность реалистичной светотени скул и глазниц */
  realismShadeAlpha: number;
}

const STAGE_ANIMATION_PROFILES: StageAnimationProfile[] = [
  // 0: Sub 3 — Усталое тяжелое дыхание, покачивание головы, частый прищур/моргание
  {
    cycleSpeed: 0.055,
    headTiltRad: 0.022,
    jawClenchAmp: 0.012,
    hairSwayAmp: 1.8,
    breathAmp: 0.022,
    eyeSquintAmp: 0.22,
    eyeLineY: -0.04,
    eyeSpanX: 0.135,
    realismShadeAlpha: 0.12,
  },
  // 1: Sub 5 — Старательное выпрямление шеи, ритмичный подъем корня языка (базовый мьюинг)
  {
    cycleSpeed: 0.062,
    headTiltRad: 0.018,
    jawClenchAmp: 0.018,
    hairSwayAmp: 2.2,
    breathAmp: 0.018,
    eyeSquintAmp: 0.18,
    eyeLineY: -0.035,
    eyeSpanX: 0.13,
    realismShadeAlpha: 0.13,
  },
  // 2: LTN — Ритмичная работа жевательных мышц (Мастика), спокойное дыхание
  {
    cycleSpeed: 0.068,
    headTiltRad: 0.016,
    jawClenchAmp: 0.024,
    hairSwayAmp: 2.6,
    breathAmp: 0.016,
    eyeSquintAmp: 0.16,
    eyeLineY: -0.035,
    eyeSpanX: 0.125,
    realismShadeAlpha: 0.14,
  },
  // 3: MTN — Уверенный ритмичный кивок, мягкое движение текстурной челки и тонус скул
  {
    cycleSpeed: 0.072,
    headTiltRad: 0.02,
    jawClenchAmp: 0.026,
    hairSwayAmp: 3.2,
    breathAmp: 0.016,
    eyeSquintAmp: 0.18,
    eyeLineY: -0.03,
    eyeSpanX: 0.125,
    realismShadeAlpha: 0.15,
  },
  // 4: HTN — Фокус взгляда с положительным наклоном, волна объемной укладки, четкий импульс челюсти
  {
    cycleSpeed: 0.076,
    headTiltRad: 0.022,
    jawClenchAmp: 0.028,
    hairSwayAmp: 4.0,
    breathAmp: 0.015,
    eyeSquintAmp: 0.24,
    eyeLineY: -0.032,
    eyeSpanX: 0.125,
    realismShadeAlpha: 0.16,
  },
  // 5: Chadlite — Модельный микро-разворот головы, втягивание впалых щек (Hollow Cheeks) и пульс углов 120°
  {
    cycleSpeed: 0.08,
    headTiltRad: 0.024,
    jawClenchAmp: 0.032,
    hairSwayAmp: 3.5,
    breathAmp: 0.016,
    eyeSquintAmp: 0.26,
    eyeLineY: -0.035,
    eyeSpanX: 0.122,
    realismShadeAlpha: 0.18,
  },
  // 6: Chad — Доминантный сигма-поворот профиля, хищный прищур Hunter Eyes, мощная игра массетеров и шеи
  {
    cycleSpeed: 0.085,
    headTiltRad: 0.026,
    jawClenchAmp: 0.036,
    hairSwayAmp: 4.4,
    breathAmp: 0.018,
    eyeSquintAmp: 0.3,
    eyeLineY: -0.028,
    eyeSpanX: 0.12,
    realismShadeAlpha: 0.2,
  },
  // 7: True Adam — Развевающиеся длинные темные пряди, золотое сечение светотени и эталонный импульс симметрии
  {
    cycleSpeed: 0.09,
    headTiltRad: 0.028,
    jawClenchAmp: 0.038,
    hairSwayAmp: 5.8,
    breathAmp: 0.02,
    eyeSquintAmp: 0.32,
    eyeLineY: -0.025,
    eyeSpanX: 0.118,
    realismShadeAlpha: 0.22,
  },
];

export class PSLSpriteRenderer {
  private atlasImage: HTMLImageElement | null = null;
  private isLoaded = false;
  private hasError = false;
  private moggedBarImage: HTMLImageElement | null = null;
  private isMoggedBarLoaded = false;

  // Переход между уровнями: старый персонаж с плашкой MOGGED на глазах -> исчезновение -> новый персонаж
  private lastRenderedRank: PSLRankDefinition | null = null;
  private moggedTransition: {
    oldRank: PSLRankDefinition;
    newRank: PSLRankDefinition;
    startTimeMs: number;
    durationMs: number;
  } | null = null;

  // Анимационные состояния сцены
  private scalePulse = 1.0;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;
  private hammerSwingAngle = 0;
  private hammerOpacity = 0;
  private hammerTargetX = 0;
  private hammerTargetY = 0;

  // Зацикленная анимация портрета (работает ТОЛЬКО пока удерживается бонус от нажатия mewingCombo > 0)
  private loopPhase = 0;
  private loopAmplitude = 0;

  private floatingTexts: FloatingFeedbackText[] = [];
  private shockwaves: ShockwaveRing[] = [];
  private particles: SparkParticle[] = [];
  private nextId = 1;

  constructor(onAtlasReady?: () => void) {
    if (typeof window !== 'undefined') {
      const mogImg = new Image();
      mogImg.src = '/assets/sfx/mogged_eye_bar.svg';
      mogImg.onload = () => {
        this.moggedBarImage = mogImg;
        this.isMoggedBarLoaded = true;
      };

      const img = new Image();
      img.src = PSL_ATLAS_HD_URL;
      img.onload = () => {
        this.atlasImage = img;
        this.isLoaded = true;
        onAtlasReady?.();
      };
      img.onerror = () => {
        // Fallback на базовый атлас, если HD-версия недоступна
        const fallbackImg = new Image();
        fallbackImg.src = PSL_ATLAS_FALLBACK_URL;
        fallbackImg.onload = () => {
          this.atlasImage = fallbackImg;
          this.isLoaded = true;
          onAtlasReady?.();
        };
        fallbackImg.onerror = () => {
          this.hasError = true;
          onAtlasReady?.();
        };
      };
    }
  }

  public isAtlasReady(): boolean {
    return this.isLoaded && this.atlasImage !== null;
  }

  public getAtlasImage(): HTMLImageElement | null {
    return this.atlasImage;
  }

  /**
   * Запускает сцену «MOGGED» при достижении нового уровня внешности:
   * На глаза старого персонажа падает черная плашка MOGGED, держится ~1.7с,
   * после чего плавно исчезает и появляется следующий персонаж.
   */
  public triggerMoggedTransition(
    oldRank: PSLRankDefinition,
    newRank: PSLRankDefinition
  ): void {
    this.moggedTransition = {
      oldRank,
      newRank,
      startTimeMs: performance.now(),
      durationMs: 2150,
    };
    this.shakeOffsetX = (Math.random() - 0.5) * 18;
    this.shakeOffsetY = (Math.random() - 0.5) * 18;
    this.scalePulse = 0.94;
  }

  /**
   * Вызывается при клике игрока по портрету. Создает пружинящий импульс,
   * ударные кольца, частицы и всплывающий текст.
   */
  public triggerClickEffect(params: {
    normX: number; // 0..1 внутри холста
    normY: number; // 0..1 внутри холста
    amount: number;
    isCrit: boolean;
    hasHammerUpgrade: boolean;
  }): void {
    const { normX, normY, amount, isCrit, hasHammerUpgrade } = params;

    // 1. Импульс масштаба и микро-шейк при крите молотка
    this.scalePulse = isCrit ? 0.91 : 0.955;

    if (isCrit) {
      this.shakeOffsetX = (Math.random() - 0.5) * 14;
      this.shakeOffsetY = (Math.random() - 0.5) * 14;
    }

    // 2. Визуализация удара ортопедического молотка при наличии улучшения или крите
    if (isCrit || hasHammerUpgrade) {
      this.hammerTargetX = normX;
      this.hammerTargetY = normY;
      this.hammerSwingAngle = -0.65;
      this.hammerOpacity = 1.0;
    }

    // 3. Ударная волна (Shockwave)
    this.shockwaves.push({
      x: normX,
      y: normY,
      radius: 8,
      maxRadius: isCrit ? 115 : 68,
      alpha: 0.85,
      isCrit,
    });

    // 4. Частицы
    const particleCount = isCrit ? 14 : 6;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const speed = (isCrit ? 2.6 : 1.5) + Math.random() * 2.0;
      this.particles.push({
        x: normX,
        y: normY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        size: isCrit ? 4.5 : 3,
        alpha: 1,
        color: isCrit ? '#F59E0B' : '#10B981',
      });
    }

    // 5. Всплывающая цифра
    if (this.floatingTexts.length > 24) {
      this.floatingTexts.shift();
    }
    this.floatingTexts.push({
      id: this.nextId++,
      x: normX + (Math.random() - 0.5) * 0.08,
      y: normY - 0.03,
      vy: isCrit ? -0.0042 : -0.0032,
      text: `+${formatLooks(amount)}`,
      subtext: isCrit ? 'БОНСМЭШ КРИТ!' : undefined,
      isCrit,
      alpha: 1.0,
      scale: isCrit ? 1.25 : 1.0,
    });
  }

  private drawSingleRankPortrait(
    ctx: CanvasRenderingContext2D,
    targetRank: PSLRankDefinition,
    targetBoxSize: number,
    showOriginalCaption: boolean
  ): { drawW: number; drawH: number } {
    if (this.isLoaded && this.atlasImage) {
      const uv = showOriginalCaption ? targetRank.cropWithLabelUV : targetRank.cropUV;
      const sx = uv.x * this.atlasImage.naturalWidth;
      const sy = uv.y * this.atlasImage.naturalHeight;
      const sw = uv.w * this.atlasImage.naturalWidth;
      const sh = uv.h * this.atlasImage.naturalHeight;

      const aspect = sw / sh;
      let drawW = targetBoxSize;
      let drawH = targetBoxSize / aspect;
      if (drawH > targetBoxSize) {
        drawH = targetBoxSize;
        drawW = targetBoxSize * aspect;
      }

      ctx.drawImage(
        this.atlasImage,
        sx,
        sy,
        sw,
        sh,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );
      return { drawW, drawH };
    }

    this.drawFallbackSilhouette(ctx, targetBoxSize, targetRank);
    return { drawW: targetBoxSize, drawH: targetBoxSize };
  }

  private drawMoggedEyeBarOverlay(
    ctx: CanvasRenderingContext2D,
    oldRank: PSLRankDefinition,
    drawW: number,
    drawH: number,
    showOriginalCaption: boolean,
    elapsedMs: number,
    alpha: number
  ): void {
    // Точная калибровка координат глаз для каждого из 8 персонажей относительно их cropUV
    const EYE_CALIBRATION: Array<{
      ex: number;
      ey: number;
      bw: number;
      bh: number;
    }> = [
      // 0: Sub 3
      { ex: 0.012, ey: 0.014, bw: 0.54, bh: 0.105 },
      // 1: Sub 5
      { ex: 0.022, ey: 0.030, bw: 0.50, bh: 0.105 },
      // 2: LTN
      { ex: 0.005, ey: 0.028, bw: 0.50, bh: 0.105 },
      // 3: MTN
      { ex: -0.015, ey: 0.010, bw: 0.50, bh: 0.10 },
      // 4: HTN
      { ex: 0.005, ey: -0.015, bw: 0.50, bh: 0.10 },
      // 5: Chadlite
      { ex: 0.018, ey: -0.020, bw: 0.50, bh: 0.10 },
      // 6: Chad
      { ex: 0.004, ey: -0.022, bw: 0.48, bh: 0.10 },
      // 7: True Adam
      { ex: 0.005, ey: -0.025, bw: 0.44, bh: 0.10 },
    ];

    const cal = EYE_CALIBRATION[oldRank.index] || EYE_CALIBRATION[0];
    const baseUV = oldRank.cropUV;
    const activeUV = showOriginalCaption ? oldRank.cropWithLabelUV : oldRank.cropUV;

    // Абсолютная точка центра глаз и размер плашки в UV-пространстве всего атласа
    const eyeAtlasU = baseUV.x + baseUV.w * (0.5 + cal.ex);
    const eyeAtlasV = baseUV.y + baseUV.h * (0.5 + cal.ey);
    const barAtlasW = baseUV.w * cal.bw;
    const barAtlasH = baseUV.h * cal.bh;

    // Перевод из UV атласа в локальные пиксели отрисованного портрета (-drawW/2 .. +drawW/2)
    const eyeX = ((eyeAtlasU - (activeUV.x + activeUV.w * 0.5)) / activeUV.w) * drawW;
    const eyeY = ((eyeAtlasV - (activeUV.y + activeUV.h * 0.5)) / activeUV.h) * drawH;
    const barW = (barAtlasW / activeUV.w) * drawW;
    const barH = (barAtlasH / activeUV.h) * drawH;

    // Эффект мощного штампа на глаза в первые 150мс
    const slamProgress = Math.min(1, elapsedMs / 150);
    const easeOutBack = 1 - Math.pow(1 - slamProgress, 3);
    const barScale = 1.85 - 0.85 * easeOutBack;
    const tiltRad = -0.018 + (1 - slamProgress) * 0.06;

    ctx.save();
    ctx.translate(eyeX, eyeY);
    ctx.rotate(tiltRad);
    ctx.scale(barScale, barScale);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.shadowColor = 'rgba(0, 0, 0, 0.78)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    if (this.isMoggedBarLoaded && this.moggedBarImage) {
      ctx.drawImage(this.moggedBarImage, -barW / 2, -barH / 2, barW, barH);
    } else {
      // Мгновенный векторный фоллбэк, если SVG еще декодируется
      ctx.fillStyle = '#070709';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-barW / 2, -barH / 2, barW, barH);
      ctx.strokeRect(-barW / 2, -barH / 2, barW, barH);

      const fontSize = Math.max(14, Math.round(barH * 0.62));
      ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#DC2626';
      ctx.fillText('MOGGED', 2, 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('MOGGED', 0, 0);
    }

    ctx.restore();
  }

  /**
   * Основной метод отрисовки кадра (60 FPS) на HTML5 Canvas.
   */
  public renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    options: {
      rank: PSLRankDefinition;
      showOriginalCaption: boolean;
      mewingCombo: number; // 0..100
      generation: number;
      perkLevels: Record<string, number>;
      rewardedBoostActive: boolean;
    }
  ): void {
    const {
      rank,
      showOriginalCaption,
      mewingCombo,
    } = options;

    // Автоматический перехват повышения уровня для показа плашки MOGGED на старом персонаже
    if (this.lastRenderedRank && rank.index > this.lastRenderedRank.index) {
      if (
        !this.moggedTransition ||
        this.moggedTransition.newRank.index !== rank.index
      ) {
        this.triggerMoggedTransition(this.lastRenderedRank, rank);
      }
    }
    this.lastRenderedRank = rank;

    const animProfile =
      STAGE_ANIMATION_PROFILES[rank.index] || STAGE_ANIMATION_PROFILES[0];

    // Зацикленная анимация активна ТОЛЬКО пока удерживается бонус от нажатия (mewingCombo > 0).
    // Когда бонус от нажатия полностью исчезает (mewingCombo <= 0), цикл плавно останавливается в 0.
    const isClickBonusHeld = mewingCombo > 0.1;
    if (isClickBonusHeld) {
      const targetAmp = Math.min(1, 0.42 + (mewingCombo / 100) * 0.58);
      this.loopAmplitude += (targetAmp - this.loopAmplitude) * 0.18;
      const speedBoost = 0.85 + (mewingCombo / 100) * 0.65;
      this.loopPhase = (this.loopPhase + animProfile.cycleSpeed * speedBoost) % (Math.PI * 200);
    } else {
      this.loopAmplitude *= 0.78;
      if (this.loopAmplitude < 0.004) {
        this.loopAmplitude = 0;
      }
    }

    // Плавная релаксация пружины и эффектов
    this.scalePulse += (1.0 - this.scalePulse) * 0.22;
    this.shakeOffsetX *= 0.75;
    this.shakeOffsetY *= 0.75;
    this.hammerSwingAngle += (0.15 - this.hammerSwingAngle) * 0.28;
    this.hammerOpacity = Math.max(0, this.hammerOpacity - 0.055);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, width, height);

    // 1. Чистый бумажно-белый фон пьедестала (#FFFFFF), чтобы ч/б скетч из референса выглядел бесшовно
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 2. Отрисовка HD-портрета (или сцены перехода MOGGED со старым персонажем и плашкой на глазах)
    const centerX = width / 2 + this.shakeOffsetX;
    const centerY = height / 2 + this.shakeOffsetY;
    const targetBoxSize = Math.min(width, height) * 0.84;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(this.scalePulse, this.scalePulse);

    if (this.moggedTransition) {
      const now = performance.now();
      const elapsed = now - this.moggedTransition.startTimeMs;
      const total = this.moggedTransition.durationMs;

      if (elapsed >= total) {
        this.moggedTransition = null;
        this.drawSingleRankPortrait(ctx, rank, targetBoxSize, showOriginalCaption);
      } else {
        // Первые 76% времени (~1.65с): держим старого персонажа с плашкой MOGGED на глазах
        // Последние 24% времени (~0.5с): старый персонаж и плашка исчезают, появляется новый персонаж
        const holdEndMs = total * 0.76;

        if (elapsed <= holdEndMs) {
          const { drawW, drawH } = this.drawSingleRankPortrait(
            ctx,
            this.moggedTransition.oldRank,
            targetBoxSize,
            showOriginalCaption
          );
          this.drawMoggedEyeBarOverlay(
            ctx,
            this.moggedTransition.oldRank,
            drawW,
            drawH,
            showOriginalCaption,
            elapsed,
            1.0
          );
        } else {
          const fadeT = Math.min(1, (elapsed - holdEndMs) / (total - holdEndMs));
          const oldAlpha = 1 - fadeT;
          const newAlpha = fadeT;

          // Старый персонаж + плашка MOGGED растворяются
          ctx.save();
          ctx.globalAlpha = oldAlpha;
          const oldScale = 1 - fadeT * 0.06;
          ctx.scale(oldScale, oldScale);
          const { drawW, drawH } = this.drawSingleRankPortrait(
            ctx,
            this.moggedTransition.oldRank,
            targetBoxSize,
            showOriginalCaption
          );
          this.drawMoggedEyeBarOverlay(
            ctx,
            this.moggedTransition.oldRank,
            drawW,
            drawH,
            showOriginalCaption,
            elapsed,
            oldAlpha
          );
          ctx.restore();

          // Новый персонаж проявляется на его месте
          ctx.save();
          ctx.globalAlpha = newAlpha;
          const newScale = 1.07 - fadeT * 0.07;
          ctx.scale(newScale, newScale);
          this.drawSingleRankPortrait(
            ctx,
            this.moggedTransition.newRank,
            targetBoxSize,
            showOriginalCaption
          );
          ctx.restore();
        }
      }
    } else {
      this.drawSingleRankPortrait(ctx, rank, targetBoxSize, showOriginalCaption);
    }

    ctx.restore();

    // 6. Отрисовка ударных волн (Shockwaves)
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const wave = this.shockwaves[i];
      wave.radius += (wave.maxRadius - wave.radius) * 0.22;
      wave.alpha -= 0.055;

      if (wave.alpha <= 0.02) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(wave.x * width, wave.y * height, wave.radius, 0, Math.PI * 2);
      ctx.strokeStyle = wave.isCrit
        ? `rgba(245, 158, 11, ${wave.alpha})`
        : `rgba(16, 185, 129, ${wave.alpha})`;
      ctx.lineWidth = wave.isCrit ? 3 : 2;
      ctx.stroke();
      ctx.restore();
    }

    // 7. Отрисовка ортопедического молоточка при ударе
    if (this.hammerOpacity > 0.02) {
      this.drawHammerGraphic(
        ctx,
        this.hammerTargetX * width,
        this.hammerTargetY * height,
        this.hammerSwingAngle,
        this.hammerOpacity
      );
    }

    // 8. Отрисовка частиц
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx / width;
      p.y += p.vy / height;
      p.vy += 0.12;
      p.alpha -= 0.04;

      if (p.alpha <= 0.02) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 9. Отрисовка всплывающих цифр (+PSL и БОНСМЭШ КРИТ!)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.024;

      if (ft.alpha <= 0.02) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      const px = ft.x * width;
      const py = ft.y * height;

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';

      if (ft.subtext) {
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#B45309';
        ctx.fillText(ft.subtext, px, py - 18);
      }

      ctx.font = ft.isCrit
        ? '700 20px "JetBrains Mono", monospace'
        : '700 15px "JetBrains Mono", monospace';

      // Контрастная подложка под цифры на белом фоне портрета
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeText(ft.text, px, py);

      ctx.fillStyle = ft.isCrit ? '#D97706' : '#059669';
      ctx.fillText(ft.text, px, py);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawAnthropometricGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    rankIndex: number,
    perkLevels: Record<string, number>
  ): void {
    ctx.save();
    ctx.strokeStyle = rankIndex >= 5 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(15, 23, 42, 0.06)';
    ctx.lineWidth = 1;

    // Вертикальная ось симметрии лица
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(width / 2, 12);
    ctx.lineTo(width / 2, height - 12);

    // Линии лицевых третей (верхняя, средняя, нижняя треть)
    const thirds = [0.28, 0.5, 0.72];
    for (const t of thirds) {
      ctx.moveTo(16, height * t);
      ctx.lineTo(width - 16, height * t);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Угловые калибровочные засечки антропометрии
    const corner = 14;
    const pad = 10;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(pad, pad + corner);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + corner, pad);
    // Top-right
    ctx.moveTo(width - pad - corner, pad);
    ctx.lineTo(width - pad, pad);
    ctx.lineTo(width - pad, pad + corner);
    // Bottom-left
    ctx.moveTo(pad, height - pad - corner);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(pad + corner, height - pad);
    // Bottom-right
    ctx.moveTo(width - pad - corner, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad, height - pad - corner);
    ctx.stroke();

    // Подпись коэффициента золотого сечения при прокачке ДНК
    const totalPerkLevels = Object.values(perkLevels).reduce((a, b) => a + b, 0);
    if (totalPerkLevels > 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      const phi = (1.52 + Math.min(0.098, totalPerkLevels * 0.003)).toFixed(3);
      ctx.fillText(`PHI RATIO: 1:${phi}`, 18, 24);
    }

    ctx.restore();
  }

  private drawGeneticTraitOverlays(
    ctx: CanvasRenderingContext2D,
    boxSize: number,
    perkLevels: Record<string, number>,
    generation: number
  ): void {
    const gonialLvl = perkLevels['gonial_angle'] || 0;
    const hunterLvl = perkLevels['hunter_eyes'] || 0;

    ctx.save();
    // Векторные антропометрические маркеры угла челюсти 120°, если прокачан перк
    if (gonialLvl > 0) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.lineWidth = 1.5;
      const jawY = boxSize * 0.18;
      const chinY = boxSize * 0.34;
      const jawW = boxSize * 0.25;

      ctx.beginPath();
      ctx.moveTo(-jawW, jawY - 14);
      ctx.lineTo(-jawW * 0.88, jawY + 8);
      ctx.lineTo(0, chinY);
      ctx.lineTo(jawW * 0.88, jawY + 8);
      ctx.lineTo(jawW, jawY - 14);
      ctx.stroke();
    }

    // Линия кантального наклона (Hunter Eyes)
    if (hunterLvl > 0) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.5;
      const eyeY = -boxSize * 0.035;
      const eyeInnerX = boxSize * 0.055;
      const eyeOuterX = boxSize * 0.19;

      ctx.beginPath();
      ctx.moveTo(-eyeOuterX, eyeY - 4);
      ctx.lineTo(-eyeInnerX, eyeY + 2);
      ctx.moveTo(eyeInnerX, eyeY + 2);
      ctx.lineTo(eyeOuterX, eyeY - 4);
      ctx.stroke();
    }

    // Золотой ореол Династии для Поколения II+
    if (generation > 1) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, boxSize * 0.46, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHammerGraphic(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    opacity: number
  ): void {
    ctx.save();
    ctx.translate(x + 26, y + 18);
    ctx.rotate(angle);
    ctx.globalAlpha = opacity;

    // Рукоятка ортопедического молотка
    ctx.fillStyle = '#334155';
    ctx.fillRect(-3, -34, 6, 40);

    // Боёк молотка
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-16, -42, 32, 12);

    // Золотая ударная накладка
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-18, -41, 4, 10);
    ctx.fillRect(14, -41, 4, 10);

    ctx.restore();
  }

  /**
   * Отрисовывает HD-портрет с 32-полосной биомеханической зацикленной анимацией
   * (при удержании бонуса от нажатия) и деликатной реалистичной светотенью.
   */
  private drawEnhancedAnimatedPortrait(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    drawW: number,
    drawH: number,
    rankIndex: number,
    profile: StageAnimationProfile
  ): void {
    const amp = this.loopAmplitude;
    const phase = this.loopPhase;

    // Если бонус от нажатия полностью исчез (amp === 0), рисуем статичный HD-кадр без деформации
    if (amp <= 0.005) {
      ctx.drawImage(img, sx, sy, sw, sh, -drawW / 2, -drawH / 2, drawW, drawH);
      this.drawSubtleRealismOverlay(ctx, drawW, drawH, rankIndex, profile, 0, 0);
      return;
    }

    // При активном бонусе от нажатия рендерим 36 горизонтальных анатомических микро-полос
    // для органичной зацикленной анимации волос, прищура глаз, скул, жевательных мышц (мьюинга) и дыхания шеи
    const slices = 36;
    const sliceSrcH = sh / slices;
    const sliceDstH = drawH / slices;

    // Фаза сжатия челюсти (мьюинг-импульс) и прищура взгляда
    const jawClenchWave = Math.max(0, Math.sin(phase * 1.35));
    const breathWave = Math.sin(phase * 0.85);

    for (let i = 0; i < slices; i++) {
      const normY = i / slices; // 0 (макушка) .. 1 (шея/ключицы)
      let offsetX = 0;
      let offsetY = 0;
      let scaleX = 1.0;
      let scaleY = 1.0;

      // 1. Зона волос и макушки (0.00 .. 0.36): плавное колыхание прядей
      if (normY < 0.36) {
        const hairFactor = 1 - normY / 0.36;
        offsetX +=
          Math.sin(phase * 1.15 + normY * 7.5) *
          profile.hairSwayAmp *
          hairFactor *
          amp;
      }

      // 2. Зона бровей и глаз (0.34 .. 0.52): сфокусированный прищур (Hunter Eyes) и микро-трекинг
      if (normY >= 0.34 && normY <= 0.52) {
        const eyeBell = Math.sin(((normY - 0.34) / 0.18) * Math.PI);
        const squintPulse = (0.5 + 0.5 * Math.sin(phase * 1.35 - 0.3)) * profile.eyeSquintAmp * amp;
        scaleY *= 1 - eyeBell * squintPulse * 0.14;
        offsetY += eyeBell * squintPulse * 1.4;
      }

      // 3. Зона скул и средней трети (0.50 .. 0.64): вакуумное втягивание щек (Hollow Cheeks)
      if (normY > 0.5 && normY <= 0.64) {
        const cheekBell = Math.sin(((normY - 0.5) / 0.14) * Math.PI);
        scaleX *= 1 - cheekBell * jawClenchWave * profile.jawClenchAmp * 0.55 * amp;
      }

      // 4. Нижняя треть: челюсть, массетеры и подбородок (0.62 .. 0.82) — ритмичное сжатие мьюинга
      if (normY > 0.62 && normY <= 0.82) {
        const jawBell = Math.sin(((normY - 0.62) / 0.2) * Math.PI);
        // Расширение жевательных мышц (массетеров) при сжатии + подтяжка нижней трети вверх
        scaleX *= 1 + jawBell * jawClenchWave * profile.jawClenchAmp * 1.35 * amp;
        offsetY -= jawBell * jawClenchWave * 3.4 * amp;
      }

      // 5. Зона шеи и плеч (0.80 .. 1.00): глубокое дыхание и осанка
      if (normY > 0.8) {
        const neckFactor = (normY - 0.8) / 0.2;
        scaleX *= 1 + neckFactor * breathWave * profile.breathAmp * 1.2 * amp;
        offsetY += neckFactor * breathWave * 2.2 * amp;
      }

      // Для True Adam (ранг 7) длинные пряди по бокам шеи также плавно развеваются
      if (rankIndex === 7 && normY > 0.55) {
        offsetX += Math.sin(phase * 1.25 + normY * 9.0) * 2.8 * amp;
      }

      const curSy = sy + i * sliceSrcH;
      const curDy = -drawH / 2 + i * sliceDstH + offsetY;
      const curDw = drawW * scaleX;
      // Небольшой нахлест 0.9px исключает появление микро-швов между полосами при трансформации
      const curDh = sliceDstH * scaleY + 0.9;

      ctx.drawImage(
        img,
        sx,
        curSy,
        sw,
        sliceSrcH,
        -curDw / 2 + offsetX,
        curDy,
        curDw,
        curDh
      );
    }

    // Поверх отрисованного портрета накладываем деликатный слой реалистичного объема и живых бликов глаз
    this.drawSubtleRealismOverlay(ctx, drawW, drawH, rankIndex, profile, phase, amp);
  }

  /**
   * Добавляет портрету легкий реалистичный 3D-объем (светотень скул, переносицы, глазниц и живые блики в зрачках),
   * полностью сохраняя оригинальную черно-белую рисовку.
   */
  private drawSubtleRealismOverlay(
    ctx: CanvasRenderingContext2D,
    drawW: number,
    drawH: number,
    rankIndex: number,
    profile: StageAnimationProfile,
    phase: number,
    amp: number
  ): void {
    ctx.save();

    const lightShiftX = Math.sin(phase) * drawW * 0.035 * amp;
    const clenchIntensity = amp > 0 ? 0.5 + 0.5 * Math.sin(phase * 1.35) : 0;
    const baseAlpha = profile.realismShadeAlpha * (1 + clenchIntensity * 0.28 * amp);

    // 1. Мягкое объемное затенение скуловых впадин (Subsurface / Graphite Cheek Contour)
    const cheekY = drawH * 0.08;
    const cheekOffsetX = drawW * 0.165;
    const cheekRadius = drawW * 0.14;

    for (const side of [-1, 1]) {
      const cx = side * cheekOffsetX + lightShiftX * 0.4;
      const grad = ctx.createRadialGradient(cx, cheekY, 2, cx, cheekY, cheekRadius);
      grad.addColorStop(0, `rgba(15, 23, 42, ${(baseAlpha * 0.62).toFixed(3)})`);
      grad.addColorStop(0.55, `rgba(30, 41, 59, ${(baseAlpha * 0.28).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cheekY, cheekRadius * 0.78, cheekRadius * 1.05, side * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Реалистичный объем переносицы и надбровной дуги (мягкий студийный блик + тень глазниц)
    const noseBridgeGrad = ctx.createLinearGradient(
      lightShiftX - drawW * 0.04,
      -drawH * 0.12,
      lightShiftX + drawW * 0.04,
      drawH * 0.06
    );
    noseBridgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    noseBridgeGrad.addColorStop(0.5, `rgba(255, 255, 255, ${(0.22 + amp * 0.12).toFixed(3)})`);
    noseBridgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = noseBridgeGrad;
    ctx.fillRect(-drawW * 0.035, -drawH * 0.12, drawW * 0.07, drawH * 0.18);

    // 3. Тень под нижней губой и подбородком для ощущения скульптурной челюсти
    const chinY = drawH * 0.23 - clenchIntensity * 2.2 * amp;
    const chinGrad = ctx.createRadialGradient(0, chinY, 1, 0, chinY, drawW * 0.11);
    chinGrad.addColorStop(0, `rgba(15, 23, 42, ${(baseAlpha * 0.55).toFixed(3)})`);
    chinGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = chinGrad;
    ctx.beginPath();
    ctx.ellipse(0, chinY, drawW * 0.095, drawH * 0.042, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Живые реалистичные блики в глазах (Catchlights) и периодическое естественное моргание при активном цикле
    const eyeY = drawH * profile.eyeLineY;
    const eyeX = drawW * profile.eyeSpanX;
    const blinkCycle = amp > 0 ? Math.sin(phase * 0.65 + 1.1) : 0;
    const isBlinking = amp > 0 && blinkCycle > 0.965;

    for (const side of [-1, 1]) {
      const ex = side * eyeX + lightShiftX * 0.25;
      if (isBlinking) {
        // Короткое естественное прикрытие века в цикле
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, drawW * 0.042, drawH * 0.008, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Двойной реалистичный студийный блик на роговице глаза
        const glintAlpha = 0.72 + Math.sin(phase * 2.2) * 0.18 * amp;
        ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(ex - 2.2 + lightShiftX * 0.15, eyeY - 1.8, Math.max(1.6, drawW * 0.0075), 0, Math.PI * 2);
        ctx.fill();

        // Для высоких рангов (HTN .. True Adam) добавляем тонкий холодный отблеск Hunter Eyes во время комбо
        if (rankIndex >= 4 && amp > 0.05) {
          ctx.fillStyle =
            rankIndex === 7
              ? `rgba(251, 191, 36, ${(0.38 * amp).toFixed(2)})`
              : `rgba(56, 189, 248, ${(0.32 * amp).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(ex + 1.8, eyeY + 1.2, Math.max(1.2, drawW * 0.0055), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  private drawFallbackSilhouette(
    ctx: CanvasRenderingContext2D,
    size: number,
    rank: PSLRankDefinition
  ): void {
    ctx.save();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -size * 0.05, size * 0.26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 18px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rank.title, 0, size * 0.35);
    ctx.restore();
  }
}

/**
 * Отрисовывает миниатюру любого из 8 рангов PSL на переданном Canvas-элементе
 * (используется в Галерее Эволюции и модальном окне повышения ранга).
 */
export function drawRankThumbnailOnCanvas(
  canvas: HTMLCanvasElement | null,
  atlasImg: HTMLImageElement | null,
  rankIndex: number,
  includeOriginalLabel = false
): void {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rank = PSL_RANKS[rankIndex] || PSL_RANKS[0];
  const w = canvas.width;
  const h = canvas.height;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  if (!atlasImg) {
    ctx.restore();
    return;
  }

  const uv = includeOriginalLabel ? rank.cropWithLabelUV : rank.cropUV;
  const sx = uv.x * atlasImg.naturalWidth;
  const sy = uv.y * atlasImg.naturalHeight;
  const sw = uv.w * atlasImg.naturalWidth;
  const sh = uv.h * atlasImg.naturalHeight;

  const pad = 4;
  const availW = w - pad * 2;
  const availH = h - pad * 2;
  const aspect = sw / sh;

  let drawW = availW;
  let drawH = availW / aspect;
  if (drawH > availH) {
    drawH = availH;
    drawW = availH * aspect;
  }

  const dx = (w - drawW) / 2;
  const dy = (h - drawH) / 2;

  ctx.drawImage(atlasImg, sx, sy, sw, sh, dx, dy, drawW, drawH);

  // Деликатная светотень скул на миниатюре для единства улучшенного стиля
  const shadeAlpha = 0.08 + rankIndex * 0.012;
  const grad = ctx.createRadialGradient(
    w / 2,
    dy + drawH * 0.54,
    drawW * 0.06,
    w / 2,
    dy + drawH * 0.54,
    drawW * 0.38
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.75, `rgba(15, 23, 42, ${shadeAlpha.toFixed(3)})`);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(dx, dy, drawW, drawH);

  ctx.restore();
}
