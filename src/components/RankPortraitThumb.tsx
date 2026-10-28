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
      className={`relative overflow-hidden rounded-xl border border-[#2A343D] bg-white shrink-0 select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className={`block transition-all duration-300 ${
          locked ? 'brightness-[0.14] contrast-200 saturate-0 opacity-85 scale-[0.98]' : ''
        }`}
      />
      {locked && size >= 64 && (
        <div className="pointer-events-none absolute inset-0 bg-slate-950/35 flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-900/90 border border-white/20 flex items-center justify-center shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-slate-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
