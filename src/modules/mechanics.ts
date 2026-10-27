/**
 * Модуль игровых механик и 24-часового математического баланса:
 * - 8 стадий PSL из загруженного атласа (/assets/aistudio/image_998de055.png)
 * - Магазин улучшений: Ручной клик (молоток для бонсмэшинга, мьюинг, гуаша) и Пассивный уход (мази, зал, хирургия)
 * - Многоступенчатая система Поколений (Реборн) и наследственные перки внешности (ДНК)
 */

export interface SpriteCropUV {
  /** Нормализованные координаты (0..1) относительно ширины и высоты референс-атласа */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PSLRankDefinition {
  id: string;
  index: number;
  code: string;
  title: string;
  subtitle: string;
  pslScoreLabel: string;
  requiredLooks: number;
  rankMultiplier: number;
  description: string;
  anatomicalNotes: string;
  cropUV: SpriteCropUV;
  cropWithLabelUV: SpriteCropUV;
}

/**
 * 8 канонических рангов из загруженного изображения /public/assets/aistudio/image_998de055.png
 * Сбалансировано под ~24 часа полного прохождения со сменой поколений.
 */
export const PSL_RANKS: PSLRankDefinition[] = [
  {
    id: 'sub3',
    index: 0,
    code: 'sub 3',
    title: 'Sub 3',
    subtitle: 'Критическая асимметрия',
    pslScoreLabel: '1.8 – 2.9 PSL',
    requiredLooks: 0,
    rankMultiplier: 1.0,
    description: 'Исходное состояние: ротовое дыхание, лимфатические отеки век, слабый тонус челюсти и проблемная кожа.',
    anatomicalNotes: 'Опущенный кончик языка · Ретрузия нижней трети · Отечность периорбитальной зоны',
    cropUV: { x: 0.03, y: 0.03, w: 0.28, h: 0.245 },
    cropWithLabelUV: { x: 0.02, y: 0.02, w: 0.30, h: 0.305 },
  },
  {
    id: 'sub5',
    index: 1,
    code: 'sub 5',
    title: 'Sub 5',
    subtitle: 'Ниже среднего',
    pslScoreLabel: '3.2 – 4.2 PSL',
    requiredLooks: 600,
    rankMultiplier: 1.35,
    description: 'Уходят первичные воспаления и сильная отечность. Освоена базовая осанка шеи и носовое дыхание.',
    anatomicalNotes: 'Первичный лимфодренаж · Выравнивание тона эпидермиса · Начало мьюинга',
    cropUV: { x: 0.365, y: 0.03, w: 0.28, h: 0.245 },
    cropWithLabelUV: { x: 0.355, y: 0.02, w: 0.30, h: 0.305 },
  },
  {
    id: 'ltn',
    index: 2,
    code: 'ltn',
    title: 'LTN',
    subtitle: 'Low-Tier Normie',
    pslScoreLabel: '4.3 – 4.8 PSL',
    requiredLooks: 8_500,
    rankMultiplier: 1.8,
    description: 'Начальный нормальный уровень: чистая кожа благодаря мазям, аккуратная стрижка и тонус жевательных мышц.',
    anatomicalNotes: 'Нейтральный наклон глаз · Базовый рельеф нижней челюсти · Ухоженная кожа',
    cropUV: { x: 0.695, y: 0.03, w: 0.275, h: 0.245 },
    cropWithLabelUV: { x: 0.685, y: 0.02, w: 0.295, h: 0.305 },
  },
  {
    id: 'mtn',
    index: 3,
    code: 'mtn',
    title: 'MTN',
    subtitle: 'Mid-Tier Normie',
    pslScoreLabel: '5.0 – 5.4 PSL',
    requiredLooks: 95_000,
    rankMultiplier: 2.5,
    description: 'Гармоничный средний уровень: сбалансированные трети лица, плотная линия бровей и здоровый румянец.',
    anatomicalNotes: 'Симметричные пропорции · Снижение подкожного жира до 15% · Плотные брови',
    cropUV: { x: 0.03, y: 0.345, w: 0.28, h: 0.25 },
    cropWithLabelUV: { x: 0.02, y: 0.34, w: 0.30, h: 0.305 },
  },
  {
    id: 'htn',
    index: 4,
    code: 'htn',
    title: 'HTN',
    subtitle: 'High-Tier Normie',
    pslScoreLabel: '5.6 – 6.1 PSL',
    requiredLooks: 1_100_000,
    rankMultiplier: 3.6,
    description: 'Заметная привлекательность: четкая скуловая дуга, выраженный подбородок и объемная текстурная укладка.',
    anatomicalNotes: 'Положительный кантальный наклон · Выраженные массетеры · Процент жира ~12%',
    cropUV: { x: 0.365, y: 0.345, w: 0.285, h: 0.25 },
    cropWithLabelUV: { x: 0.355, y: 0.34, w: 0.305, h: 0.305 },
  },
  {
    id: 'chadlite',
    index: 5,
    code: 'chadlite',
    title: 'Chadlite',
    subtitle: 'Модельная структура (Открывает Реборн)',
    pslScoreLabel: '6.3 – 6.9 PSL',
    requiredLooks: 15_000_000,
    rankMultiplier: 5.5,
    description: 'Порог генетического престижа! Острые углы челюсти, плотная посадка верхнего века и рельефные скулы.',
    anatomicalNotes: 'Гониальный угол 122° · Впалые щеки · Доступна Смена Поколения (ДНК)',
    cropUV: { x: 0.685, y: 0.34, w: 0.295, h: 0.255 },
    cropWithLabelUV: { x: 0.675, y: 0.335, w: 0.31, h: 0.31 },
  },
  {
    id: 'chad',
    index: 6,
    code: 'chad',
    title: 'Chad',
    subtitle: 'Генетический пик',
    pslScoreLabel: '7.2 – 7.9 PSL',
    requiredLooks: 250_000_000,
    rankMultiplier: 9.5,
    description: 'Эталонная костная архитектура: широкая бизигоматическая дуга, охотничий взгляд и безупречный профиль.',
    anatomicalNotes: 'Hunter Eyes · Выдвинутая максилла · Соотношение ширины к высоте лица 2.0+',
    cropUV: { x: 0.125, y: 0.64, w: 0.30, h: 0.26 },
    cropWithLabelUV: { x: 0.11, y: 0.635, w: 0.33, h: 0.33 },
  },
  {
    id: 'true_adam',
    index: 7,
    code: 'true adam',
    title: 'True Adam',
    subtitle: 'Абсолютное совершенство',
    pslScoreLabel: '8.5+ PSL · Божественный золотой стандарт',
    requiredLooks: 5_000_000_000,
    rankMultiplier: 18.0,
    description: 'Легендарная вершина шкалы PSL. Совершенная симметрия золотого сечения, увековеченная в поколениях.',
    anatomicalNotes: 'Абсолютная гармония антропометрии · Вечный статус Истинного Адама',
    cropUV: { x: 0.56, y: 0.64, w: 0.35, h: 0.26 },
    cropWithLabelUV: { x: 0.545, y: 0.635, w: 0.38, h: 0.335 },
  },
];

export type UpgradeCategory = 'click' | 'passive';

export interface ShopItemDefinition {
  id: string;
  name: string;
  category: UpgradeCategory;
  tag: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  /** Прирост к клику за уровень (для 'click') */
  baseClickBonus: number;
  /** Прирост к пассивному доходу в секунду (для 'passive') */
  basePassiveBonus: number;
  /** Доля от пассивного дохода (0..1), добавляемая к клику за уровень */
  passiveToClickSynergy?: number;
  /** Бонус к шансу крита молотка за уровень (например 0.015 = +1.5%) */
  critChanceBonus?: number;
  /** Бонус к множителю крита молотка за уровень */
  critMultiplierBonus?: number;
  unlockAtRankIndex: number;
}

/**
 * Полный каталог магазина улучшений (Молоток, мази, уход, зал, хирургия).
 */
export const SHOP_ITEMS: ShopItemDefinition[] = [
  // === АКТИВНЫЕ ПРАКТИКИ (РУЧНОЙ КЛИК) ===
  {
    id: 'mewing_posture',
    name: 'Вакуумный Мьюинг',
    category: 'click',
    tag: 'Базовая техника',
    description: 'Плотная фиксация всей спинки языка на нёбе. Увеличивает базовую силу каждого клика.',
    baseCost: 15,
    costGrowth: 1.15,
    baseClickBonus: 1.5,
    basePassiveBonus: 0,
    unlockAtRankIndex: 0,
  },
  {
    id: 'mastic_gum',
    name: 'Греческая смола Мастика',
    category: 'click',
    tag: 'Жевательные мышцы',
    description: 'Твердая смола с острова Хиос для гипертрофии массетеров и расширения углов нижней челюсти.',
    baseCost: 140,
    costGrowth: 1.16,
    baseClickBonus: 9,
    basePassiveBonus: 0,
    unlockAtRankIndex: 0,
  },
  {
    id: 'jade_guasha',
    name: 'Нефритовый скребок Гуаша',
    category: 'click',
    tag: 'Лимфодренаж + Синергия',
    description: 'Выводит застойную жидкость и добавляет +1.2% от вашего пассивного дохода в секунду к каждому клику.',
    baseCost: 1_250,
    costGrowth: 1.17,
    baseClickBonus: 48,
    basePassiveBonus: 0,
    passiveToClickSynergy: 0.012,
    unlockAtRankIndex: 1,
  },
  {
    id: 'orthopedic_hammer',
    name: 'Молоток для бонсмэшинга',
    category: 'click',
    tag: 'Критический импульс',
    description: 'Микро-импульсы по закону Вольфа для уплотнения скуловой кости. Повышает шанс и множитель крита!',
    baseCost: 14_500,
    costGrowth: 1.18,
    baseClickBonus: 320,
    basePassiveBonus: 0,
    critChanceBonus: 0.018,
    critMultiplierBonus: 0.45,
    unlockAtRankIndex: 2,
  },
  {
    id: 'jaw_expander',
    name: 'Миофункциональный эспандер',
    category: 'click',
    tag: 'Силовой тонус',
    description: 'Изометрическая нагрузка на переднюю группу мышц шеи и подбородка без риска для сустава.',
    baseCost: 190_000,
    costGrowth: 1.17,
    baseClickBonus: 2_600,
    basePassiveBonus: 0,
    passiveToClickSynergy: 0.018,
    unlockAtRankIndex: 3,
  },
  {
    id: 'smas_ultrasound',
    name: 'Ультразвуковой SMAS-аппарат',
    category: 'click',
    tag: 'Глубокий лифтинг',
    description: 'Фокусированный импульс для мгновенного сокращения связочного каркаса лица при каждом клике.',
    baseCost: 3_200_000,
    costGrowth: 1.18,
    baseClickBonus: 28_000,
    basePassiveBonus: 0,
    critMultiplierBonus: 0.85,
    unlockAtRankIndex: 4,
  },

  // === ПАССИВНЫЙ УХОД (МАЗИ, СЫВОРОТКИ, ЗАЛ И ОПЕРАЦИИ) ===
  {
    id: 'panthenol_ointment',
    name: 'Увлажняющая мазь с пантенолом',
    category: 'passive',
    tag: 'Аптечная мазь',
    description: 'Восстанавливает защитный барьер кожи, убирает шелушение и дает стабильный прирост очков внешности.',
    baseCost: 25,
    costGrowth: 1.15,
    baseClickBonus: 0,
    basePassiveBonus: 2.2,
    unlockAtRankIndex: 0,
  },
  {
    id: 'ice_hooding',
    name: 'Ледяной компресс (Ice Hooding)',
    category: 'passive',
    tag: 'Крио-уход',
    description: 'Криомассаж кубиками льда с кофеином сужает сосуды и формирует плотную посадку верхних век.',
    baseCost: 260,
    costGrowth: 1.155,
    baseClickBonus: 0,
    basePassiveBonus: 16,
    unlockAtRankIndex: 0,
  },
  {
    id: 'retinol_ointment',
    name: 'Ретиноловая мазь 0.1%',
    category: 'passive',
    tag: 'Дерматологическая мазь',
    description: 'Золотой стандарт обновления эпидермиса: выравнивает микрорельеф и создает эффект «стеклянной кожи».',
    baseCost: 2_800,
    costGrowth: 1.16,
    baseClickBonus: 0,
    basePassiveBonus: 115,
    unlockAtRankIndex: 1,
  },
  {
    id: 'minoxidil_roller',
    name: 'Мазь-активатор + мезороллер',
    category: 'passive',
    tag: 'Густота бровей и волос',
    description: 'Стимулирует спящие фолликулы для формирования густых низко посаженных бровей и четкой линии лба.',
    baseCost: 32_000,
    costGrowth: 1.165,
    baseClickBonus: 0,
    basePassiveBonus: 860,
    unlockAtRankIndex: 2,
  },
  {
    id: 'peptide_copper_ointment',
    name: 'Пептидная мазь GHK-Cu',
    category: 'passive',
    tag: 'Синтез коллагена',
    description: 'Медные трипептиды нового поколения уплотняют дерму и подчеркивают костные линии скул.',
    baseCost: 380_000,
    costGrowth: 1.17,
    baseClickBonus: 0,
    basePassiveBonus: 6_800,
    unlockAtRankIndex: 3,
  },
  {
    id: 'gym_leanmax',
    name: 'Сушка в зале до 10% жира',
    category: 'passive',
    tag: 'Рекомпозиция тела',
    description: 'Силовой тренинг, дефицит калорий и баланс калия/натрия открывают настоящие впалые щеки (Hollow Cheeks).',
    baseCost: 4_800_000,
    costGrowth: 1.175,
    baseClickBonus: 0,
    basePassiveBonus: 58_000,
    unlockAtRankIndex: 4,
  },
  {
    id: 'mse_expander',
    name: 'Небный расширитель MSE',
    category: 'passive',
    tag: 'Ортодонтия',
    description: 'Скелетное расширение верхней челюсти увеличивает скуловую ширину и поддержку подглазничной зоны.',
    baseCost: 65_000_000,
    costGrowth: 1.18,
    baseClickBonus: 0,
    basePassiveBonus: 520_000,
    unlockAtRankIndex: 5,
  },
  {
    id: 'bimax_implants',
    name: 'Бимакс-остеотомия + импланты',
    category: 'passive',
    tag: 'Реконструкция профиля',
    description: 'Выдвижение обеих челюстей вперед с индивидуальными титановыми углами для достижения ранга True Adam.',
    baseCost: 950_000_000,
    costGrowth: 1.185,
    baseClickBonus: 0,
    basePassiveBonus: 5_400_000,
    unlockAtRankIndex: 6,
  },
];

export interface DNAPerkDefinition {
  id: string;
  name: string;
  traitCode: string;
  description: string;
  maxLevel: number;
  baseDnaCost: number;
  costMultiplier: number;
  effectSummary: (level: number) => string;
}

/**
 * 5 уникальных наследственных перков внешности при многоступенчатом Реборне (Смене Поколений).
 */
export const DNA_PERKS: DNAPerkDefinition[] = [
  {
    id: 'hunter_eyes',
    name: 'Охотничий прищур (Hunter Eyes)',
    traitCode: 'ГЛАЗА',
    description: 'Глубокая посадка орбит и положительный кантальный наклон. Увеличивает силу ручного клика на +60% за уровень.',
    maxLevel: 15,
    baseDnaCost: 1,
    costMultiplier: 1.6,
    effectSummary: (lvl) => `+${lvl * 60}% к силе клика`,
  },
  {
    id: 'hollow_cheeks',
    name: 'Впалые щеки (Hollow Cheeks)',
    traitCode: 'СКУЛЫ',
    description: 'Генетически низкий объем комков Биша и высокая скуловая дуга. Увеличивает весь пассивный доход на +50% за уровень.',
    maxLevel: 15,
    baseDnaCost: 1,
    costMultiplier: 1.6,
    effectSummary: (lvl) => `+${lvl * 50}% к пассивному доходу`,
  },
  {
    id: 'gonial_angle',
    name: 'Угол челюсти 120° (Gonial Mastery)',
    traitCode: 'ЧЕЛЮСТЬ',
    description: 'Идеальный наклон ветви нижней челюсти. Повышает базовый шанс крита молотка на +3% и крит-множитель на +1.2x за уровень.',
    maxLevel: 10,
    baseDnaCost: 2,
    costMultiplier: 1.75,
    effectSummary: (lvl) => `+${lvl * 3}% шанс крита · +${(lvl * 1.2).toFixed(1)}x урон крита`,
  },
  {
    id: 'forward_maxilla',
    name: 'Выдвинутая максилла (Maxilla Projection)',
    traitCode: 'ПРОФИЛЬ',
    description: 'Доминантное развитие средней трети лица снижает стоимость всех мазей, практик и операций на 7% за уровень (до -56%).',
    maxLevel: 8,
    baseDnaCost: 2,
    costMultiplier: 1.85,
    effectSummary: (lvl) => `-${Math.min(56, lvl * 7)}% цена предметов в магазине`,
  },
  {
    id: 'adams_lineage',
    name: 'Геном Истинного Адама (Adam Lineage)',
    traitCode: 'ДИНАСТИЯ',
    description: 'Наследственная память поколений: +35% к оффлайн-доходу и +1500 стартовых очков при новом реборне за уровень.',
    maxLevel: 10,
    baseDnaCost: 3,
    costMultiplier: 1.9,
    effectSummary: (lvl) => `+${lvl * 35}% оффлайн-доход · старт с +${lvl * 1500} PSL`,
  },
];

export const GENERATION_TITLES: string[] = [
  'Поколение I · Искатель Формы',
  'Поколение II · Наследник Пропорций',
  'Поколение III · Хранитель Рельефа',
  'Поколение IV · Доминантный Фенотип',
  'Поколение V · Патриарх Эстетики',
  'Поколение VI · Скульптор Скул',
  'Поколение VII · Архитектор Золотого Сечения',
  'Поколение VIII+ · Вечная Династия Адама',
];

/**
 * Пороговые уровни владения предметом, на которых его эффективность удваивается (для 24-часового интереса).
 */
export const ITEM_MILESTONES = [10, 25, 50, 100, 150, 200];

export function getMilestoneMultiplier(level: number): number {
  let mult = 1;
  for (const m of ITEM_MILESTONES) {
    if (level >= m) mult *= 2;
  }
  return mult;
}

export function getNextMilestone(level: number): number | null {
  for (const m of ITEM_MILESTONES) {
    if (level < m) return m;
  }
  return null;
}

/**
 * Рассчитывает стоимость покупки `count` уровней предмета с учетом скидки перка Forward Maxilla.
 */
export function calculateItemCost(
  item: ShopItemDefinition,
  currentLevel: number,
  count: number,
  maxillaPerkLevel: number
): number {
  const discountFactor = Math.max(0.44, 1 - maxillaPerkLevel * 0.07);
  const r = item.costGrowth;
  const firstCost = item.baseCost * Math.pow(r, currentLevel);
  if (count <= 1) {
    return Math.ceil(firstCost * discountFactor);
  }
  const geometricSum = firstCost * ((Math.pow(r, count) - 1) / (r - 1));
  return Math.ceil(geometricSum * discountFactor);
}

/**
 * Вычисляет максимальное количество уровней предмета, которое можно купить на `availableLooks`.
 */
export function calculateMaxAffordable(
  item: ShopItemDefinition,
  currentLevel: number,
  availableLooks: number,
  maxillaPerkLevel: number
): { count: number; totalCost: number } {
  const oneCost = calculateItemCost(item, currentLevel, 1, maxillaPerkLevel);
  if (availableLooks < oneCost) {
    return { count: 1, totalCost: oneCost };
  }

  let count = 1;
  let totalCost = oneCost;
  while (count < 250) {
    const nextCost = calculateItemCost(item, currentLevel, count + 1, maxillaPerkLevel);
    if (nextCost > availableLooks) break;
    count++;
    totalCost = nextCost;
  }
  return { count, totalCost };
}

/**
 * Вычисляет стоимость следующего уровня ДНК-перка.
 */
export function calculatePerkDnaCost(perk: DNAPerkDefinition, currentLevel: number): number {
  if (currentLevel >= perk.maxLevel) return Infinity;
  return Math.ceil(perk.baseDnaCost * Math.pow(perk.costMultiplier, currentLevel));
}

/**
 * Определяет текущий ранг PSL по накопленным очкам за текущее поколение.
 */
export function getCurrentRank(currentGenerationLooks: number): PSLRankDefinition {
  let active = PSL_RANKS[0];
  for (const rank of PSL_RANKS) {
    if (currentGenerationLooks >= rank.requiredLooks) {
      active = rank;
    } else {
      break;
    }
  }
  return active;
}

export function getNextRank(currentRankIndex: number): PSLRankDefinition | null {
  if (currentRankIndex + 1 < PSL_RANKS.length) {
    return PSL_RANKS[currentRankIndex + 1];
  }
  return null;
}

/**
 * Рассчитывает количество Очков ДНК, которые игрок получит при Смене Поколения (Реборне).
 * Реборн открывается начиная с ранга Chadlite (15,000,000 очков в текущем поколении).
 */
export function calculatePendingRebirthDNA(
  currentRunTotalLooks: number,
  generation: number
): number {
  const chadliteThreshold = PSL_RANKS[5].requiredLooks; // 15,000,000
  if (currentRunTotalLooks < chadliteThreshold) return 0;

  const base = Math.pow(currentRunTotalLooks / 10_000_000, 0.52);
  const genBonus = 1 + (generation - 1) * 0.15;
  return Math.max(1, Math.floor(base * genBonus));
}

export interface ComputedStats {
  currentRank: PSLRankDefinition;
  nextRank: PSLRankDefinition | null;
  progressToNextRank: number; // 0..100
  generationMultiplier: number;
  rewardedBoostMultiplier: number;
  mewingComboMultiplier: number;
  passivePerSecond: number;
  clickPower: number;
  critChance: number; // 0..0.65
  critMultiplier: number;
  pendingRebirthDNA: number;
  canRebirth: boolean;
}

/**
 * Главная чистая функция расчета всех производных показателей экономики.
 */
export function computePlayerStats(params: {
  currentRunTotalLooks: number;
  generation: number;
  itemLevels: Record<string, number>;
  perkLevels: Record<string, number>;
  mewingCombo: number; // 0..100
  rewardedBoostRemainingSec: number;
}): ComputedStats {
  const {
    currentRunTotalLooks,
    generation,
    itemLevels,
    perkLevels,
    mewingCombo,
    rewardedBoostRemainingSec,
  } = params;

  const currentRank = getCurrentRank(currentRunTotalLooks);
  const nextRank = getNextRank(currentRank.index);

  let progressToNextRank = 100;
  if (nextRank) {
    const span = nextRank.requiredLooks - currentRank.requiredLooks;
    const progressed = currentRunTotalLooks - currentRank.requiredLooks;
    progressToNextRank = Math.max(0, Math.min(100, (progressed / span) * 100));
  }

  // Множитель поколения (+40% за каждое новое поколение)
  const generationMultiplier = 1 + (generation - 1) * 0.4;

  // Буст за просмотр рекламы Яндекс Игр (x2)
  const rewardedBoostMultiplier = rewardedBoostRemainingSec > 0 ? 2.0 : 1.0;

  // Комбо удержания ритма мьюинга (до +75% к доходу и клику)
  const maxComboBonus = 0.75 * (1 + (perkLevels['adams_lineage'] || 0) * 0.2);
  const mewingComboMultiplier = 1 + (Math.min(100, Math.max(0, mewingCombo)) / 100) * maxComboBonus;

  // Перки ДНК
  const hunterEyesMultiplier = 1 + (perkLevels['hunter_eyes'] || 0) * 0.6;
  const hollowCheeksMultiplier = 1 + (perkLevels['hollow_cheeks'] || 0) * 0.5;
  const gonialLevel = perkLevels['gonial_angle'] || 0;

  // 1. Считаем базовый пассивный доход от мазей, ухода, зала и операций
  let rawPassive = 0;
  let rawClick = 1; // Базовый клик = 1 PSL
  let synergyRate = 0;
  let hammerCritChance = 0.04; // Базовый 4% шанс крита
  let hammerCritMult = 3.0; // Базовый x3 крит

  for (const item of SHOP_ITEMS) {
    const lvl = itemLevels[item.id] || 0;
    if (lvl <= 0) continue;

    const milestoneMult = getMilestoneMultiplier(lvl);

    if (item.category === 'passive') {
      rawPassive += item.basePassiveBonus * lvl * milestoneMult;
    } else {
      rawClick += item.baseClickBonus * lvl * milestoneMult;
    }

    if (item.passiveToClickSynergy) {
      synergyRate += item.passiveToClickSynergy * lvl;
    }
    if (item.critChanceBonus) {
      hammerCritChance += item.critChanceBonus * lvl;
    }
    if (item.critMultiplierBonus) {
      hammerCritMult += item.critMultiplierBonus * lvl;
    }
  }

  const globalMultiplier =
    currentRank.rankMultiplier *
    generationMultiplier *
    rewardedBoostMultiplier *
    mewingComboMultiplier;

  const passivePerSecond = rawPassive * hollowCheeksMultiplier * globalMultiplier;

  // Синергия от Гуаша и эспандера добавляет % от пассивного дохода к клику
  const synergyClickBonus = passivePerSecond * Math.min(0.35, synergyRate);
  const clickPower =
    rawClick * hunterEyesMultiplier * globalMultiplier + synergyClickBonus;

  const critChance = Math.min(0.6, hammerCritChance + gonialLevel * 0.03);
  const critMultiplier = hammerCritMult + gonialLevel * 1.2;

  const pendingRebirthDNA = calculatePendingRebirthDNA(currentRunTotalLooks, generation);
  const canRebirth = pendingRebirthDNA > 0;

  return {
    currentRank,
    nextRank,
    progressToNextRank,
    generationMultiplier,
    rewardedBoostMultiplier,
    mewingComboMultiplier,
    passivePerSecond,
    clickPower,
    critChance,
    critMultiplier,
    pendingRebirthDNA,
    canRebirth,
  };
}
