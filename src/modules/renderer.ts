/**
 * Модуль рендеринга спрайтов (PSLSpriteRenderer):
 * - Загружает референсный атлас /assets/aistudio/image_998de055.png (8 стадий: sub 3 .. true adam)
 * - Вырезает нужный квадрант портрета с поддержкой Retina / High-DPI Canvas
 * - Отрисовывает антропометрическую сетку, ударные волны от Молотка (бонсмэшинга),
 *   частицы и всплывающие цифры (+Looks / КРИТ МОЛОТКОМ!)
 */

import { PSL_RANKS, PSLRankDefinition } from './mechanics';
import { formatLooks } from './utils';

export const PSL_ATLAS_URL = '/assets/aistudio/image_998de055.png';

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

export class PSLSpriteRenderer {
  private atlasImage: HTMLImageElement | null = null;
  private isLoaded = false;
  private hasError = false;

  // Анимационные состояния сцены
  private scalePulse = 1.0;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;
  private hammerSwingAngle = 0;
  private hammerOpacity = 0;
  private hammerTargetX = 0;
  private hammerTargetY = 0;

  private floatingTexts: FloatingFeedbackText[] = [];
  private shockwaves: ShockwaveRing[] = [];
  private particles: SparkParticle[] = [];
  private nextId = 1;

  constructor(onAtlasReady?: () => void) {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = PSL_ATLAS_URL;
      img.onload = () => {
        this.atlasImage = img;
        this.isLoaded = true;
        onAtlasReady?.();
      };
      img.onerror = () => {
        this.hasError = true;
        onAtlasReady?.();
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
      generation,
      perkLevels,
      rewardedBoostActive,
    } = options;

    // Плавная релаксация пружины и эффектов
    this.scalePulse += (1.0 - this.scalePulse) * 0.22;
    this.shakeOffsetX *= 0.75;
    this.shakeOffsetY *= 0.75;
    this.hammerSwingAngle += (0.15 - this.hammerSwingAngle) * 0.28;
    this.hammerOpacity = Math.max(0, this.hammerOpacity - 0.055);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Чистый бумажно-белый фон пьедестала (#FFFFFF), чтобы ч/б скетч из референса выглядел бесшовно
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 2. Тонкая антропометрическая разметка золотого сечения на фоне
    this.drawAnthropometricGrid(ctx, width, height, rank.index, perkLevels);

    // 3. Отрисовка вырезанного спрайта из референс-атласа /assets/aistudio/image_998de055.png
    const centerX = width / 2 + this.shakeOffsetX;
    const centerY = height / 2 + this.shakeOffsetY;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(this.scalePulse, this.scalePulse);

    const targetBoxSize = Math.min(width, height) * 0.84;

    if (this.isLoaded && this.atlasImage) {
      const uv = showOriginalCaption ? rank.cropWithLabelUV : rank.cropUV;
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
    } else {
      // Фоллбэк-силуэт на время загрузки текстуры
      this.drawFallbackSilhouette(ctx, targetBoxSize, rank);
    }

    // 4. Визуальные маркеры открытых наследственных перков ДНК (Hunter Eyes / Угол челюсти 120°)
    this.drawGeneticTraitOverlays(ctx, targetBoxSize, perkLevels, generation);

    ctx.restore();

    // 5. Индикатор комбо-ритма мьюинга по периметру рамки
    if (mewingCombo > 5 || rewardedBoostActive) {
      ctx.save();
      ctx.strokeStyle = rewardedBoostActive ? 'rgba(245, 158, 11, 0.55)' : 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, width - 4, height - 4);
      ctx.restore();
    }

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

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  if (!atlasImg) return;

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

  ctx.drawImage(
    atlasImg,
    sx,
    sy,
    sw,
    sh,
    (w - drawW) / 2,
    (h - drawH) / 2,
    drawW,
    drawH
  );
}
