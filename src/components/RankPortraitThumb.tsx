import React, { useEffect, useRef } from 'react';
import { drawRankThumbnailOnCanvas } from '../modules/renderer';

interface RankPortraitThumbProps {
  atlasImage: HTMLImageElement | null;
  rankIndex: number;
  size?: number;
  includeOriginalLabel?: boolean;
  locked?: boolean;
  className?: string;
}

export const RankPortraitThumb: React.FC<RankPortraitThumbProps> = ({
  atlasImage,
  rankIndex,
  size = 72,
  includeOriginalLabel = false,
  locked = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    drawRankThumbnailOnCanvas(canvas, atlasImage, rankIndex, includeOriginalLabel);
  }, [atlasImage, rankIndex, size, includeOriginalLabel]);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden rounded-lg border border-[#2A343D] bg-white shrink-0 ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className={`block transition-all duration-200 ${
          locked ? 'grayscale contrast-125 opacity-40 blur-[1px]' : ''
        }`}
      />
    </div>
  );
};
