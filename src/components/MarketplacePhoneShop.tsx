import React from 'react';
import {
  calculateItemCost,
  calculateMaxAffordable,
  getNextMilestone,
  getPreviousMilestone,
  PSL_RANKS,
  ShopItemDefinition,
  UpgradeCategory,
} from '../modules/mechanics';
import { PlayerProfileData } from '../modules/profile';
import { formatLooks } from '../modules/utils';
import { UpgradeSketchArt } from './UpgradeSketchArt';

export type BuyMultiplierMode = 1 | 10 | 'MAX';

export interface MarketplacePhoneShopProps {
  profile: PlayerProfileData;
  shopCategory: UpgradeCategory;
  setShopCategory: (cat: UpgradeCategory) => void;
  buyMode: BuyMultiplierMode;
  setBuyMode: (mode: BuyMultiplierMode) => void;
  isShopMinimized: boolean;
  setIsShopMinimized: (minimized: boolean) => void;
  filteredShopItems: ShopItemDefinition[];
  bestRoiItemId: string | null;
  onBuyShopItem: (item: ShopItemDefinition) => void;
}

export const MarketplacePhoneShop: React.FC<MarketplacePhoneShopProps> = ({
  profile,
  shopCategory,
  setShopCategory,
  buyMode,
  setBuyMode,
  isShopMinimized,
  setIsShopMinimized,
  filteredShopItems,
  bestRoiItemId,
  onBuyShopItem,
}) => {
  const isClickMarket = shopCategory === 'click';
  const marketTheme: 'ozon' | 'wb' = isClickMarket ? 'ozon' : 'wb';

  const featuredItem =
    filteredShopItems.find((it) => it.id === bestRoiItemId) ||
    filteredShopItems.find(
      (it) =>
        profile.highestRankIndexReached >= Math.max(0, it.unlockAtRankIndex - 1)
    ) ||
    filteredShopItems[0];

  return (
    <div className="relative w-full select-none" style={{ perspective: '2000px' }}>
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

            {/* OLED-дисплей смартфона */}
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

              {/* Фирменная шапка маркетплейса */}
              <div
                className={`px-4 py-3 border-b transition-colors duration-200 ${
                  isClickMarket
                    ? 'bg-gradient-to-r from-[#005BFF] via-[#0047CC] to-[#1D3570] border-[#005BFF]/40'
                    : 'bg-gradient-to-r from-[#CB11AB] via-[#8E118C] to-[#481173] border-[#CB11AB]/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
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
                    const maxillaLevel = profile.perkLevels['forward_maxilla'] || 0;
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
                                isClickMarket ? 'text-[#60A5FA]' : 'text-[#E879F9]'
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
                              onClick={() => onBuyShopItem(item)}
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
                                : `${formatLooks(cost)} PSL${
                                    buyCount > 1 ? ` (×${buyCount})` : ''
                                  }`}
                            </button>
                          </div>

                          {/* Тонкая шкала прогресса до ближайшего бонуса ×2 */}
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

                {/* Нижний индикатор Home Bar */}
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
            <div className="flex items-center justify-between gap-4">
              {/* ЛЕВАЯ ЧАСТЬ ПЛАТО: Классический треугольник из 3 огромных объективов Pro */}
              <div className="relative w-[154px] h-[156px] shrink-0">
                {/* Верхний левый объектив (48MP Fusion Main Camera) */}
                <div className="absolute top-0 left-0 w-[72px] h-[72px] rounded-full p-[4px] bg-gradient-to-br from-[#FFA978] via-[#D95116] to-[#7A2503] shadow-[0_6px_14px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,225,205,0.8)]">
                  <div className="w-full h-full rounded-full p-[5px] bg-gradient-to-b from-[#1C1D22] to-[#090A0D] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    <div className="relative w-full h-full rounded-full bg-[radial-gradient(circle_at_35%_30%,#1E3A5F_0%,#0B1324_42%,#04060A_78%)] border border-white/15 flex items-center justify-center overflow-hidden">
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
                      <div className="w-6 h-6 rounded-[5px] rotate-45 bg-[#030508] ring-1 ring-emerald-400/40 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-emerald-400/45 to-white/70" />
                      </div>
                      <span className="absolute top-2 left-2.5 w-3.5 h-1.5 -rotate-30 rounded-full bg-white/35 blur-[0.4px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ПРАВАЯ ЧАСТЬ ПОЛНОШИРИННОГО ПЛАТО */}
              <div className="h-[146px] pr-1.5 flex flex-col items-center justify-between py-1 shrink-0">
                {/* Верх: Двухтональная вспышка True Tone LED Flash */}
                <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-b from-[#FFAA7A] to-[#8C2F06] shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
                  <div className="w-full h-full rounded-full bg-[radial-gradient(circle,#FFFBEB_0%,#FDE68A_48%,#F59E0B_85%,#B45309_100%)] border border-white/60 shadow-inner flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full border border-amber-300/70 bg-white/50" />
                  </div>
                </div>

                {/* Центр: Микрофон студийного качества */}
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

            {/* Центральное кольцо MagSafe + безопасная геометрическая эмблема */}
            <div className="relative z-10 my-3 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 rounded-full border-[5px] border-[#FFD3B5]/35 shadow-[0_0_25px_rgba(120,32,4,0.25),inset_0_0_16px_rgba(255,215,188,0.2)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="w-28 h-28 rounded-full border border-[#FFE4D1]/20 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-br from-[#FFE5D4] via-[#F7945E] to-[#9E3508] p-[1.5px] shadow-[0_6px_16px_rgba(80,20,2,0.45)] flex items-center justify-center">
                    <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#D84E12] to-[#8F2E05] flex items-center justify-center -rotate-45">
                      <span className="text-xs font-mono font-extrabold tracking-tighter text-[#FFF2E8]">
                        PSL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 w-1.5 h-6 rounded-full bg-[#FFD3B5]/40 shadow-inner" />
            </div>

            {/* Нижний MagSafe-картхолдер быстрого заказа */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full rounded-2xl p-3 bg-[#160B06]/75 backdrop-blur-md border border-[#FFA876]/35 shadow-[0_10px_24px_rgba(0,0,0,0.45)] space-y-2.5 cursor-default"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFB38A]">
                    MagSafe Wallet · {isClickMarket ? 'О-ЗОНА Клик' : 'ЯГОДКИ Уход'}
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
                  const maxillaLvl = profile.perkLevels['forward_maxilla'] || 0;
                  const cost = calculateItemCost(featuredItem, curLvl, 1, maxillaLvl);
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
                        onClick={() => onBuyShopItem(featuredItem)}
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
};
