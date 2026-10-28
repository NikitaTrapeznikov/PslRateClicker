import React from 'react';

interface UpgradeSketchArtProps {
  itemId: string;
  locked?: boolean;
  marketplaceTheme?: 'ozon' | 'wb';
  isHotDeal?: boolean;
}

/**
 * Рисованные ч/б иллюстрации (в едином скетч-вайбе с референсом PSL)
 * для каждого из 14 улучшений магазина (молоток, мази, мьюинг, гуаша, лед, мезороллер, хирургия).
 */
export const UpgradeSketchArt: React.FC<UpgradeSketchArtProps> = ({
  itemId,
  locked = false,
  marketplaceTheme,
  isHotDeal = false,
}) => {
  const frameBorderClass =
    marketplaceTheme === 'ozon'
      ? isHotDeal
        ? 'border-[#F91155] shadow-[0_0_12px_rgba(249,17,85,0.28)]'
        : 'border-[#005BFF]/60'
      : marketplaceTheme === 'wb'
      ? isHotDeal
        ? 'border-[#F43F5E] shadow-[0_0_12px_rgba(203,17,171,0.32)]'
        : 'border-[#CB11AB]/60'
      : 'border-[#2A343D]';

  return (
    <div
      className={`relative w-14 h-14 rounded-xl border-2 ${frameBorderClass} bg-white flex items-center justify-center overflow-hidden shrink-0 transition-colors duration-200 ${
        locked ? 'grayscale opacity-45' : ''
      }`}
    >
      {/* Фирменный уголок витрины (кобальт/коралл для Клик-маркета или ягодно-пурпурный для Уход-маркета) */}
      {!locked && marketplaceTheme && (
        <div
          className={`pointer-events-none absolute top-0 left-0 w-3.5 h-3.5 rounded-br-md ${
            marketplaceTheme === 'ozon'
              ? isHotDeal
                ? 'bg-[#F91155]'
                : 'bg-[#005BFF]'
              : isHotDeal
              ? 'bg-[#F43F5E]'
              : 'bg-[#CB11AB]'
          }`}
        />
      )}
      <svg
        viewBox="0 0 64 64"
        className="w-12 h-12 text-slate-900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Тонкая фоновая штриховка в стиле анатомического скетча */}
        <path
          d="M4 12H60M4 52H60M12 4V60M52 4V60"
          stroke="#E2E8F0"
          strokeWidth="0.75"
          strokeDasharray="2 2"
        />

        {itemId === 'mewing_posture' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Профиль нижней трети лица и стрелка прижатия языка к нёбу */}
            <path
              d="M16 12C20 18 22 24 18 30C15 34 19 37 22 39C19 42 21 47 26 50C33 53 44 49 48 42"
              strokeWidth="2.2"
            />
            <path
              d="M25 32C32 26 42 26 48 32"
              strokeWidth="2"
              strokeDasharray="2 2"
            />
            <path
              d="M36 42V29M36 29L32 33M36 29L40 33"
              stroke="#059669"
              strokeWidth="2.2"
            />
          </g>
        )}

        {itemId === 'mastic_gum' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Кристаллы греческой смолы мастики и контур жевательной мышцы */}
            <polygon
              points="20,24 30,16 42,22 38,36 24,38"
              fill="#F1F5F9"
              strokeWidth="2.2"
            />
            <path d="M30 16L32 28L42 22M24 38L32 28" strokeWidth="1.4" />
            <circle cx="44" cy="42" r="8" fill="#E2E8F0" strokeWidth="2" />
            <path d="M40 40L46 44M14 46L22 44" strokeWidth="1.5" />
          </g>
        )}

        {itemId === 'jade_guasha' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Фигурный нефритовый скребок Гуаша с линиями лимфодренажа */}
            <path
              d="M18 44C14 34 20 18 32 16C38 15 40 22 45 20C50 18 52 28 46 38C40 48 24 52 18 44Z"
              fill="#D1FAE5"
              strokeWidth="2.2"
            />
            <path d="M25 38C30 32 36 28 41 26" strokeWidth="1.5" />
            <path
              d="M14 24C16 19 20 15 25 13"
              stroke="#059669"
              strokeWidth="1.8"
            />
          </g>
        )}

        {itemId === 'orthopedic_hammer' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Хирургический молоток для бонсмэшинга с импульсом удара */}
            <line x1="20" y1="48" x2="38" y2="24" strokeWidth="3.2" />
            <rect
              x="27"
              y="13"
              width="24"
              height="11"
              rx="2"
              transform="rotate(36 39 18)"
              fill="#1E293B"
              strokeWidth="2"
            />
            {/* Вспышка удара по кости */}
            <path
              d="M46 34L54 32M48 40L55 43M42 43L45 50"
              stroke="#D97706"
              strokeWidth="2.2"
            />
          </g>
        )}

        {itemId === 'jaw_expander' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Челюстной эспандер с пружинным сопротивлением */}
            <rect
              x="16"
              y="20"
              width="32"
              height="24"
              rx="7"
              fill="#E2E8F0"
              strokeWidth="2.2"
            />
            <path
              d="M23 26H41M23 38H41M26 26L30 38L34 26L38 38"
              strokeWidth="1.8"
            />
          </g>
        )}

        {itemId === 'smas_ultrasound' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Манипула ультразвукового SMAS-аппарата и волны */}
            <path
              d="M24 48L28 28H36L40 48Z"
              fill="#F1F5F9"
              strokeWidth="2.2"
            />
            <rect x="25" y="23" width="14" height="5" rx="1.5" fill="#0F172A" />
            <path
              d="M22 18C28 13 36 13 42 18M18 13C26 7 38 7 46 13"
              stroke="#059669"
              strokeWidth="2"
            />
          </g>
        )}

        {itemId === 'panthenol_ointment' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Классический аптечный тюбик мази с крестом */}
            <path
              d="M22 18H42L38 46H26L22 18Z"
              fill="#F8FAFC"
              strokeWidth="2.2"
            />
            <rect x="27" y="46" width="10" height="6" rx="1" fill="#0F172A" />
            <line x1="20" y1="18" x2="44" y2="18" strokeWidth="2.5" />
            <path
              d="M32 26V36M27 31H37"
              stroke="#059669"
              strokeWidth="2.4"
            />
          </g>
        )}

        {itemId === 'ice_hooding' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Кубик льда с морозными гранями */}
            <polygon
              points="32,12 49,21 49,41 32,50 15,41 15,21"
              fill="#E0F2FE"
              strokeWidth="2.2"
            />
            <path
              d="M15 21L32 30L49 21M32 30V50"
              strokeWidth="1.8"
            />
            <path d="M22 25L26 27M40 36L44 33" strokeWidth="1.5" />
          </g>
        )}

        {itemId === 'retinol_ointment' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Дерматологическая мазь Ретинол 0.1% и сияние кожи */}
            <rect
              x="21"
              y="22"
              width="22"
              height="28"
              rx="3"
              fill="#FEF3C7"
              strokeWidth="2.2"
            />
            <path d="M26 22V16H38V22" fill="#0F172A" strokeWidth="2" />
            <text
              x="32"
              y="39"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#0F172A"
              stroke="none"
            >
              A+
            </text>
            <path d="M48 16L50 20L54 22L50 24L48 28L46 24L42 22L46 20Z" fill="#D97706" stroke="none" />
          </g>
        )}

        {itemId === 'minoxidil_roller' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Титановый мезороллер с микроиглами и флакон сыворотки */}
            <circle cx="28" cy="24" r="9" fill="#E2E8F0" strokeWidth="2.2" />
            <path
              d="M28 12V15M28 33V36M16 24H19M37 24H40M19 15L22 18M34 30L37 33M37 15L34 18M22 30L19 33"
              strokeWidth="1.8"
            />
            <path d="M28 33L44 50" strokeWidth="3.2" />
          </g>
        )}

        {itemId === 'peptide_copper_ointment' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Баночка медной пептидной мази GHK-Cu с гексагоном пептида */}
            <rect
              x="16"
              y="28"
              width="32"
              height="20"
              rx="4"
              fill="#E0E7FF"
              strokeWidth="2.2"
            />
            <rect
              x="19"
              y="22"
              width="26"
              height="6"
              rx="1.5"
              fill="#1E293B"
              strokeWidth="2"
            />
            <polygon
              points="32,32 37,35 37,41 32,44 27,41 27,35"
              stroke="#059669"
              strokeWidth="1.8"
            />
          </g>
        )}

        {itemId === 'gym_leanmax' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Тяжелая гантель и острый контур впалых скул */}
            <line x1="14" y1="32" x2="50" y2="32" strokeWidth="3" />
            <rect x="16" y="21" width="6" height="22" rx="1.5" fill="#1E293B" strokeWidth="2" />
            <rect x="11" y="24" width="4" height="16" rx="1" fill="#475569" strokeWidth="1.8" />
            <rect x="42" y="21" width="6" height="22" rx="1.5" fill="#1E293B" strokeWidth="2" />
            <rect x="49" y="24" width="4" height="16" rx="1" fill="#475569" strokeWidth="1.8" />
          </g>
        )}

        {itemId === 'mse_expander' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Ортодонтический небный дистрактор MSE с винтом расширения */}
            <circle cx="32" cy="32" r="7" fill="#F1F5F9" strokeWidth="2.2" />
            <path
              d="M25 28L15 20M25 36L15 44M39 28L49 20M39 36L49 44"
              strokeWidth="2.4"
            />
            <path
              d="M20 32H44M20 32L24 29M44 32L40 29"
              stroke="#D97706"
              strokeWidth="2"
            />
          </g>
        )}

        {itemId === 'bimax_implants' && (
          <g stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round">
            {/* Хирургическая разметка углов челюсти 120° и титановой пластины */}
            <path
              d="M16 18L20 38L32 48L44 38L48 18"
              fill="#F8FAFC"
              strokeWidth="2.4"
            />
            <path
              d="M19 36L32 45L45 36"
              stroke="#059669"
              strokeWidth="2"
              strokeDasharray="3 2"
            />
            <circle cx="21" cy="36" r="2.2" fill="#D97706" stroke="none" />
            <circle cx="43" cy="36" r="2.2" fill="#D97706" stroke="none" />
            <circle cx="32" cy="45" r="2.2" fill="#D97706" stroke="none" />
          </g>
        )}
      </svg>
    </div>
  );
};
