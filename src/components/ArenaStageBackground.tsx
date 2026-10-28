import React from 'react';

export type ArenaLocationTier = 0 | 1 | 2 | 3;

export interface ArenaLocationMeta {
  tier: ArenaLocationTier;
  id: string;
  title: string;
  subtitle: string;
  ranksLabel: string;
  accentHex: string;
  glowRgb: string;
  imageUrl: string;
}

export const ARENA_LOCATIONS: ArenaLocationMeta[] = [
  {
    tier: 0,
    id: 'night_room',
    title: 'Ночная Комната',
    subtitle: 'Неоновый свет, гитары и панорама ночного города за окном',
    ranksLabel: 'Sub 3 – LTN',
    accentHex: '#A855F7',
    glowRgb: '168, 85, 247',
    imageUrl: '/assets/backgrounds/stage1_room.jpg',
  },
  {
    tier: 1,
    id: 'aesthetics_gym',
    title: 'Aesthetics Gym',
    subtitle: 'Тяжелая база, стальные блины и атмосфера ночной качалки',
    ranksLabel: 'MTN – HTN',
    accentHex: '#10B981',
    glowRgb: '16, 185, 129',
    imageUrl: '/assets/backgrounds/stage2_gym.jpg',
  },
  {
    tier: 2,
    id: 'sigma_penthouse',
    title: 'Пентхаус Сигмы',
    subtitle: 'Панорамные окна, огни небоскребов, камин и живые свечи',
    ranksLabel: 'Chadlite – Chad',
    accentHex: '#38BDF8',
    glowRgb: '56, 189, 248',
    imageUrl: '/assets/backgrounds/stage3_penthouse.jpg',
  },
  {
    tier: 3,
    id: 'golden_olympus',
    title: 'Золотой Олимп',
    subtitle: 'Мраморные колонны, золотые своды и солнечные лучи пантеона',
    ranksLabel: 'True Adam',
    accentHex: '#FBBF24',
    glowRgb: '251, 191, 36',
    imageUrl: '/assets/backgrounds/stage4_olympus.jpg',
  },
];

export function getLocationTierByRankIndex(rankIndex: number): ArenaLocationTier {
  if (rankIndex >= 7) return 3;
  if (rankIndex >= 5) return 2;
  if (rankIndex >= 3) return 1;
  return 0;
}

interface ArenaStageBackgroundProps {
  tier: ArenaLocationTier;
  comboRatio: number; // 0..1
  isPeakAura: boolean;
}

export const ArenaStageBackground: React.FC<ArenaStageBackgroundProps> = ({
  tier,
  comboRatio,
  isPeakAura,
}) => {
  const activeMeta = ARENA_LOCATIONS[tier];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Слои HD-фотографий локаций с плавным кроссфейдом (без квадратных артефактов и дерганий при кликах) */}
      {ARENA_LOCATIONS.map((loc) => {
        const isActive = loc.tier === tier;
        return (
          <div
            key={loc.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={loc.imageUrl}
              alt=""
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* Мягкое верхнее атмосферное свечение в цвете локации */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[560px] transition-opacity duration-500"
        style={{
          opacity: 0.25 + comboRatio * 0.25 + (isPeakAura ? 0.12 : 0),
          background: `radial-gradient(ellipse at 50% 0%, rgba(${activeMeta.glowRgb}, 0.35) 0%, rgba(${activeMeta.glowRgb}, 0.08) 50%, transparent 75%)`,
        }}
      />

      {/* Деликатная кинематографичная виньетка (картинка остается яркой и читаемой, а UI контрастным) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 48%, rgba(8, 12, 18, 0.10) 0%, rgba(8, 12, 18, 0.34) 65%, rgba(6, 9, 14, 0.64) 100%),
            linear-gradient(180deg, rgba(8, 12, 18, 0.32) 0%, transparent 18%, transparent 82%, rgba(8, 12, 18, 0.52) 100%)
          `,
        }}
      />
    </div>
  );
};
