import React, { useEffect, useRef } from 'react';

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

    // Кинематографичная цветокоррекция: придаем черно-белому Аполлону благородный теплый оттенок слоновой кости
    if (mode === 'apollo_left') {
      for (let x = lEdge; x <= rEdge; x++) {
        const idx = (y * w + x) * 4;
        if (data[idx + 3] > 0) {
          const lum = data[idx];
          data[idx] = Math.min(255, Math.round(lum * 1.04));
          data[idx + 1] = Math.min(255, Math.round(lum * 0.98));
          data[idx + 2] = Math.min(255, Math.round(lum * 0.90));
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

interface PuppetPinPose {
  baseX: number;
  baseY: number;
  targetHeight: number;
  bodyLungeX: number;
  bodyBobY: number;
  headOffsetX: number;
  headOffsetY: number;
  chestTwistX: number;
  chestBreathScale: number;
  leadArmHandX: number;
  leadArmHandY: number;
  leadArmElbowX: number;
  leadArmElbowY: number;
  rearArmHandX: number;
  rearArmHandY: number;
  leadLegStepX: number;
  leadLegLiftY: number;
  rearLegStepX: number;
  rearLegLiftY: number;
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

  const cols = 10;
  const rows = 14;

  const uGrid: number[][] = [];
  const vGrid: number[][] = [];
  const xGrid: number[][] = [];
  const yGrid: number[][] = [];

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

      // 1. Вес Головы
      if (ny < 0.27) {
        const wHead = Math.pow(Math.max(0, (0.27 - ny) / 0.27), 1.3);
        dx += pose.headOffsetX * wHead;
        dy += pose.headOffsetY * wHead;
      }

      // 2. Вес Торса и Грудной клетки
      if (ny > 0.15 && ny < 0.68) {
        const wTorso = Math.sin(
          Math.max(0, Math.min(1, (ny - 0.15) / 0.53)) * Math.PI
        );
        const centerDist = nx - 0.48;
        dx += pose.chestTwistX * wTorso + centerDist * dstW * pose.chestBreathScale * wTorso;
      }

      // 3. Вес Родных Рук фотографии
      if (ny > 0.24 && ny < 0.80) {
        const armProgress = Math.max(0, Math.min(1, (ny - 0.26) / 0.46));
        const elbowWeight = Math.sin(armProgress * Math.PI);
        const handWeight = Math.pow(armProgress, 1.35);

        if (nx > 0.56) {
          const sideMask = Math.pow(Math.min(1, (nx - 0.56) / 0.26), 1.15);
          if (pose.isApolloLeft) {
            dx +=
              (pose.leadArmElbowX * elbowWeight + pose.leadArmHandX * handWeight) *
              sideMask;
            dy +=
              (pose.leadArmElbowY * elbowWeight + pose.leadArmHandY * handWeight) *
              sideMask;
          } else {
            dx += pose.rearArmHandX * handWeight * sideMask;
            dy += pose.rearArmHandY * handWeight * sideMask;
          }
        }

        if (nx < 0.40) {
          const sideMask = Math.pow(Math.min(1, (0.40 - nx) / 0.26), 1.15);
          if (!pose.isApolloLeft) {
            dx +=
              (pose.leadArmElbowX * elbowWeight + pose.leadArmHandX * handWeight) *
              sideMask;
            dy +=
              (pose.leadArmElbowY * elbowWeight + pose.leadArmHandY * handWeight) *
              sideMask;
          } else {
            dx += pose.rearArmHandX * handWeight * sideMask;
            dy += pose.rearArmHandY * handWeight * sideMask;
          }
        }
      }

      // 4. Вес Родных Ног фотографии
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

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
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
export const OlympusTitansBattleBackdrop: React.FC<{ rankIndex: number }> = ({
  rankIndex,
}) => {
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

      const cycle = t * 1.25;
      const wholeBeat = Math.floor(cycle);
      const phase = wholeBeat % 4;
      const p = cycle % 1;

      const strike =
        p < 0.44
          ? Math.sin((p / 0.44) * (Math.PI * 0.5))
          : Math.max(0, Math.cos(((p - 0.44) / 0.56) * (Math.PI * 0.5)));
      const strikeSharp = Math.pow(strike, 1.8);
      const isImpactPeak = p >= 0.39 && p <= 0.52;

      const shakeAmp = isImpactPeak ? (phase === 2 ? 9 : 5.5) : 0;
      const shakeX = shakeAmp ? Math.sin(now * 0.085) * shakeAmp : 0;
      const shakeY = shakeAmp ? Math.cos(now * 0.105) * shakeAmp : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(shakeX, shakeY);

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

      const walkWave = Math.sin(t * 5.2);
      const walkWaveCos = Math.cos(t * 5.2);

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
        leadArmElbowX: 22 + walkWave * 8,
        leadArmElbowY: -34 + walkWave * 6,
        leadArmHandX: 54 + walkWave * 12,
        leadArmHandY: -95 + walkWave * 10,
        rearArmHandX: 28 - walkWave * 8,
        rearArmHandY: -65 - walkWave * 6,
        leadLegStepX: 24 + walkWave * 22,
        leadLegLiftY: Math.min(0, walkWave * 18),
        rearLegStepX: -18 - walkWave * 22,
        rearLegLiftY: Math.min(0, -walkWave * 18),
        impactFlash: 0,
        isApolloLeft: true,
      };

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
        leadArmElbowX: -24 - walkWaveCos * 8,
        leadArmElbowY: -36 + walkWaveCos * 6,
        leadArmHandX: -58 - walkWaveCos * 12,
        leadArmHandY: -98 + walkWaveCos * 10,
        rearArmHandX: -26 + walkWaveCos * 8,
        rearArmHandY: -62 - walkWaveCos * 6,
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
        apolloPose.bodyLungeX = strikeSharp * (baseDist * 0.68);
        apolloPose.chestTwistX = strikeSharp * 42;
        apolloPose.headOffsetX = strikeSharp * 28;
        apolloPose.leadArmElbowX = 22 + strikeSharp * 68;
        apolloPose.leadArmElbowY = -34 - strikeSharp * 55;
        apolloPose.leadArmHandX = 54 + strikeSharp * 145;
        apolloPose.leadArmHandY = -95 - strikeSharp * 95;
        apolloPose.leadLegStepX = 24 + strikeSharp * 65;
        apolloPose.leadLegLiftY = -strikeSharp * 24;

        const recoil = isImpactPeak ? strikeSharp : p > 0.44 ? strikeSharp * 0.85 : 0;
        zeusPose.bodyLungeX = recoil * 38;
        zeusPose.chestTwistX = recoil * 36;
        zeusPose.headOffsetX = recoil * 54;
        zeusPose.headOffsetY = -recoil * 12;
        zeusPose.leadArmHandX = -75;
        zeusPose.leadArmHandY = -135;
        zeusPose.impactFlash = isImpactPeak ? 1 : recoil * 0.6;
        impactX = zeusPose.baseX - 45;
      } else if (phase === 1) {
        zeusPose.bodyLungeX = -strikeSharp * (baseDist * 0.68);
        zeusPose.chestTwistX = -strikeSharp * 44;
        zeusPose.headOffsetX = -strikeSharp * 28;
        zeusPose.leadArmElbowX = -24 - strikeSharp * 72;
        zeusPose.leadArmElbowY = -36 - strikeSharp * 58;
        zeusPose.leadArmHandX = -58 - strikeSharp * 150;
        zeusPose.leadArmHandY = -98 - strikeSharp * 98;
        zeusPose.leadLegStepX = -24 - strikeSharp * 75;
        zeusPose.leadLegLiftY = -strikeSharp * 38;

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

      if (statuesRef.current.apollo) {
        drawPuppetWarpedStatue(ctx, statuesRef.current.apollo, apolloPose);
      }
      if (statuesRef.current.zeus) {
        drawPuppetWarpedStatue(ctx, statuesRef.current.zeus, zeusPose);
      }

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
      <img
        src="/assets/backgrounds/stage4_olympus.jpg"
        alt=""
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          filter: 'saturate(1.18) contrast(1.08) brightness(0.68)',
        }}
      />

      <canvas ref={canvasRef} className="relative z-10 w-full h-full block" />
    </div>
  );
};
