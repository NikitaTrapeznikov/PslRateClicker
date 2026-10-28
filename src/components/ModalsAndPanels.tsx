import React, { useEffect, useRef, useState } from 'react';
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
 * Точная студийная вырезка полной фотографии статуи с сохранением 100% родных рук, венозности, ног, пресса и лица,
 * а также выравниванием цветокоррекции обеих статуй под единый кинематографичный мрамор Олимпа.
 */
function preparePhotorealisticStatueCanvas(
  img: HTMLImageElement,
  mode: 'apollo_left' | 'zeus_right'
): HTMLCanvasElement {
  const w = 560;
  const h = Math.round((img.naturalHeight / Math.max(1, img.naturalWidth)) * w);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const getLum = (idx: number) =>
    data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

  // Точный анатомический коридор силуэта по высоте (ny от 0 до 1) для отсечения студийного/архитектурного фона
  const getSilhouetteBounds = (ny: number): [number, number] => {
    if (mode === 'apollo_left') {
      if (ny < 0.03) return [0.35, 0.56];
      if (ny < 0.19) return [0.29, 0.59]; // Голова с кудрями
      if (ny < 0.23) return [0.27, 0.68]; // Шея и плечевые накладки хитона
      if (ny < 0.36) return [0.14, 0.80]; // Дельты и грудь
      if (ny < 0.56) return [0.10, 0.84]; // Бицепсы, предплечья и талия
      if (ny < 0.75) return [0.08, 0.90]; // Кисти рук и драпировка на бедрах
      return [0.20, 0.92]; // Мощные квадрицепсы и ноги
    } else {
      if (ny < 0.04) return [0.30, 0.58];
      if (ny < 0.26) return [0.26, 0.63]; // Голова и кудрявая борода
      if (ny < 0.38) return [0.14, 0.86]; // Трапеции и огромные дельты
      if (ny < 0.65) return [0.02, 0.95]; // Широко расставленные руки и торс
      return [0.02, 0.84]; // Нижняя драпировка и бедра
    }
  };

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    const [minNx, maxNx] = getSilhouetteBounds(ny);
    const leftBound = Math.floor(minNx * w);
    const rightBound = Math.ceil(maxNx * w);

    // Очищаем всё за пределами анатомического контура
    for (let x = 0; x < leftBound; x++) {
      data[(y * w + x) * 4 + 3] = 0;
    }
    for (let x = rightBound; x < w; x++) {
      data[(y * w + x) * 4 + 3] = 0;
    }

    // Сканируем снаружи внутрь до реального края мраморного тела
    const borderLum = mode === 'apollo_left' ? 76 : 40;
    let lEdge = leftBound;
    while (lEdge < rightBound) {
      const idx = (y * w + lEdge) * 4;
      if (getLum(idx) > borderLum) break;
      data[idx + 3] = 0;
      lEdge++;
    }
    // Мягкое сглаживание внешнего края (6 пикселей антиалиасинга)
    for (let f = 0; f < 6 && lEdge + f < rightBound; f++) {
      const idx = (y * w + lEdge + f) * 4;
      data[idx + 3] = Math.round(data[idx + 3] * ((f + 1) / 6));
    }

    let rEdge = rightBound - 1;
    while (rEdge > lEdge) {
      const idx = (y * w + rEdge) * 4;
      if (getLum(idx) > borderLum) break;
      data[idx + 3] = 0;
      rEdge--;
    }
    for (let f = 0; f < 6 && rEdge - f > lEdge; f++) {
      const idx = (y * w + rEdge - f) * 4;
      data[idx + 3] = Math.round(data[idx + 3] * ((f + 1) / 6));
    }

    // Убираем темный фон в просветах между руками и талией, сохраняя сами руки и торс 100% непрозрачными
    if (ny > 0.38 && ny < 0.74) {
      for (let x = lEdge + 5; x < rEdge - 5; x++) {
        const nx = x / w;
        const inGapZone =
          mode === 'zeus_right'
            ? (nx > 0.13 && nx < 0.30) || (nx > 0.67 && nx < 0.84)
            : (nx > 0.16 && nx < 0.24) || (nx > 0.65 && nx < 0.76);
        if (inGapZone) {
          const idx = (y * w + x) * 4;
          const lum = getLum(idx);
          const gapCut = mode === 'apollo_left' ? 46 : 34;
          if (lum < gapCut) {
            data[idx + 3] = 0;
          } else if (lum < gapCut + 22) {
            data[idx + 3] = Math.round(((lum - gapCut) / 22) * 255);
          }
        }
      }
    }

    // Кинематографичная цветокоррекция: придаем черно-белому Аполлону благородный теплый оттенок слоновой кости,
    // чтобы обе статуи выглядели как единая сцена в одном освещении Олимпа
    if (mode === 'apollo_left') {
      for (let x = lEdge; x <= rEdge; x++) {
        const idx = (y * w + x) * 4;
        if (data[idx + 3] > 0) {
          const lum = data[idx];
          data[idx] = Math.min(255, Math.round(lum * 1.04)); // теплый светлый мрамор R
          data[idx + 1] = Math.min(255, Math.round(lum * 0.98)); // G
          data[idx + 2] = Math.min(255, Math.round(lum * 0.90)); // B
        }
      }
    }

    // Плавное растворение самого низа у края кадра (последние 6%)
    if (ny > 0.94) {
      const fade = Math.max(0, 1 - (ny - 0.94) / 0.06);
      for (let x = lEdge; x <= rEdge; x++) {
        const idx = (y * w + x) * 4;
        data[idx + 3] = Math.round(data[idx + 3] * fade);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Отрисовка текстурированного треугольника (2D UV Mesh / After Effects Puppet Pin Warp)
 * Позволяет плавно сгибать и двигать реальные руки, ноги, торс и голову фотографии БЕЗ рисования мультяшных фигур!
 */
function drawUvTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  u2: number,
  v2: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  // Вычисляем барицентрическую аффинную матрицу перехода из (u,v) фотографии в экранные (x,y)
  const du1 = u1 - u0;
  const dv1 = v1 - v0;
  const du2 = u2 - u0;
  const dv2 = v2 - v0;

  const det = du1 * dv2 - du2 * dv1;
  if (Math.abs(det) < 1e-5) return;
  const invDet = 1 / det;

  const dx1 = x1 - x0;
  const dy1 = y1 - y0;
  const dx2 = x2 - x0;
  const dy2 = y2 - y0;

  const a = (dx1 * dv2 - dx2 * dv1) * invDet;
  const b = (dy1 * dv2 - dy2 * dv1) * invDet;
  const c = (du1 * dx2 - du2 * dx1) * invDet;
  const d = (du1 * dy2 - du2 * dy1) * invDet;
  const e = x0 - a * u0 - c * v0;
  const f = y0 - b * u0 - d * v0;

  // Слегка расширяем треугольник от его центра на 0.45px, чтобы между полигонами сетки не было микро-щелей
  const cx = (x0 + x1 + x2) / 3;
  const cy = (y0 + y1 + y2) / 3;
  const expand = (px: number, py: number): [number, number] => {
    const vx = px - cx;
    const vy = py - cy;
    const len = Math.hypot(vx, vy) || 1;
    return [px + (vx / len) * 0.55, py + (vy / len) * 0.55];
  };
  const [ex0, ey0] = expand(x0, y0);
  const [ex1, ey1] = expand(x1, y1);
  const [ex2, ey2] = expand(x2, y2);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ex0, ey0);
  ctx.lineTo(ex1, ey1);
  ctx.lineTo(ex2, ey2);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/**
 * Параметры живого Puppet-Pin управления реальной фотографией статуи
 */
interface PuppetPinPose {
  baseX: number;
  baseY: number;
  targetHeight: number;
  // Смещения анатомических зон фотографии (в пикселях экрана)
  bodyLungeX: number;
  bodyBobY: number;
  headOffsetX: number;
  headOffsetY: number;
  chestTwistX: number;
  chestBreathScale: number;
  // Движение родной передней (ударной) руки фотографии
  leadArmHandX: number;
  leadArmHandY: number;
  leadArmElbowX: number;
  leadArmElbowY: number;
  // Движение родной задней руки фотографии
  rearArmHandX: number;
  rearArmHandY: number;
  // Движение родных ног фотографии (шаг вперед/назад, подъем бедра/колена)
  leadLegStepX: number;
  leadLegLiftY: number;
  rearLegStepX: number;
  rearLegLiftY: number;
  // Визуальный импульс при попадании
  impactFlash: number;
  isApolloLeft: boolean;
}

function drawPuppetWarpedStatue(
  ctx: CanvasRenderingContext2D,
  statueCanvas: HTMLCanvasElement,
  pose: PuppetPinPose
) {
  const sw = statueCanvas.width;
  const sh = statueCanvas.height;
  const aspect = sw / Math.max(1, sh);

  const dstH = pose.targetHeight;
  const dstW = dstH * aspect;
  const originX = pose.baseX - dstW * 0.5 + pose.bodyLungeX;
  const originY = pose.baseY - dstH + pose.bodyBobY;

  // Строим 2D Puppet-Pin сетку (10x14 узлов) поверх оригинальной фотографии
  const cols = 10;
  const rows = 14;

  const uGrid: number[][] = [];
  const vGrid: number[][] = [];
  const xGrid: number[][] = [];
  const yGrid: number[][] = [];

  // Для Аполлона (слева, лицом вправо): ударная передняя рука — справа на фото (nx > 0.62), задняя — слева (nx < 0.32)
  // Для Зевса (справа, лицом влево): ударная передняя рука — слева на фото (nx < 0.34), задняя — справа (nx > 0.66)
  for (let r = 0; r <= rows; r++) {
    const ny = r / rows;
    uGrid[r] = [];
    vGrid[r] = [];
    xGrid[r] = [];
    yGrid[r] = [];

    for (let c = 0; c <= cols; c++) {
      const nx = c / cols;
      uGrid[r][c] = nx * sw;
      vGrid[r][c] = ny * sh;

      let dx = 0;
      let dy = 0;

      // 1. Вес Головы (ny 0.0 .. 0.25, центр nx 0.25..0.68)
      if (ny < 0.27) {
        const wHead = Math.pow(Math.max(0, (0.27 - ny) / 0.27), 1.3);
        dx += pose.headOffsetX * wHead;
        dy += pose.headOffsetY * wHead;
      }

      // 2. Вес Торса и Грудной клетки (ny 0.20 .. 0.62)
      if (ny > 0.15 && ny < 0.68) {
        const wTorso = Math.sin(
          Math.max(0, Math.min(1, (ny - 0.15) / 0.53)) * Math.PI
        );
        const centerDist = nx - 0.48;
        dx += pose.chestTwistX * wTorso + centerDist * dstW * pose.chestBreathScale * wTorso;
      }

      // 3. Вес Родных Рук фотографии (ny 0.26 .. 0.78)
      // Плавно поднимаем и выбрасываем настоящие мраморные руки с фото!
      if (ny > 0.24 && ny < 0.80) {
        const armProgress = Math.max(0, Math.min(1, (ny - 0.26) / 0.46)); // 0 у плеча -> 1 у кисти
        const elbowWeight = Math.sin(armProgress * Math.PI);
        const handWeight = Math.pow(armProgress, 1.35);

        // Правая сторона фото (nx > 0.58)
        if (nx > 0.56) {
          const sideMask = Math.pow(Math.min(1, (nx - 0.56) / 0.26), 1.15);
          if (pose.isApolloLeft) {
            // У Аполлона правая сторона фото — это его передняя (ближняя к Зевсу) ударная рука
            dx +=
              (pose.leadArmElbowX * elbowWeight + pose.leadArmHandX * handWeight) *
              sideMask;
            dy +=
              (pose.leadArmElbowY * elbowWeight + pose.leadArmHandY * handWeight) *
              sideMask;
          } else {
            // У Зевса правая сторона фото — это его задняя рука
            dx += pose.rearArmHandX * handWeight * sideMask;
            dy += pose.rearArmHandY * handWeight * sideMask;
          }
        }

        // Левая сторона фото (nx < 0.40)
        if (nx < 0.40) {
          const sideMask = Math.pow(Math.min(1, (0.40 - nx) / 0.26), 1.15);
          if (!pose.isApolloLeft) {
            // У Зевса левая сторона фото — это его передняя (ближняя к Аполлону) ударная рука
            dx +=
              (pose.leadArmElbowX * elbowWeight + pose.leadArmHandX * handWeight) *
              sideMask;
            dy +=
              (pose.leadArmElbowY * elbowWeight + pose.leadArmHandY * handWeight) *
              sideMask;
          } else {
            // У Аполлона левая сторона фото — это его задняя рука
            dx += pose.rearArmHandX * handWeight * sideMask;
            dy += pose.rearArmHandY * handWeight * sideMask;
          }
        }
      }

      // 4. Вес Родных Ног фотографии (ny 0.64 .. 1.0) — живой шаг и выпад бедрами
      if (ny > 0.62) {
        const legWeight = Math.pow((ny - 0.62) / 0.38, 1.25);
        if (nx >= 0.48) {
          const rightLegMask = Math.min(1, (nx - 0.44) / 0.22);
          const stepX = pose.isApolloLeft ? pose.leadLegStepX : pose.rearLegStepX;
          const liftY = pose.isApolloLeft ? pose.leadLegLiftY : pose.rearLegLiftY;
          dx += stepX * legWeight * rightLegMask;
          dy += liftY * legWeight * rightLegMask;
        } else {
          const leftLegMask = Math.min(1, (0.52 - nx) / 0.22);
          const stepX = pose.isApolloLeft ? pose.rearLegStepX : pose.leadLegStepX;
          const liftY = pose.isApolloLeft ? pose.rearLegLiftY : pose.leadLegLiftY;
          dx += stepX * legWeight * leftLegMask;
          dy += liftY * legWeight * leftLegMask;
        }
      }

      xGrid[r][c] = originX + nx * dstW + dx;
      yGrid[r][c] = originY + ny * dstH + dy;
    }
  }

  // Отрисовываем все треугольники деформированной фотографии
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Верхний левый треугольник ячейки
      drawUvTriangle(
        ctx,
        statueCanvas,
        uGrid[r][c],
        vGrid[r][c],
        uGrid[r][c + 1],
        vGrid[r][c + 1],
        uGrid[r + 1][c],
        vGrid[r + 1][c],
        xGrid[r][c],
        yGrid[r][c],
        xGrid[r][c + 1],
        yGrid[r][c + 1],
        xGrid[r + 1][c],
        yGrid[r + 1][c]
      );
      // Нижний правый треугольник ячейки
      drawUvTriangle(
        ctx,
        statueCanvas,
        uGrid[r][c + 1],
        vGrid[r][c + 1],
        uGrid[r + 1][c + 1],
        vGrid[r + 1][c + 1],
        uGrid[r + 1][c],
        vGrid[r + 1][c],
        xGrid[r][c + 1],
        yGrid[r][c + 1],
        xGrid[r + 1][c + 1],
        yGrid[r + 1][c + 1],
        xGrid[r + 1][c],
        yGrid[r + 1][c]
      );
    }
  }

  // Мягкий кинематографичный блик на мраморе в момент столкновения
  if (pose.impactFlash > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const flashX = pose.baseX + pose.bodyLungeX + pose.chestTwistX;
    const flashY = originY + dstH * 0.38;
    const grad = ctx.createRadialGradient(flashX, flashY, 8, flashX, flashY, dstW * 0.45);
    grad.addColorStop(
      0,
      `rgba(255, 250, 235, ${(pose.impactFlash * 0.55).toFixed(2)})`
    );
    grad.addColorStop(
      0.5,
      `rgba(251, 191, 36, ${(pose.impactFlash * 0.25).toFixed(2)})`
    );
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, dstW * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

interface MarbleDustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  isShard: boolean;
  rot: number;
}

/**
 * Фотореалистичный авто-бой двух греческих статуй с фотографий пользователя (After Effects Puppet-Pin деформация)
 */
const OlympusTitansBattleBackdrop: React.FC<{ rankIndex: number }> = ({ rankIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statuesRef = useRef<{
    apollo: HTMLCanvasElement | null;
    zeus: HTMLCanvasElement | null;
  }>({ apollo: null, zeus: null });

  useEffect(() => {
    let cancelled = false;

    const imgApollo = new Image();
    imgApollo.crossOrigin = 'anonymous';
    imgApollo.src = '/assets/aistudio/____________b9e4bfd1.png';
    imgApollo.onload = () => {
      if (cancelled) return;
      statuesRef.current.apollo = preparePhotorealisticStatueCanvas(
        imgApollo,
        'apollo_left'
      );
    };

    const imgZeus = new Image();
    imgZeus.crossOrigin = 'anonymous';
    imgZeus.src = '/assets/aistudio/9bd41ccd057c3b10554b073c332fe5cd_cca3f73a.jpg';
    imgZeus.onload = () => {
      if (cancelled) return;
      statuesRef.current.zeus = preparePhotorealisticStatueCanvas(
        imgZeus,
        'zeus_right'
      );
    };

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const dustParticles: MarbleDustParticle[] = [];
    let lastImpactBeat = -1;

    const spawnMarbleImpactDust = (ix: number, iy: number, heavy: boolean) => {
      const count = heavy ? 32 : 20;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (1.8 + Math.random() * 7.5) * (heavy ? 1.3 : 1);
        dustParticles.push({
          x: ix + (Math.random() - 0.5) * 35,
          y: iy + (Math.random() - 0.5) * 35,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.2,
          size: i % 3 === 0 ? 14 + Math.random() * 22 : 2.5 + Math.random() * 5.5,
          alpha: i % 3 === 0 ? 0.36 : 0.9,
          isShard: i % 3 !== 0,
          rot: Math.random() * Math.PI * 2,
        });
      }
    };

    const embers = Array.from({ length: 45 }, (_, i) => ({
      x: ((i * 97.3) % 100) / 100,
      y: ((i * 53.7) % 100) / 100,
      size: 1.2 + (i % 3) * 1.1,
      speedY: 0.00045 + (i % 5) * 0.00025,
      phase: i * 0.7,
    }));

    const startTime = performance.now();

    const render = (now: number) => {
      const speedMult = 1 + rankIndex * 0.04;
      const t = (now - startTime) * 0.001 * speedMult;

      // Цикл живого боя из 4 кинематографичных фаз
      const cycle = t * 1.25;
      const wholeBeat = Math.floor(cycle);
      const phase = wholeBeat % 4;
      const p = cycle % 1;

      // Плавная физическая кривая выпада и удара (0 -> 1 на p=0.44 -> 0)
      const strike =
        p < 0.44
          ? Math.sin((p / 0.44) * (Math.PI * 0.5))
          : Math.max(0, Math.cos(((p - 0.44) / 0.56) * (Math.PI * 0.5)));
      const strikeSharp = Math.pow(strike, 1.8);
      const isImpactPeak = p >= 0.39 && p <= 0.52;

      // Кинематографичный встрях камеры в момент тяжелого удара
      const shakeAmp = isImpactPeak ? (phase === 2 ? 9 : 5.5) : 0;
      const shakeX = shakeAmp ? Math.sin(now * 0.085) * shakeAmp : 0;
      const shakeY = shakeAmp ? Math.cos(now * 0.105) * shakeAmp : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 1. Кинематографичный свет Олимпа
      const skyGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.32,
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      skyGrad.addColorStop(0, 'rgba(251, 191, 36, 0.20)');
      skyGrad.addColorStop(0.55, 'rgba(15, 20, 32, 0.48)');
      skyGrad.addColorStop(1, 'rgba(6, 9, 15, 0.84)');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-20, -20, width + 40, height + 40);

      const centerX = width * 0.5;
      const statueH = Math.min(height * 0.88, Math.max(480, width * 0.48));
      const baseY = height * 0.99;
      const baseDist = Math.min(width * 0.16, statueH * 0.28);

      // Ритм живого дыхания и перешагивания ногами
      const walkWave = Math.sin(t * 5.2);
      const walkWaveCos = Math.cos(t * 5.2);

      // Состояние Левого Бойца (Молодой Аполлон с первого фото)
      const apolloPose: PuppetPinPose = {
        baseX: centerX - baseDist + Math.sin(t * 2.1) * 16,
        baseY,
        targetHeight: statueH,
        bodyLungeX: 0,
        bodyBobY: Math.abs(walkWave) * 8,
        headOffsetX: Math.sin(t * 3.1) * 5,
        headOffsetY: 0,
        chestTwistX: Math.sin(t * 3.1) * 7,
        chestBreathScale: 0.022 * Math.sin(t * 3.8),
        // В боевой стойке родные руки с фото приподняты и согнуты в сторону соперника
        leadArmElbowX: 22 + walkWave * 8,
        leadArmElbowY: -34 + walkWave * 6,
        leadArmHandX: 54 + walkWave * 12,
        leadArmHandY: -95 + walkWave * 10,
        rearArmHandX: 28 - walkWave * 8,
        rearArmHandY: -65 - walkWave * 6,
        // Живой шаг родными ногами с фото
        leadLegStepX: 24 + walkWave * 22,
        leadLegLiftY: Math.min(0, walkWave * 18),
        rearLegStepX: -18 - walkWave * 22,
        rearLegLiftY: Math.min(0, -walkWave * 18),
        impactFlash: 0,
        isApolloLeft: true,
      };

      // Состояние Правого Бойца (Бородатый Зевс со второго фото)
      const zeusPose: PuppetPinPose = {
        baseX: centerX + baseDist - Math.sin(t * 2.1) * 16,
        baseY,
        targetHeight: statueH,
        bodyLungeX: 0,
        bodyBobY: Math.abs(walkWaveCos) * 8,
        headOffsetX: -Math.cos(t * 3.1) * 5,
        headOffsetY: 0,
        chestTwistX: -Math.cos(t * 3.1) * 7,
        chestBreathScale: 0.024 * Math.cos(t * 3.8),
        // В боевой стойке передняя рука Зевса поднята навстречу Аполлону
        leadArmElbowX: -24 - walkWaveCos * 8,
        leadArmElbowY: -36 + walkWaveCos * 6,
        leadArmHandX: -58 - walkWaveCos * 12,
        leadArmHandY: -98 + walkWaveCos * 10,
        rearArmHandX: -26 + walkWaveCos * 8,
        rearArmHandY: -62 - walkWaveCos * 6,
        // Живой шаг родными ногами Зевса
        leadLegStepX: -24 - walkWaveCos * 22,
        leadLegLiftY: Math.min(0, walkWaveCos * 18),
        rearLegStepX: 18 + walkWaveCos * 22,
        rearLegLiftY: Math.min(0, -walkWaveCos * 18),
        impactFlash: 0,
        isApolloLeft: false,
      };

      let impactX = centerX;
      let impactY = baseY - statueH * 0.62;

      if (phase === 0) {
        // ФАЗА 1: Аполлон шагает передней ногой вперед и выбрасывает свою родную руку в мощном ударе!
        apolloPose.bodyLungeX = strikeSharp * (baseDist * 0.68);
        apolloPose.chestTwistX = strikeSharp * 42;
        apolloPose.headOffsetX = strikeSharp * 28;
        apolloPose.leadArmElbowX = 22 + strikeSharp * 68;
        apolloPose.leadArmElbowY = -34 - strikeSharp * 55;
        apolloPose.leadArmHandX = 54 + strikeSharp * 145;
        apolloPose.leadArmHandY = -95 - strikeSharp * 95;
        apolloPose.leadLegStepX = 24 + strikeSharp * 65;
        apolloPose.leadLegLiftY = -strikeSharp * 24;

        // Зевс принимает удар в блок, его голова и плечи уходят назад от импульса
        const recoil = isImpactPeak ? strikeSharp : p > 0.44 ? strikeSharp * 0.85 : 0;
        zeusPose.bodyLungeX = recoil * 38;
        zeusPose.chestTwistX = recoil * 36;
        zeusPose.headOffsetX = recoil * 54;
        zeusPose.headOffsetY = -recoil * 12;
        zeusPose.leadArmHandX = -75;
        zeusPose.leadArmHandY = -135; // высокий блок рукой у головы
        zeusPose.impactFlash = isImpactPeak ? 1 : recoil * 0.6;
        impactX = zeusPose.baseX - 45;
      } else if (phase === 1) {
        // ФАЗА 2: Бородатый Зевс шагает вперед и наносит сокрушительный удар своей мощной рукой и коленом!
        zeusPose.bodyLungeX = -strikeSharp * (baseDist * 0.68);
        zeusPose.chestTwistX = -strikeSharp * 44;
        zeusPose.headOffsetX = -strikeSharp * 28;
        zeusPose.leadArmElbowX = -24 - strikeSharp * 72;
        zeusPose.leadArmElbowY = -36 - strikeSharp * 58;
        zeusPose.leadArmHandX = -58 - strikeSharp * 150;
        zeusPose.leadArmHandY = -98 - strikeSharp * 98;
        zeusPose.leadLegStepX = -24 - strikeSharp * 75;
        zeusPose.leadLegLiftY = -strikeSharp * 38;

        // Аполлон отшагивает назад и откидывает голову от удара Зевса
        const recoil = isImpactPeak ? strikeSharp : p > 0.44 ? strikeSharp * 0.85 : 0;
        apolloPose.bodyLungeX = -recoil * 38;
        apolloPose.chestTwistX = -recoil * 36;
        apolloPose.headOffsetX = -recoil * 54;
        apolloPose.headOffsetY = -recoil * 12;
        apolloPose.leadArmHandX = 72;
        apolloPose.leadArmHandY = -132;
        apolloPose.impactFlash = isImpactPeak ? 1 : recoil * 0.6;
        impactX = apolloPose.baseX + 45;
      } else if (phase === 2) {
        // ФАЗА 3: ВСТРЕЧНЫЙ ТАРАН И СТОЛКНОВЕНИЕ ДВУХ МРАМОРНЫХ ГИГАНТОВ В ЦЕНТРЕ ОЛИМПА!
        apolloPose.bodyLungeX = strikeSharp * (baseDist * 0.58);
        apolloPose.bodyBobY = -strikeSharp * 26;
        apolloPose.chestTwistX = strikeSharp * 40;
        apolloPose.leadArmElbowX = 22 + strikeSharp * 62;
        apolloPose.leadArmElbowY = -34 - strikeSharp * 52;
        apolloPose.leadArmHandX = 54 + strikeSharp * 135;
        apolloPose.leadArmHandY = -95 - strikeSharp * 95;
        apolloPose.leadLegStepX = 24 + strikeSharp * 78;
        apolloPose.leadLegLiftY = -strikeSharp * 48;
        apolloPose.impactFlash = isImpactPeak ? 1 : 0;

        zeusPose.bodyLungeX = -strikeSharp * (baseDist * 0.58);
        zeusPose.bodyBobY = -strikeSharp * 26;
        zeusPose.chestTwistX = -strikeSharp * 40;
        zeusPose.leadArmElbowX = -24 - strikeSharp * 62;
        zeusPose.leadArmElbowY = -36 - strikeSharp * 52;
        zeusPose.leadArmHandX = -58 - strikeSharp * 135;
        zeusPose.leadArmHandY = -98 - strikeSharp * 95;
        zeusPose.leadLegStepX = -24 - strikeSharp * 78;
        zeusPose.leadLegLiftY = -strikeSharp * 48;
        zeusPose.impactFlash = isImpactPeak ? 1 : 0;
        impactX = centerX;
      } else {
        // ФАЗА 4: Быстрый ближний размен ударами рук и коленей в клинче
        const fastWave = Math.sin(p * Math.PI * 2);
        if (fastWave >= 0) {
          apolloPose.bodyLungeX = fastWave * (baseDist * 0.52);
          apolloPose.chestTwistX = fastWave * 34;
          apolloPose.leadArmHandX = 54 + fastWave * 130;
          apolloPose.leadArmHandY = -95 - fastWave * 88;
          apolloPose.rearArmHandX = 28 + fastWave * 95;
          apolloPose.rearArmHandY = -65 - fastWave * 75;
          zeusPose.headOffsetX = fastWave * 42;
          zeusPose.impactFlash = fastWave * 0.8;
        } else {
          const zw = -fastWave;
          zeusPose.bodyLungeX = -zw * (baseDist * 0.52);
          zeusPose.chestTwistX = -zw * 34;
          zeusPose.leadArmHandX = -58 - zw * 130;
          zeusPose.leadArmHandY = -98 - zw * 88;
          zeusPose.rearArmHandX = -26 - zw * 95;
          zeusPose.rearArmHandY = -62 - zw * 75;
          apolloPose.headOffsetX = -zw * 42;
          apolloPose.impactFlash = zw * 0.8;
        }
      }

      if (isImpactPeak && lastImpactBeat !== wholeBeat) {
        lastImpactBeat = wholeBeat;
        spawnMarbleImpactDust(impactX, impactY, phase === 2);
      }

      // 2. Отрисовка обеих реальных фотографий через 2D UV Puppet-Pin сетку (0% мультяшных примитивов!)
      if (statuesRef.current.apollo) {
        drawPuppetWarpedStatue(ctx, statuesRef.current.apollo, apolloPose);
      }
      if (statuesRef.current.zeus) {
        drawPuppetWarpedStatue(ctx, statuesRef.current.zeus, zeusPose);
      }

      // 3. Кинематографичная световая вспышка в момент удара (без мультяшных зигзагов)
      if (isImpactPeak) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const rad = phase === 2 ? 260 : 160;
        const flashGrad = ctx.createRadialGradient(
          impactX,
          impactY,
          4,
          impactX,
          impactY,
          rad
        );
        flashGrad.addColorStop(0, 'rgba(255, 252, 240, 0.82)');
        flashGrad.addColorStop(0.35, 'rgba(251, 191, 36, 0.42)');
        flashGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(impactX, impactY, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Реалистичная мраморная пыль и мелкая каменная крошка при ударах
      for (let i = dustParticles.length - 1; i >= 0; i--) {
        const d = dustParticles[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.isShard) {
          d.vy += 0.32;
        } else {
          d.vx *= 0.94;
          d.vy *= 0.94;
          d.size += 0.6;
        }
        d.alpha *= d.isShard ? 0.94 : 0.92;
        if (d.alpha < 0.02) {
          dustParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = d.alpha;
        if (d.isShard) {
          ctx.translate(d.x, d.y);
          ctx.rotate(d.rot);
          ctx.fillStyle = '#F5F2EB';
          ctx.fillRect(-d.size * 0.5, -d.size * 0.35, d.size, d.size * 0.7);
        } else {
          const dustGrad = ctx.createRadialGradient(d.x, d.y, 1, d.x, d.y, d.size);
          dustGrad.addColorStop(0, 'rgba(245, 240, 230, 0.65)');
          dustGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = dustGrad;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. Мягкая золотая дымка и пылинки света у подножия Олимпа
      const mistGrad = ctx.createLinearGradient(0, height * 0.8, 0, height);
      mistGrad.addColorStop(0, 'transparent');
      mistGrad.addColorStop(0.6, 'rgba(12, 16, 24, 0.55)');
      mistGrad.addColorStop(1, 'rgba(6, 9, 14, 0.88)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height * 0.8, width, height * 0.2);

      embers.forEach((s) => {
        const sx = ((s.x + Math.sin(t * 0.4 + s.phase) * 0.025 + 1) % 1) * width;
        const sy = ((s.y - t * s.speedY + 1) % 1) * height;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.58)';
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [rankIndex]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Золотой храм Олимпа с колоннами и фресками богов на своде */}
      <img
        src="/assets/backgrounds/stage4_olympus.jpg"
        alt=""
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          filter: 'saturate(1.18) contrast(1.08) brightness(0.68)',
        }}
      />

      {/* Живая 2D UV Puppet-Pin анимация реальных фотографий двух мраморных богов */}
      <canvas ref={canvasRef} className="relative z-10 w-full h-full block" />
    </div>
  );
};

export const EvolutionAtlasView: React.FC<EvolutionViewProps> = ({
  profile,
  stats,
  atlasImage,
}) => {
  const [selectedRankIndex, setSelectedRankIndex] = useState<number>(stats.currentRank.index);
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
          (profile.currentRunTotalLooks / Math.max(1, nextLockedRank.requiredLooks)) * 100
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
                  <span aria-hidden="true" className="text-slate-500">·</span>
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
                  {isAllUnlocked ? `Открыто ${unlockedCount}/${PSL_RANKS.length}` : `➔ ${nextLockedRank.title}`}
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
                      (profile.currentRunTotalLooks / Math.max(1, rank.requiredLooks)) * 100
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

interface RebirthViewProps {
  profile: PlayerProfileData;
  stats: ComputedStats;
  atlasImage?: HTMLImageElement | null;
  onTriggerRebirth: () => void;
  onBuyPerk: (perkId: string) => void;
}

interface PerkGifMeta {
  shortTitle: string;
  gifUrl: string;
  colorHex: string;
  rgb: string;
  bonusText: (lvl: number) => string;
  nextBonusText: (lvl: number) => string;
}

const PERK_GIF_META: Record<string, PerkGifMeta> = {
  hunter_eyes: {
    shortTitle: 'Охотничий взгляд',
    gifUrl: '/assets/loading/jordan_barrett_mewing.gif',
    colorHex: '#38BDF8',
    rgb: '56, 189, 248',
    bonusText: (lvl) => `+${lvl * 60}% клик`,
    nextBonusText: () => '+60% клик',
  },
  hollow_cheeks: {
    shortTitle: 'Впалые щёки',
    gifUrl: '/assets/perks/handsome_squidward.gif',
    colorHex: '#10B981',
    rgb: '16, 185, 129',
    bonusText: (lvl) => `+${lvl * 50}% пассив`,
    nextBonusText: () => '+50% пассив',
  },
  gonial_angle: {
    shortTitle: 'Челюсть 120°',
    gifUrl: '/assets/perks/jawline_check.gif',
    colorHex: '#F59E0B',
    rgb: '245, 158, 11',
    bonusText: (lvl) => `+${lvl * 3}% крит`,
    nextBonusText: () => '+3% крит',
  },
  forward_maxilla: {
    shortTitle: 'Максилла Сигмы',
    gifUrl: '/assets/loading/patrick_bateman_sigma.gif',
    colorHex: '#A855F7',
    rgb: '168, 85, 247',
    bonusText: (lvl) => `-${Math.min(56, lvl * 7)}% цены`,
    nextBonusText: () => '-7% цены',
  },
  adams_lineage: {
    shortTitle: 'Геном Адама',
    gifUrl: '/assets/perks/david_laid.gif',
    colorHex: '#F43F5E',
    rgb: '244, 63, 94',
    bonusText: (lvl) => `+${lvl * 35}% оффлайн`,
    nextBonusText: () => '+35% оффлайн',
  },
};

// Яркие фото эталонов эстетики / Адамов для космического фона (без затухания и без надписей)
const BACKGROUND_ADAMS_PHOTOS = [
  {
    src: '/assets/adams/sean_opry_2.jpg',
    className: 'top-[76px] left-[1.5%] w-44 sm:w-56 lg:w-64 aspect-[3/4] -rotate-3',
    borderColor: 'rgba(56, 189, 248, 0.75)',
    glowColor: 'rgba(56, 189, 248, 0.38)',
    floatDelay: '0s',
    floatDuration: '6.2s',
  },
  {
    src: '/assets/adams/david_gandy_2.jpg',
    className: 'top-[76px] right-[1.5%] w-44 sm:w-56 lg:w-64 aspect-[3/4] rotate-3',
    borderColor: 'rgba(251, 191, 36, 0.75)',
    glowColor: 'rgba(251, 191, 36, 0.38)',
    floatDelay: '1.1s',
    floatDuration: '6.8s',
  },
  {
    src: '/assets/adams/alain_delon.jpg',
    className: 'bottom-[3%] left-[2%] w-48 sm:w-64 lg:w-72 aspect-[4/3] rotate-2',
    borderColor: 'rgba(16, 185, 129, 0.75)',
    glowColor: 'rgba(16, 185, 129, 0.38)',
    floatDelay: '0.5s',
    floatDuration: '7.1s',
  },
  {
    src: '/assets/adams/christian_bale.jpg',
    className: 'bottom-[3%] right-[2%] w-44 sm:w-56 lg:w-64 aspect-[3/4] -rotate-2',
    borderColor: 'rgba(168, 85, 247, 0.75)',
    glowColor: 'rgba(168, 85, 247, 0.38)',
    floatDelay: '1.7s',
    floatDuration: '6.4s',
  },
  {
    src: '/assets/adams/david_gandy_1.jpg',
    className: 'bottom-[2.5%] left-[27%] w-40 sm:w-52 lg:w-60 aspect-[3/4] -rotate-2 hidden md:block',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    glowColor: 'rgba(245, 158, 11, 0.38)',
    floatDelay: '0.8s',
    floatDuration: '6.9s',
  },
  {
    src: '/assets/perks/david_laid.gif',
    className: 'bottom-[2.5%] right-[27%] w-40 sm:w-52 lg:w-60 aspect-[3/4] rotate-2 hidden md:block',
    borderColor: 'rgba(244, 63, 94, 0.8)',
    glowColor: 'rgba(244, 63, 94, 0.38)',
    floatDelay: '1.4s',
    floatDuration: '6.0s',
  },
];

// Звездные искры на фоне космоса
const COSMIC_DNA_SPARKS = [
  { left: '8%', top: '18%', size: 4, color: '#FBBF24', delay: '0s', duration: '4.5s' },
  { left: '16%', top: '68%', size: 3.5, color: '#38BDF8', delay: '1.1s', duration: '5.2s' },
  { left: '27%', top: '24%', size: 4.5, color: '#F59E0B', delay: '0.6s', duration: '4.8s' },
  { left: '38%', top: '82%', size: 3.5, color: '#FFFFFF', delay: '1.8s', duration: '5.5s' },
  { left: '52%', top: '14%', size: 4.5, color: '#FBBF24', delay: '0.3s', duration: '4.2s' },
  { left: '64%', top: '76%', size: 4, color: '#38BDF8', delay: '2.2s', duration: '5.0s' },
  { left: '78%', top: '22%', size: 4.5, color: '#FFFFFF', delay: '0.9s', duration: '4.6s' },
  { left: '89%', top: '62%', size: 4, color: '#F59E0B', delay: '1.5s', duration: '5.4s' },
  { left: '93%', top: '28%', size: 3.5, color: '#38BDF8', delay: '0.4s', duration: '4.9s' },
];

export const RebirthStarryBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Яркое звездное небо и космическая туманность без темной пелены */}
      <img
        src="/assets/adams/nebula_1.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-100"
        style={{
          filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
        }}
      />

      {/* 2. Живые парящие фотографии Адамов в невесомости на фоне звездного неба */}
      <div className="absolute inset-0">
        {BACKGROUND_ADAMS_PHOTOS.map((photo, idx) => (
          <div
            key={idx}
            className={`absolute ${photo.className} rounded-2xl overflow-hidden bg-slate-950 animate-adams-float`}
            style={{
              border: `2px solid ${photo.borderColor}`,
              boxShadow: `0 16px 40px rgba(0,0,0,0.85), 0 0 28px ${photo.glowColor}`,
              animationDelay: photo.floatDelay,
              animationDuration: photo.floatDuration,
            }}
          >
            <img
              src={photo.src}
              alt=""
              className="w-full h-full object-cover object-top brightness-105 contrast-105"
            />
          </div>
        ))}
      </div>

      {/* 3. Мерцающие звезды */}
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
            boxShadow: `0 0 12px ${spark.color}, 0 0 24px ${spark.color}`,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
          }}
        />
      ))}
    </div>
  );
};

export const GeneticsRebirthView: React.FC<RebirthViewProps> = ({
  profile,
  stats,
  onTriggerRebirth,
  onBuyPerk,
}) => {
  const [rebirthFlash, setRebirthFlash] = useState<{
    generation: number;
    dnaEarned: number;
    newMultiplier: number;
  } | null>(null);
  const [pulsingPerkId, setPulsingPerkId] = useState<string | null>(null);

  const chadliteTarget = PSL_RANKS[5].requiredLooks;
  const rebirthProgress = Math.min(
    100,
    (profile.currentRunTotalLooks / chadliteTarget) * 100
  );
  const nextGenMultiplier = 1 + profile.generation * 0.4;

  const handleRebirthClick = () => {
    if (!stats.canRebirth) return;
    const earned = stats.pendingRebirthDNA;
    const nextGen = profile.generation + 1;
    const nextMult = 1 + profile.generation * 0.4;

    setRebirthFlash({
      generation: nextGen,
      dnaEarned: earned,
      newMultiplier: nextMult,
    });
    onTriggerRebirth();

    window.setTimeout(() => {
      setRebirthFlash(null);
    }, 1750);
  };

  const handleBuyPerkClick = (perkId: string) => {
    setPulsingPerkId(perkId);
    onBuyPerk(perkId);
    window.setTimeout(() => {
      setPulsingPerkId((prev) => (prev === perkId ? null : prev));
    }, 420);
  };

  return (
    <div className="relative z-10 max-w-[1060px] mx-auto space-y-4 select-none">
      {/* ЭПИЧНАЯ ВСПЫШКА СМЕНЫ ПОКОЛЕНИЯ */}
      {rebirthFlash && (
        <div
          onClick={() => setRebirthFlash(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md cursor-pointer overflow-hidden"
        >
          {/* Расходящиеся золотые ударные волны */}
          <div className="pointer-events-none absolute w-72 h-72 rounded-full border-4 border-amber-400/80 shadow-[0_0_80px_rgba(251,191,36,0.8)] animate-rebirth-shockwave" />
          <div
            className="pointer-events-none absolute w-96 h-96 rounded-full border-2 border-cyan-400/70 shadow-[0_0_90px_rgba(56,189,248,0.65)] animate-rebirth-shockwave"
            style={{ animationDelay: '0.16s' }}
          />

          {/* Центральная карточка вознесения ДНК */}
          <div className="relative z-10 mx-4 max-w-md w-full rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-[#171F2E]/95 via-[#0E1420]/95 to-[#090D14]/95 p-6 text-center shadow-[0_0_90px_rgba(251,191,36,0.55)] animate-rebirth-banner">
            <div className="mx-auto mb-3 w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-[0_0_32px_rgba(251,191,36,0.65)] bg-slate-950">
              <img
                src="/assets/perks/dna_helix.gif"
                alt="DNA Ascension"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-300 font-mono text-[11px] font-extrabold uppercase tracking-widest">
              ГЕНЕТИКА ОБНОВЛЕНА
            </div>

            <h3 className="mt-1.5 text-3xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-[0_2px_16px_rgba(251,191,36,0.5)]">
              ПОКОЛЕНИЕ {rebirthFlash.generation}
            </h3>

            <div className="mt-4 flex items-center justify-center gap-2.5 font-mono text-sm font-extrabold">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.6)]">
                +{rebirthFlash.dnaEarned} ДНК 🧬
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/25 border border-emerald-400/60 text-emerald-300">
                ДОХОД ×{rebirthFlash.newMultiplier.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* КОМПАКТНЫЙ БАННЕР РЕБОРНА С МИНИМУМОМ ТЕКСТА */}
      <div className="relative rounded-2xl border border-amber-400/50 bg-[#0D131C]/80 backdrop-blur-md p-3.5 sm:p-4 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Слева: 3D-спираль ДНК + краткие цифры */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.4)] shrink-0 bg-slate-950">
              <img
                src="/assets/perks/dna_helix.gif"
                alt="DNA Helix"
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold uppercase whitespace-nowrap">
                ПОК. {profile.generation}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-tight">
                Смена Поколения
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/45 text-amber-300">
                  🧬 {profile.dnaPoints} ДНК
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/45 text-emerald-300">
                  Доход ×{stats.generationMultiplier.toFixed(2)} ➔ ×{nextGenMultiplier.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Справа: Прогресс + Кнопка Реборна */}
          <div className="w-full md:w-[320px] p-3 rounded-xl bg-[#090D14]/90 border border-white/15 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-300">
                {stats.canRebirth ? 'Готово' : 'До Chadlite'}
              </span>
              <span className="text-amber-400 font-extrabold">
                {stats.canRebirth
                  ? `+${stats.pendingRebirthDNA} ДНК`
                  : `${rebirthProgress.toFixed(0)}% (${formatLooks(chadliteTarget)} PSL)`}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-200"
                style={{ width: `${rebirthProgress}%` }}
              />
            </div>

            <button
              type="button"
              disabled={!stats.canRebirth}
              onClick={handleRebirthClick}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wide transition-all ${
                stats.canRebirth
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.45)] hover:brightness-110 active:scale-[0.99] cursor-pointer'
                  : 'bg-[#182028] text-slate-400 border border-white/10 cursor-not-allowed'
              }`}
            >
              {stats.canRebirth
                ? `⚡ ПЕРЕРОДИТЬСЯ (+${stats.pendingRebirthDNA} ДНК)`
                : '🔒 Нужен Chadlite'}
            </button>
          </div>
        </div>
      </div>

      {/* СЕТКА МУТАЦИЙ ДНК С ЗОЛОТОЙ ЭВОЛЮЦИЕЙ НА 10/10 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {DNA_PERKS.map((perk: DNAPerkDefinition) => {
          const currentLvl = profile.perkLevels[perk.id] || 0;
          const isMax = currentLvl >= perk.maxLevel;
          const cost = calculatePerkDnaCost(perk, currentLvl);
          const canAfford = !isMax && profile.dnaPoints >= cost;
          const meta = PERK_GIF_META[perk.id] || PERK_GIF_META['hunter_eyes'];
          const progressPct = Math.min(100, (currentLvl / perk.maxLevel) * 100);
          const isJustUpgraded = pulsingPerkId === perk.id;

          return (
            <div
              key={perk.id}
              className={`group relative rounded-2xl border backdrop-blur-md p-3 flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                isMax
                  ? 'bg-gradient-to-b from-[#1F190D]/90 via-[#121620]/90 to-[#0E141D]/90 animate-gold-gene'
                  : 'bg-[#0E141D]/80 hover:bg-[#131C28]/90 shadow-[0_14px_34px_rgba(0,0,0,0.7)]'
              } ${isJustUpgraded ? 'scale-[1.03]' : ''}`}
              style={
                isMax
                  ? undefined
                  : {
                      borderColor: isJustUpgraded
                        ? '#FBBF24'
                        : canAfford
                        ? meta.colorHex
                        : currentLvl > 0
                        ? `${meta.colorHex}77`
                        : 'rgba(255,255,255,0.18)',
                      boxShadow: isJustUpgraded
                        ? `0 0 30px rgba(251, 191, 36, 0.55)`
                        : canAfford
                        ? `0 8px 25px rgba(${meta.rgb}, 0.3)`
                        : undefined,
                    }
              }
            >
              {/* Чистая GIF-карточка без имен и тегов */}
              <div>
                <div
                  className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border ${
                    isMax ? 'border-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.35)]' : 'border-white/15'
                  }`}
                >
                  <img
                    src={meta.gifUrl}
                    alt={meta.shortTitle}
                    loading="eager"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Компактный уровень или золотой статус MAX */}
                  <span
                    className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold tabular-nums ${
                      isMax
                        ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                        : 'bg-black/80 backdrop-blur-md border border-white/20 text-white'
                    }`}
                  >
                    {isMax ? `★ ${currentLvl}/${perk.maxLevel}` : `${currentLvl}/${perk.maxLevel}`}
                  </span>
                </div>

                {/* Короткое название и бонус */}
                <div className="mt-2.5 text-center">
                  <h3
                    className={`text-sm font-extrabold font-display tracking-tight truncate ${
                      isMax ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-white'
                    }`}
                  >
                    {meta.shortTitle}
                  </h3>
                  <div
                    className="mt-0.5 text-xs font-mono font-bold tabular-nums"
                    style={{ color: isMax ? '#FBBF24' : meta.colorHex }}
                  >
                    {meta.bonusText(currentLvl)}
                  </div>
                </div>
              </div>

              {/* Прогресс-бар + Кнопка */}
              <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2">
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full transition-all duration-200"
                    style={{
                      width: `${progressPct}%`,
                      background: isMax
                        ? 'linear-gradient(90deg, #F59E0B, #FDE047, #F59E0B)'
                        : meta.colorHex,
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleBuyPerkClick(perk.id)}
                  className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-mono font-extrabold tabular-nums transition-all whitespace-nowrap ${
                    isMax
                      ? 'bg-gradient-to-r from-amber-400/25 via-yellow-400/30 to-amber-500/25 text-amber-200 border border-amber-300/70 shadow-[0_0_16px_rgba(251,191,36,0.3)] cursor-default'
                      : canAfford
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_4px_14px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer'
                      : 'bg-[#1A232E] text-slate-300 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {isMax
                    ? '★ АБСОЛЮТ ✓'
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
